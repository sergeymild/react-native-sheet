import React from 'react';
import {
  Dimensions,
  findNodeHandle,
  type LayoutChangeEvent,
  NativeModules,
  Platform,
  requireNativeComponent,
  StatusBar,
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
  isLandscape: boolean;
}

export class PrivateFittedSheet extends React.PureComponent<SheetProps, State> {
  private cleanup?: () => void;
  private onHidePassThroughParam?: any;
  private sheetRef = React.createRef<any>();

  private dimensions: { width: number; height: number };

  constructor(props: SheetProps) {
    super(props);
    this.dimensions = this.viewportSize();

    this.state = {
      show: false,
      data: null,
      isLandscape: this.dimensions.width > this.dimensions.height,
    };
  }

  show = (data?: any) => {
    this.setState({ show: true, data });
  };

  onLayout = (e: LayoutChangeEvent) => {
    if (__DEV__)
      console.log('[FittedSheet.onLayout]', e.nativeEvent.layout.height);
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
    if (__DEV__) console.log('[FittedSheet.onDismiss]');
    this.setState({ show: false, height: undefined });
    const passValue = this.onHidePassThroughParam;
    this.onHidePassThroughParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };

  private insets(): { top: number; bottom: number } {
    return SheetModule.getConstants().insets as any;
  }

  componentDidMount() {
    if (__DEV__) console.log('[FittedSheet.componentDidMount]', this.insets());
    this.cleanup = Dimensions.addEventListener('change', () => {
      this.dimensions = this.viewportSize();
      const isLandscape = this.dimensions.width > this.dimensions.height;
      this.setState({ isLandscape });
    }).remove;
  }

  componentWillUnmount() {
    if (__DEV__) console.log('[FittedSheet.componentWillUnmount]');
    this.hide();
    this.cleanup?.();
    this.cleanup = undefined;
  }

  private viewportSize(): { width: number; height: number } {
    if (Platform.OS === 'ios') {
      return SheetModule.viewportSize();
    }
    return Dimensions.get('window');
  }

  render() {
    if (!this.state.show) return null;
    let maxHeight = Math.min(
      this.props.params?.maxHeight ?? Number.MAX_VALUE,
      this.dimensions.height - this.insets().top - this.insets().bottom
    );
    const paramsMaxWidth = this.state.isLandscape
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

    if (__DEV__) {
      console.log(
        '[FittedSheet.render]',
        JSON.stringify(
          {
            maxHeight,
            maxWidth,
            nativeHeight,
            isLandscape: this.state.isLandscape,
            h: Dimensions.get('window').height,
            sb: StatusBar.currentHeight,
            dimensions: this.dimensions,
          },
          undefined,
          2
        )
      );
    }
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
