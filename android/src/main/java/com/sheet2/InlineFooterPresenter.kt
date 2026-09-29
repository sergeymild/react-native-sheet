package com.sheet2

import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import android.widget.FrameLayout

internal class InlineFooterPresenter(
  private val anchor: AppFittedSheet,
  private val hostView: View,
) {

  private var overlay: FrameLayout? = null

  val isShown: Boolean get() = overlay != null

  fun show() {
    if (isShown) return
    val root = findInlineRoot(anchor) ?: return

    val overlayRoot = PassThroughFrameLayout(anchor.context).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT,
      )
      isClickable = false
      isFocusable = false
    }

    (hostView.parent as? ViewGroup)?.removeView(hostView)
    val size = hostView.layoutParams
    hostView.layoutParams = FrameLayout.LayoutParams(
      size?.width ?: FrameLayout.LayoutParams.MATCH_PARENT,
      size?.height ?: 0,
      Gravity.BOTTOM,
    )
    overlayRoot.addView(hostView)

    root.addView(overlayRoot)
    overlay = overlayRoot
    footers.add(overlayRoot)
    hostView.post { anchor.pushContentOriginOffset() }
  }

  fun dismiss() {
    val layout = overlay ?: return
    footers.remove(layout)
    overlay = null
    (layout.parent as? ViewGroup)?.removeView(layout)
    (hostView.parent as? ViewGroup)?.removeView(hostView)
  }

  companion object {
    private val footers = mutableListOf<View>()

    fun bringFootersToFront(root: ViewGroup) {
      footers.filter { it.parent === root }.forEach { it.bringToFront() }
    }
  }
}

internal fun findInlineRoot(anchor: View): ViewGroup? {
  var current: ViewParent? = anchor.parent
  var lastGroup: ViewGroup? = null
  while (current != null) {
    if (current is ViewGroup) lastGroup = current
    if (current.javaClass.name == "com.swmansion.rnscreens.Screen") {
      return (current.parent as? ViewGroup) ?: (current as? ViewGroup)
    }
    current = current.parent
  }
  return lastGroup
}
