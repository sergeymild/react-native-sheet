import React from 'react';
import {
  Dimensions,
  findNodeHandle,
  type LayoutChangeEvent,
  NativeModules,
  Platform,
  requireNativeComponent,
  View,
} from 'react-native';

const _FittedSheet = requireNativeComponent<any>('SheetView');
const SheetModule = NativeModules.SheetView;

export interface FittedSheetParams {
  readonly applyMaxHeightToMinHeight?: boolean;
  readonly dismissable?: boolean;
  readonly maxPortraitWidth?: number;
  readonly maxLandscapeWidth?: number;
  readonly maxHeight?: number;
  readonly minHeight?: number;
  readonly topLeftRightCornerRadius?: number;
  readonly backgroundColor?: string;
  /**
   * Android only
   */
  readonly isSystemUILight?: boolean;
}

type Children =
  | ((data: any) => React.ReactElement)
  | React.ReactElement
  | React.ReactElement[];

export interface SheetProps {
  readonly params?: FittedSheetParams;
  readonly onSheetDismiss?: (passThroughParam?: any) => void;
  readonly children?: Children;
}

interface State {
  show: boolean;
  data: any | null;
  height?: number;
  passScrollViewReactTag?: string;
}

export class PrivateFittedSheet extends React.PureComponent<SheetProps, State> {
  private cleanup?: () => void;
  private shouldShowBack = false;
  onHidePassThroughParam?: any;
  presentData?: any;
  private sheetRef = React.createRef<any>();
  minimized = false;

  private dimensions: { width: number; height: number };
  private isLandscape: boolean;

  constructor(props: SheetProps) {
    super(props);
    this.state = { show: false, data: null };

    this.dimensions = this.viewportSize();
    this.isLandscape = this.dimensions.width > this.dimensions.height;
  }

  show = (data?: any) => {
    this.presentData = data;
    this.setState({ show: true, data });
  };

  onLayout = (e: LayoutChangeEvent) => {
    // if (__DEV__)
    //   console.log('[FittedSheet.onLayout]', e.nativeEvent.layout.height);
    this.setState({ height: e.nativeEvent.layout.height });
  };

  attachScrollViewToSheet = () => {
    console.log('[FittedSheet.attachScrollViewToSheet]');
    this.setState({ passScrollViewReactTag: Date.now().toString() });
  };

  hide = (passThroughParam?: any) => {
    if (!this.state.show) return;
    this.onHidePassThroughParam = passThroughParam;
    const tag = findNodeHandle(this.sheetRef.current);
    if (!tag) return;
    SheetModule.dismiss(tag);
  };

  private onDismiss = () => {
    if (__DEV__) console.log('[FittedSheet.onDismiss]', this.minimized);
    if (this.shouldShowBack) {
      this.setState({ show: false, height: undefined }, () =>
        this.show(this.presentData)
      );
      this.shouldShowBack = false;
      return;
    }
    this.setState({
      show: false,
      height: undefined,
      data: undefined,
      passScrollViewReactTag: undefined,
    });
    if (this.minimized) return;
    const passValue = this.onHidePassThroughParam;
    this.onHidePassThroughParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };

  private insets(): { top: number; bottom: number } {
    return SheetModule.getConstants().insets as any;
  }

  componentDidMount() {
    //if (__DEV__) console.log('[FittedSheet.componentDidMount]');
    this.cleanup = Dimensions.addEventListener('change', () => {
      if (!this.state.show) return;
      if (this.shouldShowBack) return;
      this.shouldShowBack = true;
      this.dimensions = this.viewportSize();
      this.isLandscape = this.dimensions.width > this.dimensions.height;

      this.hide();
    }).remove;
  }

  componentWillUnmount() {
    //if (__DEV__) console.log('[FittedSheet.componentWillUnmount]');
    this.hide();
    this.cleanup?.();
    this.cleanup = undefined;
  }

  private viewportSize(): { width: number; height: number } {
    if (Platform.OS === 'ios') {
      return SheetModule.viewportSize();
    }
    return Dimensions.get('screen');
  }

  render() {
    if (!this.state.show) return null;
    let maxHeight = Math.min(
      this.props.params?.maxHeight ?? Number.MAX_VALUE,
      this.dimensions.height - this.insets().top - this.insets().bottom
    );

    const paramsMaxWidth = this.isLandscape
      ? this.props.params?.maxLandscapeWidth
      : this.props.params?.maxPortraitWidth;
    let maxWidth = Math.min(
      paramsMaxWidth ?? Number.MAX_VALUE,
      this.dimensions.width
    );
    let minHeight = this.props.params?.minHeight;
    if (this.props.params?.applyMaxHeightToMinHeight) {
      minHeight = maxHeight;
    }

    let nativeHeight = this.state.height;
    if (nativeHeight) {
      nativeHeight = Math.max(nativeHeight ?? 0, minHeight ?? 0);
      nativeHeight = Math.min(nativeHeight, maxHeight);
    }

    // if (__DEV__) {
    //   console.log('[FittedSheet.render]', {
    //     maxHeight,
    //     maxWidth,
    //     nativeHeight,
    //     h: Dimensions.get('window').height,
    //     sb: StatusBar.currentHeight,
    //     dim: this.dimensions.width,
    //   });
    // }
    const background = this.props?.params?.backgroundColor;
    return (
      <_FittedSheet
        onSheetDismiss={this.onDismiss}
        ref={this.sheetRef}
        style={{ width: maxWidth, position: 'absolute' }}
        calculatedHeight={nativeHeight}
        passScrollViewReactTag={this.state.passScrollViewReactTag}
        fittedSheetParams={
          this.props.params
            ? {
                ...this.props.params,
                maxWidth,
              }
            : undefined
        }
      >
        <View
          nativeID={'fitted-sheet-root-view'}
          style={{
            width: maxWidth,
            maxHeight,
            backgroundColor: background,
          }}
          onLayout={this.onLayout}
        >
          {this.props.children &&
            typeof this.props.children === 'function' &&
            this.props.children(this.state.data)}
          {this.props.children &&
            typeof this.props.children !== 'function' &&
            this.props.children}
        </View>
      </_FittedSheet>
    );
  }
}
