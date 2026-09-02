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
  private var inlineOverlayView: View? = null
  private var dialogOverlayView: View? = null

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

  var presentationStyle: String = "bottom"
    set(value) {
      field = value
      // In centered mode the FrameLayout centers the card; disable the RN
      // view's own translationX centering so it isn't double-shifted (right
      // side in landscape).
      mHostView.centeredPresentation = value == "center"
    }
  var centerAnimation: String = "fade"
  private var centeredDialog: CenteredSheetDialog? = null

  /**
   * Fabric state wrapper for this SheetView. Set by [Sheet2ViewManager.updateState].
   * Used to push `contentOriginOffset` values back to C++ so that
   * `SheetViewShadowNode::getContentOriginOffset()` reflects the visual position
   * of the sheet content — which keeps Pressability's responder-region check
   * aligned with actual touch coordinates.
   */
  internal var fabricStateWrapper: StateWrapper? = null

  /**
   * Pushes a Fabric state update whose effect is to make `measure()` / Pressability
   * region checks see the sheet content at its on-screen position.
   *
   * Two cases:
   *  - **Inline mode**: [mHostView] is re-parented into an overlay inside the same
   *    Activity Window, visually offset from this AppFittedSheet's Yoga position.
   *    The offset we need to add at the `<_FittedSheet>` shadow-node level is the
   *    visual delta between `mHostView`'s on-screen position and this view's.
   *  - **Dialog mode**: [mHostView] lives in a separate Dialog Window; touches
   *    inside it are dispatched by `mHostView`'s own `JSTouchDispatcher` in
   *    mHostView-local coordinates (top of sheet = 0). Meanwhile `measure()` on
   *    Fabric goes through the main-surface shadow tree and would return
   *    coordinates that include this AppFittedSheet's own Yoga-page position.
   *    Pushing `-anchor.getLocationInWindow` cancels that out so `measure()`
   *    reports mHostView-local coordinates that match the touch coords.
   */
  internal fun pushContentOriginOffset() {
    val wrapper = fabricStateWrapper ?: return
    if (!isAttachedToWindow) return
    val anchorLoc = IntArray(2).also { getLocationInWindow(it) }

    val offsetXDp: Float
    val offsetYDp: Float
    if (useInlinePresentation) {
      val hostLoc = IntArray(2).also { mHostView.getLocationInWindow(it) }
      offsetXDp = (hostLoc[0] - anchorLoc[0]).toFloat().pxToDp()
      offsetYDp = (hostLoc[1] - anchorLoc[1]).toFloat().pxToDp()
    } else {
      offsetXDp = (-anchorLoc[0]).toFloat().pxToDp()
      offsetYDp = (-anchorLoc[1]).toFloat().pxToDp()
    }

    val map = Arguments.createMap()
    map.putDouble("contentOriginOffsetX", offsetXDp.toDouble())
    map.putDouble("contentOriginOffsetY", offsetYDp.toDouble())
    runCatching { wrapper.updateState(map) }
  }

  private val inlinePresenter: InlineSheetPresenter by lazy {
    InlineSheetPresenter(this, mHostView)
  }

  init {
    mHostView.onSheetLayoutChanged = { pushContentOriginOffset() }
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

    if (presentationStyle == "center") {
      if (centeredDialog == null || centeredDialog?.isShowing != true) {
        // mHostView may still be attached to a previous parent; detach first.
        (mHostView.parent as? ViewGroup)?.removeView(mHostView)
        centeredDialog = CenteredSheetDialog(
          context = getCurrentActivity() ?: context,
          contentView = mHostView,
          dismissable = dismissable,
          slide = centerAnimation == "slide",
        ) {
          (mHostView.parent as? ViewGroup)?.removeView(mHostView)
          centeredDialog = null
          onSheetDismiss()
        }
        centeredDialog?.show()
        // Sync Fabric shadow tree with our Yoga-position once the centered Dialog
        // is laid out (same reason as the bottom-sheet Dialog path below).
        post { pushContentOriginOffset() }
      }
      return
    }

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
        fragment.setOverlayView(dialogOverlayView)
        if (stacked) {
          if (presentedSheets.contains(fragmentTag)) return
          presentedSheets.add(fragmentTag)
        }
        // Sync Fabric shadow tree with our Yoga-position once Dialog is laid out —
        // ensures Pressability's measure() returns coords matching the Dialog
        // JSTouchDispatcher's touch coords (which are mHostView-local).
        post { pushContentOriginOffset() }
      }
    } else {
      // Sheet already showing; reapply offset in case window position changed.
      post { pushContentOriginOffset() }
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
    if (useInlinePresentation && index > 0) {
      inlineOverlayView = child
      inlinePresenter.setOverlayView(child)
      return
    }
    if (!useInlinePresentation && index > 0) {
      dialogOverlayView = child
      sheet?.setOverlayView(child)
      return
    }
    mHostView.addView(child, index)
  }

  override fun getChildCount(): Int =
    mHostView.childCount +
      (if (inlineOverlayView != null) 1 else 0) +
      (if (dialogOverlayView != null) 1 else 0)

  override fun getChildAt(index: Int): View? {
    if (index < mHostView.childCount) return mHostView.getChildAt(index)
    val overlayIndex = index - mHostView.childCount
    if (inlineOverlayView != null && overlayIndex == 0) return inlineOverlayView
    return dialogOverlayView
  }

  override fun removeView(child: View) {
    UiThreadUtil.assertOnUiThread()
    if (child == inlineOverlayView) {
      inlineOverlayView = null
      inlinePresenter.setOverlayView(null)
      return
    }
    if (child == dialogOverlayView) {
      dialogOverlayView = null
      sheet?.setOverlayView(null)
      return
    }
    dismiss()
  }

  override fun removeViewAt(index: Int) {
    UiThreadUtil.assertOnUiThread()
    if (useInlinePresentation && index >= mHostView.childCount && inlineOverlayView != null) {
      inlineOverlayView = null
      inlinePresenter.setOverlayView(null)
      return
    }
    if (!useInlinePresentation && index >= mHostView.childCount && dialogOverlayView != null) {
      dialogOverlayView = null
      sheet?.setOverlayView(null)
      return
    }
    dismiss()
  }

  private fun onDropInstance() {
    (context as ReactContext).removeLifecycleEventListener(this)
    dismiss()
  }

  fun dismiss() {
    UiThreadUtil.assertOnUiThread()
    if (centeredDialog != null) {
      centeredDialog?.dismiss()
      centeredDialog = null
      return
    }
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
