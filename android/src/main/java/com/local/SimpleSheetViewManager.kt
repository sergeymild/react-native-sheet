package com.local

import android.content.res.Resources
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.*
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.yoga.YogaEdge
import com.facebook.yoga.YogaPositionType
import com.sheet.toDP

internal class ModalHostShadowNode : LayoutShadowNode() {
  companion object {
    val attachedViews = mutableMapOf<Int, AppFittedSheet2>()
    val pendingUpdateHeight = mutableMapOf<Int, Float>()
  }
  /**
   * We need to set the styleWidth and styleHeight of the one child (represented by the <View></View>
   * within the <RCTModalHostView></RCTModalHostView> in Modal.js. This needs to fill the entire window.
   */
  override fun addChildAt(child: ReactShadowNodeImpl, i: Int) {
    super.addChildAt(child, i)
    val display = Resources.getSystem().displayMetrics
    child.setStyleWidth(display.widthPixels.toFloat())
//    child.setStyleHeight(display.widthPixels.toFloat())
//    child.setPositionType(YogaPositionType.ABSOLUTE)
//    child.setPosition(YogaEdge.BOTTOM.intValue(), 0f)
//    child.setPosition(YogaEdge.LEFT.intValue(), 0f)
//    child.setPosition(YogaEdge.RIGHT.intValue(), 0f)
  }

  private fun savePendingHeight() {
    val newHeight = getChildAt(0).layoutHeight
    println("😀 ModalHostShadowNode.dispatchUpdates id: $reactTag savePendingHeight: ${newHeight.toInt().toDP()}")
    pendingUpdateHeight[reactTag] = newHeight
  }

  override fun dispatchUpdates(absoluteX: Float, absoluteY: Float, uiViewOperationQueue: UIViewOperationQueue?, nativeViewHierarchyOptimizer: NativeViewHierarchyOptimizer?): Boolean {
    val didChange = super.dispatchUpdates(absoluteX, absoluteY, uiViewOperationQueue, nativeViewHierarchyOptimizer)
    val newHeight = getChildAt(0).layoutHeight
    attachedViews[reactTag]?.mHostView?.let {
      if (it.reactView == null) {
        savePendingHeight()
      } else {
        println("😀 ModalHostShadowNode.dispatchUpdates id: $reactTag newHeight: ${newHeight.toInt().toDP()}")
        it.setVirtualHeight(newHeight)
        pendingUpdateHeight.remove(reactTag)
      }
    }
    if (attachedViews[reactTag] == null) savePendingHeight()
    return didChange
  }
}

class SimpleSheetViewManager : ViewGroupManager<AppFittedSheet2>() {
  override fun getName() = "SimpleSheetView"

  override fun createViewInstance(reactContext: ThemedReactContext): AppFittedSheet2 {
    return AppFittedSheet2(reactContext)
  }

  override fun createViewInstance(reactTag: Int, reactContext: ThemedReactContext, initialProps: ReactStylesDiffMap?, stateWrapper: StateWrapper?): AppFittedSheet2 {
    val view = super.createViewInstance(reactTag, reactContext, initialProps, stateWrapper)
    println("🥲 SimpleSheetViewManager.createViewInstance id: $reactTag")
    ModalHostShadowNode.attachedViews[view.id] = view
    return view
  }

  @ReactProp(name = "fittedSheetParams")
  fun fittedSheetParams(view: AppFittedSheet2, params: ReadableMap) {
    println("🥲 SimpleSheetViewManager.fittedSheetParams $params")
    view.params = params
  }

  @ReactProp(name = "increaseHeight")
  fun setIncreaseHeight(view: AppFittedSheet2, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.reactHeight + PixelUtil.toPixelFromDIP(by)
    view.mHostView.sheetMaxHeightSize = newHeight.toDouble()
    view.mHostView.setVirtualHeight(newHeight)
  }

  @ReactProp(name = "sheetHeight")
  fun setHeight(view: AppFittedSheet2, by: Double) {
    if (by == 0.0) return
    //view.mHostView.sheetMaxHeightSize = view.mHostView.reactHeight.toDouble()
    view.mHostView.setVirtualHeight(PixelUtil.toPixelFromDIP(by))
  }

  @ReactProp(name = "decreaseHeight")
  fun setDecreaseHeight(view: AppFittedSheet2, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.reactHeight - PixelUtil.toPixelFromDIP(by)
    println("🥲 SimpleSheetViewManager.decreaseHeight from: ${view.mHostView.reactHeight} to: $newHeight")
    view.mHostView.sheetMaxHeightSize = newHeight.toDouble()
    view.mHostView.setVirtualHeight(newHeight)
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
    println("🥲 SimpleSheetViewManager.createShadowNodeInstance")
    return ModalHostShadowNode()
  }

  override fun createShadowNodeInstance(context: ReactApplicationContext): LayoutShadowNode {
    println("🥲 SimpleSheetViewManager.createShadowNodeInstance")
    return ModalHostShadowNode()
  }

  override fun onAfterUpdateTransaction(view: AppFittedSheet2) {
    super.onAfterUpdateTransaction(view)
    view.showOrUpdate()
  }
}
