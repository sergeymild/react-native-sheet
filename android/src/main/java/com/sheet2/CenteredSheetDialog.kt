package com.sheet2

import android.animation.ValueAnimator
import android.app.Dialog
import android.content.Context
import android.graphics.Rect
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import android.widget.FrameLayout
import kotlin.math.abs
import kotlin.math.max

/**
 * Presents [contentView] as a floating card in the vertical center of the
 * screen with a full-screen window dim. Dismissed by swiping the card down or
 * (when [dismissable]) tapping the dimmed background.
 *
 * Deliberately does NOT use BottomSheetBehavior — a plain centered Dialog plus a
 * small vertical-drag gesture keeps the shared bottom-sheet path untouched.
 *
 * Parity target (iOS): while dragging the card down the whole-screen dim fades
 * in sync with the card position; releasing past a distance/velocity threshold
 * slides the card fully off the bottom while the dim fades to zero, otherwise
 * the card springs back and the dim restores. Because [contentView] hosts a live
 * React view tree that consumes its own touches, the drag is detected by a
 * custom [DragDismissLayout] that intercepts vertical drags (leaving taps to the
 * React children) and treats taps on the dim area as a dismiss request.
 */
class CenteredSheetDialog(
  context: Context,
  private val contentView: View,
  private val dismissable: Boolean,
  private val slide: Boolean,
  private val onDismiss: () -> Unit,
) {
  private val dialog = Dialog(context)
  val isShowing: Boolean get() = dialog.isShowing

  private val maxDim = 0.5f
  private var dismissing = false

  init {
    dialog.requestWindowFeature(Window.FEATURE_NO_TITLE)

    val container = DragDismissLayout(context)
    val lp = FrameLayout.LayoutParams(
      ViewGroup.LayoutParams.WRAP_CONTENT,
      ViewGroup.LayoutParams.WRAP_CONTENT,
    ).apply { gravity = Gravity.CENTER }
    container.addView(contentView, lp)
    container.card = contentView
    dialog.setContentView(container)

    dialog.window?.apply {
      setBackgroundDrawableResource(android.R.color.transparent)
      setLayout(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.MATCH_PARENT,
      )
      setGravity(Gravity.CENTER)
      // Full-screen dim behind the card.
      addFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
      setDimAmount(maxDim)
      // Enter/exit window animation: reuse existing fade/slide anim styles.
      attributes = attributes.apply {
        windowAnimations = if (slide) {
          R.style.Custom_Theme_FullScreenDialog_Slide
        } else {
          R.style.Custom_Theme_FullScreenDialog_Fade
        }
      }
    }

    // Back-button dismissal only; tap-outside is handled by DragDismissLayout
    // because a MATCH_PARENT window never reports a touch as "outside".
    dialog.setCancelable(dismissable)
    dialog.setCanceledOnTouchOutside(false)
    dialog.setOnCancelListener { onDismiss() }
  }

  fun show() = dialog.show()

  fun dismiss() {
    if (dialog.isShowing) dialog.dismiss()
  }

  private fun setDim(amount: Float) {
    dialog.window?.let { w ->
      w.attributes = w.attributes.apply { dimAmount = amount.coerceIn(0f, maxDim) }
    }
  }

  private fun animateDismiss(card: View, screenHeight: Float) {
    if (dismissing) return
    dismissing = true
    val startY = card.translationY
    val endY = screenHeight // slide fully off the bottom
    val startDim = dialog.window?.attributes?.dimAmount ?: maxDim
    ValueAnimator.ofFloat(0f, 1f).apply {
      duration = 200
      addUpdateListener { a ->
        val f = a.animatedValue as Float
        card.translationY = startY + (endY - startY) * f
        setDim(startDim * (1f - f))
      }
      addListener(object : android.animation.AnimatorListenerAdapter() {
        override fun onAnimationEnd(animation: android.animation.Animator) {
          onDismiss()
          dialog.dismiss()
        }
      })
      start()
    }
  }

  private fun animateSpringBack(card: View) {
    val startY = card.translationY
    val startDim = dialog.window?.attributes?.dimAmount ?: maxDim
    ValueAnimator.ofFloat(0f, 1f).apply {
      duration = 180
      addUpdateListener { a ->
        val f = a.animatedValue as Float
        card.translationY = startY * (1f - f)
        setDim(startDim + (maxDim - startDim) * f)
      }
      start()
    }
  }

  /**
   * Full-screen container that owns the centered [card]. It intercepts a
   * downward drag started on the card (so the card can follow the finger and be
   * flung away) while letting ordinary taps reach the React children, and treats
   * a tap that lands off the card as a dim-background dismiss.
   */
  private inner class DragDismissLayout(context: Context) : FrameLayout(context) {
    var card: View? = null

    private val touchSlop = ViewConfiguration.get(context).scaledTouchSlop
    private val density = resources.displayMetrics.density
    private val screenHeight = resources.displayMetrics.heightPixels.toFloat()
    private val threshold = density * 96f // ~96dp drag distance to dismiss
    // Distance over which the dim fully fades while dragging — keeps the fade
    // roughly in sync with the card sliding toward the bottom edge.
    private val fadeDistance = max(screenHeight * 0.5f, threshold * 2f)

    private var downX = 0f
    private var downY = 0f
    private var downInsideCard = false
    private var dragging = false
    private var lastY = 0f
    private var lastT = 0L
    private var velocity = 0f
    private val hitRect = Rect()

    private fun cardContains(x: Float, y: Float): Boolean {
      val c = card ?: return false
      c.getHitRect(hitRect)
      // getHitRect already accounts for translationY.
      return hitRect.contains(x.toInt(), y.toInt())
    }

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
      when (ev.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
          downX = ev.x
          downY = ev.y
          downInsideCard = cardContains(ev.x, ev.y)
          dragging = false
          lastY = ev.rawY
          lastT = ev.eventTime
          velocity = 0f
        }
        MotionEvent.ACTION_MOVE -> {
          if (dismissing) return true
          val dy = ev.y - downY
          val dx = ev.x - downX
          if (downInsideCard && dy > touchSlop && dy > abs(dx)) {
            dragging = true
            return true // start owning the gesture; children get CANCEL
          }
        }
      }
      return dragging
    }

    override fun onTouchEvent(ev: MotionEvent): Boolean {
      when (ev.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
          // Reached here for taps on the dim area (no child consumed the down).
          downX = ev.x
          downY = ev.y
          downInsideCard = cardContains(ev.x, ev.y)
          return true
        }
        MotionEvent.ACTION_MOVE -> {
          if (dismissing) return true
          if (dragging) {
            val dt = (ev.eventTime - lastT).coerceAtLeast(1L)
            velocity = (ev.rawY - lastY) / dt * 1000f
            lastY = ev.rawY
            lastT = ev.eventTime
            val dy = ev.y - downY
            val card = card
            if (card != null && dy > 0) {
              card.translationY = dy
              setDim(maxDim * (1f - dy / fadeDistance))
            }
          }
          return true
        }
        MotionEvent.ACTION_UP -> {
          val card = card
          if (dragging && card != null) {
            val dy = ev.y - downY
            val fling = velocity > density * 1200f
            if (dismissable && (dy > threshold || fling)) {
              animateDismiss(card, screenHeight)
            } else {
              animateSpringBack(card)
            }
          } else if (!downInsideCard && dismissable && !dismissing) {
            // Tap on the dimmed background.
            val moved = abs(ev.x - downX) > touchSlop || abs(ev.y - downY) > touchSlop
            if (!moved) {
              onDismiss()
              dialog.dismiss()
            }
          }
          dragging = false
          return true
        }
        MotionEvent.ACTION_CANCEL -> {
          val card = card
          if (dragging && card != null) animateSpringBack(card)
          dragging = false
          return true
        }
      }
      return super.onTouchEvent(ev)
    }
  }
}
