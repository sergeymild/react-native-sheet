package com.sheet

import android.util.Log
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

  @ReactMethod
  fun dismiss(viewTag: Int) {
    reactApplicationContext.runOnUiQueueThread {
      val view = findSheetView(viewTag)
      view?.dismiss()
    }
  }
}
