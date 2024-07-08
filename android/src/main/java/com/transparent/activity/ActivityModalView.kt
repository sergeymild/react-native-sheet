package com.transparent.activity

import android.content.Context
import android.content.Intent
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.view.ReactViewGroup
import com.modal.TopModalView
import com.sheet.BaseRNView
import java.lang.ref.WeakReference

fun ActivityModalView.onActivityDismiss() {
  (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
    .receiveEvent(id, "onActivityDismiss", Arguments.createMap())
}

class ActivityModalView(context: Context?) : ReactViewGroup(context) {
  private var rnView = BaseRNView(context)
  init {
    println("🗡️ init")
    TransparentActivity.parentView = WeakReference(this)
    val intent = Intent(getCurrentActivity()!!, TransparentActivity::class.java)
    getCurrentActivity()?.startActivity(intent)

  }

  fun getCurrentActivity(): AppCompatActivity? {
    return (context as? ReactContext)?.currentActivity as? AppCompatActivity
  }

  override fun addView(child: View, index: Int) {
    rnView.addView(child)
    if (TransparentActivity.presentedInstance == null) {
      TransparentActivity.deferredView = WeakReference(rnView)
    }
    val activity = TransparentActivity.presentedInstance?.get() ?: return
    activity.setContentView(rnView)
  }

  override fun addChildrenForAccessibility(outChildren: ArrayList<View?>?) {}
  override fun dispatchPopulateAccessibilityEvent(event: AccessibilityEvent?) = false


  override fun removeView(child: View?) {
    println("🗡️️ removeView")
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  override fun removeViewAt(index: Int) {
    println("🗡️️ removeViewAt: $index")
    UiThreadUtil.assertOnUiThread()
    dismiss()
  }

  fun onDismiss() {
    println("🗡️ onDismiss")
    onActivityDismiss()
  }

  fun dismiss() {
    println("🗡️️ dismiss")
    TransparentActivity.presentedInstance?.get()?.finish();
  }
}
