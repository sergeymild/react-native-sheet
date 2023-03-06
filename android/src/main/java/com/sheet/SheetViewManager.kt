package com.sheet

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.*
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.yoga.YogaPositionType

internal class ModalHostShadowNode : LayoutShadowNode() {
  /**
   * We need to set the styleWidth and styleHeight of the one child (represented by the <View></View>
   * within the <RCTModalHostView></RCTModalHostView> in Modal.js. This needs to fill the entire window.
   */
  override fun addChildAt(child: ReactShadowNodeImpl, i: Int) {
    super.addChildAt(child, i)
    println("🥲shadowNode.addChildAt")
    val modalSize = ModalHostHelper.getModalHostSize(themedContext)
    child.setStyleWidth(modalSize.x.toFloat())
    //child.setStyleHeight(modalSize.y.toFloat())
    child.setPositionType(YogaPositionType.ABSOLUTE)
  }

  override fun calculateLayoutOnChildren(): MutableIterable<ReactShadowNode<ReactShadowNode<*>>> {
    return super.calculateLayoutOnChildren()
    println("🥲calculateLayoutOnChildren ${getChildAt(0).layoutHeight}")
  }
}

class SheetViewManager : ViewGroupManager<AppFittedSheet>() {
  override fun getName() = "SheetView"

  override fun createViewInstance(reactContext: ThemedReactContext): AppFittedSheet {
    return AppFittedSheet(reactContext)
  }

  @ReactProp(name = "sheetHeight")
  fun sheetHeight(view: AppFittedSheet, size: Double) {
    println("🥲 sheetHeight $size")
    view.mHostView.sheetMaxHeightSize = if (size < 0) -1.0 else size.toPxD()
    view.mHostView.setVirtualHeight(if (size < 0) -1 else size.toPx())
  }

  @ReactProp(name = "fittedSheetParams")
  fun fittedSheetParams(view: AppFittedSheet, params: ReadableMap) {
    println("🥲 fittedSheetParams $params")
    view.params = params
  }

  @ReactProp(name = "increaseHeight")
  fun setIncreaseHeight(view: AppFittedSheet, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.reactHeight + PixelUtil.toPixelFromDIP(by)
    view.mHostView.sheetMaxHeightSize = newHeight.toDouble()
    view.mHostView.setVirtualHeight(newHeight.toInt())
  }

  @ReactProp(name = "decreaseHeight")
  fun setDecreaseHeight(view: AppFittedSheet, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.reactHeight - PixelUtil.toPixelFromDIP(by)
    println("🥲decreaseHeight from: ${view.mHostView.reactHeight} to: $newHeight")
    view.mHostView.sheetMaxHeightSize = newHeight.toDouble()
    view.mHostView.setVirtualHeight(newHeight.toInt())
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onSheetDismiss", MapBuilder.of("registrationName", "onSheetDismiss"))
      .build()
  }

  override fun getShadowNodeClass(): Class<LayoutShadowNode> {
    return ModalHostShadowNode::class.java as Class<LayoutShadowNode>
  }

  override fun createShadowNodeInstance(): LayoutShadowNode {
    return ModalHostShadowNode()
  }

  override fun createShadowNodeInstance(context: ReactApplicationContext): LayoutShadowNode {
    println("🥲createShadowNodeInstance")
    return ModalHostShadowNode()
  }

  override fun onAfterUpdateTransaction(view: AppFittedSheet) {
    super.onAfterUpdateTransaction(view)
    view.showOrUpdate()
  }
}
