#import <React/RCTViewManager.h>
#import <React/RCTUIManager.h>
#import "RCTBridge.h"

@interface SheetViewManager : RCTViewManager
@end

@implementation SheetViewManager

RCT_EXPORT_MODULE(SheetView)

- (UIView *)view
{
  return [[UIView alloc] init];
}

RCT_EXPORT_VIEW_PROPERTY(color, NSString)

@end
