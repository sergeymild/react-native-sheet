#import "SheetView.h"
#import "SheetViewComponentDescriptor.h"
#import "SheetViewShadowNode.h"
#import "SheetViewState.h"
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

// `SheetViewComponentName` is defined in `SheetViewShadowNode.cpp` (mirror
// of the Android-side symbol).

@interface SheetView () <RCTSheetViewViewProtocol>

@end

@implementation SheetView {
  HostFittedSheet * _view2;
  UIView * _view;
  // Typed state handle — cast from the base `State::Shared` we receive in
  // `updateState:oldState:`. Having it typed lets us call
  // `updateState(lambda)` with `SheetViewState` to push the visual
  // content-origin delta when the sheet is re-parented for inline
  // presentation.
  SheetViewShadowNode::ConcreteState::Shared _sheetState;
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

    [self _bindStateUpdater];

    self.contentView = _view2;
  }

  return self;
}

- (void)_bindStateUpdater
{
  __weak SheetView *weakSelf = self;
  _view2.stateUpdater = ^(float x, float y) {
    __strong SheetView *strongSelf = weakSelf;
    if (!strongSelf) return;
    [strongSelf pushContentOriginOffsetX:x y:y];
  };
}

- (void)updateState:(const facebook::react::State::Shared &)state
           oldState:(const facebook::react::State::Shared &)oldState
{
  _sheetState = std::static_pointer_cast<const SheetViewShadowNode::ConcreteState>(state);
}

- (void)pushContentOriginOffsetX:(float)x y:(float)y
{
  if (!_sheetState) return;
  _sheetState->updateState(
    [x, y](const SheetViewShadowNode::ConcreteState::Data &oldData)
        -> SheetViewShadowNode::ConcreteState::SharedData {
      if (std::abs(oldData.contentOriginOffset.x - x) < 0.01 &&
          std::abs(oldData.contentOriginOffset.y - y) < 0.01) {
        return nullptr;
      }
      auto newData = oldData;
      newData.contentOriginOffset = {x, y};
      return std::make_shared<const SheetViewShadowNode::ConcreteState::Data>(newData);
    });
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &oldViewProps = *std::static_pointer_cast<SheetViewProps const>(_props);
  const auto &newViewProps = *std::static_pointer_cast<SheetViewProps const>(props);

  [_view2 setUniqueId:[[NSString alloc]initWithUTF8String:newViewProps.uniqueId.c_str()]];

  // Apply all props unconditionally — after prepareForRecycle the new
  // HostFittedSheet instance has default state, but the props diff against
  // the preserved _props may be a no-op, leaving the recycled instance in
  // defaults (e.g. useInlinePresentation=false, windowLevel=.alert).
  [_view2 setFittedSheetParams:@{
    @"maxWidth": @(newViewProps.maxWidth),
    @"dismissable": @(newViewProps.dismissable),
    @"topLeftRightCornerRadius": @(newViewProps.topLeftRightCornerRadius)
  }];

  auto color = RCTUIColorFromSharedColor(newViewProps.sheetBackgroundColor);
  [_view2 setSheetBackgroundColor:color];

  [_view2 setWindowLevel:[[NSString alloc]initWithUTF8String:newViewProps.windowLevel.c_str()]];

  [_view2 setUseInlinePresentation:newViewProps.useInlinePresentation];

  [_view2 setPresentationStyle:[[NSString alloc] initWithUTF8String:newViewProps.presentationStyle.c_str()]];
  [_view2 setCenterAnimation:[[NSString alloc] initWithUTF8String:newViewProps.centerAnimation.c_str()]];

  if (oldViewProps.passScrollViewReactTag != newViewProps.passScrollViewReactTag) {
    [_view2 setPassScrollViewReactTag];
  }


  [_view2 setCalculatedHeight:newViewProps.calculatedHeight];


  [super updateProps:props oldProps:oldProps];
}

- (void)mountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  [_view2 insertReactSubview:childComponentView atIndex:index];

  __weak SheetView *weakSelf = self;
  _view2.onSheetDismiss = ^{
    __strong SheetView *strongSelf = weakSelf;
    if (!strongSelf) return; // object already destroyed, exiting

    auto eventEmitter = [strongSelf modalEventEmitter];
    if (eventEmitter) {
      eventEmitter->onSheetDismiss({});
    }
  };
}

- (void)unmountChildComponentView:(UIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index {
  [_view2 removeReactSubview:childComponentView];
}

- (void)prepareForRecycle {
  [_view2 destroy];
  _view2.onSheetDismiss = nil;

  // Remove old HostFittedSheet from hierarchy
  [_view2 removeFromSuperview];

  // Create new HostFittedSheet instance for next use
  _view2 = [[HostFittedSheet alloc] init];
  [self _bindStateUpdater];
  self.contentView = _view2;

  [super prepareForRecycle];
}

- (void)dealloc {
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
