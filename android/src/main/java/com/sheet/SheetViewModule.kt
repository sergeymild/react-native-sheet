package com.sheet

import android.util.Log
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerHelper

@ReactModule(name = SheetViewModule.TAG)
class SheetViewModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val TAG = "SheetView"
  }

  override fun getName(): String {
    return TAG
  }

  private fun findSheetView(viewId: Int): AppFittedSheet? {
    try {
      Log.d(TAG, "Finding view $viewId...")
      val view = if (reactApplicationContext != null) UIManagerHelper.getUIManager(reactApplicationContext, viewId)?.resolveView(viewId) as AppFittedSheet? else null
      Log.d(TAG,  if (reactApplicationContext != null) "Found view $viewId!" else "Couldn't find view $viewId!")
      return view ?: throw RuntimeException("ViewNotFound($viewId)")
    } catch (e: Throwable) {
      if (BuildConfig.DEBUG) {
        e.printStackTrace()
      }
    }
    return null
  }

  override fun getConstants(): Map<String, Any> {
    return getInitialWindowMetrics()
  }

  private fun getInitialWindowMetrics(): Map<String, Any> {
    val decorView = reactApplicationContext.currentActivity?.window?.decorView as ViewGroup? ?: return emptyMap()
    val insets = getSafeAreaInsets(decorView)
    return if (insets == null) {
      emptyMap()
    } else mapOf("insets" to edgeInsetsToJavaMap(insets))
  }

  @ReactMethod
  fun dismiss(viewTag: Int) {
    reactApplicationContext.runOnUiQueueThread {
      val view = findSheetView(viewTag)
      view?.dismiss()
    }
  }
}
