#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(SheetView, SheetViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(dismissKeyboardOnScroll, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSheetDismiss, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(fittedSheetParams, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(sheetHeight, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(passScrollViewReactTag, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(increaseHeight, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(decreaseHeight, NSNumber)
RCT_EXTERN_METHOD(dismiss:(nonnull NSNumber *)node)

@end
