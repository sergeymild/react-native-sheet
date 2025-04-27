package com.sheet

import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext

class SheetModule(reactContext: ReactApplicationContext) : NativeSheetSpec(reactContext) {
  override fun getTypedExportedConstants(): Map<String, Any> {
    return getInitialWindowMetrics()
  }

  private fun getInitialWindowMetrics(): Map<String, Any> {
    val decorView = reactApplicationContext.currentActivity?.window?.decorView as ViewGroup? ?: return emptyMap()
    val insets = getSafeAreaInsets(decorView)
    return if (insets == null) {
      emptyMap()
    } else mapOf("insets" to edgeInsetsToJavaMap(insets))
  }
}
