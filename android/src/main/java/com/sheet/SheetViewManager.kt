package com.sheet

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.NativeViewHierarchyOptimizer
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.ReactShadowNodeImpl
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.UIViewOperationQueue
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.util.ReactFindViewUtil
import com.facebook.yoga.YogaPositionType

internal class ModalHostShadowNode : LayoutShadowNode() {
  companion object {
    val attachedViews = mutableMapOf<Int, AppFittedSheet>()
  }

  private var styledWidth: Float = 0f
  private var styledMaxHeight: Float = 0f
  private var styledMinHeight: Float = 0f

  /**
   * We need to set the styleWidth and styleHeight of the one child (represented by the <View></View>
   * within the <RCTModalHostView></RCTModalHostView> in Modal.js. This needs to fill the entire window.
   */
  override fun addChildAt(child: ReactShadowNodeImpl, i: Int) {
    super.addChildAt(child, i)
    child.setPositionType(YogaPositionType.ABSOLUTE)
    child.setStyleWidth(styledWidth)
    child.setStyleMinHeight(styledMinHeight)
    child.setStyleMaxHeight(styledMaxHeight)
    println("addChildAt ${styledWidth.toInt().toDP()} ${styledMaxHeight.toInt().toDP()} ${styledMinHeight.toInt().toDP()}")
  }

  override fun setStyleWidth(widthPx: Float) {
    super.setStyleWidth(widthPx)
    styledWidth = widthPx
    println("😀 setStyleWidth id: ${styledWidth.toInt().toDP()}")
  }

  override fun setStyleMaxHeight(widthPx: Float) {
    super.setStyleMaxHeight(widthPx)
    styledMaxHeight = widthPx
    println("😀 setStyleMaxHeight id: ${styledMaxHeight.toInt().toDP()}")
  }

  override fun setStyleMinHeight(widthPx: Float) {
    super.setStyleMinHeight(widthPx)
    styledMinHeight = widthPx
    println("😀 setStyleMinHeight id: ${styledMinHeight.toInt().toDP()}")
  }

  override fun dispatchUpdates(absoluteX: Float, absoluteY: Float, uiViewOperationQueue: UIViewOperationQueue?, nativeViewHierarchyOptimizer: NativeViewHierarchyOptimizer?): Boolean {
    val didChange = super.dispatchUpdates(absoluteX, absoluteY, uiViewOperationQueue, nativeViewHierarchyOptimizer)
    val newHeight = getChildAt(0).layoutHeight
    attachedViews[reactTag]?.mHostView?.let {
      if (it.reactView == null) {
        it.sheetMaxHeightSize = newHeight.toDouble()
      } else {
        it.setVirtualHeight(newHeight)
        getChildAt(0).setStyleWidth(it.currentWidth.toFloat())
        println("😀 dispatchUpdates ${it.currentWidth.toDP()} pa: ${it.currentHeight.toDP()}")
      }
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
    println("🥲 createViewInstance id: $reactTag view: $view")
    ModalHostShadowNode.attachedViews[view.id] = view
    return view
  }

  @ReactProp(name = "fittedSheetParams")
  fun fittedSheetParams(view: AppFittedSheet, params: ReadableMap) {
    println("🥲 fittedSheetParams $params")
    view.params = params
  }

  @ReactProp(name = "passScrollViewReactTag")
  fun passScrollViewReactTag(view: AppFittedSheet, nativeId: String) {
    val v = ReactFindViewUtil.findView(view, nativeId) ?: return
    view.setNewNestedScrollView(v)
  }

  @ReactProp(name = "increaseHeight")
  fun setIncreaseHeight(view: AppFittedSheet, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.currentHeight + PixelUtil.toPixelFromDIP(by)
    view.mHostView.setVirtualHeight(newHeight)
    view.setNewShadowSize(view.mHostView.currentWidth, view.mHostView.currentHeight)
  }

  @ReactProp(name = "decreaseHeight")
  fun setDecreaseHeight(view: AppFittedSheet, by: Double) {
    if (by == 0.0) return
    val newHeight = view.mHostView.currentHeight - PixelUtil.toPixelFromDIP(by)
    println("🥲decreaseHeight from: ${view.mHostView.currentHeight} to: $newHeight")
    view.mHostView.setVirtualHeight(newHeight)
    view.setNewShadowSize(view.mHostView.currentWidth, view.mHostView.currentHeight)
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
