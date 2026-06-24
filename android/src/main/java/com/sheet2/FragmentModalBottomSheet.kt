package com.sheet2

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.widget.FrameLayout
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import java.lang.ref.WeakReference

class FragmentModalBottomSheet() : BottomSheetDialogFragment() {

  private var modalView: ViewGroup? = null
  private var overlayHost: ViewGroup? = null
  private var overlayView: View? = null
  private var dismissable: Boolean = true
  private var isSystemUILight: Boolean = false
  private var onDismiss: ((dismissAll: Boolean) -> Unit)? = null
  var dismissAll = false

  constructor(
    modalView: ViewGroup,
    dismissable: Boolean,
    isSystemUILight: Boolean,
    onDismiss: (dismissAll: Boolean) -> Unit
  ) : this() {
    this.modalView = modalView
    this.dismissable = dismissable
    this.isSystemUILight = isSystemUILight
    this.onDismiss = onDismiss
  }

  companion object {
    var presentedWindow: WeakReference<Window>? = null
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    // If modalView is null (fragment restored by system), dismiss immediately
    if (modalView == null) {
      dismissAllowingStateLoss()
      return null
    }
    return modalView
  }

  override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
    this.isCancelable = dismissable
    val dialog = CustomBottomSheetDialog(requireContext(), R.style.AppBottomSheetDialog)
    dialog.setSheetBackgroundColor(Color.TRANSPARENT)
    dialog.window?.let {
      presentedWindow = WeakReference(it)
      it.setStatusBarStyle(isSystemUILight)
      if (isSystemUILight) {
        it.setSystemUIColor(Color.WHITE)
      } else {
        it.setSystemUIColor(Color.BLACK)
      }
    }
    return dialog
  }

  override fun onStart() {
    super.onStart()
    attachOverlayView()
  }

  fun setOverlayView(view: View?) {
    if (overlayView == view) return
    detachOverlayView()
    overlayView = view
    attachOverlayView()
  }

  private fun attachOverlayView() {
    val view = overlayView ?: return
    val decorView = dialog?.window?.decorView as? ViewGroup ?: return
    detachOverlayHost()
    (view.parent as? ViewGroup)?.removeView(view)

    val host = DialogPassThroughFrameLayout(decorView.context).apply {
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
      isClickable = false
      isFocusable = false
    }

    view.layoutParams = FrameLayout.LayoutParams(
      FrameLayout.LayoutParams.MATCH_PARENT,
      FrameLayout.LayoutParams.MATCH_PARENT
    )
    host.addView(view)
    decorView.addView(host)
    host.bringToFront()
    overlayHost = host
  }

  private fun detachOverlayHost() {
    (overlayHost?.parent as? ViewGroup)?.removeView(overlayHost)
    overlayHost = null
  }

  private fun detachOverlayView() {
    detachOverlayHost()
    (overlayView?.parent as? ViewGroup)?.removeView(overlayView)
  }

  fun setNewNestedScrollView(view: View) {
    (dialog as CustomBottomSheetDialog).setNewNestedScrollView(view)
  }

  fun collapse() {
    (dialog as CustomBottomSheetDialog).collapse()
  }

  fun expand() {
    (dialog as CustomBottomSheetDialog).expand()
  }

  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
    detachOverlayView()
    overlayView = null
    presentedWindow?.clear()
    presentedWindow = null
    onDismiss?.invoke(dismissAll)
  }
}

private class DialogPassThroughFrameLayout(context: android.content.Context) : FrameLayout(context) {
  override fun dispatchTouchEvent(ev: MotionEvent): Boolean = false
  override fun onInterceptTouchEvent(ev: MotionEvent): Boolean = false
  override fun onTouchEvent(event: MotionEvent): Boolean = false
}
