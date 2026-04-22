#pragma once

#include <react/renderer/core/Props.h>
#include <react/renderer/graphics/Float.h>
#include <react/renderer/graphics/Point.h>

#ifdef RN_SERIALIZABLE_STATE
#include <react/renderer/mapbuffer/MapBuffer.h>
#include <react/renderer/mapbuffer/MapBufferBuilder.h>
#endif

namespace facebook::react {

/**
 * State for the `SheetView` Fabric component.
 *
 * `contentOriginOffset` is the visual delta between the Yoga-computed position
 * of the sheet content and its actual on-screen position after the Android
 * host view has been re-parented by the inline presenter. It is pushed from
 * the JVM side on `InlineSheetPresenter` layout-settle, and consumed by
 * `SheetViewShadowNode::getContentOriginOffset()` so that descendants'
 * `measure()` and Pressability region checks report the real screen position.
 */
class SheetViewState {
 public:
  SheetViewState() = default;
  SheetViewState(SheetViewState const& previousState, Point contentOriginOffset)
      : contentOriginOffset(contentOriginOffset) {}

#ifdef RN_SERIALIZABLE_STATE
  SheetViewState(SheetViewState const& previousState, folly::dynamic data) {
    auto x = data["contentOriginOffsetX"];
    auto y = data["contentOriginOffsetY"];
    contentOriginOffset = {
        x.isNumber() ? (Float)x.asDouble() : 0,
        y.isNumber() ? (Float)y.asDouble() : 0};
  }

  folly::dynamic getDynamic() const {
    return folly::dynamic::object("contentOriginOffsetX", (double)contentOriginOffset.x)(
        "contentOriginOffsetY", (double)contentOriginOffset.y);
  }

  MapBuffer getMapBuffer() const {
    return MapBufferBuilder::EMPTY();
  }
#endif

  Point contentOriginOffset{0, 0};
};

} // namespace facebook::react
