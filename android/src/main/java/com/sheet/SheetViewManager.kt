package com.sheet

import com.behavior.BottomSheetBehavior
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.SheetViewManagerDelegate
import com.facebook.react.viewmanagers.SheetViewManagerInterface

@ReactModule(name = SheetViewManager.NAME)
class SheetViewManager(reactContext: ReactApplicationContext) : ViewGroupManager<SheetView>(reactContext),
  SheetViewManagerInterface<SheetView> {
  private val mDelegate: ViewManagerDelegate<SheetView>

  init {
    mDelegate = SheetViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<SheetView> {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): SheetView {
    return SheetView(context)
  }

  override fun dismissSheet(view: SheetView) {
    println("==========dismissSheet")
    view.dismiss()
  }

  override fun setDismissable(view: SheetView, value: Boolean) {
    println("==========setDismissable $value")
    view.dismissable = value
  }

  override fun setMaxWidth(view: SheetView, value: Double) {
    println("==========setMaxWidth $value")
    view.mHostView.sheetMaxWidthSize = value.dpToPx()
  }

  override fun setMaxHeight(view: SheetView, value: Double) {
    println("==========setMaxHeight $value")
    view.mHostView.sheetMaxHeightSize = value.dpToPx()
  }

  override fun setMinHeight(view: SheetView, value: Double) {
    println("==========setMinHeight $value")
    view.mHostView.sheetMinHeightSize = value.dpToPx()
  }

  override fun setTopLeftRightCornerRadius(view: SheetView, value: Double) {
    println("==========setTopLeftRightCornerRadius $value")
    view.topLeftRightCornerRadius = value.dpToPx()
  }

  override fun setIsSystemUILight(view: SheetView, value: Boolean) {
    println("==========setIsSystemUILight $value")
    view.isSystemUILight = value
  }

  override fun setPassScrollViewReactTag(view: SheetView, value: String?) {
    println("==========setPassScrollViewReactTag $value")
    value ?: return
    val v = BottomSheetBehavior.findView(view) ?: return
    view.setNewNestedScrollView(v)
  }

  override fun setCalculatedHeight(view: SheetView, value: Double) {
    println("==========setCalculatedHeight $value")
    view.mHostView.setVirtualHeight(value.dpToPx())
  }

  override fun onAfterUpdateTransaction(view: SheetView) {
    super.onAfterUpdateTransaction(view)
    println("==========onAfterUpdateTransaction")
    view.showOrUpdate()
  }

  protected override fun addEventEmitters(
    reactContext: ThemedReactContext,
    view: SheetView
  ) {
    val dispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, view.id)
    if (dispatcher != null) {
      view.eventDispatcher = dispatcher
    }
  }

  companion object {
    const val NAME = "SheetView"
  }
}
