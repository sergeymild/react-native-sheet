package com.transparent.activity

import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.UIManagerHelper

@ReactModule(name = TransparentActivityModule.TAG)
class TransparentActivityModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  companion object {
    const val TAG = "TransparentActivity"
  }

  override fun getName(): String {
    return TAG
  }

  @ReactMethod
  fun dismiss(viewTag: Int) {
    Handler(Looper.getMainLooper()).post {
      TransparentActivity.presentedInstance?.get()?.finish()
    }
  }
}
