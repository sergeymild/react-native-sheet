
#import "SheetModule.h"
#import "RCTTypeSafety/RCTTypedModuleConstants.h"

using namespace facebook::react;

@implementation SheetModule
RCT_EXPORT_MODULE(Sheet)

- (ModuleConstants<JS::NativeSheet::Constants>)constantsToExport {
  return (ModuleConstants<JS::NativeSheet::Constants>)[self getConstants];
}

- (ModuleConstants<JS::NativeSheet::Constants>)getConstants {
  
  
  ModuleConstants<JS::NativeSheet::Constants> constants;
  constants = typedConstants<JS::NativeSheet::Constants>({
    .insets = [[NSDictionary alloc] init]
  });
  

  return constants;
}

- (void)dismiss {
  
}

- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params {
  return std::make_shared<NativeSheetSpecJSI>(params);
}

@end
