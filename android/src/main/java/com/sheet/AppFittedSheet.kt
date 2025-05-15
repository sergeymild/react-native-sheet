package com.sheet

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.view.ViewStructure
import android.view.accessibility.AccessibilityEvent
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.react.uimanager.events.RCTEventEmitter

fun androidx.fragment.app.Fragment.safeShow(
  manager: FragmentManager,
  tag: String?
) {
  val ft = manager.beginTransaction()
  ft.add(this, tag)
  ft.commitNowAllowingStateLoss()
}

internal fun AppFittedSheet.onSheetDismiss() {
  (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
    .receiveEvent(id, "onSheetDismiss", Arguments.createMap())
}

private var presentedSheets: MutableList<String> = mutableListOf()

class AppFittedSheet(context: Context) : ViewGroup(context), LifecycleEventListener {
  private var stacked = true
  private val fragmentTag = "CCBottomSheet-${System.currentTimeMillis()}"
  var mHostView = DialogRootViewGroup(context)

  var params: ReadableMap? = null
    set(value) {
      mHostView.sheetMaxHeightSize = value.double("maxHeight", Double.MAX_VALUE).toPxD()
      mHostView.sheetMaxWidthSize = value.double("maxWidth", Double.MAX_VALUE).toPxD()
      mHostView.sheetMinHeightSize = value.double("minHeight", Double.MIN_VALUE).toPxD()

      field = value
    }

  private val dismissable: Boolean
    get() = params.bool("dismissable", true)
  private val topLeftRightCornerRadius: Float
    get() = params.float("topLeftRightCornerRadius", 0f)
  private val backgroundColor: Int
    get() = params?.color("backgroundColor", context) ?: Color.TRANSPARENT
  private val isSystemUILight: Boolean
    get() = params?.bool("isSystemUILight", false) ?: false

  private fun getCurrentActivity(): AppCompatActivity? {
    return (context as? ReactContext)?.currentActivity as? AppCompatActivity
  }

  private fun findSheet(name: String): FragmentModalBottomSheet? {
    return getCurrentActivity()?.supportFragmentManager?.findFragmentByTag(name) as? FragmentModalBottomSheet
  }
  private val sheet: FragmentModalBottomSheet?
    get() = findSheet(fragmentTag)

  fun showOrUpdate() {
    println("🥲 showOrUpdate")
    UiThreadUtil.assertOnUiThread()

    val sheet = this.sheet
    mHostView.setCornerRadius(topLeftRightCornerRadius)
    mHostView.setBackgroundColor(backgroundColor)
    if (sheet == null) {
      if (stacked) {
        presentedSheets.lastOrNull()?.let {
          findSheet(it)?.collapse()
        }
      }

      val fragment = FragmentModalBottomSheet(
        modalView = mHostView,
        dismissable = dismissable,
        isSystemUILight = isSystemUILight
      ) {
        println("😀 onDismiss")
        val parent = mHostView.parent as? ViewGroup
        parent?.removeViewAt(0)
        onSheetDismiss()
        if (stacked) {
          var lastName = presentedSheets.removeLastOrNull()
          if (lastName == fragmentTag) {
            lastName = presentedSheets.lastOrNull()
          }
          lastName?.let { findSheet(it)?.expand() }
          println("👀 Dismiss ${presentedSheets.size}")
        }
      }
      getCurrentActivity()?.supportFragmentManager?.let {
        fragment.safeShow(it, fragmentTag)
        if (stacked) {
          println("👀 Show ${presentedSheets.size} name: $fragmentTag")
          if (presentedSheets.contains(fragmentTag)) return
          presentedSheets.add(fragmentTag)
        }
      }
    }
  }

  fun setNewNestedScrollView(view: View) {
    sheet?.setNewNestedScrollView(view)
  }

  override fun dispatchProvideStructure(structure: ViewStructure?) {
    mHostView.dispatchProvideStructure(structure)
  }

  override fun addView(child: View, index: Int) {
    println("🥲 addView parentId: $id id: ${child.id}")
    UiThreadUtil.assertOnUiThread()
    mHostView.addView(child, index)
    val ctx = context as ReactContext? ?: return
    val module = UIManagerHelper.getUIManager(ctx, UIManagerType.DEFAULT) as? UIManagerModule ?: return
    ctx.runOnNativeModulesQueueThread {
      val resolveShadowNode = module?.uiImplementation?.resolveShadowNode(child.id) ?: return@runOnNativeModulesQueueThread
      val height = resolveShadowNode.layoutHeight
      if (height > 0) mHostView.setVirtualHeight(height)
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
