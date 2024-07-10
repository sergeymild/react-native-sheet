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
  private val dismissible: Boolean,
  private val isDark: Boolean,
  private val isStatusBarBgLight: Boolean,
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
    this.isCancelable = dismissible
    val dialog = CustomBottomSheetDialog(requireContext(), if (isDark) R.style.AppBottomSheetDialog_Dark else R.style.AppBottomSheetDialog)
    dialog.setSheetBackgroundColor(Color.TRANSPARENT)
    dialog.window?.let {presentedWindow = WeakReference(it)}
    dialog.window?.let {
      it.navigationBarColor = sheetBackgroundColor
      if (isStatusBarBgLight) {
        it.decorView.systemUiVisibility =
          it.decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
      } else {
        it.decorView.systemUiVisibility =
          it.decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
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
