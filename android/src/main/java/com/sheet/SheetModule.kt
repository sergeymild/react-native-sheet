package com.sheet

import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap

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

  override fun viewportSize(): WritableMap {
    return Arguments.createMap()
  }

  override fun presentToast(params: ReadableMap?) {
    Toaster.Builder(reactApplicationContext)
      .setTitle("Some title")
      .setDuration(5000)
      .show()
  }
}
