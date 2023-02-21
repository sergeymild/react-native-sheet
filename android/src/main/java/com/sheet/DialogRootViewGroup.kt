package com.sheet

import android.animation.ValueAnimator
import android.content.Context
import android.view.MotionEvent
import android.view.View
import com.facebook.react.bridge.ReactContext
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.react.uimanager.JSPointerDispatcher
import com.facebook.react.uimanager.JSTouchDispatcher
import com.facebook.react.uimanager.RootView
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.events.EventDispatcher
import com.facebook.react.views.view.ReactViewGroup
import kotlin.math.min

class DialogRootViewGroup(context: Context) : ReactViewGroup(context), RootView,
  View.OnLayoutChangeListener {

  private val reactContext: ReactContext
    get() = context as ReactContext
  private val mJSTouchDispatcher = JSTouchDispatcher(this)
  private var mJSPointerDispatcher: JSPointerDispatcher? = null
  private var animator: ValueAnimator? = null

  init {
    if (ReactFeatureFlags.dispatchPointerEvents) {
      mJSPointerDispatcher = JSPointerDispatcher(this)
    }
  }

  private val eventDispatcher: EventDispatcher
    get() {
      val reactContext = reactContext
      return reactContext.getNativeModule(UIManagerModule::class.java)!!.eventDispatcher
    }
  private var reactView: View? = null
    set(value) {
      field = value
      if (value == null) pendingHeight = null
    }

  var sheetMaxWidthSize: Double = -1.0
  var sheetMaxHeightSize: Double = -1.0
  private val screenHeight: Int by lazy {
    return@lazy ModalHostHelper.getModalHostSize(context).y
  }

  private fun allowedHeight(): Int {
    println("🥲 DialogRootViewGroup.allowedHeight reactHeight: ${reactHeight.toDP()}, sheetMaxHeightSize: ${sheetMaxHeightSize.toDP()}, screenHeight: ${screenHeight.toDP()}")
    if (sheetMaxHeightSize == -1.0) {
      return min(reactHeight, screenHeight)
    }

    return min(min(sheetMaxHeightSize.toInt(), screenHeight), reactHeight)
  }

  private var pendingHeight: Int? = null
  var reactHeight: Int = -1
  set(value) {
    field = value
    println("😀 DialogRootViewGroup.reactHeight $value")
  }

  fun setVirtualHeight(h: Int) {
    if (reactView == null) {
      pendingHeight = h
      return
    }
    pendingHeight = null
    if (layoutParams == null) {
      layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
    }
    this@DialogRootViewGroup.reactHeight = h
    var oldH = layoutParams?.height ?: -1
    println("😀 DialogRootViewGroup.setVirtualHeight oldH.lp: $oldH")
    if (oldH <= 0) oldH = measuredHeight
    println("😀 DialogRootViewGroup.setVirtualHeight oldH.mh: $oldH allowHeight: ${allowedHeight()}")
    if (oldH < 0) {
      layoutParams?.height = allowedHeight()
      ReactNativeReflection.setSize(reactView, measuredWidth, allowedHeight())
    } else {
      playNewHeightAnimation(oldH = oldH, newH = allowedHeight())
    }
  }

  override fun onLayoutChange(
    v: View?,
    left: Int,
    top: Int,
    right: Int,
    bottom: Int,
    oldLeft: Int,
    oldTop: Int,
    oldRight: Int,
    oldBottom: Int
  ) {
    println("😀 DialogRootViewGroup.addOnLayoutChangeListener ${right - left} ${bottom - top}")
    if (sheetMaxHeightSize > 0.0) {
      return
    }
    setVirtualHeight(bottom - top)
  }

  override fun addView(child: View, index: Int, params: LayoutParams) {
    if (reactView != null) removeView(reactView)
    super.addView(child, -1, params)
    reactView = child
    if (sheetMaxHeightSize < 0.0) {
      reactView!!.addOnLayoutChangeListener(this)
    } else {
      setVirtualHeight(sheetMaxHeightSize.toInt())
      //ReactNativeReflection.setSize(reactView, measuredWidth, allowedHeight())
    }
  }

  override fun removeView(view: View?) {
    if (view == reactView) releaseReactView()
    super.removeView(view)
  }

  override fun removeViewAt(index: Int) {
    if (getChildAt(index) === reactView) releaseReactView()
    super.removeViewAt(index)
  }

  override fun onChildStartedNativeGesture(p0: View?, p1: MotionEvent?) {
    mJSTouchDispatcher.onChildStartedNativeGesture(p1, eventDispatcher)
    mJSPointerDispatcher?.onChildStartedNativeGesture(p0, p1, eventDispatcher)
  }

  override fun onChildStartedNativeGesture(p0: MotionEvent?) {
    this.onChildStartedNativeGesture(null, p0)
  }

  override fun onChildEndedNativeGesture(p0: View?, p1: MotionEvent?) {
    mJSTouchDispatcher.onChildEndedNativeGesture(p1, eventDispatcher)
    mJSPointerDispatcher?.onChildEndedNativeGesture()
  }

  override fun handleException(t: Throwable?) {
    reactContext.handleException(RuntimeException(t))
  }

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    mJSTouchDispatcher.handleTouchEvent(event, eventDispatcher)
    mJSPointerDispatcher?.handleMotionEvent(event, eventDispatcher)
    return super.onInterceptTouchEvent(event)
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    try {
      mJSTouchDispatcher.handleTouchEvent(event, eventDispatcher)
      mJSPointerDispatcher?.handleMotionEvent(event, eventDispatcher)
    } catch (e: Throwable) {
      //e
    }
    super.onTouchEvent(event)
    // In case when there is no children interested in handling touch event, we return true from
    // the root view in order to receive subsequent events related to that gesture
    return true
  }

  // No-op - override in order to still receive events to onInterceptTouchEvent
  // even when some other view disallow that
  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) = Unit

  override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
    super.onSizeChanged(w, h, oldw, oldh)
    if (sheetMaxHeightSize >= 0.0) {
      reactView?.let {
        ReactNativeReflection.setSize(it, w, allowedHeight())
      }
    }
  }

  private fun playNewHeightAnimation(oldH: Int, newH: Int) {
    //ReactNativeReflection.setSize(reactView, measuredWidth, newH)
    animator?.let {
      it.cancel()
      it.removeAllListeners()
    }
    ValueAnimator.ofInt(oldH, newH).also {
      it.duration = 250L
      it.addUpdateListener { animator ->
        val h = animator.animatedValue as Int
        this@DialogRootViewGroup.reactHeight = h
        layoutParams = layoutParams.also { lp -> lp.height = h }
      }
      it.finalListener {
        it.removeAllListeners()
        it.removeAllUpdateListeners()
      }
    }.start()
  }

  private fun releaseReactView() {
    animator?.let {
      it.removeAllListeners()
      it.removeAllUpdateListeners()
    }
    sheetMaxHeightSize = -1.0
    sheetMaxWidthSize = -1.0
    pendingHeight = null
    reactHeight = -1
    if (sheetMaxHeightSize < 0.0) {
      reactView?.removeOnLayoutChangeListener(this)
    }
    reactView = null
  }
}
