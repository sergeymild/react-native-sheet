package com.sheet

import android.content.Context
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.ViewStructure
import android.view.accessibility.AccessibilityEvent
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.view.ReactViewGroup
import com.modal.safeShow

fun AppFittedSheet.onSheetDismiss() {
  (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
    .receiveEvent(id, "onSheetDismiss", Arguments.createMap())
}

class AppFittedSheet(context: Context) : ViewGroup(context), LifecycleEventListener {
  private val fragmentTag = "CCBottomSheet-${System.currentTimeMillis()}"
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
  private val backgroundColor: Int
    get() = params?.color("backgroundColor", context) ?: Color.TRANSPARENT

  private fun getCurrentActivity(): AppCompatActivity {
    return (context as ReactContext).currentActivity as AppCompatActivity
  }

  private val sheet: FragmentModalBottomSheet?
    get() = getCurrentActivity().supportFragmentManager.findFragmentByTag(fragmentTag) as FragmentModalBottomSheet?

  fun showOrUpdate() {
    println("🥲 showOrUpdate")
    UiThreadUtil.assertOnUiThread()

    val sheet = this.sheet
    if (sheet == null) {
      val fragment = FragmentModalBottomSheet(
        modalView = mHostView,
        dismissable = dismissable,
        sheetBackgroundColor = backgroundColor,
        handleRadius = topLeftRightCornerRadius ?: 0F
      ) {
        println("😀 onDismiss")
        val parent = mHostView.parent as? ViewGroup
        parent?.removeViewAt(0)
        onSheetDismiss()
      }
      fragment.safeShow(getCurrentActivity().supportFragmentManager, fragmentTag)
    }
  }

  @RequiresApi(Build.VERSION_CODES.M)
  override fun dispatchProvideStructure(structure: ViewStructure?) {
    mHostView.dispatchProvideStructure(structure)
  }

  override fun addView(child: View, index: Int) {
    println("🥲 addView parentId: $id id: ${child.id}")
    UiThreadUtil.assertOnUiThread()
    mHostView.addView(child, index)
    ModalHostShadowNode.pendingUpdateHeight[id]?.let {
      println("🥲 addView pending: $it")
      mHostView.setVirtualHeight(it)
      ModalHostShadowNode.pendingUpdateHeight.remove(id)
    }
  }

  override fun getChildCount(): Int = mHostView.childCount

  override fun getChildAt(index: Int): View? = mHostView.getChildAt(index)

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
    this.sheet?.dismissAllowingStateLoss()
  }
  override fun addChildrenForAccessibility(outChildren: ArrayList<View?>?) {}

  override fun dispatchPopulateAccessibilityEvent(event: AccessibilityEvent?) = false
  override fun onHostResume() { showOrUpdate() }
  override fun onHostPause() {}

  override fun onHostDestroy() { onDropInstance() }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}
}
