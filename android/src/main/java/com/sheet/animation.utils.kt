package com.sheet

import android.animation.Animator
import android.animation.ValueAnimator
import com.facebook.react.uimanager.PixelUtil

fun ValueAnimator.finalListener(listener: () -> Unit) {
    addListener(object : Animator.AnimatorListener {
        override fun onAnimationStart(animation: Animator) = Unit
        override fun onAnimationRepeat(animation: Animator) = Unit
        override fun onAnimationEnd(animation: Animator) = listener()
        override fun onAnimationCancel(animation: Animator) = listener()
    })
}

fun Int.toDP(): Int {
  return PixelUtil.toDIPFromPixel(this.toFloat()).toInt()
}

fun Double.toDP(): Int {
  return PixelUtil.toDIPFromPixel(this.toFloat()).toInt()
}
