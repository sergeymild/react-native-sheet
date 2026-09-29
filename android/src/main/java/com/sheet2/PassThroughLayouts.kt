package com.sheet2

import android.content.Context
import android.widget.FrameLayout
import androidx.coordinatorlayout.widget.CoordinatorLayout
import com.facebook.react.uimanager.PointerEvents
import com.facebook.react.uimanager.ReactPointerEventsView

internal class PassThroughFrameLayout(context: Context) : FrameLayout(context), ReactPointerEventsView {
  override val pointerEvents: PointerEvents = PointerEvents.BOX_NONE
}

internal class PassThroughCoordinatorLayout(context: Context) :
  CoordinatorLayout(context),
  ReactPointerEventsView {
  override val pointerEvents: PointerEvents = PointerEvents.BOX_NONE
}
