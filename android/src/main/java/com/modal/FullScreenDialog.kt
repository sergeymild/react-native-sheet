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
  // "slide" || "fade"
  private val animationType: String,
  private val isEdgeToEdge: Boolean,
  private val isStatusBarBgLight: Boolean,
  private val onDismiss: () -> Unit
) : DialogFragment() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (isEdgeToEdge) {
      setStyle(STYLE_NORMAL, R.style.Theme_EdgeToEdgeDialog)
    } else {
      setStyle(STYLE_NORMAL, R.style.Theme_FullScreenDialog)
    }
  }

  override fun onStart() {
    super.onStart()
    isCancelable = false

    dialog?.window?.let {
      if (animated) {
        if (animationType == "slide") {
          it.setWindowAnimations(R.style.Theme_FullScreenDialog_Slide)
        }
        // Fade is applied by Default
      } else {
        it.setWindowAnimations(R.style.Theme_FullScreenDialog_NoAnimation)
      }

      if (isEdgeToEdge) {
        it.navigationBarColor = Color.TRANSPARENT
        it.statusBarColor = Color.TRANSPARENT
        it.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
          View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION

        if (isStatusBarBgLight) {
          it.decorView.systemUiVisibility =
            it.decorView.systemUiVisibility or View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        } else {
          it.decorView.systemUiVisibility =
            it.decorView.systemUiVisibility and View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR.inv()
        }
      } else {
        val width = ViewGroup.LayoutParams.MATCH_PARENT
        val height = ViewGroup.LayoutParams.MATCH_PARENT
        it.setLayout(width, height)
        it.clearFlags(WindowManager.LayoutParams.FLAG_DIM_BEHIND)
      }

      it.setFormat(PixelFormat.TRANSLUCENT)
      it.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
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
