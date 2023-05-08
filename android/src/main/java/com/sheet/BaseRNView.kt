package com.sheet

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

open class BaseRNView(context: Context?) : ReactViewGroup(context), RootView {
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
}
