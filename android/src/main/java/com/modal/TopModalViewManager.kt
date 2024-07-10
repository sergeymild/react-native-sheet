package com.modal

import android.content.res.Resources
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.ReactShadowNodeImpl
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.yoga.YogaPositionType

private class ModalHostShadowNode : LayoutShadowNode() {
  override fun addChildAt(child: ReactShadowNodeImpl, i: Int) {
    super.addChildAt(child, i)
    val display = Resources.getSystem().displayMetrics
    child.setStyleWidth(display.widthPixels.toFloat())
    child.setStyleHeight(display.heightPixels.toFloat())
    child.setPositionType(YogaPositionType.ABSOLUTE)
  }
}

class TopModalViewManager : ViewGroupManager<TopModalView>() {
  override fun getName() = "TopModalView"

  override fun createViewInstance(reactContext: ThemedReactContext): TopModalView {
    return TopModalView(reactContext)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onModalDismiss", MapBuilder.of("registrationName", "onModalDismiss"))
      .build()
  }

  @ReactProp(name = "isEdgeToEdge")
  fun setIsEdgeToEdge(view: TopModalView, isEdgeToEdge: Boolean) {
    view.isEdgeToEdge = isEdgeToEdge
  }
  @ReactProp(name = "isStatusBarBgLight")
  fun setIsStatusBarBgLight(view: TopModalView, isStatusBarBgLight: Boolean) {
    view.isStatusBarBgLight = isStatusBarBgLight
  }

  @ReactProp(name="animated")
  fun setAnimated(view: TopModalView, animated: Boolean) {
    view.animated = animated
  }
  // "slide" | "fade"
  @ReactProp(name = "animationType")
  fun setAnimationType(view: TopModalView, animationType: String) {
    view.animationType = animationType
  }

  override fun getShadowNodeClass(): Class<LayoutShadowNode> {
    return ModalHostShadowNode::class.java as Class<LayoutShadowNode>
  }

  override fun createShadowNodeInstance(): LayoutShadowNode {
    return ModalHostShadowNode()
  }

  override fun createShadowNodeInstance(context: ReactApplicationContext): LayoutShadowNode {
    println("⚽️ createShadowNodeInstance")
    return ModalHostShadowNode()
  }

  override fun removeView(parent: TopModalView?, view: View?) {
    super.removeView(parent, view)
    println("⚽️ removeView")
  }

  override fun removeViewAt(parent: TopModalView?, index: Int) {
    super.removeViewAt(parent, index)
    println("⚽️ removeViewAt")
  }

  override fun onDropViewInstance(view: TopModalView) {
    super.onDropViewInstance(view)
    view.dismiss()
  }
}
