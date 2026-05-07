package com.aicommandvault.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.aicommandvault.app.data.CommandRepository
import com.aicommandvault.app.data.Platform
import com.aicommandvault.app.data.SavedStore
import com.aicommandvault.app.ui.components.CommandCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlatformScreen(
    platform: Platform,
    savedStore: SavedStore,
    onSavedChanged: () -> Unit,
    hapticsEnabled: Boolean,
    onBack: () -> Unit,
) {
    val cmds = CommandRepository.forPlatform(platform)

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Column {
                        Text(platform.label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(platform.tagline, style = MaterialTheme.typography.titleMedium, maxLines = 2)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            platform.accent.copy(alpha = 0.18f),
                            MaterialTheme.colorScheme.background,
                        ),
                    ),
                )
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Spacer(Modifier.height(6.dp))
                Text("${cmds.size} commands", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.height(6.dp))
            }
            itemsIndexed(cmds, key = { _, c -> c.id }) { _, cmd ->
                val saved = savedStore.isSaved(cmd.id)
                CommandCard(
                    cmd = cmd,
                    accentBorder = platform.accent,
                    accentSoft = platform.accentSoft,
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
