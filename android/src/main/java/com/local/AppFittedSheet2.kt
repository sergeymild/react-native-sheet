package com.local

import android.content.Context
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.ViewStructure
import android.view.accessibility.AccessibilityEvent
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.sheet.DialogRootViewGroup
import com.sheet.bool
import com.sheet.float
import com.sheet.toPxD


class AppFittedSheet2(context: Context) : ViewGroup(context), LifecycleEventListener {
  var mHostView = DialogRootViewGroup(context)

  var params: ReadableMap? = null
    set(value) {
      if (value?.hasKey("maxHeight") == true) {
        mHostView.sheetMaxHeightSize = value.getDouble("maxHeight").toPxD()
      }

      field = value
    }

  private val dismissable: Boolean
  get() = params?.bool("dismissable") ?: true

  private val topLeftRightCornerRadius: Float?
    get() = params?.float("topLeftRightCornerRadius")
//  private val backgroundColor: Int
//    get() = params?.color("backgroundColor", context) ?: Color.TRANSPARENT
  private val isDark: Boolean
    get() = params?.bool("isDark") ?: false

  private fun getCurrentActivity(): AppCompatActivity {
    return (context as ReactContext).currentActivity as AppCompatActivity
  }

  fun showOrUpdate() {
    println("🥲 showOrUpdate")
    UiThreadUtil.assertOnUiThread()

    setBackgroundColor(Color.YELLOW)
    addView(mHostView)
    mHostView.setBackgroundColor(Color.RED)
  }

  @RequiresApi(Build.VERSION_CODES.M)
  override fun dispatchProvideStructure(structure: ViewStructure?) {
    mHostView.dispatchProvideStructure(structure)
  }

  override fun addView(child: View?) {
    super.addView(child)
    println("🥲 addView child: $child")
  }

  override fun addView(child: View, index: Int) {
    UiThreadUtil.assertOnUiThread()
    if (child is DialogRootViewGroup) {
      println("🥲 addView DialogRootViewGroup $index")
      super.addView(child, -1)
      return
    }
    println("🥲 addView parentId: $id id: ${child.id} ${child.contentDescription}")
    mHostView.addView(child, index)
    ModalHostShadowNode.pendingUpdateHeight[id]?.let {
      println("🥲 addView pending: $it")
      mHostView.setVirtualHeight(it)
      ModalHostShadowNode.pendingUpdateHeight.remove(id)
    }
  }

  //override fun getChildCount(): Int = mHostView.childCount

//  override fun getChildAt(index: Int): View? {
//    if (index == 0) return mHostView
//    println("🥲 getChildAt id: ${mHostView.getChildAt(index)}")
//    return mHostView.getChildAt(index)
//  }

  override fun removeView(child: View) {
    println("🥲 removeView id: ${child.id}")
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    println("🥲 onDetachedFromWindow: $id")
    ModalHostShadowNode.attachedViews.remove(id)
    ModalHostShadowNode.pendingUpdateHeight.remove(id)
  }

  override fun removeViewAt(index: Int) {
    println("🥲 removeViewAt: $index id: ${mHostView.getChildAt(index).id}")
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  private fun onDropInstance() {
    println("🥲 onDropInstance")
    (context as ReactContext).removeLifecycleEventListener(this)
    dismiss()
  }

  fun dismiss() {
    println("🥲 dismiss")
    UiThreadUtil.assertOnUiThread()
    //this.sheet?.dismissAllowingStateLoss()
  }
  override fun addChildrenForAccessibility(outChildren: ArrayList<View?>?) {}

  override fun dispatchPopulateAccessibilityEvent(event: AccessibilityEvent?) = false
  override fun onHostResume() { showOrUpdate() }
  override fun onHostPause() {}

  override fun onHostDestroy() { onDropInstance() }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    layoutChildren(l, t, r, b, false)
  }

  fun layoutChildren(left: Int, top: Int, right: Int, bottom: Int, forceLeftGravity: Boolean) {
    val count = getChildCount()
    for (i in 0 until count) {
      val child = getChildAt(i)
      if (child!!.visibility != GONE) {
        child!!.layout(0, 0, 0 + width, 0 + height)
      }
    }
  }
}
