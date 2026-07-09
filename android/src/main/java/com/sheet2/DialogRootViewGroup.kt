package com.sheet2

import android.content.Context
import android.content.res.Resources
import android.graphics.Outline
import android.os.Looper
import android.view.View
import android.view.ViewOutlineProvider
import com.facebook.react.uimanager.PixelUtil.pxToDp
import kotlin.math.max
import kotlin.math.min

class DialogRootViewGroup(context: Context) : BaseRNView(context) {
  private var reactView: View? = null
  var onSheetLayoutChanged: (() -> Unit)? = null

  var sheetMaxHeightSize = Float.MAX_VALUE
  var sheetMaxWidthSize = Float.MAX_VALUE
  var sheetMinHeightSize = Float.MIN_VALUE

  /**
   * When true the card is horizontally centered by its parent container (the
   * centered Dialog's FrameLayout via Gravity.CENTER), so this view must NOT
   * additionally offset itself through [translationX]. Applying both double-
   * shifts the card to the right in landscape (where widthPixels >> card width).
   * The bottom-sheet path keeps translationX centering because there the RN view
   * sits left-aligned inside a full-width container.
   */
  var centeredPresentation: Boolean = false
    set(value) {
      field = value
      if (value) translationX = 0f
      layout()
    }

  private fun centeringTranslationX(newWidth: Int): Float =
    if (centeredPresentation) 0f
    else ((metrics.displayMetrics.widthPixels - newWidth) / 2).toFloat()

  private val metrics: Resources by lazy { Resources.getSystem() }

  fun setCornerRadius(r: Float) {
    setOutlineProvider(object : ViewOutlineProvider() {
      override fun getOutline(view: View, outline: Outline) {
        val left = 0
        val top = 0
        val right = view.width
        val bottom = view.height
        val cornerRadius = r
        outline.setRoundRect(left, top, right, ((bottom + cornerRadius).toInt()), cornerRadius)
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

  private fun layout() {
    if (Looper.myLooper() == Looper.getMainLooper()) {
      parent?.requestLayout()
    } else {
      post { parent?.requestLayout() }
    }
  }

  private fun notifySheetLayoutChanged() {
    post { onSheetLayoutChanged?.invoke() }
  }

  fun setVirtualHeight(h: Float) {
    if (reactView == null) return
    this.sheetMaxHeightSize = h
    if (sheetMaxHeightSize == Float.MAX_VALUE) return
    val newHeight = allowedHeight
    val newWidth = allowedWidth
    println("😀 DialogRootViewGroup.setVirtualHeight ${newHeight.pxToDp()} :${newWidth.pxToDp()}")
    ensureLayoutParams()
    layoutParams?.height = newHeight
    translationX = centeringTranslationX(newWidth)
    layoutParams?.width = newWidth
    layout()
    notifySheetLayoutChanged()
  }

  fun updateMaxWidth(value: Float) {
    sheetMaxWidthSize = value
    val newWidth = allowedWidth
    translationX = centeringTranslationX(newWidth)
    layoutParams?.width = newWidth
    layout()
    notifySheetLayoutChanged()
  }

  override fun addView(child: View, index: Int, params: LayoutParams) {
    println("😀 DialogRootViewGroup.addView ${child.id}")
    if (reactView != null) removeView(reactView)
    super.addView(child, index, params)
    reactView = child
    setVirtualHeight(sheetMaxHeightSize)
  }

  override fun removeView(view: View?) {
    if (view == reactView) releaseReactView()
    super.removeView(view)
  }

  override fun removeViewAt(index: Int) {
    if (getChildAt(index) === reactView) releaseReactView()
    super.removeViewAt(index)
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    notifySheetLayoutChanged()
  }

  private fun releaseReactView() {
    sheetMaxHeightSize = Float.MAX_VALUE
    reactView = null
  }
}
