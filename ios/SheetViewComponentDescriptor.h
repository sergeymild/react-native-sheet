#pragma once

#include <react/renderer/components/SheetViewSpec/EventEmitters.h>
#include <react/renderer/components/SheetViewSpec/Props.h>
#include <react/renderer/components/view/ConcreteViewShadowNode.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include <react/renderer/core/StateData.h>

/**
 * iOS-side declarations for the `SheetView` Fabric component.
 *
 * We set `interfaceOnly: true` on the JS spec (see
 * `src/SheetViewNativeComponent.ts`) so codegen stops auto-emitting a default
 * `SheetViewShadowNode` / `SheetViewComponentDescriptor` typedef on Android —
 * the library provides its own subclass there that overrides
 * `getContentOriginOffset` for inline presentation. iOS doesn't need that
 * override (inline mode is done via native UIViewController containment), but
 * it still needs the typedef for `SheetView.mm`'s component descriptor
 * registration, which this header provides.
 */

namespace facebook::react {

extern const char SheetViewComponentName[];

using SheetViewState = StateData;

using SheetViewShadowNode = ConcreteViewShadowNode<
    SheetViewComponentName,
    SheetViewProps,
    SheetViewEventEmitter,
    SheetViewState>;

using SheetViewComponentDescriptor =
    ConcreteComponentDescriptor<SheetViewShadowNode>;

} // namespace facebook::react
