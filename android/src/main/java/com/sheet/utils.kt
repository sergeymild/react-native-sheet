package com.sheet

import android.content.Context
import android.graphics.Color
import com.facebook.react.bridge.ColorPropConverter
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.PixelUtil


fun Int.toDP(): Int {
  return PixelUtil.toDIPFromPixel(this.toFloat()).toInt()
}

fun Double.toDP(): Int {
  return PixelUtil.toDIPFromPixel(this.toFloat()).toInt()
}

fun Double.toPxD(): Double {
  return PixelUtil.toPixelFromDIP(this.toFloat()).toDouble()
}

fun ReadableMap.bool(value: String): Boolean? {
  if (!hasKey(value)) return null
  return getBoolean(value)
}

fun ReadableMap.float(value: String): Float? {
  if (!hasKey(value)) return null
  return getDouble(value).toFloat()
}

fun ReadableMap.color(value: String, context: Context): Int {
  if (!hasKey(value)) return Color.TRANSPARENT
  return ColorPropConverter.getColor(getDouble("backgroundColor"), context)
}
