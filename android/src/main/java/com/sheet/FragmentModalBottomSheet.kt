package com.sheet

import android.annotation.SuppressLint
import android.app.Dialog
import android.content.DialogInterface
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.annotation.ColorInt
import com.google.android.material.bottomsheet.BottomSheetDialogFragment

class FragmentModalBottomSheet : BottomSheetDialogFragment() {

    var handleRadius: Float = 12F
        set(value) {
            field = value
            (dialog as CustomBottomSheetDialog?)?.cornerRadius = value
        }

    @ColorInt
    var sheetBackgroundColor: Int = Color.TRANSPARENT
        set(value) {
            field = value
            (dialog as CustomBottomSheetDialog?)?.sheetBackgroundColor = value
        }
    var onDismiss: Runnable? = null
    var modalView: DialogRootViewGroup? = null

    private val mBottomSheetBehaviorCallback: BottomSheetBehavior.BottomSheetCallback =
        object : BottomSheetBehavior.BottomSheetCallback() {
            @SuppressLint("SwitchIntDef")
            override fun onStateChanged(bottomSheet: View, newState: Int) {
                when (newState) {
                    BottomSheetBehavior.STATE_HIDDEN -> dismiss()
                }
            }

            override fun onSlide(bottomSheet: View, slideOffset: Float) {}
        }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = modalView!!

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = CustomBottomSheetDialog(requireContext(), R.style.AppBottomSheetDialog)
        dialog.cornerRadius = handleRadius
        dialog.sheetBackgroundColor = sheetBackgroundColor
        dialog.behavior.addBottomSheetCallback(mBottomSheetBehaviorCallback)
        return dialog
    }

    override fun onDismiss(dialog: DialogInterface) {
        super.onDismiss(dialog)
        onDismiss?.run()
    }
}
