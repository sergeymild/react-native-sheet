#pragma once

#include <ReactCommon/JavaTurboModule.h>
#include <ReactCommon/TurboModule.h>
#include <jsi/jsi.h>

/**
 * Custom autolinking header for the SheetViewSpec library.
 *
 * The React Native gradle plugin generates a default `SheetViewSpec.h` at
 * `android/build/generated/source/codegen/jni/SheetViewSpec.h`. By configuring
 * our own `CMakeLists.txt` with an include directory that comes BEFORE the
 * generated one, `autolinking.cpp` finds this file first and therefore sees
 * our custom `SheetViewComponentDescriptor` declaration — which is defined in
 * the library's `common/cpp` area and subclasses the codegen-provided
 * ViewShadowNode with a custom `getContentOriginOffset` override.
 *
 * See react-native-screens' `rnscreens.h` for the same pattern.
 */
#include <react/renderer/components/SheetViewSpec/SheetViewComponentDescriptor.h>

namespace facebook::react {

/**
 * TurboModule provider declaration — codegen generates the implementation at
 * `build/generated/source/codegen/jni/SheetViewSpec-generated.cpp`; we only
 * repeat the prototype here so that consumers of this header (autolinking.cpp)
 * can resolve both our ComponentDescriptor include AND the TurboModule symbol.
 */
JSI_EXPORT
std::shared_ptr<TurboModule> SheetViewSpec_ModuleProvider(
    const std::string& moduleName,
    const JavaTurboModule::InitParams& params);

class JSI_EXPORT NativeSheetSpecJSI : public JavaTurboModule {
 public:
  NativeSheetSpecJSI(const JavaTurboModule::InitParams& params);
};

} // namespace facebook::react
