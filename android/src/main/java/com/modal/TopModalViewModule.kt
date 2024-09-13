package com.modal

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerHelper

@ReactModule(name = TopModalViewModule.TAG)
class TopModalViewModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val TAG = "TopModalView"
  }

  override fun getName(): String {
    return TAG
  }

  private fun findSheetView(viewId: Int): TopModalView? {
    Log.d(TAG, "Finding view $viewId...")
    val view = if (reactApplicationContext != null) UIManagerHelper.getUIManager(reactApplicationContext, viewId)?.resolveView(viewId) as TopModalView? else null
    Log.d(TAG,  if (reactApplicationContext != null) "Found view $viewId!" else "Couldn't find view $viewId!")
    return view
  }

  @ReactMethod
  fun dismiss(viewTag: Int) {
    Handler(Looper.getMainLooper()).post {
      try {
        val view = findSheetView(viewTag)
        view?.dismiss()
      } catch (_: Throwable) {

      }
    }
  }
}
