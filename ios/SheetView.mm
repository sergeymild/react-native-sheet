#import "SheetView.h"

#import <Sheet/ComponentDescriptors.h>
#import <Sheet/EventEmitters.h>
#import <Sheet/Props.h>
#import <Sheet/RCTComponentViewHelpers.h>
#import <React/RCTConversions.h>

#import "RCTFabricComponentsPlugins.h"
#import <Sheet/Sheet-Swift.h>

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
    
    _view = [[UIView alloc] init];
    _view2 = [[HostFittedSheet alloc] init];
    
    
    
    __weak SheetView *weakSelf = self;
    _view2.onSheetDismiss = ^{
      NSLog(@"😀  ---- onSheetDismiss");
      auto eventEmitter = [weakSelf modalEventEmitter];
      if (eventEmitter) {
        eventEmitter->onSheetDismiss({});
      }
    };
    
    self.contentView = _view2;
  }
  
  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  NSLog(@"😀 updateProps");
  const auto &oldViewProps = *std::static_pointer_cast<SheetViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<SheetViewProps const>(props);
  
  if (oldViewProps.maxWidth != newViewProps.maxWidth || oldViewProps.dismissable != newViewProps.dismissable || oldViewProps.topLeftRightCornerRadius != newViewProps.topLeftRightCornerRadius) {
    [_view2 setFittedSheetParams:@{
      @"maxWidth": @(newViewProps.maxWidth),
      @"dismissable": @(newViewProps.dismissable),
      @"topLeftRightCornerRadius": @(newViewProps.topLeftRightCornerRadius)
    }];
  }
  
  if (oldViewProps.passScrollViewReactTag != newViewProps.passScrollViewReactTag) {
    [_view2 setPassScrollViewReactTag];
  }
  
  
  NSLog(@"----- %f", newViewProps.calculatedHeight);
  [_view2 setCalculatedHeight:newViewProps.calculatedHeight];
  
  
  [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  NSLog(@"😀 mountChildComponentView");
  [_view2 insertReactSubview:childComponentView atIndex:index];
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  NSLog(@"😀 unmountChildComponentView");
  [_view2 removeReactSubview:childComponentView];
}

- (void)prepareForRecycle {
  NSLog(@"😀 prepareForRecycle");
  [super prepareForRecycle];
  [_view2 destroy];
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
