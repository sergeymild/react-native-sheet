#pragma once

#include <react/renderer/core/ConcreteComponentDescriptor.h>

#include "SheetViewShadowNode.h"

namespace facebook::react {

using SheetViewComponentDescriptor =
    ConcreteComponentDescriptor<SheetViewShadowNode>;

} // namespace facebook::react
