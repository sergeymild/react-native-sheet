package com.sheet

import android.content.res.Resources
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.*
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.yoga.YogaPositionType

internal class ModalHostShadowNode : LayoutShadowNode() {
  companion object {
    val attachedViews = mutableMapOf<Int, AppFittedSheet>()
    val pendingUpdateHeight = mutableMapOf<Int, Float>()
  }
  /**
   * We need to set the styleWidth and styleHeight of the one child (represented by the <View></View>
   * within the <RCTModalHostView></RCTModalHostView> in Modal.js. This needs to fill the entire window.
   */
  override fun addChildAt(child: ReactShadowNodeImpl, i: Int) {
    super.addChildAt(child, i)
    println("🥲shadowNode.addChildAt")
    val display = Resources.getSystem().displayMetrics
    child.setStyleWidth(display.widthPixels.toFloat())
    //child.setStyleHeight(modalSize.y.toFloat())
    child.setPositionType(YogaPositionType.ABSOLUTE)
  }

  override fun dispatchUpdates(absoluteX: Float, absoluteY: Float, uiViewOperationQueue: UIViewOperationQueue?, nativeViewHierarchyOptimizer: NativeViewHierarchyOptimizer?): Boolean {
    val didChange = super.dispatchUpdates(absoluteX, absoluteY, uiViewOperationQueue, nativeViewHierarchyOptimizer)
    val newHeight = getChildAt(0).layoutHeight
    attachedViews[reactTag]?.mHostView?.let {
      println("😀 dispatchUpdates id: $reactTag newHeight: ${newHeight.toInt().toDP()}")
      it.setVirtualHeight(newHeight)
      pendingUpdateHeight.remove(reactTag)
    }
    if (attachedViews[reactTag] == null) {
      println("😀 dispatchUpdates id: $reactTag savePendingHeight: ${newHeight.toInt().toDP()}")
      pendingUpdateHeight[reactTag] = newHeight
    }
    return didChange
  }
}

class SheetViewManager : ViewGroupManager<AppFittedSheet>() {
  override fun getName() = "SheetView"

  override fun createViewInstance(reactContext: ThemedReactContext): AppFittedSheet {
    return AppFittedSheet(reactContext)
  }

  override fun createViewInstance(reactTag: Int, reactContext: ThemedReactContext, initialProps: ReactStylesDiffMap?, stateWrapper: StateWrapper?): AppFittedSheet {
    val view = super.createViewInstance(reactTag, reactContext, initialProps, stateWrapper)
    println("🥲 createViewInstance id: $reactTag")
    ModalHostShadowNode.attachedViews[view.id] = view
    return view
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
    view.mHostView.setVirtualHeight(newHeight)
  }

  @ReactProp(name = "sheetHeight")
  fun setHeight(view: AppFittedSheet, by: Double) {
    if (by == 0.0) return
    //view.mHostView.sheetMaxHeightSize = view.mHostView.reactHeight.toDouble()
    view.mHostView.setVirtualHeight(PixelUtil.toPixelFromDIP(by))
  }

  @ReactProp(name = "decreaseHeight")
  fun setDecreaseHeight(view: AppFittedSheet, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.reactHeight - PixelUtil.toPixelFromDIP(by)
    println("🥲decreaseHeight from: ${view.mHostView.reactHeight} to: $newHeight")
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
    println("🥲 createShadowNodeInstance")
    return ModalHostShadowNode()
  }

  override fun createShadowNodeInstance(context: ReactApplicationContext): LayoutShadowNode {
    println("🥲 createShadowNodeInstance")
    return ModalHostShadowNode()
  }

  override fun onAfterUpdateTransaction(view: AppFittedSheet) {
    super.onAfterUpdateTransaction(view)
    view.showOrUpdate()
  }
}
