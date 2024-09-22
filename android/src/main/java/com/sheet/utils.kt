package com.sheet

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.Window
import com.facebook.react.bridge.ColorPropConverter
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.PixelUtil


fun Int.toDP(): Int {
  return PixelUtil.toDIPFromPixel(this.toFloat()).toInt()
}

fun Double.toPxD(): Double {
  return PixelUtil.toPixelFromDIP(this.toFloat()).toDouble()
}

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
  return ColorPropConverter.getColor(getDouble("backgroundColor"), context)
}

fun Window.updateStatusBar(isLight: Boolean) {
  if (isLight) {
    decorView.systemUiVisibility =
      decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
  } else {
    decorView.systemUiVisibility =
      decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
  }
}
