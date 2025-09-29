package com.sheet2

import android.content.Context
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowInsetsController
import androidx.core.graphics.toColorInt
import com.facebook.react.bridge.ReadableMap


fun ReadableMap?.bool(value: String, default: Boolean): Boolean {
  if (this == null) return default
  if (!hasKey(value)) return default
  return getBoolean(value)
}

fun ReadableMap?.float(value: String, default: Float): Float {
  if (this == null) return default
  if (!hasKey(value)) return default
  return getDouble(value).toFloat()
}

fun ReadableMap?.double(value: String, default: Double): Double {
  if (this == null) return default
  if (!hasKey(value)) return default
  return getDouble(value)
}

fun ReadableMap.color(value: String, context: Context): Int {
  if (!hasKey(value)) return Color.TRANSPARENT
  return getString("backgroundColor")?.toColorInt() ?: Color.TRANSPARENT
}

fun Window.setStatusBarStyle(isLight: Boolean) {
  if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
    decorView.windowInsetsController?.setSystemBarsAppearance(
      if (!isLight) WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS else 0,
      WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
    );
  } else {
    if (isLight) {
      // Draw light icons on a dark background color
      decorView.systemUiVisibility =
        decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
    } else {
      // Draw dark icons on a light background color
      decorView.systemUiVisibility =
        decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
    }
  }
}

fun Window.setSystemUIColor(color: Int) {
  navigationBarColor = color
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
    isNavigationBarContrastEnforced = false
  }
}
