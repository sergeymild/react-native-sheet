package com.sheet

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.view.ViewStructure
import android.view.accessibility.AccessibilityEvent
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.events.RCTEventEmitter

fun AppFittedSheet.onSheetDismiss() {
  (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
    .receiveEvent(id, "onSheetDismiss", Arguments.createMap())
}

class AppFittedSheet(context: Context) : ViewGroup(context), LifecycleEventListener {
  private val fragmentTag = "CCBottomSheet-${System.currentTimeMillis()}"
  var mHostView = DialogRootViewGroup(context)

  var params: ReadableMap? = null
    set(value) {
      if (value?.hasKey("maxWidth") == true) {
        mHostView.sheetMaxWidthSize = PixelUtil.toPixelFromDIP(value.getDouble("maxWidth")).toDouble()
      }

      if (value?.hasKey("topLeftRightCornerRadius") == true) {
        topLeftRightCornerRadius = value.getDouble("topLeftRightCornerRadius")
      }

      if (value?.hasKey("maxHeight") == true) {
        mHostView.sheetMaxHeightSize = value.getDouble("maxHeight").toPxD()
      }

      field = value
    }

  private var topLeftRightCornerRadius: Double = -1.0
    set(value) {
      field = value
      sheet?.handleRadius = value.toFloat()
    }

  private fun getCurrentActivity(): AppCompatActivity {
    return (context as ReactContext).currentActivity as AppCompatActivity
  }

  private val sheet: FragmentModalBottomSheet?
    get() = getCurrentActivity().supportFragmentManager.findFragmentByTag(fragmentTag) as FragmentModalBottomSheet?

  fun showOrUpdate() {
    println("🥲 showOrUpdate")
    UiThreadUtil.assertOnUiThread()

    val sheet = this.sheet
    if (sheet == null) {
      val fragment = FragmentModalBottomSheet()
      fragment.modalView = mHostView
      fragment.handleRadius = topLeftRightCornerRadius.toFloat()
      params?.let {
        if (it.hasKey("backgroundColor")) {
          val color = ColorPropConverter.getColor(it.getDouble("backgroundColor"), fragment.context)
          fragment.sheetBackgroundColor = color
        }
      }

      fragment.onDismiss = Runnable {
        println("😀 onDismiss")
        val parent = mHostView.parent as? ViewGroup
        parent?.removeViewAt(0)
        onSheetDismiss()
      }
      fragment.show(getCurrentActivity().supportFragmentManager, fragmentTag)
    }
  }

  override fun dispatchProvideStructure(structure: ViewStructure?) {
    mHostView.dispatchProvideStructure(structure)
  }

  override fun addView(child: View, index: Int) {
    UiThreadUtil.assertOnUiThread()
    mHostView.addView(child, index)
  }

  override fun getChildCount(): Int = mHostView.childCount

  override fun getChildAt(index: Int): View? = mHostView.getChildAt(index)

  override fun removeView(child: View?) {
    println("🥲removeView")
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  override fun removeViewAt(index: Int) {
    println("🥲 removeViewAt: $index")
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  override fun addChildrenForAccessibility(outChildren: ArrayList<View?>?) {
    // Explicitly override this to prevent accessibility events being passed down to children
    // Those will be handled by the mHostView which lives in the dialog
  }

  override fun dispatchPopulateAccessibilityEvent(event: AccessibilityEvent?): Boolean {
    // Explicitly override this to prevent accessibility events being passed down to children
    // Those will be handled by the mHostView which lives in the dialog
    return false
  }

  override fun onHostResume() {
    println("🥲onHostResume")
    // We show the dialog again when the host resumes
    showOrUpdate()
  }

  override fun onHostPause() {}

  override fun onHostDestroy() {
    onDropInstance()
  }

  fun onDropInstance() {
    println("🥲onDropInstance")
    (context as ReactContext).removeLifecycleEventListener(this)
    dismiss()
  }

  fun dismiss() {
    println("🥲dismiss")
    UiThreadUtil.assertOnUiThread()
    this.sheet?.dismissAllowingStateLoss()
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {

  }
}
