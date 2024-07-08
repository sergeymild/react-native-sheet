package com.transparent.activity

import android.content.res.Resources
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.LayoutShadowNode
import com.facebook.react.uimanager.ReactShadowNodeImpl
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
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

class TransparentActivityManager : ViewGroupManager<ActivityModalView>() {
  override fun getName() = "TransparentActivity"

  override fun createViewInstance(reactContext: ThemedReactContext): ActivityModalView {
    return ActivityModalView(reactContext)
  }

  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Any>? {
    return MapBuilder.builder<String, Any>()
      .put("onActivityDismiss", MapBuilder.of("registrationName", "onActivityDismiss"))
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

  override fun removeView(parent: ActivityModalView?, view: View?) {
    super.removeView(parent, view)
    println("⚽️ removeView")
  }

  override fun removeViewAt(parent: ActivityModalView?, index: Int) {
    super.removeViewAt(parent, index)
    println("⚽️ removeViewAt")
  }

  override fun onDropViewInstance(view: ActivityModalView) {
    super.onDropViewInstance(view)
    view.dismiss()
  }
}
