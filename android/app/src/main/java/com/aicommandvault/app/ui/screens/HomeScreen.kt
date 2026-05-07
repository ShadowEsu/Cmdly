package com.aicommandvault.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.aicommandvault.app.data.CommandRepository
import com.aicommandvault.app.data.Platform
import com.aicommandvault.app.data.VaultCommand

@Composable
fun HomeScreen(
    onNavigatePlatform: (Platform) -> Unit,
    onNavigateSearch: () -> Unit,
    onNavigateSaved: () -> Unit,
) {
    val bundles = remember { CommandRepository.sessionBundles() }
    val total = remember { CommandRepository.all.size }

    LazyColumn(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Hello, Coder!",
                style = MaterialTheme.typography.headlineLarge,
                color = MaterialTheme.colorScheme.onBackground,
            )
            Text(
                text = "CMDLY",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        item {
            Surface(
                onClick = onNavigateSearch,
                shape = RoundedCornerShape(18.dp),
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.55f),
                tonalElevation = 4.dp,
            ) {
                Row(
                    Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("⌕", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(
                        text = "Search commands, shortcuts, actions…",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                StatPill(Modifier.weight(1f), "Commands", total.toString())
                StatPill(Modifier.weight(1f), "Platforms", Platform.entries.size.toString())
                StatPill(Modifier.weight(1f), "Featured", bundles.featured.size.toString())
            }
        }

        item {
            SectionTitle("Platforms", "Open a themed deck")
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(Platform.entries.toList(), key = { it.name }) { p ->
                    PlatformCard(p, CommandRepository.forPlatform(p).size) { onNavigatePlatform(p) }
                }
            }
        }

        item {
            SectionTitle("Featured picks", "Weighted random each cold start")
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(bundles.featured, key = { it.id }) { c ->
                    MiniCommandTile(c) { onNavigatePlatform(c.platform) }
                }
            }
        }

        item {
            SectionTitle("Trending shuffle", "Uniform random mix")
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(bundles.trending, key = { it.id }) { c ->
                    MiniCommandTile(c) { onNavigatePlatform(c.platform) }
                }
            }
        }

        item {
            SectionTitle("Recommended", "High-signal starters")
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                bundles.recommended.chunked(2).forEach { row ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        row.forEach { c ->
                            MiniCommandWide(
                                c,
                                modifier = Modifier.weight(1f),
                            ) { onNavigatePlatform(c.platform) }
                        }
                        if (row.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        item {
            SectionTitle("One tap per platform", "Random entry point")
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                bundles.quick.forEach { c ->
                    Surface(
                        onClick = { onNavigatePlatform(c.platform) },
                        shape = RoundedCornerShape(16.dp),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.55f),
                        tonalElevation = 2.dp,
                    ) {
                        Row(
                            Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Column(Modifier.weight(1f)) {
                                Text(c.platform.label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                Text(c.name, style = MaterialTheme.typography.titleMedium, fontFamily = FontFamily.Monospace)
                            }
                            Text("→", color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        item {
            Surface(
                onClick = onNavigateSaved,
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.18f),
            ) {
                Text(
                    text = "Open saved commands",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(16.dp),
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                )
            }
            Spacer(Modifier.height(96.dp))
        }
    }
}

@Composable
private fun StatPill(modifier: Modifier, label: String, value: String) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.55f),
        tonalElevation = 2.dp,
        modifier = modifier,
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(label.uppercase(), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, style = MaterialTheme.typography.titleLarge)
        }
    }
}

@Composable
private fun SectionTitle(title: String, subtitle: String) {
    Column(Modifier.padding(bottom = 6.dp)) {
        Text(title, style = MaterialTheme.typography.titleMedium)
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun PlatformCard(platform: Platform, count: Int, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.55f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        modifier = Modifier.width(260.dp),
    ) {
        Box(
            Modifier
                .background(
                    Brush.verticalGradient(
                        listOf(
                            platform.accent.copy(alpha = 0.22f),
                            MaterialTheme.colorScheme.surface.copy(alpha = 0.2f),
                        ),
                    ),
                )
                .padding(16.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(platform.label, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
                    Surface(shape = RoundedCornerShape(999.dp), color = MaterialTheme.colorScheme.surface.copy(alpha = 0.35f)) {
                        Text(
                            "$count cmds",
                            style = MaterialTheme.typography.labelLarge,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                Text(platform.tagline, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
private fun MiniCommandTile(cmd: VaultCommand, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.width(220.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.55f)),
        border = BorderStroke(1.dp, cmd.platform.accent.copy(alpha = 0.35f)),
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(cmd.platform.label.uppercase(), style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(cmd.name, style = MaterialTheme.typography.titleMedium, fontFamily = FontFamily.Monospace)
            Text(cmd.short, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2)
        }
    }
}

@Composable
private fun MiniCommandWide(cmd: VaultCommand, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = modifier.height(140.dp),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.55f)),
    ) {
        Column(
            Modifier
                .padding(12.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(cmd.platform.label, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(cmd.name, style = MaterialTheme.typography.titleMedium, fontFamily = FontFamily.Monospace, maxLines = 1)
            Text(cmd.detail, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 3)
        }
    }
}
