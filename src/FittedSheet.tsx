import React, { createContext, useContext } from 'react';
import {
  Dimensions,
  type LayoutChangeEvent,
  Platform,
  StatusBar,
  View,
} from 'react-native';

import She, { Commands } from './SheetViewNativeComponent';
import SheetModule from './NativeSheet';

export const _FittedSheet = She;

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
    if (__DEV__)
      console.log('[FittedSheet.onLayout]', e.nativeEvent.layout.height);
    this.setState({ height: e.nativeEvent.layout.height });
  };

  passScrollViewReactTag = (nativeId: string) => {
    if (__DEV__)
      console.log('🍓[FittedSheet.passScrollViewReactTag]', nativeId);
    this.setState({ passScrollViewReactTag: nativeId });
  };
  hide = (passThroughParam?: any) => {
    if (!this.state.show) return;
    this.onHidePassThroughParam = passThroughParam;
    console.log('[FittedSheet.hide]', Commands.dismissSheet);
    Commands.dismissSheet(this.sheetRef.current);
  };

  // @ts-ignore
  private onDismiss = () => {
    if (__DEV__) console.log('[FittedSheet.onDismiss]');
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
    if (__DEV__) console.log('[FittedSheet.componentDidMount]', this.insets());
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
    if (__DEV__) console.log('[FittedSheet.componentWillUnmount]');
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

  private _shouldSetResponder(): boolean {
    return true;
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

    if (__DEV__) {
      console.log('[FittedSheet.render]', {
        maxHeight,
        maxWidth,
        nativeHeight,
        h: Dimensions.get('window').height,
        sb: StatusBar.currentHeight,
        dim: this.dimensions.width,
      });
    }
    const background = this.props?.params?.backgroundColor ?? 'white';
    return (
      <_FittedSheet
        onSheetDismiss={this.onDismiss}
        ref={this.sheetRef}
        onStartShouldSetResponder={this._shouldSetResponder}
        style={{ width: maxWidth, position: 'absolute' }}
        dismissable={this.props.params?.dismissable ?? true}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        minHeight={minHeight}
        topLeftRightCornerRadius={
          this.props.params?.topLeftRightCornerRadius ?? 20
        }
        isSystemUILight={this.props.params?.isSystemUILight ?? true}
        calculatedHeight={nativeHeight}
        passScrollViewReactTag={this.state.passScrollViewReactTag}
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
