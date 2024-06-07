package com.local

import android.widget.FrameLayout
import com.sheet.DialogRootViewGroup

class FragmentBottomSheet(
  private val modalView: DialogRootViewGroup,
  private val dismissable: Boolean,
  private val handleRadius: Float,
  private val sheetBackgroundColor: Int,
  private val isDark: Boolean,
  private val onDismiss: () -> Unit
) : FrameLayout(modalView.context) {

  init {
    addView(modalView)
  }
}
