package com.aicommandvault.app

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Bookmarks
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.aicommandvault.app.data.Platform
import com.aicommandvault.app.data.SavedStore
import com.aicommandvault.app.ui.screens.HomeScreen
import com.aicommandvault.app.ui.screens.PlatformScreen
import com.aicommandvault.app.ui.screens.SavedScreen
import com.aicommandvault.app.ui.screens.SearchScreen
import com.aicommandvault.app.ui.theme.AiCommandVaultTheme

private object Routes {
    const val HOME = "home"
    const val SEARCH = "search"
    const val SAVED = "saved"
    const val PLATFORM = "platform/{id}"
    fun platform(id: String) = "platform/$id"
}

@Composable
fun VaultApp() {
    val context = LocalContext.current
    val savedStore = remember { SavedStore(context) }

    var savedRevision by remember { mutableIntStateOf(0) }

    AiCommandVaultTheme {
        VaultRoot(
            savedStore = savedStore,
            savedRevision = savedRevision,
            onSavedChanged = { savedRevision++ },
            hapticsEnabled = true,
        )
    }
}

@Composable
private fun VaultRoot(
    savedStore: SavedStore,
    savedRevision: Int,
    onSavedChanged: () -> Unit,
    hapticsEnabled: Boolean,
) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val route = backStackEntry?.destination?.route.orEmpty()
    val showBottomBar = route == Routes.HOME || route == Routes.SEARCH || route == Routes.SAVED

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    val destinations = listOf(
                        Triple(Routes.HOME, "Browse", Icons.Outlined.Home),
                        Triple(Routes.SEARCH, "Search", Icons.Outlined.Search),
                        Triple(Routes.SAVED, "Saved", Icons.Outlined.Bookmarks),
                    )
                    destinations.forEach { (dest, label, icon) ->
                        val selected = backStackEntry?.destination?.hierarchy?.any { it.route == dest } == true
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(dest) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(icon, contentDescription = label) },
                            label = { Text(label) },
                        )
                    }
                }
            }
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = Routes.HOME,
            modifier = Modifier.padding(padding),
        ) {
            composable(Routes.HOME) {
                HomeScreen(
                    onNavigatePlatform = { p -> navController.navigate(Routes.platform(p.routeId)) },
                    onNavigateSearch = { navController.navigate(Routes.SEARCH) },
                    onNavigateSaved = { navController.navigate(Routes.SAVED) },
                )
            }
            composable(Routes.SEARCH) {
                SearchScreen(
                    savedStore = savedStore,
                    onSavedChanged = onSavedChanged,
                    hapticsEnabled = hapticsEnabled,
                )
            }
            composable(Routes.SAVED) {
                SavedScreen(
                    savedStore = savedStore,
                    savedRevision = savedRevision,
                    onSavedChanged = onSavedChanged,
                    hapticsEnabled = hapticsEnabled,
                )
            }
            composable(
                route = Routes.PLATFORM,
                arguments = listOf(navArgument("id") { type = NavType.StringType }),
            ) { entry ->
                val id = entry.arguments?.getString("id").orEmpty()
                val platform = Platform.fromRouteId(id) ?: return@composable
                PlatformScreen(
                    platform = platform,
                    savedStore = savedStore,
                    onSavedChanged = onSavedChanged,
                    hapticsEnabled = hapticsEnabled,
                    onBack = { navController.popBackStack() },
                )
            }
        }
    }
}
