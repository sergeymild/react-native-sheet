package com.sheet

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.modal.TopModalViewManager
import com.modal.TopModalViewModule
import com.transparent.activity.TransparentActivityManager
import com.transparent.activity.TransparentActivityModule

class SheetPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(SheetViewModule(reactContext), TopModalViewModule(reactContext), TransparentActivityModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return listOf(SheetViewManager(), TopModalViewManager(), TransparentActivityManager())
  }
}
