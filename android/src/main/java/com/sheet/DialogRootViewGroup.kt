package com.sheet

import android.content.Context
import android.content.res.Resources
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReactContext
import com.facebook.react.config.ReactFeatureFlags
import com.facebook.react.uimanager.JSPointerDispatcher
import com.facebook.react.uimanager.JSTouchDispatcher
import com.facebook.react.uimanager.RootView
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.events.EventDispatcher
import kotlin.math.max
import kotlin.math.min

fun DialogRootViewGroup.eventDispatcher(): EventDispatcher {
  val reactContext = context as ReactContext
  return reactContext.getNativeModule(UIManagerModule::class.java)!!.eventDispatcher
}

class DialogRootViewGroup(context: Context) : ViewGroup(context), RootView {
  private val mJSTouchDispatcher = JSTouchDispatcher(this)
  private var mJSPointerDispatcher: JSPointerDispatcher? = null
  var reactView: View? = null

  var sheetMaxHeightSize: Double = -1.0
  var sheetMinHeightSize: Double = -1.0
  private val screenHeight: Int by lazy {
    return@lazy Resources.getSystem().displayMetrics.heightPixels
  }

  var reactHeight: Int = -1

  init {
    if (ReactFeatureFlags.dispatchPointerEvents) {
      mJSPointerDispatcher = JSPointerDispatcher(this)
    }
  }

  private fun allowedHeight(): Int {
    val rHeight = max(sheetMinHeightSize.toInt(), reactHeight)
    val returnValue = if (sheetMaxHeightSize <= 0.0) {
      min(rHeight, screenHeight)
    } else {
      min(min(sheetMaxHeightSize.toInt(), screenHeight), rHeight)
    }
    println("🥲 DialogRootViewGroup.allowedHeight reactHeight: ${reactHeight.toDP()}, sheetMaxHeightSize: ${sheetMaxHeightSize.toDP()}, screenHeight: ${screenHeight.toDP()} returnValue: ${returnValue.toDP()}")
    return returnValue
  }

  private fun ensureLayoutParams() {
    if (layoutParams != null) return
    layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
  }

  fun setVirtualHeight(h: Float) {
    if (reactView == null) return
    ensureLayoutParams()
    this@DialogRootViewGroup.reactHeight = h.toInt()
    var oldH = layoutParams?.height ?: -1
    if (oldH <= 0) oldH = measuredHeight
    val newHeight = allowedHeight()
    println("😀 DialogRootViewGroup.setVirtualHeight ${oldH.toDP()} -> ${newHeight.toDP()}")
    layoutParams?.height = newHeight
  }

  override fun addView(child: View, index: Int, params: LayoutParams) {
    println("😀 DialogRootViewGroup.addView ${child.id}")
    if (reactView != null) removeView(reactView)
    super.addView(child, -1, params)
    reactView = child
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
    mJSTouchDispatcher.onChildStartedNativeGesture(p1, eventDispatcher())
    mJSPointerDispatcher?.onChildStartedNativeGesture(p0, p1, eventDispatcher())
  }

  override fun onChildStartedNativeGesture(p0: MotionEvent?) {
    this.onChildStartedNativeGesture(null, p0)
  }

  override fun onChildEndedNativeGesture(p0: View?, p1: MotionEvent?) {
    mJSTouchDispatcher.onChildEndedNativeGesture(p1, eventDispatcher())
    mJSPointerDispatcher?.onChildEndedNativeGesture()
  }

  override fun handleException(t: Throwable?) {
    (context as ReactContext).handleException(RuntimeException(t))
  }

  override fun onInterceptTouchEvent(event: MotionEvent): Boolean {
    mJSTouchDispatcher.handleTouchEvent(event, eventDispatcher())
    mJSPointerDispatcher?.handleMotionEvent(event, eventDispatcher(), true)
    return super.onInterceptTouchEvent(event)
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    try {
      mJSTouchDispatcher.handleTouchEvent(event, eventDispatcher())
      mJSPointerDispatcher?.handleMotionEvent(event, eventDispatcher(), false)
    } catch (_: Throwable) { }
    super.onTouchEvent(event)
    return true
  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) = Unit
  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}

  private fun releaseReactView() {
    sheetMaxHeightSize = -1.0
    reactHeight = -1
    reactView = null
  }
}
