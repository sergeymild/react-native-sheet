package com.sheet2

import android.graphics.Color
import com.behavior.BottomSheetBehavior
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PixelUtil.dpToPx
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.SheetViewManagerDelegate
import com.facebook.react.viewmanagers.SheetViewManagerInterface

@ReactModule(name = Sheet2ViewManager.NAME)
class Sheet2ViewManager(reactContext: ReactApplicationContext) : ViewGroupManager<Sheet2View>(reactContext),
  SheetViewManagerInterface<Sheet2View> {
  private val mDelegate: ViewManagerDelegate<Sheet2View>

  init {
    mDelegate = SheetViewManagerDelegate(this)
  }

  override fun getDelegate(): ViewManagerDelegate<Sheet2View> {
    return mDelegate
  }

  override fun getName(): String {
    return NAME
  }

  public override fun createViewInstance(context: ThemedReactContext): Sheet2View {
    return Sheet2View(context)
  }

  override fun dismissSheet(view: Sheet2View) {
    println("==========dismissSheet")
    view.dismiss()
  }

  override fun setUniqueId(view: Sheet2View, value: String?) {

  }

  override fun setDismissable(view: Sheet2View, value: Boolean) {
    println("==========setDismissable $value")
    view.dismissable = value
  }

  override fun setMaxWidth(view: Sheet2View, value: Double) {
    println("==========setMaxWidth $value")
    view.maxWidth = value.dpToPx()
  }

  override fun setMaxHeight(view: Sheet2View, value: Double) {
    println("==========setMaxHeight $value")
    view.mHostView.sheetMaxHeightSize = value.dpToPx()
  }

  override fun setMinHeight(view: Sheet2View, value: Double) {
    println("==========setMinHeight $value")
    view.mHostView.sheetMinHeightSize = value.dpToPx()
  }

  override fun setTopLeftRightCornerRadius(view: Sheet2View, value: Double) {
    println("==========setTopLeftRightCornerRadius $value")
    view.topLeftRightCornerRadius = value.dpToPx()
  }

  override fun setIsSystemUILight(view: Sheet2View, value: Boolean) {
    println("==========setIsSystemUILight $value")
    view.isSystemUILight = value
  }

  override fun setPassScrollViewReactTag(view: Sheet2View, value: String?) {
    println("==========setPassScrollViewReactTag $value")
    value ?: return
    val v = BottomSheetBehavior.findView(view) ?: return
    view.setNewNestedScrollView(v)
  }

  override fun setSheetBackgroundColor(view: Sheet2View, value: Int?) {
    view._backgroundColor = value ?: Color.TRANSPARENT
  }

  override fun setWindowLevel(view: Sheet2View, value: String?) {
    // iOS only
  }

  override fun setUseInlinePresentation(view: Sheet2View, value: Boolean) {
    view.useInlinePresentation = value
  }

  override fun setPresentationStyle(view: Sheet2View, value: String?) {
    view.presentationStyle = value ?: "bottom"
  }

  override fun setCenterAnimation(view: Sheet2View, value: String?) {
    view.centerAnimation = value ?: "fade"
  }

  override fun setCalculatedHeight(view: Sheet2View, value: Double) {
    println("==========setCalculatedHeight $value")
    view.mHostView.setVirtualHeight(value.dpToPx())
  }

  override fun onAfterUpdateTransaction(view: Sheet2View) {
    super.onAfterUpdateTransaction(view)
    println("==========onAfterUpdateTransaction")
    view.showOrUpdate()
  }

  override fun updateState(
    view: Sheet2View,
    props: ReactStylesDiffMap?,
    stateWrapper: StateWrapper?
  ): Any? {
    view.fabricStateWrapper = stateWrapper
    return super.updateState(view, props, stateWrapper)
  }

  protected override fun addEventEmitters(
    reactContext: ThemedReactContext,
    view: Sheet2View
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
