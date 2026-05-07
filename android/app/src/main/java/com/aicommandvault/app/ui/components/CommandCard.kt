package com.aicommandvault.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.Image
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ExpandMore
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.aicommandvault.app.data.VaultCommand
import com.aicommandvault.app.R
import com.aicommandvault.app.ui.util.copyPlainText
import com.aicommandvault.app.ui.util.performVaultHaptic

@Composable
fun CommandCard(
    cmd: VaultCommand,
    accentBorder: androidx.compose.ui.graphics.Color,
    accentSoft: androidx.compose.ui.graphics.Color,
    saved: Boolean,
    hapticsEnabled: Boolean,
    onToggleSave: () -> Unit,
) {
    val context = LocalContext.current
    val view = LocalView.current
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.55f)),
        border = BorderStroke(1.dp, accentBorder.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.Top, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = cmd.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontFamily = FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                        Surface(
                            color = accentSoft.copy(alpha = 0.35f),
                            shape = RoundedCornerShape(999.dp),
                            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                        ) {
                            Text(
                                text = cmd.category.uppercase(),
                                style = MaterialTheme.typography.labelLarge,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                    Text(
                        text = cmd.short,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                Column(horizontalAlignment = Alignment.End, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = {
                            copyPlainText(context, cmd.name, cmd.name)
                            view.performVaultHaptic(hapticsEnabled)
                        },
                    ) {
                        Image(
                            painter = painterResource(R.drawable.ic_copy_documents),
                            contentDescription = "Copy ${cmd.name}",
                            modifier = Modifier,
                        )
                    }
                    IconButton(onClick = { expanded = !expanded }) {
                        Icon(Icons.Outlined.ExpandMore, contentDescription = if (expanded) "Collapse" else "Expand")
                    }
                }
            }

            AnimatedVisibility(
                visible = expanded,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut(),
            ) {
                Column(Modifier.padding(top = 12.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = cmd.detail,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextButton(
                            onClick = {
                                copyPlainText(context, "Details", cmd.detail)
                                view.performVaultHaptic(hapticsEnabled)
                            },
                        ) {
                            Text("Copy details")
                        }
                        TextButton(
                            onClick = {
                                onToggleSave()
                                view.performVaultHaptic(hapticsEnabled)
                            },
                        ) {
                            Text(if (saved) "Saved" else "Save")
                        }
                    }
                }
            }
        }
    }
}
