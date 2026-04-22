#include "SheetViewShadowNode.h"

namespace facebook::react {

extern const char SheetViewComponentName[] = "SheetView";

Point SheetViewShadowNode::getContentOriginOffset(
    bool includeTransform) const {
  auto const& stateData = getStateData();
  auto offset = stateData.contentOriginOffset;
  auto transform =
      includeTransform ? getTransform() : Transform::Identity();
  auto result = transform * Vector{offset.x, offset.y, 0.0f, 1.0f};
  return {result.x, result.y};
}

} // namespace facebook::react
