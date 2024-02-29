package com.sheet

import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.ColorInt
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class FragmentModalBottomSheet(
  private val modalView: DialogRootViewGroup,
  private val dismissable: Boolean,
  private val handleRadius: Float,
  private val sheetBackgroundColor: Int,
  private val isDark: Boolean,
  private val onDismiss: () -> Unit
) : BottomSheetDialogFragment() {

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View = modalView

  override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
    this.isCancelable = dismissable
    val dialog = CustomBottomSheetDialog(requireContext(), if (isDark) R.style.AppBottomSheetDialog_Dark else R.style.AppBottomSheetDialog)
    dialog.setCornerRadius(handleRadius)
    dialog.setSheetBackgroundColor(sheetBackgroundColor)
    return dialog
  }

  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
    onDismiss()
  }
}
