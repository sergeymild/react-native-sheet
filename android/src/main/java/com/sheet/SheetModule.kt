package com.sheet

import android.view.ViewGroup
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
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

  override fun dismissAll() {
    reactApplicationContext.runOnUiQueueThread {
      reactApplicationContext.currentActivity?.let { AppFittedSheet.dismissAll(it as AppCompatActivity) }
    }
  }

  override fun dismissPresented() {
    reactApplicationContext.runOnUiQueueThread {
      reactApplicationContext.currentActivity?.let { AppFittedSheet.dismissPresented(it as AppCompatActivity) }
    }
  }
}
