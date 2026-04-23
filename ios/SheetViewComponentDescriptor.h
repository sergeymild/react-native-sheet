#pragma once

#include "SheetViewShadowNode.h"
#include <react/renderer/core/ConcreteComponentDescriptor.h>

/**
 * iOS-side declarations for the `SheetView` Fabric component.
 *
 * We set `interfaceOnly: true` on the JS spec (see
 * `src/SheetViewNativeComponent.ts`) so codegen stops auto-emitting default
 * `SheetViewShadowNode` / `SheetViewComponentDescriptor` typedefs — the
 * library provides its own subclass (`SheetViewShadowNode`) that overrides
 * `getContentOriginOffset` to keep Pressability region checks in sync with
 * the real on-screen position after child-VC containment for inline
 * presentation. `SheetView.mm`'s `componentDescriptorProvider` picks up this
 * `SheetViewComponentDescriptor` below.
 */

namespace facebook::react {

using SheetViewComponentDescriptor =
    ConcreteComponentDescriptor<SheetViewShadowNode>;

} // namespace facebook::react
