package com.sheet

import android.content.Context
import android.content.res.Resources
import android.view.View
import com.BaseRNView
import com.facebook.react.uimanager.RootView
import kotlin.math.min

class DialogRootViewGroup(context: Context) : BaseRNView(context), RootView,
  View.OnLayoutChangeListener {

  private var reactView: View? = null

  var dismissable = true
  var sheetMaxWidthSize: Double = -1.0
  var sheetMaxHeightSize: Double = -1.0
  var reactHeight: Int = -1
  private val screenHeight: Int by lazy {
    return@lazy Resources.getSystem().displayMetrics.heightPixels
  }

  private fun allowedHeight(): Int {
    val returnValue = if (sheetMaxHeightSize <= 0.0) {
      min(reactHeight, screenHeight)
    } else {
      min(min(sheetMaxHeightSize.toInt(), screenHeight), reactHeight)
    }
    println("🥲 DialogRootViewGroup.allowedHeight reactHeight: ${reactHeight.toDP()}, sheetMaxHeightSize: ${sheetMaxHeightSize.toDP()}, screenHeight: ${screenHeight.toDP()} returnValue: ${returnValue.toDP()}")
    return returnValue
  }

  private fun ensureLayoutParams() {
    if (layoutParams != null) return
    layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
  }

  fun setVirtualHeight(h: Int) {
    if (reactView == null) return
    ensureLayoutParams()
    this@DialogRootViewGroup.reactHeight = h
    var oldH = layoutParams?.height ?: -1
    if (oldH <= 0) oldH = measuredHeight
    val newHeight = allowedHeight()
    println("😀 DialogRootViewGroup.setVirtualHeight ${oldH.toDP()} -> ${newHeight.toDP()}")
    layoutParams?.height = newHeight
    ReactNativeReflection.setSize(reactView, measuredWidth, newHeight)
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
    println("😀 DialogRootViewGroup.onLayoutChange ${allowedHeight().toDP()} -> ${(bottom - top).toDP()}")
    setVirtualHeight(bottom - top)
  }

  override fun addView(child: View, index: Int, params: LayoutParams) {
    println("😀 DialogRootViewGroup.addView $child")
    if (reactView != null) removeView(reactView)
    super.addView(child, -1, params)
    reactView = child
    reactView!!.addOnLayoutChangeListener(this)
  }

  override fun removeView(view: View?) {
    if (view == reactView) releaseReactView()
    super.removeView(view)
  }

  override fun removeViewAt(index: Int) {
    if (getChildAt(index) === reactView) releaseReactView()
    super.removeViewAt(index)
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {}


  private fun releaseReactView() {
    sheetMaxHeightSize = -1.0
    sheetMaxWidthSize = -1.0
    reactHeight = -1
    if (sheetMaxHeightSize < 0.0) {
      reactView?.removeOnLayoutChangeListener(this)
    }
    reactView = null
  }
}
