import React from 'react';
import {
  Dimensions,
  type LayoutChangeEvent,
  Platform,
  StatusBar,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import She, { Commands } from './SheetViewNativeComponent';
import SheetModule from './NativeSheet';
import { Portal } from '@gorhom/portal';

const _FittedSheet = She;

export interface FittedSheetParams {
  applyMaxHeightToMinHeight?: boolean;
  dismissable?: boolean;
  maxPortraitWidth?: number;
  maxLandscapeWidth?: number;
  maxHeight?: number;
  minHeight?: number;
  topLeftRightCornerRadius?: number;
  backgroundColor?: string;
  /**
   * Android only
   */
  isSystemUILight?: boolean;
}

type FittedSheetChildren =
  | ((data: any) => React.ReactElement)
  | React.ReactElement
  | React.ReactElement[];

export interface SheetProps {
  params?: FittedSheetParams;
  onSheetDismiss?: (passThroughParam?: any) => void;
  children?: FittedSheetChildren;
  rootViewStyle?: StyleProp<Omit<ViewStyle, 'flex' | 'flexGrow' | 'position'>>;
}

interface State {
  show: boolean;
  data: any | null;
  height?: number;
  passScrollViewReactTag?: string;
  isLandscape: boolean;
}

let index = 0;
export class PrivateFittedSheet extends React.PureComponent<SheetProps, State> {
  private cleanup?: () => void;
  private onHidePassThroughParam?: any;
  private sheetRef = React.createRef<any>();
  private uniqueId = 0;

  private dimensions: { width: number; height: number };

  constructor(props: SheetProps) {
    super(props);
    this.uniqueId = ++index;
    this.dimensions = this.viewportSize();

    this.state = {
      show: false,
      data: null,
      isLandscape: this.dimensions.width > this.dimensions.height,
    };
  }

  private log = (key: string, message: any | undefined = undefined) => {
    //if (true) return;
    if (message) console.log(`${this.uniqueId} - FittedSheet.${key}`, message);
    else console.log(`${this.uniqueId} - FittedSheet.${key}`);
  };

  show = (data?: any) => {
    this.setState({ show: true, data });
  };

  onLayout = (e: LayoutChangeEvent) => {
    this.log('onLayout', e.nativeEvent.layout.height);
    this.setState({ height: e.nativeEvent.layout.height });
  };

  attachScrollViewToSheet = () => {
    this.log(`attachScrollViewToSheet`);
    this.setState({ passScrollViewReactTag: Date.now().toString() });
  };

  hide = (passThroughParam?: any) => {
    if (!this.state.show) return;
    this.onHidePassThroughParam = passThroughParam;
    this.log('hide', Commands.dismissSheet);
    //@ts-ignore
    Commands.dismissSheet(this.sheetRef.current);
  };

  static dismissAll = () => {
    SheetModule.dismissAll();
  };

  static dismissPresented = () => {
    SheetModule.dismissPresented();
  };

  // @ts-ignore
  private onDismiss = () => {
    this.log('onDismiss');
    this.setState({ show: false, height: undefined });
    const passValue = this.onHidePassThroughParam;
    this.onHidePassThroughParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };

  private insets(): { top: number; bottom: number } {
    return (SheetModule.getConstants().insets as any) ?? { top: 0, bottom: 0 };
  }

  componentDidMount() {
    this.log('componentDidMount');
    this.cleanup = Dimensions.addEventListener('change', () => {
      this.dimensions = this.viewportSize();
      const isLandscape = this.dimensions.width > this.dimensions.height;
      this.setState({ isLandscape });
    }).remove;
  }

  componentWillUnmount() {
    this.log('componentWillUnmount');
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

  private _shouldSetResponder(): boolean {
    return true;
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
      //@ts-ignore
      const logJson = JSON.stringify(
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
      );
      this.log('render');
    }
    const background = this.props?.params?.backgroundColor;
    return (
      <Portal hostName={'SheetHost'}>
        <_FittedSheet
          key={this.uniqueId.toString()}
          onSheetDismiss={this.onDismiss}
          uniqueId={this.uniqueId.toString()}
          ref={this.sheetRef}
          onStartShouldSetResponder={this._shouldSetResponder}
          style={{ width: maxWidth, position: 'absolute' }}
          dismissable={this.props.params?.dismissable ?? true}
          maxWidth={maxWidth}
          maxHeight={maxHeight}
          sheetBackgroundColor={background}
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
            onLayout={this.onLayout}
            style={[
              {
                width: maxWidth,
                maxHeight,
                backgroundColor: background,
              },
              this.props.rootViewStyle,
            ]}
          >
            {this.props.children &&
              typeof this.props.children === 'function' &&
              this.props.children(this.state.data)}
            {this.props.children &&
              typeof this.props.children !== 'function' &&
              this.props.children}
          </View>
        </_FittedSheet>
      </Portal>
    );
  }
}
