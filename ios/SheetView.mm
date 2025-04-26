#import "SheetView.h"

#import <Sheet/ComponentDescriptors.h>
#import <Sheet/EventEmitters.h>
#import <Sheet/Props.h>
#import <Sheet/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"

using namespace facebook::react;

@interface SheetView () <RCTSheetViewViewProtocol>

@end

@implementation SheetView {
    UIView * _view;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<SheetViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const SheetViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];

    self.contentView = _view;
  }

  return self;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<SheetViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<SheetViewProps const>(props);

    

    [super updateProps:props oldProps:oldProps];
}

Class<RCTComponentViewProtocol> SheetViewCls(void)
{
    return SheetView.class;
}


@end
