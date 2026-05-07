package com.aicommandvault.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.aicommandvault.app.data.CommandRepository
import com.aicommandvault.app.data.Platform
import com.aicommandvault.app.data.SavedStore
import com.aicommandvault.app.data.VaultCommand
import com.aicommandvault.app.ui.components.CommandCard

private sealed class PlatformFilter {
    data object All : PlatformFilter()
    data class One(val platform: Platform) : PlatformFilter()
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SearchScreen(
    savedStore: SavedStore,
    onSavedChanged: () -> Unit,
    hapticsEnabled: Boolean,
) {
    var query by remember { mutableStateOf("") }
    var filter by remember { mutableStateOf<PlatformFilter>(PlatformFilter.All) }

    val results = remember(query, filter) {
        rank(CommandRepository.all, query, filter)
    }

    Column(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.Top,
    ) {
        Spacer(Modifier.height(8.dp))
        Text("Search", style = MaterialTheme.typography.headlineLarge)
        Text("Global filter across every deck.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)

        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            placeholder = { Text("Type to filter…") },
            singleLine = true,
        )

        FlowRow(
            modifier = Modifier.padding(top = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FilterChip(
                selected = filter is PlatformFilter.All,
                onClick = { filter = PlatformFilter.All },
                label = { Text("All") },
            )
            Platform.entries.forEach { p ->
                val selected = when (val f = filter) {
                    is PlatformFilter.One -> f.platform == p
                    PlatformFilter.All -> false
                }
                FilterChip(
                    selected = selected,
                    onClick = { filter = PlatformFilter.One(p) },
                    label = { Text(p.label) },
                )
            }
        }

        Text(
            "${results.size} results",
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 10.dp),
        )

        LazyColumn(
            Modifier
                .weight(1f)
                .padding(top = 8.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            itemsIndexed(results, key = { _, c -> c.id }) { _, cmd ->
                val saved = savedStore.isSaved(cmd.id)
                CommandCard(
                    cmd = cmd,
                    accentBorder = cmd.platform.accent,
                    accentSoft = cmd.platform.accentSoft,
                    saved = saved,
                    hapticsEnabled = hapticsEnabled,
                    onToggleSave = {
                        savedStore.toggle(cmd.id)
                        onSavedChanged()
                    },
                )
            }
            item { Spacer(Modifier.height(96.dp)) }
        }
    }
}

private fun rank(all: List<VaultCommand>, query: String, filter: PlatformFilter): List<VaultCommand> {
    val needle = query.trim().lowercase()
    val platformPred: (VaultCommand) -> Boolean = when (filter) {
        PlatformFilter.All -> { true }
        is PlatformFilter.One -> { c -> c.platform == filter.platform }
    }

    return all
        .asSequence()
        .filter(platformPred)
        .map { c -> c to score(c, needle) }
        .filter { (_, sc) -> if (needle.isEmpty()) true else sc > 0 }
        .sortedWith(compareByDescending<Pair<VaultCommand, Int>> { it.second }.thenByDescending { it.first.weight })
        .map { it.first }
        .toList()
}

private fun score(cmd: VaultCommand, needle: String): Int {
    if (needle.isEmpty()) return 1
    val hay = "${cmd.name} ${cmd.short} ${cmd.detail} ${cmd.category}".lowercase()
    var sc = 0
    if (cmd.name.lowercase().contains(needle)) sc += 6
    if (cmd.short.lowercase().contains(needle)) sc += 3
    if (cmd.detail.lowercase().contains(needle)) sc += 1
    if (cmd.category.lowercase().contains(needle)) sc += 2
    if (sc == 0 && hay.contains(needle)) sc = 1
    return sc
}
