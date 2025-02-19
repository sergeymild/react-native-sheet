#import <React/RCTViewManager.h>

@interface RCT_EXTERN_REMAP_MODULE(SheetView, SheetViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(dismissKeyboardOnScroll, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSheetDismiss, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(fittedSheetParams, NSDictionary)
RCT_EXPORT_VIEW_PROPERTY(passScrollViewReactTag, NSString)

RCT_EXTERN_METHOD(dismiss:(nonnull NSNumber *)node)
RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(viewportSize)

@end


@interface RCT_EXTERN_REMAP_MODULE(TopModalView, TopModalViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(onModalDismiss, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(animated, BOOL)
/// "fade" | "slide" | "none"
RCT_EXPORT_VIEW_PROPERTY(animationType, NSString)
RCT_EXTERN_METHOD(present:(nonnull NSNumber *)node)
RCT_EXTERN_METHOD(dismiss:(nonnull NSNumber *)node)

@end
