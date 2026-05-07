package com.aicommandvault.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.aicommandvault.app.data.CommandRepository
import com.aicommandvault.app.data.SavedStore
import com.aicommandvault.app.ui.components.CommandCard

@Composable
fun SavedScreen(
    savedStore: SavedStore,
    savedRevision: Int,
    onSavedChanged: () -> Unit,
    hapticsEnabled: Boolean,
) {
    val saved = remember(savedRevision) {
        val ids = savedStore.snapshot()
        CommandRepository.all.filter { it.id in ids }
    }

    Column(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.Top,
    ) {
        Spacer(Modifier.height(8.dp))
        Text("Saved", style = MaterialTheme.typography.headlineLarge)
        Text("Bookmarks stay on-device in this build.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)

        if (saved.isEmpty()) {
            Text(
                "Nothing saved yet. Open a deck, expand a command, and tap Save.",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 16.dp),
            )
        } else {
            LazyColumn(
                Modifier
                    .weight(1f)
                    .padding(top = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(saved, key = { it.id }) { cmd ->
                    val isSaved = savedStore.isSaved(cmd.id)
                    CommandCard(
                        cmd = cmd,
                        accentBorder = cmd.platform.accent,
                        accentSoft = cmd.platform.accentSoft,
                        saved = isSaved,
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
}
