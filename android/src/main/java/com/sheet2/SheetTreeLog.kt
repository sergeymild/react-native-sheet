package com.sheet2

import android.content.Context
import android.util.Log
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

/**
 * Every place where this library moves a view React Native believes it owns.
 *
 * The mounting crashes worth chasing carry no frame of ours: on Android the
 * stack between `ViewGroupManager.addView` and `ViewGroup.addInArray` is React
 * Native and the framework only ("addViewAt: failed to insert view [child] into
 * parent [parent] at index N", caused by "IndexOutOfBoundsException: index=N
 * count=0"). So the only way to tell afterwards whether a sheet was involved is
 * to say so ourselves, naming the views by the id React Native uses as the tag —
 * which is exactly what that message carries.
 *
 * Entries go to logcat, to a small in-memory ring for a local session, and — when
 * a listener is registered from JS — to the app, which is expected to turn them
 * into breadcrumbs. Breadcrumbs are what survives into a native crash report.
 */
object SheetTreeLog {
  private const val TAG = "Sheet2Tree"
  private const val EVENT = "sheet2:tree"
  private const val CAPACITY = 32

  private val entries = ArrayDeque<String>()

  fun log(context: Context?, op: String, details: String) {
    val entry = "$op $details"

    synchronized(entries) {
      if (entries.size == CAPACITY) entries.removeFirst()
      entries.addLast(entry)
    }

    Log.d(TAG, entry)
    emit(context, entry)
  }

  /** The tag React Native knows the view by, or "-" when there is no view. */
  fun tag(view: View?): String = view?.let { "${it.id}" } ?: "-"

  fun childTags(parent: ViewGroup?): String {
    if (parent == null) return "-"
    val count = parent.childCount
    if (count == 0) return "none"

    return (0 until count).joinToString(",") { "${parent.getChildAt(it).id}" }
  }

  fun snapshot(): List<String> = synchronized(entries) { entries.toList() }

  private fun emit(context: Context?, entry: String) {
    val reactContext = context as? ReactContext ?: return
    if (!reactContext.hasActiveReactInstance()) return

    try {
      reactContext
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(EVENT, entry)
    } catch (error: Throwable) {
      // A sheet can be torn down while the instance is going away; diagnostics
      // must never be the reason something crashes.
      Log.d(TAG, "emit failed: ${error.message}")
    }
  }
}
