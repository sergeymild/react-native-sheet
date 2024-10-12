package com.sheet

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

class FragmentModalBottomSheet(
  private val modalView: ViewGroup,
  private val dismissable: Boolean,
  private val isSystemUILight: Boolean,
  private val onDismiss: () -> Unit
) : BottomSheetDialogFragment() {

  companion object {
    var presentedWindow: WeakReference<Window>? = null
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View = modalView

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

  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
    presentedWindow?.clear()
    presentedWindow = null
    onDismiss()
  }
}
