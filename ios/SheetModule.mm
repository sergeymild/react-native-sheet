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
        @"bottom": @(0)
      }
    });
  });
  

  return constants;
}

- (NSDictionary *)viewportSize {
  NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCapacity:2];
  RCTUnsafeExecuteOnMainQueueSync(^{
    auto size = RCTViewportSize();
    dict[@"width"] = @(size.width);
    dict[@"height"] = @(size.height);
  });
  return dict;
}

- (void)dismiss:(NSInteger)tag {
  NSLog(@"😀 dismissModule %d", [[NSNumber alloc] initWithInt:tag].intValue);
}

- (void)dismissAll {
  RCTExecuteOnMainQueue(^{
    UIViewController *presented = RCTPresentedViewController();
    if ([presented isKindOfClass:SheetViewController.class]) {
      ((SheetViewController*)presented).dismissAll = true;
      [((SheetViewController*)presented) dismissViewControllerAnimated:false completion:nil];
    }
  });
}

- (void)dismissPresented {
  RCTExecuteOnMainQueue(^{
    UIViewController *presented = RCTPresentedViewController();
    if ([presented isKindOfClass:SheetViewController.class]) {
      [((SheetViewController*)presented) dismissViewControllerAnimated:true completion:nil];
    }
  });
}

- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params {
  return std::make_shared<NativeSheetSpecJSI>(params);
}

@end
