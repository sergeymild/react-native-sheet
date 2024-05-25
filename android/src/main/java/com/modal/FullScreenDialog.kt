package com.modal

import android.content.DialogInterface
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import androidx.fragment.app.DialogFragment
import androidx.fragment.app.FragmentManager
import com.sheet.R

fun androidx.fragment.app.Fragment.safeShow(
  manager: FragmentManager,
  tag: String?
) {
  val ft = manager.beginTransaction()
  ft.add(this, tag)
  ft.commitAllowingStateLoss()
}

class FullScreenDialog(
  private val presentView: View,
  private val animated: Boolean,
  private val onDismiss: () -> Unit
) : DialogFragment() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setStyle(STYLE_NORMAL, R.style.Custom_Theme_FullScreenDialog)
  }

  override fun onStart() {
    super.onStart()
    isCancelable = false
    dialog?.window?.let {
      val width = ViewGroup.LayoutParams.MATCH_PARENT
      val height = ViewGroup.LayoutParams.MATCH_PARENT
      it.setLayout(width, height)
      if (animated) {
        it.setWindowAnimations(R.style.Custom_Theme_FullScreenDialog_Slide)
      }
      it.setFormat(PixelFormat.TRANSLUCENT)
      it.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
      it.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
    }
  }

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View {
    super.onCreateView(inflater, container, savedInstanceState)
    val parent = inflater.inflate(R.layout.item_full, container, false) as CoordinatorLayout
    return parent
  }

  override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
    super.onViewCreated(view, savedInstanceState)
    view.findViewById<FrameLayout>(R.id.container).addView(presentView)
  }

  override fun onDismiss(dialog: DialogInterface) {
    super.onDismiss(dialog)
    println("⚽️ FullScreenDialog.onDismiss")
    onDismiss()
  }
}
