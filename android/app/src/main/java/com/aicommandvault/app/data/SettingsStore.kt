package com.aicommandvault.app.data

import android.content.Context

enum class VaultFontScale { Sm, Md, Lg }

enum class VaultAccent { Violet, Cyan, Amber }

class SettingsStore(context: Context) {
    private val app = context.applicationContext
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun fontScale(): VaultFontScale = when (prefs.getString(KEY_FONT, "md")) {
        "sm" -> VaultFontScale.Sm
        "lg" -> VaultFontScale.Lg
        else -> VaultFontScale.Md
    }

    fun setFontScale(value: VaultFontScale) {
        val v = when (value) {
            VaultFontScale.Sm -> "sm"
            VaultFontScale.Md -> "md"
            VaultFontScale.Lg -> "lg"
        }
        prefs.edit().putString(KEY_FONT, v).apply()
    }

    fun hapticsEnabled(): Boolean = prefs.getBoolean(KEY_HAPTICS, true)

    fun setHaptics(value: Boolean) {
        prefs.edit().putBoolean(KEY_HAPTICS, value).apply()
    }

    fun accent(): VaultAccent = when (prefs.getString(KEY_ACCENT, "violet")) {
        "cyan" -> VaultAccent.Cyan
        "amber" -> VaultAccent.Amber
        else -> VaultAccent.Violet
    }

    fun setAccent(value: VaultAccent) {
        val v = when (value) {
            VaultAccent.Violet -> "violet"
            VaultAccent.Cyan -> "cyan"
            VaultAccent.Amber -> "amber"
        }
        prefs.edit().putString(KEY_ACCENT, v).apply()
    }

    private companion object {
        const val PREFS = "vault_settings"
        const val KEY_FONT = "font_scale"
        const val KEY_HAPTICS = "haptics"
        const val KEY_ACCENT = "accent"
    }
}
