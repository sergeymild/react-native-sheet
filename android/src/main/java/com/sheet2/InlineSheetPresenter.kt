package com.sheet2

import android.animation.ValueAnimator
import android.graphics.Color
import android.os.SystemClock
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import com.behavior.BottomSheetBehavior
import com.facebook.react.uimanager.RootView

/**
 * Presents the sheet inline — as a child of the current react-native-screens
 * Screen's container (ScreenStack / ScreensCoordinatorLayout) — instead of in a
 * separate Dialog Window. When a new Screen (e.g. fullScreenModal) is pushed on
 * top via react-native-screens, the new Screen is added as a later sibling in the
 * same container and naturally covers our overlay.
 *
 * Known limitation on Fabric: `measure()` on RN refs inside the sheet returns
 * Yoga-tree coords, not the native visual position. Pressability's responder
 * region check therefore fails unless the RN consumer either provides large
 * `hitSlop`, or until a custom Fabric ShadowNode with an
 * `getContentOriginOffset` override is wired up (see plan v4, Шаг 2).
 */
internal class InlineSheetPresenter(
  private val anchor: AppFittedSheet,
  private val hostView: View,
) {

  private var overlay: FrameLayout? = null
  private var behavior: BottomSheetBehavior<FrameLayout>? = null
  private var scrimAnimator: ValueAnimator? = null
  private var onDismiss: (() -> Unit)? = null

  val isShown: Boolean get() = overlay != null

  fun show(dismissable: Boolean, onDismiss: () -> Unit) {
    if (isShown) return
    val root = findInlineRoot() ?: return
    this.onDismiss = onDismiss

    val ctx = anchor.context

    val overlayRoot = FrameLayout(ctx).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT,
      )
    }

    val coordinator = CoordinatorLayout(ctx).apply {
      layoutParams = FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        FrameLayout.LayoutParams.MATCH_PARENT,
      )
      setBackgroundColor(Color.TRANSPARENT)
    }
    overlayRoot.addView(coordinator)

    val touchOutside = View(ctx).apply {
      layoutParams = CoordinatorLayout.LayoutParams(
        CoordinatorLayout.LayoutParams.MATCH_PARENT,
        CoordinatorLayout.LayoutParams.MATCH_PARENT,
      )
    }
    coordinator.addView(touchOutside)

    val designBottomSheet = FrameLayout(ctx).apply {
      layoutParams = CoordinatorLayout.LayoutParams(
        CoordinatorLayout.LayoutParams.MATCH_PARENT,
        CoordinatorLayout.LayoutParams.WRAP_CONTENT,
      ).apply {
        gravity = Gravity.TOP or Gravity.CENTER_HORIZONTAL
      }
    }

    (hostView.parent as? ViewGroup)?.removeView(hostView)
    designBottomSheet.addView(hostView)
    coordinator.addView(designBottomSheet)

    val behavior = BottomSheetBehavior<FrameLayout>().apply {
      setHideable(true)
      setSkipCollapsed(true)
      setDraggable(dismissable)
      setPeekHeight(10, false)
      setState(BottomSheetBehavior.STATE_HIDDEN)
      addBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
        override fun onStateChanged(bottomSheet: View, newState: Int) {
          if (newState == BottomSheetBehavior.STATE_DRAGGING) {
            // BottomSheetBehavior took over the gesture natively. In inline
            // mode JS touches are dispatched by the ancestor ReactRootView's
            // JSTouchDispatcher, which doesn't see the native intercept and
            // would still fire a press on ACTION_UP. Notify it to cancel the
            // active responder so a swipe-to-dismiss isn't mistaken for a tap.
            cancelAncestorJsTouches(bottomSheet)
          } else if (newState == BottomSheetBehavior.STATE_HIDDEN) {
            dismiss(animated = false, invokeCallback = true)
          } else if (newState == BottomSheetBehavior.STATE_EXPANDED ||
            newState == BottomSheetBehavior.STATE_COLLAPSED ||
            newState == BottomSheetBehavior.STATE_HALF_EXPANDED
          ) {
            // Sheet settled — sync Fabric shadow tree with our new visual
            // position so Pressability measures correctly.
            bottomSheet.post { anchor.pushContentOriginOffset() }
          }
        }

        override fun onSlide(bottomSheet: View, slideOffset: Float) {
          // While dragging, update offset each frame so the user can still tap
          // elements after the sheet settles at a non-expanded position.
          anchor.pushContentOriginOffset()
        }
      })
    }
    (designBottomSheet.layoutParams as CoordinatorLayout.LayoutParams).behavior = behavior
    this.behavior = behavior

    touchOutside.setOnClickListener {
      if (dismissable) behavior.setState(BottomSheetBehavior.STATE_HIDDEN)
    }

    animateScrim(coordinator, fromAlpha = 0f, toAlpha = SCRIM_ALPHA)

    root.addView(overlayRoot)
    overlay = overlayRoot

    designBottomSheet.post {
      behavior.setState(BottomSheetBehavior.STATE_EXPANDED)
      // Post once more so Fabric state sync runs after the expand-layout pass.
      designBottomSheet.post { anchor.pushContentOriginOffset() }
    }
  }

  fun dismiss(animated: Boolean = true, invokeCallback: Boolean = true) {
    val layout = overlay ?: return
    val behavior = this.behavior
    if (animated && behavior != null && behavior.getState() != BottomSheetBehavior.STATE_HIDDEN) {
      behavior.setState(BottomSheetBehavior.STATE_HIDDEN)
      return
    }
    scrimAnimator?.cancel()
    scrimAnimator = null
    this.behavior = null
    overlay = null
    (layout.parent as? ViewGroup)?.removeView(layout)
    (hostView.parent as? ViewGroup)?.removeView(hostView)
    if (invokeCallback) onDismiss?.invoke()
    onDismiss = null
  }

  fun setDismissable(dismissable: Boolean) {
    behavior?.setDraggable(dismissable)
  }

  /**
   * Walks up from [anchor] looking for the closest react-native-screens Screen
   * ancestor and returns its parent (the ScreenStack / ScreensCoordinatorLayout).
   * Attaching the overlay there places it as a sibling of the current Screen —
   * so when a new Screen is pushed (e.g. fullScreenModal) it lands as a later
   * child of the same container and naturally draws on top of us.
   *
   * Using the Screen itself does not work: Screen and ScreenContentWrapper rely on
   * RN/Yoga to lay out their children and leave non-RN children at 0×0.
   *
   * Falls back to the top-most ViewGroup ancestor when not hosted by
   * react-native-screens.
   */
  private fun findInlineRoot(): ViewGroup? {
    var current: ViewParent? = anchor.parent
    var lastGroup: ViewGroup? = null
    while (current != null) {
      if (current is ViewGroup) lastGroup = current
      if (current.javaClass.name == SCREEN_CLASS_NAME) {
        return (current.parent as? ViewGroup) ?: (current as? ViewGroup)
      }
      current = current.parent
    }
    return lastGroup
  }

  private fun cancelAncestorJsTouches(child: View) {
    var p: ViewParent? = child.parent
    while (p != null) {
      if (p is RootView) {
        val now = SystemClock.uptimeMillis()
        val ev = MotionEvent.obtain(now, now, MotionEvent.ACTION_CANCEL, 0f, 0f, 0)
        try {
          (p as RootView).onChildStartedNativeGesture(child, ev)
        } finally {
          ev.recycle()
        }
        return
      }
      p = p.parent
    }
  }

  private fun animateScrim(target: View, fromAlpha: Float, toAlpha: Float) {
    scrimAnimator?.cancel()
    val animator = ValueAnimator.ofFloat(fromAlpha, toAlpha).apply {
      duration = SCRIM_DURATION_MS
      addUpdateListener { animation ->
        val alpha = animation.animatedValue as Float
        val alphaByte = (alpha * 255).toInt().coerceIn(0, 255)
        target.setBackgroundColor(Color.argb(alphaByte, 0, 0, 0))
      }
    }
    scrimAnimator = animator
    animator.start()
  }

  companion object {
    private const val SCRIM_ALPHA = 0.5f
    private const val SCRIM_DURATION_MS = 250L
    private const val SCREEN_CLASS_NAME = "com.swmansion.rnscreens.Screen"
  }
}
