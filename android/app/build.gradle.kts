plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

import java.util.Properties
import java.io.FileInputStream

val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

android {
    namespace = "com.aicommandvault.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.aicommandvault.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }

    signingConfigs {
        create("release") {
            val storeFilePath =
                (System.getenv("CMDLY_RELEASE_STORE_FILE") ?: keystoreProperties.getProperty("storeFile")).orEmpty()
            val storePasswordValue =
                (System.getenv("CMDLY_RELEASE_STORE_PASSWORD") ?: keystoreProperties.getProperty("storePassword")).orEmpty()
            val keyAliasValue =
                (System.getenv("CMDLY_RELEASE_KEY_ALIAS") ?: keystoreProperties.getProperty("keyAlias")).orEmpty()
            val keyPasswordValue =
                (System.getenv("CMDLY_RELEASE_KEY_PASSWORD") ?: keystoreProperties.getProperty("keyPassword")).orEmpty()

            if (
                storeFilePath.isNotBlank() &&
                    storePasswordValue.isNotBlank() &&
                    keyAliasValue.isNotBlank() &&
                    keyPasswordValue.isNotBlank()
            ) {
                val candidate = rootProject.file(storeFilePath)
                if (candidate.exists()) {
                    storeFile = candidate
                    storePassword = storePasswordValue
                    keyAlias = keyAliasValue
                    keyPassword = keyPasswordValue
                }
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            val releaseSigning = signingConfigs.getByName("release")
            signingConfig =
                if (releaseSigning.storeFile != null && releaseSigning.storeFile!!.exists()) {
                    releaseSigning
                } else {
                    signingConfigs.getByName("debug")
                }
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.12.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.activity:activity-ktx:1.9.3")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    implementation("androidx.navigation:navigation-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
