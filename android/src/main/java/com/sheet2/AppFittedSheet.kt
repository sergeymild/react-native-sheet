package com.sheet2

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.view.ViewStructure
import android.view.accessibility.AccessibilityEvent
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.PixelUtil.pxToDp
import com.facebook.react.uimanager.StateWrapper
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

private var presentedSheets: MutableList<String> = mutableListOf()

open class AppFittedSheet(context: Context) : ViewGroup(context), LifecycleEventListener {
  private var stacked = true
  private val fragmentTag = "CCBottomSheet-${System.currentTimeMillis()}"
  var mHostView = DialogRootViewGroup(context)

  var dismissable = true
    set(value) {
      field = value
      inlinePresenter.setDismissable(value)
    }
  var topLeftRightCornerRadius: Float = 0F
  var _backgroundColor: Int = Color.TRANSPARENT
  var isSystemUILight: Boolean = false
  var useInlinePresentation: Boolean = false
    set(value) {
      field = value
      // When inline, mHostView sits inside the main ReactRootView; turn off its
      // own JSTouchDispatcher so we don't double-dispatch touches.
      mHostView.inlineMode = value
    }

  /**
   * Fabric state wrapper for this SheetView. Set by [Sheet2ViewManager.updateState].
   * Used to push `contentOriginOffset` values back to C++ so that
   * `SheetViewShadowNode::getContentOriginOffset()` reflects the visual position
   * of the re-parented inline sheet — which keeps Pressability's responder region
   * check aligned with actual touch coordinates.
   */
  internal var fabricStateWrapper: StateWrapper? = null

  /**
   * Pushes the visual Y delta (from Yoga-computed position of this view to the
   * actual on-screen position of [mHostView] after inline re-parenting) into our
   * Fabric ShadowNode state.
   */
  internal fun pushInlineContentOriginOffset() {
    val wrapper = fabricStateWrapper ?: return
    if (!useInlinePresentation) return
    // Attached check — wrapper can race with destruction during dismiss.
    if (!isAttachedToWindow) return
    val anchorLoc = IntArray(2).also { getLocationInWindow(it) }
    val hostLoc = IntArray(2).also { mHostView.getLocationInWindow(it) }
    // Fabric's shadow tree / Pressability work in density-independent units (DP).
    // `getLocationInWindow` returns pixels, so convert before handing to C++.
    val offsetYDp = (hostLoc[1] - anchorLoc[1]).toFloat().pxToDp()
    val offsetXDp = (hostLoc[0] - anchorLoc[0]).toFloat().pxToDp()
    val map = Arguments.createMap()
    map.putDouble("contentOriginOffsetX", offsetXDp.toDouble())
    map.putDouble("contentOriginOffsetY", offsetYDp.toDouble())
    runCatching { wrapper.updateState(map) }
  }

  private val inlinePresenter: InlineSheetPresenter by lazy {
    InlineSheetPresenter(this, mHostView)
  }

  var maxWidth: Float = 0F
    set(value) {
      field = value
      mHostView.sheetMaxWidthSize = value
      if (this.sheet == null) return
      mHostView.updateMaxWidth(mHostView.sheetMaxWidthSize)
    }

  var eventDispatcher: EventDispatcher?
    get() = mHostView.eventDispatcher
    set(eventDispatcher) {
      mHostView.eventDispatcher = eventDispatcher
    }

  private fun getCurrentActivity(): AppCompatActivity? {
    return (context as? ReactContext)?.currentActivity as? AppCompatActivity
  }

  private fun findSheet(name: String): FragmentModalBottomSheet? {
    return getCurrentActivity()?.supportFragmentManager?.findFragmentByTag(name) as? FragmentModalBottomSheet
  }

  private val sheet: FragmentModalBottomSheet?
    get() = findSheet(fragmentTag)

  override fun setId(id: Int) {
    super.setId(id)
    // In inline mode mHostView is re-parented under our own overlay. Forwarding the
    // RN tag to it would make two Android views share the same id, which confuses
    // RN's responder/event routing. Keep the forwarding only for Dialog mode.
    if (!useInlinePresentation) {
      mHostView.id = id
    } else {
      mHostView.id = View.NO_ID
    }
  }

  fun showOrUpdate() {
    UiThreadUtil.assertOnUiThread()

    mHostView.setCornerRadius(topLeftRightCornerRadius)
    mHostView.setBackgroundColor(_backgroundColor)

    if (useInlinePresentation) {
      if (!inlinePresenter.isShown) {
        inlinePresenter.show(dismissable) { onSheetDismiss() }
      }
      return
    }

    val sheet = this.sheet
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
      ) { dismissAll ->
        val parent = mHostView.parent as? ViewGroup
        parent?.removeViewAt(0)
        onSheetDismiss()
        if (dismissAll) {
          if (stacked) {
            var lastName = presentedSheets.removeLastOrNull()
            if (lastName == fragmentTag) lastName = presentedSheets.lastOrNull()
            if (lastName != null) {
              findSheet(lastName)?.let {
                it.dismissAll = true
                it.dismissAllowingStateLoss()
              }
            }
          }
          return@FragmentModalBottomSheet
        }
        if (stacked) {
          var lastName = presentedSheets.removeLastOrNull()
          if (lastName == fragmentTag) {
            lastName = presentedSheets.lastOrNull()
          }
          lastName?.let { findSheet(it)?.expand() }
        }
      }
      getCurrentActivity()?.supportFragmentManager?.let {
        fragment.safeShow(it, fragmentTag)
        if (stacked) {
          if (presentedSheets.contains(fragmentTag)) return
          presentedSheets.add(fragmentTag)
        }
      }
    }
  }

  fun setNewNestedScrollView(view: View) {
    sheet?.setNewNestedScrollView(view)
  }

  override fun dispatchProvideStructure(structure: ViewStructure) {
    mHostView.dispatchProvideStructure(structure)
  }

  override fun addView(child: View, index: Int) {
    UiThreadUtil.assertOnUiThread()
    mHostView.addView(child, index)
  }

  override fun getChildCount(): Int = mHostView.childCount

  override fun getChildAt(index: Int): View? = mHostView.getChildAt(index)

  override fun removeView(child: View) {
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  override fun removeViewAt(index: Int) {
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  private fun onDropInstance() {
    (context as ReactContext).removeLifecycleEventListener(this)
    dismiss()
  }

  fun dismiss() {
    UiThreadUtil.assertOnUiThread()
    if (useInlinePresentation) {
      inlinePresenter.dismiss()
      return
    }
    this.sheet?.dismissAllowingStateLoss()
  }

  override fun addChildrenForAccessibility(outChildren: ArrayList<View?>?) {}

  override fun dispatchPopulateAccessibilityEvent(event: AccessibilityEvent?) = false
  override fun onHostResume() { showOrUpdate() }
  override fun onHostPause() {}
  override fun onHostDestroy() { onDropInstance() }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}

  companion object {
    fun dismissAll(activity: AppCompatActivity) {
      val fragment = activity.supportFragmentManager.fragments.lastOrNull()
      if (fragment is FragmentModalBottomSheet) {
        fragment.dismissAll = true
        fragment.dismissAllowingStateLoss()
      }
    }

    fun dismissPresented(activity: AppCompatActivity) {
      val fragment = activity.supportFragmentManager.fragments.lastOrNull()
      if (fragment is FragmentModalBottomSheet) {
        fragment.dismissAllowingStateLoss()
      }
    }
  }
}
