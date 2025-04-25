package com.sheet

import android.content.Context
import android.content.res.Resources
import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.PixelUtil
import kotlin.math.max
import kotlin.math.min

class DialogRootViewGroup(context: Context) : BaseRNView(context) {
  private var reactView: View? = null

  var sheetMaxHeightSize = Double.MAX_VALUE
  var sheetMaxWidthSize = Double.MAX_VALUE
  var sheetMinHeightSize = Double.MIN_VALUE

  private val metrics: Resources by lazy { Resources.getSystem() }

  override fun getRnViewId(): Int {
    return reactView?.id ?: -1
  }

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

  private val allowedHeight: Int
    get() {
      var returnValue = min(sheetMaxHeightSize.toInt(), metrics.displayMetrics.heightPixels)
      returnValue = max(returnValue, sheetMinHeightSize.toInt())
      return returnValue
    }

  private val allowedWidth: Int
    get() = min(sheetMaxWidthSize.toInt(), metrics.displayMetrics.widthPixels)

  private fun ensureLayoutParams() {
    if (layoutParams != null) return
    layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
  }

  fun setVirtualHeight(h: Float) {
    if (reactView == null) return
    this.sheetMaxHeightSize = h.toDouble()
    if (sheetMaxHeightSize == Double.MAX_VALUE) return
    val newHeight = allowedHeight
    val newWidth = allowedWidth
    println("😀 DialogRootViewGroup.setVirtualHeight ${newHeight.toDP()} :${metrics.displayMetrics.heightPixels.toDP()}")
    ensureLayoutParams()
    translationX = ((metrics.displayMetrics.widthPixels - newWidth) / 2).toFloat()
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
