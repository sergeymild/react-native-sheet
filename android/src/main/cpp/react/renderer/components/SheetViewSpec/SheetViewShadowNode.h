#pragma once

#include <jsi/jsi.h>
#include <react/renderer/components/SheetViewSpec/EventEmitters.h>
#include <react/renderer/components/SheetViewSpec/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>

#include "SheetViewState.h"

namespace facebook::react {

JSI_EXPORT extern const char SheetViewComponentName[];

/**
 * Custom `ShadowNode` for <SheetView>. The override on
 * `getContentOriginOffset` lets the JVM side (`InlineSheetPresenter`) push a
 * visual Y/X delta via state updates. The offset is consumed by
 * `LayoutableShadowNode::computeRelativeLayoutMetrics` (line 180 in
 * `LayoutableShadowNode.cpp`), so that `measure()` / `measureInWindow()`
 * called from JS on descendant refs returns coordinates relative to the
 * sheet's actual on-screen position — which keeps Pressability's responder
 * region check in sync with real touch coordinates.
 */
class JSI_EXPORT SheetViewShadowNode final
    : public ConcreteViewShadowNode<
          SheetViewComponentName,
          SheetViewProps,
          SheetViewEventEmitter,
          SheetViewState> {
 public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  Point getContentOriginOffset(bool includeTransform) const override;
};

} // namespace facebook::react
