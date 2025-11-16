#import "SheetView.h"
#import <react/renderer/components/SheetViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/SheetViewSpec/EventEmitters.h>
#import <react/renderer/components/SheetViewSpec/Props.h>
#import <react/renderer/components/SheetViewSpec/RCTComponentViewHelpers.h>

#import <React/RCTConversions.h>

#import "RCTFabricComponentsPlugins.h"

#if __has_include("Sheet2-Swift.h")
#import "Sheet2-Swift.h"
#else
#import <Sheet2/Sheet2-Swift.h>
#endif

using namespace facebook::react;

@interface SheetView () <RCTSheetViewViewProtocol>

@end

@implementation SheetView {
  HostFittedSheet * _view2;
  UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<SheetViewComponentDescriptor>();
}

- (std::shared_ptr<const SheetViewEventEmitter>)modalEventEmitter
{
  if (!_eventEmitter) return nullptr;
  assert(std::dynamic_pointer_cast<const SheetViewEventEmitter>(_eventEmitter));
  return std::static_pointer_cast<const SheetViewEventEmitter>(_eventEmitter);
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const SheetViewProps>();
    _props = defaultProps;
    NSLog(@"SheetView.initWithFrame");
    _view = [[UIView alloc] init];
    _view2 = [[HostFittedSheet alloc] init];

    self.contentView = _view2;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<SheetViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<SheetViewProps const>(props);

  [_view2 setUniqueId:[[NSString alloc]initWithUTF8String:newViewProps.uniqueId.c_str()]];
  NSLog(@"%@ SheetView.updateProps", _view2.uniqueId);

  if (oldViewProps.maxWidth != newViewProps.maxWidth || oldViewProps.dismissable != newViewProps.dismissable || oldViewProps.topLeftRightCornerRadius != newViewProps.topLeftRightCornerRadius) {
    [_view2 setFittedSheetParams:@{
      @"maxWidth": @(newViewProps.maxWidth),
      @"dismissable": @(newViewProps.dismissable),
      @"topLeftRightCornerRadius": @(newViewProps.topLeftRightCornerRadius)
    }];
  }

  auto color = RCTUIColorFromSharedColor(newViewProps.sheetBackgroundColor);
  [_view2 setSheetBackgroundColor:color];

  if (oldViewProps.passScrollViewReactTag != newViewProps.passScrollViewReactTag) {
    [_view2 setPassScrollViewReactTag];
  }


  NSLog(@"----- %f", newViewProps.calculatedHeight);
  [_view2 setCalculatedHeight:newViewProps.calculatedHeight];


  [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  NSLog(@"%@ SheetView.mountChildComponentView", _view2.uniqueId);
  [_view2 insertReactSubview:childComponentView atIndex:index];

  __weak SheetView *weakSelf = self;
  _view2.onSheetDismiss = ^{
    __strong SheetView *strongSelf = weakSelf;
    if (!strongSelf) return; // object already destroyed, exiting

    NSLog(@"%@ SheetView.onSheetDismiss", strongSelf->_view2.uniqueId);
    auto eventEmitter = [strongSelf modalEventEmitter];
    if (eventEmitter) {
      eventEmitter->onSheetDismiss({});
    }
  };
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  NSLog(@"%@ SheetView.unmountChildComponentView", _view2.uniqueId);
  [_view2 removeReactSubview:childComponentView];
}

- (void)prepareForRecycle {
  NSLog(@"%@ SheetView.prepareForRecycle - before destroy", _view2.uniqueId);
  [_view2 destroy];
  _view2.onSheetDismiss = nil;

  // Remove old HostFittedSheet from hierarchy
  [_view2 removeFromSuperview];

  NSLog(@"%@ SheetView.prepareForRecycle - creating new HostFittedSheet", _view2.uniqueId);
  // Create new HostFittedSheet instance for next use
  _view2 = [[HostFittedSheet alloc] init];
  self.contentView = _view2;

  NSLog(@"%@ SheetView.prepareForRecycle - calling super", _view2.uniqueId);
  [super prepareForRecycle];
  NSLog(@"%@ SheetView.prepareForRecycle - completed", _view2.uniqueId);
}

- (void)dealloc {
  NSLog(@"%@ SheetView.dealloc", _view2.uniqueId);
  [_view2 destroy];
  _view2.onSheetDismiss = nil;
  _view2 = nil;
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask {
  [super finalizeUpdates:updateMask];
  [_view2 finalizeUpdates];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args {
  RCTSheetViewHandleCommand(self, commandName, args);
}

- (void)dismissSheet {
  [_view2 dismiss];
}

Class<RCTComponentViewProtocol> SheetViewCls(void) {
  return SheetView.class;
}

@end
