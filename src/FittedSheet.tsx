import React, { createContext, useContext } from 'react';
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
}

export const FITTED_SHEET_SCROLL_VIEW = 'fittedSheetScrollView';

interface Context {
  hide: (passThroughParam?: any) => void;
  passScrollViewReactTag: (nativeId: string) => void;
}

const FittedSheetContext = createContext<Context | null>(null);

export const useFittedSheetContext = () => {
  try {
    return useContext(FittedSheetContext);
  } catch {
    return undefined;
  }
};

export class FittedSheet extends React.PureComponent<SheetProps, State> {
  private cleanup?: () => void;
  private shouldShowBack = false;
  private onHidePassThroughParam?: any;
  private sheetRef = React.createRef<any>();

  private dimensions: { width: number; height: number };
  private isLandscape: boolean;

  constructor(props: SheetProps) {
    super(props);
    this.state = { show: false, data: null };

    this.dimensions = this.viewportSize();
    this.isLandscape = this.dimensions.width > this.dimensions.height;
  }

  show = (data?: any) => {
    this.setState({ show: true, data });
  };

  onLayout = (e: LayoutChangeEvent) => {
    console.log('[FittedSheet.onLayout]', e.nativeEvent.layout.height);
    this.setState({ height: e.nativeEvent.layout.height });
  };

  passScrollViewReactTag = (nativeId: string) => {
    console.log('🍓[FittedSheet.passScrollViewReactTag]', nativeId);
    this.setState({ passScrollViewReactTag: nativeId });
  };
  hide = (passThroughParam?: any) => {
    if (!this.state.show) return;
    this.onHidePassThroughParam = passThroughParam;
    const tag = findNodeHandle(this.sheetRef.current);
    if (!tag) return;
    SheetModule.dismiss(tag);
  };

  // @ts-ignore
  private onDismiss = () => {
    console.log('[FittedSheet.onDismiss]');
    if (this.shouldShowBack) {
      this.setState({ show: false, height: undefined }, () =>
        this.show(this.state.data)
      );
      this.shouldShowBack = false;
      return;
    }
    this.setState({ show: false, height: undefined });
    const passValue = this.onHidePassThroughParam;
    this.onHidePassThroughParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };

  private insets(): { top: number; bottom: number } {
    return SheetModule.getConstants().insets as any;
  }

  componentDidMount() {
    console.log('[FittedSheet.componentDidMount]', this.insets());
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
    console.log('[FittedSheet.componentWillUnmount]');
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
    console.log('[FittedSheet.render.insets]', this.insets());
    let maxHeight = Math.min(
      this.props.params?.maxHeight ?? Number.MAX_VALUE,
      // dim.height - (StatusBar.currentHeight ?? 56)
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

    console.log('[FittedSheet.render]', {
      maxHeight,
      maxWidth,
      nativeHeight,
      h: Dimensions.get('window').height,
      sb: StatusBar.currentHeight,
      dim: this.dimensions.width,
    });
    return (
      <_FittedSheet
        onSheetDismiss={this.onDismiss}
        ref={this.sheetRef}
        style={{ width: maxWidth, position: 'absolute' }}
        calculatedHeight={nativeHeight}
        fittedSheetParams={
          this.props.params
            ? {
                ...this.props.params,
                maxWidth,
                passScrollViewReactTag: this.state.passScrollViewReactTag,
              }
            : {
                passScrollViewReactTag: this.state.passScrollViewReactTag,
              }
        }
      >
        <View
          nativeID={'fitted-sheet-root-view'}
          style={{
            width: maxWidth,
            maxHeight,
            backgroundColor: this.props.params?.backgroundColor ?? 'white',
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
