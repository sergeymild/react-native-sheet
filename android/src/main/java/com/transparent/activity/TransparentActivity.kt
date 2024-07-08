package com.transparent.activity

import android.os.Bundle
import android.view.View
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import java.lang.ref.WeakReference

class TransparentActivity : AppCompatActivity() {
  init {
    println("🗡️ TransparentActivity.init")
    presentedInstance = WeakReference(this)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)
    super.onCreate(savedInstanceState)
    println("🗡️ TransparentActivity.onCreate")
    parentView?.get()?.getCurrentActivity()?.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_NOTHING)
    deferredView?.get()?.let { setContentView(it) }
    deferredView = null
  }

  private fun dismiss() {
    println("🗡️ TransparentActivity.dismiss")
    parentView?.get()?.onDismiss()
    parentView?.get()?.getCurrentActivity()?.window?.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
    presentedInstance = null
  }

  override fun finish() {
    super.finish()
    println("🗡️ TransparentActivity.finish")
    dismiss()
  }

  override fun onBackPressed() {
    super.onBackPressed()
    println("🗡️ TransparentActivity.onBackPressed")
    dismiss()
  }

  companion object {
    var presentedInstance: WeakReference<TransparentActivity>? = null
    var deferredView: WeakReference<View>? = null
    var parentView: WeakReference<ActivityModalView>? = null
  }
}
