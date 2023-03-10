package com.modal

import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.*
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.yoga.YogaPositionType
import com.sheet.ModalHostHelper

private class ModalHostShadowNode : LayoutShadowNode() {
  override fun addChildAt(child: ReactShadowNodeImpl, i: Int) {
    super.addChildAt(child, i)
    val modalSize = ModalHostHelper.getModalHostSize(themedContext)
    child.setStyleWidth(modalSize.x.toFloat())
    child.setStyleHeight(modalSize.y.toFloat())
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

  override fun onAfterUpdateTransaction(view: TopModalView) {
    super.onAfterUpdateTransaction(view)
    view.showOrUpdate()
  }
}
