import React, { createContext, useContext } from 'react';
import {
  Dimensions,
  findNodeHandle,
  type LayoutChangeEvent,
  NativeModules,
  Platform,
  processColor,
  requireNativeComponent,
  StatusBar,
  View,
} from 'react-native';

export const _FittedSheet = requireNativeComponent<any>('SheetView');

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

interface Props {
  readonly params?: FittedSheetParams;
  readonly onSheetDismiss?: (passThroughParam?: any) => void;
  readonly children?: Children;
}

interface State {
  show: boolean;
  data: any | null;
  currentHeight: number;
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

export class FittedSheet extends React.PureComponent<Props, State> {
  private cleanup?: () => void;
  private shouldShowBack = false;
  private onHidePassThroughParam?: any;
  private sheetRef = React.createRef<any>();
  constructor(props: Props) {
    super(props);
    this.state = { show: false, data: null, currentHeight: -1 };
  }

  show = (data?: any) => {
    this.setState({ show: true, data });
  };

  data = () => this.state.data;

  private newOrMaxHeight(height: number) {
    const dim = Dimensions.get('screen');

    const maxHeight = Math.min(
      this.props.params?.maxHeight ?? Number.MAX_VALUE,
      dim.height - (StatusBar.currentHeight ?? 0)
    );
    return Math.min(maxHeight, height);
  }

  onLayout = (e: LayoutChangeEvent) => {
    this.setState({
      currentHeight: this.newOrMaxHeight(e.nativeEvent.layout.height),
    });
  };

  toggle = () => {
    this.setState({ show: !this.state.show });
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
    NativeModules.SheetView.dismiss(tag);
  };

  private onDismiss = () => {
    if (this.shouldShowBack) {
      this.setState({ show: false }, () => this.show(this.state.data));
      this.shouldShowBack = false;
      return;
    }
    this.setState({ show: false });
    const passValue = this.onHidePassThroughParam;
    this.onHidePassThroughParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };

  componentDidMount() {
    this.cleanup = Dimensions.addEventListener('change', () => {
      if (!this.state.show) return;
      if (this.shouldShowBack) return;
      this.shouldShowBack = true;
      this.hide();
    }).remove;
  }

  componentWillUnmount() {
    this.hide();
    this.cleanup?.();
    this.cleanup = undefined;
  }

  private viewportSize(): { width: number; height: number } {
    if (Platform.OS === 'ios') {
      return NativeModules.SheetView.viewportSize();
    }
    return Dimensions.get('screen');
  }

  render() {
    if (!this.state.show) return null;

    const dim = this.viewportSize();
    const isLandscape = dim.width > dim.height;
    console.log('🍓[FittedSheet.render]', dim);

    let maxHeight = Math.min(
      this.props.params?.maxHeight ?? Number.MAX_VALUE,
      dim.height - (StatusBar.currentHeight ?? 0)
    );

    const paramsMaxWidth = isLandscape
      ? this.props.params?.maxLandscapeWidth
      : this.props.params?.maxPortraitWidth;
    let maxWidth = Math.min(paramsMaxWidth ?? Number.MAX_VALUE, dim.width);
    let minHeight = this.props.params?.minHeight;
    if (this.props.params?.applyMaxHeightToMinHeight) {
      minHeight = maxHeight;
    }
    const fittedSheetParams = this.props.params
      ? {
          ...this.props.params,
          maxHeight,
          maxWidth,
          currentHeight: this.state.currentHeight,
          passScrollViewReactTag: this.state.passScrollViewReactTag,
          backgroundColor: this.props.params.backgroundColor
            ? processColor(this.props.params.backgroundColor)
            : undefined,
        }
      : {
          maxHeight,
          maxWidth,
          passScrollViewReactTag: this.state.passScrollViewReactTag,
          currentHeight: this.state.currentHeight,
        };
    console.log(
      '🍓[FittedSheet.render]',
      this.state.currentHeight,
      fittedSheetParams
    );
    return (
      <_FittedSheet
        onSheetDismiss={this.onDismiss}
        ref={this.sheetRef}
        style={{
          width: maxWidth,
          maxHeight,
          minHeight,
          position: 'absolute',
        }}
        fittedSheetParams={fittedSheetParams}
      >
        <FittedSheetContext.Provider value={this}>
          <View
            nativeID={'fitted-sheet-root-view'}
            style={{ maxHeight, minHeight, maxWidth }}
            onLayout={this.onLayout}
          >
            {this.props.children &&
              typeof this.props.children === 'function' &&
              this.props.children(this.state.data)}
            {this.props.children &&
              typeof this.props.children !== 'function' &&
              this.props.children}
          </View>
        </FittedSheetContext.Provider>
      </_FittedSheet>
    );
  }
}
