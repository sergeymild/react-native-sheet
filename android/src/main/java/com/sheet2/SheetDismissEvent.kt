package com.sheet2

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event

class SheetDismissEvent(
    surfaceId: Int,
    viewId: Int,
) : Event<SheetDismissEvent>(surfaceId, viewId) {
    override fun getEventName() = EVENT_NAME

    // All events for a given view can be coalesced.
    override fun getCoalescingKey(): Short = 0

    override fun getEventData(): WritableMap? = null

    companion object {
        const val EVENT_NAME = "onSheetDismiss"
    }
}
