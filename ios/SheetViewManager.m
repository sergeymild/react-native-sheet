#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(SheetView, SheetViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(dismissKeyboardOnScroll, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSheetDismiss, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(fittedSheetParams, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(passScrollViewReactTag, NSString)
RCT_EXPORT_VIEW_PROPERTY(calculatedHeight, NSNumber)

RCT_EXTERN_METHOD(dismiss:(nonnull NSNumber *)node)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(viewportSize)

@end
