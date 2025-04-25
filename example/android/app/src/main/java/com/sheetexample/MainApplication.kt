package com.sheetexample

import android.app.Application
import com.facebook.react.PackageList

class MainApplication : Application(), ReactApplication {
    private val mReactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        val useDeveloperSupport: Boolean
            get() = BuildConfig.DEBUG

        val packages: List<Any>
            get() {
                val packages: List<ReactPackage> =
                    PackageList(this).getPackages()
                // Packages that cannot be autolinked yet can be added manually here, for example:
                // packages.add(new MyReactNativePackage());
                return packages
            }

        val jSMainModuleName: String
            get() = "index"

        val isNewArchEnabled: Boolean
            get() = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

        protected val isHermesEnabled: Boolean
            get() = BuildConfig.IS_HERMES_ENABLED
    }

    val reactNativeHost: ReactNativeHost
        get() = mReactNativeHost

    override fun onCreate() {
        super.onCreate()
        SoLoader.init(this, OpenSourceMergedSoMapping)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
    }
}
