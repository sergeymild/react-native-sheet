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
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.EventDispatcher

fun Fragment.safeShow(
  manager: FragmentManager,
  tag: String?
) {
  val ft = manager.beginTransaction()
  ft.add(this, tag)
  ft.commitNowAllowingStateLoss()
}

internal fun AppFittedSheet.onSheetDismiss() {
  val reactEventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(context as ReactContext, id)
  val surfaceId = UIManagerHelper.getSurfaceId(context)
  reactEventDispatcher?.dispatchEvent(SheetDismissEvent(surfaceId, id))
}

open class AppFittedSheet(context: Context) : ViewGroup(context), LifecycleEventListener {
  private val fragmentTag = "CCBottomSheet-${System.currentTimeMillis()}"
  var mHostView = DialogRootViewGroup(context)


  var dismissable = true
  var topLeftRightCornerRadius: Float = 0F
  var _backgroundColor: Int = Color.TRANSPARENT
  var isSystemUILight: Boolean = false

  var eventDispatcher: EventDispatcher?
    get() = mHostView.eventDispatcher
    set(eventDispatcher) {
      mHostView.eventDispatcher = eventDispatcher
    }

  private fun getCurrentActivity(): AppCompatActivity? {
    return (context as? ReactContext)?.currentActivity as? AppCompatActivity
  }

  private val sheet: FragmentModalBottomSheet?
    get() = getCurrentActivity()?.supportFragmentManager?.findFragmentByTag(fragmentTag) as FragmentModalBottomSheet?

  override fun setId(id: Int) {
    super.setId(id)
    println("👀 setId $id")
    // Forward the ID to our content view, so event dispatching behaves correctly
    mHostView.id = id
  }

  fun showOrUpdate() {
    println("🥲 showOrUpdate")
    UiThreadUtil.assertOnUiThread()

    val sheet = this.sheet
    mHostView.setCornerRadius(topLeftRightCornerRadius)
    mHostView.setBackgroundColor(_backgroundColor)
    if (sheet == null) {
      val fragment = FragmentModalBottomSheet(
        modalView = mHostView,
        dismissable = dismissable,
        isSystemUILight = isSystemUILight
      ) {
        println("😀 onDismiss")
        val parent = mHostView.parent as? ViewGroup
        parent?.removeViewAt(0)
        onSheetDismiss()
      }
      getCurrentActivity()?.supportFragmentManager?.let {
        fragment.safeShow(it, fragmentTag)
      }
    }
  }

  fun setNewNestedScrollView(view: View) {
    sheet?.setNewNestedScrollView(view)
  }

  @RequiresApi(Build.VERSION_CODES.M)
  override fun dispatchProvideStructure(structure: ViewStructure) {
    mHostView.dispatchProvideStructure(structure)
  }

  override fun addView(child: View, index: Int) {
    println("🥲 addView parentId: $id id: ${child.id}")
    UiThreadUtil.assertOnUiThread()
    mHostView.addView(child, index)
//    val ctx = context as ReactContext? ?: return
//    val module = UIManagerHelper.getUIManager(ctx, UIManagerType.DEFAULT) as? UIManagerModule ?: return
//    ctx.runOnNativeModulesQueueThread {
//      val resolveShadowNode = module?.uiImplementation?.resolveShadowNode(child.id) ?: return@runOnNativeModulesQueueThread
//      val height = resolveShadowNode.layoutHeight
//      if (height > 0) mHostView.setVirtualHeight(height)
//    }
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
