#import <React/RCTUtils.h>
#import "SheetModule.h"
#import "RCTTypeSafety/RCTTypedModuleConstants.h"

using namespace facebook::react;

@implementation SheetModule
RCT_EXPORT_MODULE(Sheet)

- (ModuleConstants<JS::NativeSheet::Constants>)constantsToExport {
  return (ModuleConstants<JS::NativeSheet::Constants>)[self getConstants];
}

- (ModuleConstants<JS::NativeSheet::Constants>)getConstants {
  __block ModuleConstants<JS::NativeSheet::Constants> constants;
  
  RCTUnsafeExecuteOnMainQueueSync(^{
    constants = typedConstants<JS::NativeSheet::Constants>({
      .insets = @{
        @"top": @(RCTKeyWindow().safeAreaInsets.top),
        @"bottom": @(RCTKeyWindow().safeAreaInsets.bottom)
      }
    });
  });
  

  return constants;
}

- (void)dismiss:(NSInteger)tag {
  NSLog(@"😀 dismissModule %d", [[NSNumber alloc] initWithInt:tag].intValue);
}

- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params {
  return std::make_shared<NativeSheetSpecJSI>(params);
}

@end
