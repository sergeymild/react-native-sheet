package com.sheet2

import android.annotation.SuppressLint
import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import androidx.annotation.UiThread
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.react.uimanager.JSPointerDispatcher
import com.facebook.react.uimanager.JSTouchDispatcher
import com.facebook.react.uimanager.PixelUtil.pxToDp
import com.facebook.react.uimanager.RootView
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.events.EventDispatcher
import com.facebook.react.views.view.ReactViewGroup

open class BaseRNView(context: Context?) : ReactViewGroup(context), RootView {
  internal var stateWrapper: StateWrapper? = null
  internal var eventDispatcher: EventDispatcher? = null

  /**
   * When true, disables this view's own touch-dispatch pipeline (local
   * `JSTouchDispatcher`, unconditional `onTouchEvent` consumption, no-op
   * `requestDisallowInterceptTouchEvent`). Required in inline presentation —
   * there the view lives inside the main `ReactRootView`, and having a second
   * dispatcher fire for the same `MotionEvent` breaks RN's responder system.
   * Default `false` for the Dialog mode, where this view is a real root.
   */
  var inlineMode: Boolean = false

  private var viewWidth = 0
  private var viewHeight = 0
  private val jSTouchDispatcher: JSTouchDispatcher = JSTouchDispatcher(this)
  private var jSPointerDispatcher: JSPointerDispatcher? = null

  private val reactContext: ThemedReactContext
    get() = context as ThemedReactContext

  init {
    if (ReactFeatureFlags.dispatchPointerEvents) {
      jSPointerDispatcher = JSPointerDispatcher(this)
    }
  }

  override fun onInitializeAccessibilityNodeInfo(info: AccessibilityNodeInfo) {
    super.onInitializeAccessibilityNodeInfo(info)
  }

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    viewWidth = w
    viewHeight = h

    updateState(viewWidth, viewHeight)
  }

  @UiThread
  public fun updateState(width: Int, height: Int) {
    val sw = stateWrapper ?: return
    val realWidth: Float = width.toFloat().pxToDp()
    val realHeight: Float = height.toFloat().pxToDp()
    val newStateData: WritableMap = WritableNativeMap()
    newStateData.putDouble("screenWidth", realWidth.toDouble())
    newStateData.putDouble("screenHeight", realHeight.toDouble())
    sw.updateState(newStateData)
  }

  override fun handleException(t: Throwable) {
    reactContext.reactApplicationContext.handleException(RuntimeException(t))
  }

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    if (!inlineMode) {
      eventDispatcher?.let { eventDispatcher ->
        jSTouchDispatcher.handleTouchEvent(event, eventDispatcher, reactContext)
        jSPointerDispatcher?.handleMotionEvent(event, eventDispatcher, true)
      }
    }
    return super.onInterceptTouchEvent(event)
  }

  @SuppressLint("ClickableViewAccessibility")
  override fun onTouchEvent(event: MotionEvent): Boolean {
    if (inlineMode) {
      // Nested inside the main ReactRootView — do not dispatch our own JS
      // touch events or eat the event; let normal target finding run.
      return super.onTouchEvent(event)
    }
    eventDispatcher?.let { eventDispatcher ->
      jSTouchDispatcher.handleTouchEvent(event, eventDispatcher, reactContext)
      jSPointerDispatcher?.handleMotionEvent(event, eventDispatcher, false)
    }
    super.onTouchEvent(event)
    // In case when there is no children interested in handling touch event, we return true from
    // the root view in order to receive subsequent events related to that gesture
    return true
  }

  override fun onChildStartedNativeGesture(childView: View?, ev: MotionEvent) {
    if (inlineMode) return
    eventDispatcher?.let { eventDispatcher ->
      jSTouchDispatcher.onChildStartedNativeGesture(ev, eventDispatcher)
      jSPointerDispatcher?.onChildStartedNativeGesture(childView, ev, eventDispatcher)
    }
  }

  override fun onChildEndedNativeGesture(childView: View, ev: MotionEvent) {
    if (inlineMode) return
    eventDispatcher?.let { jSTouchDispatcher.onChildEndedNativeGesture(ev, it) }
    jSPointerDispatcher?.onChildEndedNativeGesture()
  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
    if (inlineMode) {
      // Nested inside the app's main ReactRootView — respect ancestors' intercept
      // requests so normal gesture arbitration works.
      super.requestDisallowInterceptTouchEvent(disallowIntercept)
      return
    }
    // No-op - override in order to still receive events to onInterceptTouchEvent
    // even when some other view disallow that
  }
}
