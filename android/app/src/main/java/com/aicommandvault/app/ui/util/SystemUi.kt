package com.aicommandvault.app.ui.util

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.view.HapticFeedbackConstants
import android.view.View
import androidx.core.content.getSystemService

fun copyPlainText(context: Context, label: String, text: String) {
    val cm = context.getSystemService<ClipboardManager>() ?: return
    cm.setPrimaryClip(ClipData.newPlainText(label, text))
}

fun View.performVaultHaptic(enabled: Boolean) {
    if (!enabled) return
    performHapticFeedback(HapticFeedbackConstants.CONFIRM)
}
