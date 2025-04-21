package com.sheet

import android.content.Context
import android.content.res.Resources
import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.PixelUtil
import kotlin.math.max
import kotlin.math.min

class DialogRootViewGroup(context: Context) : BaseRNView(context) {
  var reactView: View? = null

  var sheetMaxHeightSize: Double = -1.0
  var sheetMaxWidthSize: Double = -1.0
  var sheetMinHeightSize: Double = -1.0

  private val metrics: Resources by lazy { Resources.getSystem() }

  fun setCornerRadius(r: Float) {
    setOutlineProvider(object : ViewOutlineProvider() {
      override fun getOutline(view: View, outline: Outline) {
        val left = 0
        val top = 0
        val right = view.width
        val bottom = view.height
        val cornerRadius = PixelUtil.toPixelFromDIP(r).toInt()
        outline.setRoundRect(left, top, right, bottom + cornerRadius, cornerRadius.toFloat())
      }
    })
    setClipToOutline(true)
  }

  private val screenHeight: Int
    get() = metrics.displayMetrics.heightPixels
  private val screenWidth: Int
    get() = metrics.displayMetrics.widthPixels
  val currentWidth: Int
    get() = layoutParams?.width ?: 0

  private fun allowedHeight(): Int {
    var returnValue = if (sheetMaxHeightSize >= 0) {
      min(sheetMaxHeightSize.toInt(), screenHeight)
    } else {
      screenHeight
    }
    returnValue = max(returnValue, sheetMinHeightSize.toInt())
    return returnValue
  }

  private fun allowedWidth(): Int {
    if (sheetMaxWidthSize >= 0) return min(sheetMaxWidthSize.toInt(), screenWidth)
    return screenWidth
  }

  private fun ensureLayoutParams() {
    if (layoutParams != null) return
    layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
  }

  fun setVirtualHeight(h: Float) {
    if (reactView == null) return
    ensureLayoutParams()
    this.sheetMaxHeightSize = h.toDouble()
    var newHeight = allowedHeight()
    val newWidth = allowedWidth()
//    newHeight = PixelUtil.toPixelFromDIP(600.0).toInt()
    println("😀 DialogRootViewGroup.setVirtualHeight ${newHeight.toDP()} :${newWidth.toDP()}")
    translationX = ((screenWidth - newWidth) / 2).toFloat()
    layoutParams?.height = newHeight
    layoutParams?.width = newWidth
    parent.requestLayout()
  }

  override fun addView(child: View, index: Int, params: LayoutParams) {
    println("😀 DialogRootViewGroup.addView ${child.id}")
    if (reactView != null) removeView(reactView)
    super.addView(child, -1, params)
    reactView = child
    setVirtualHeight(sheetMaxHeightSize.toFloat())
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
    reactView = null
  }
}
