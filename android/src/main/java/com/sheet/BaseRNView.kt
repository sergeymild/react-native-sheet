package com.sheet

import android.content.Context
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

open class BaseRNView(context: Context?) : ViewGroup(context), RootView {
  private val reactContext: ReactContext
    get() = context as ReactContext
  private val mJSTouchDispatcher = JSTouchDispatcher(this)
  private var mJSPointerDispatcher: JSPointerDispatcher? = null

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
    mJSPointerDispatcher?.handleMotionEvent(event, eventDispatcher, true)
    return super.onInterceptTouchEvent(event)
  }

  override fun onTouchEvent(event: MotionEvent): Boolean {
    try {
      mJSTouchDispatcher.handleTouchEvent(event, eventDispatcher)
      mJSPointerDispatcher?.handleMotionEvent(event, eventDispatcher, false)
    } catch (e: Throwable) {
      //e
    }
    super.onTouchEvent(event)
    return true
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {

  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) = Unit
}
