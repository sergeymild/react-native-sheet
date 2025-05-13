package com.sheet

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.util.ReactFindViewUtil


class SheetViewManager : ViewGroupManager<AppFittedSheet>() {
  override fun getName() = "SheetView"

  override fun createViewInstance(reactContext: ThemedReactContext): AppFittedSheet {
    return AppFittedSheet(reactContext)
  }

  override fun createViewInstance(reactTag: Int, reactContext: ThemedReactContext, initialProps: ReactStylesDiffMap?, stateWrapper: StateWrapper?): AppFittedSheet {
    val view = super.createViewInstance(reactTag, reactContext, initialProps, stateWrapper)
    println("🥲 createViewInstance id: $reactTag view: $view")
    return view
  }

  @ReactProp(name = "fittedSheetParams")
  fun fittedSheetParams(view: AppFittedSheet, params: ReadableMap) {
    println("🥲 fittedSheetParams $params")
    view.params = params
  }

  @ReactProp(name = "calculatedHeight")
  fun calculatedHeight(view: AppFittedSheet, height: Double) {
    println("🥲 calculatedHeight $height")
    view.mHostView.setVirtualHeight(PixelUtil.toPixelFromDIP(height.toFloat()))
  }

  @ReactProp(name = "passScrollViewReactTag")
  fun passScrollViewReactTag(view: AppFittedSheet, nativeId: String) {
    val v = ReactFindViewUtil.findView(view, nativeId) ?: return
    view.setNewNestedScrollView(v)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onSheetDismiss", MapBuilder.of("registrationName", "onSheetDismiss"))
      .build()
  }

  override fun onAfterUpdateTransaction(view: AppFittedSheet) {
    super.onAfterUpdateTransaction(view)
    view.showOrUpdate()
  }
}
