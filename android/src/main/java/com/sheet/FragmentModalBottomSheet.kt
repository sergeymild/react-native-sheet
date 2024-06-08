package com.sheet

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class FragmentModalBottomSheet(
  private val modalView: ViewGroup,
  private val dismissible: Boolean,
  private val isDark: Boolean,
  private val onDismiss: () -> Unit
) : BottomSheetDialogFragment() {

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View = modalView

  override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
    this.isCancelable = dismissible
    val dialog = CustomBottomSheetDialog(requireContext(), if (isDark) R.style.AppBottomSheetDialog_Dark else R.style.AppBottomSheetDialog)
    dialog.setSheetBackgroundColor(Color.TRANSPARENT)
    return dialog
  }

  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
    onDismiss()
  }
}
