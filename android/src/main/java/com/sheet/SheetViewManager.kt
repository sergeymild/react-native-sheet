package com.sheet

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.NativeViewHierarchyOptimizer
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIViewOperationQueue
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.util.ReactFindViewUtil

internal class ModalHostShadowNode : LayoutShadowNode() {
  companion object {
    val attachedViews = mutableMapOf<Int, AppFittedSheet>()
  }

  override fun dispatchUpdates(absoluteX: Float, absoluteY: Float, uiViewOperationQueue: UIViewOperationQueue?, nativeViewHierarchyOptimizer: NativeViewHierarchyOptimizer?) {
    super.dispatchUpdates(absoluteX, absoluteY, uiViewOperationQueue, nativeViewHierarchyOptimizer)
    val newHeight = getChildAt(0).layoutHeight
    attachedViews[reactTag]?.mHostView?.let {
      if (it.reactView == null) {
        it.sheetMaxHeightSize = newHeight.toDouble()
      } else {
        it.setVirtualHeight(newHeight)
        getChildAt(0).setStyleWidth(it.currentWidth.toFloat())
      }
    }
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
