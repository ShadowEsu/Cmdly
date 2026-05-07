package com.aicommandvault.app.data

import android.content.Context

class SavedStore(context: Context) {
    private val app = context.applicationContext
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun snapshot(): Set<String> = prefs.getStringSet(KEY_IDS, emptySet())?.toSet().orEmpty()

    fun isSaved(id: String): Boolean = snapshot().contains(id)

    fun toggle(id: String) {
        val next = HashSet(snapshot())
        if (!next.add(id)) next.remove(id)
        prefs.edit().putStringSet(KEY_IDS, next).apply()
    }

    private companion object {
        const val PREFS = "vault_saved"
        const val KEY_IDS = "command_ids"
    }
}
