package com.sheet2

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.Window
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import java.lang.ref.WeakReference

class FragmentModalBottomSheet() : BottomSheetDialogFragment() {

  private var modalView: ViewGroup? = null
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
    presentedWindow?.clear()
    presentedWindow = null
    onDismiss?.invoke(dismissAll)
  }
}
