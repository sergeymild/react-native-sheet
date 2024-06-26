import React, {
  ComponentClass,
  createContext,
  FunctionComponent,
  useContext,
} from 'react';
import {
  Dimensions,
  findNodeHandle,
  FlatList,
  LayoutChangeEvent,
  NativeModules,
  Platform,
  processColor,
  requireNativeComponent,
  ScrollView,
  View,
} from 'react-native';

export const _FittedSheet = requireNativeComponent<any>('SheetView');

export interface FittedSheetParams {
  readonly dismissable?: boolean;
  readonly sheetHeight?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly minHeight?: number;
  readonly isDark?: boolean;
  readonly topLeftRightCornerRadius?: number;
  readonly backgroundColor?: string;
}

type Children = ((data: any) => React.ReactElement) | React.ReactElement;

interface Props {
  readonly params?: FittedSheetParams;
  readonly onSheetDismiss?: (passThroughtParam?: any) => void;
  readonly children?: Children;
}

type LazyView = () => FunctionComponent<any> | ComponentClass<any, any>;

interface State {
  show: boolean;
  data: any | null;
  view?: {
    view: LazyView;
    props?: any;
  };
}

export const FITTED_SHEET_SCROLL_VIEW = 'fittedSheetScrollView';

interface Context {
  hide: (passThroughtParam?: any) => void;
  replace: (height: number) => void;
  setHeight: (size: number) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  passScrollViewReactTag: (tag: React.RefObject<ScrollView | FlatList>) => void;
}

const FittedSheetContext = createContext<Context | null>(null);

export const useFittedSheetContext = () => {
  return useContext(FittedSheetContext)!;
};

export class FittedSheet extends React.PureComponent<Props, State> {
  private onHidePassThroughtParam?: any;
  private sheetRef = React.createRef<any>();
  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
      data: null,
    };
  }

  show = (data?: any) => {
    this.setState({ show: true, data });
  };

  replace = (height: number) => {
    this.sheetRef.current?.setNativeProps({ availableSize: height });
  };

  onLayout = (event: LayoutChangeEvent) => {
    if (Platform.OS === 'ios') return;
    this.setHeight(event.nativeEvent.layout.height);
  };

  setElement = (view: LazyView, props?: any) => {
    this.setState({ view: { view, props } });
  };

  showElement = (view: LazyView, props?: any) => {
    this.setState({ show: true, view: { view, props } });
  };

  data = () => this.state.data;

  toggle = () => {
    this.setState({ show: !this.state.show });
  };

  setHeight = (size: number) => {
    this.sheetRef.current?.setNativeProps({ sheetHeight: size });
  };

  passScrollViewReactTag = (ref: React.RefObject<ScrollView | FlatList>) => {
    let tag = findNodeHandle(ref.current);
    if (!tag) {
      console.warn(
        '[FittedSheet.passScrollViewReactTag]',
        'ScrollView did find with ref:',
        ref.current
      );
      return;
    }
    this.sheetRef.current?.setNativeProps({ passScrollViewReactTag: tag });
  };

  increaseHeight = (by: number) => {
    this.sheetRef.current?.setNativeProps({ increaseHeight: by });
  };

  decreaseHeight = (by: number) => {
    this.sheetRef.current?.setNativeProps({ decreaseHeight: by });
  };

  hide = (passThroughtParam?: any) => {
    if (!this.state.show) return;
    this.onHidePassThroughtParam = passThroughtParam;
    const tag = findNodeHandle(this.sheetRef.current);
    if (!tag) return;
    NativeModules.SheetView.dismiss(tag);
  };

  private onDismiss = () => {
    this.setState({ show: false, view: undefined });
    const passValue = this.onHidePassThroughtParam;
    this.onHidePassThroughtParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };

  componentWillUnmount() {
    this.hide();
  }

  render() {
    if (!this.state.show) {
      return null;
    }
    let height = this.props.params?.sheetHeight ?? -1;
    if (height === undefined && Platform.OS === 'android') height = -1;
    return (
      <_FittedSheet
        onSheetDismiss={this.onDismiss}
        ref={this.sheetRef}
        fittedSheetParams={
          this.props.params
            ? {
                ...this.props.params,
                isDark: this.props.params.isDark ?? false,
                sheetHeight: height,
                backgroundColor: this.props.params.backgroundColor
                  ? processColor(this.props.params.backgroundColor)
                  : undefined,
              }
            : {}
        }
      >
        <FittedSheetContext.Provider value={this}>
          <View
            nativeID={'fitted-sheet-root-view'}
            style={{
              maxHeight:
                this.props.params?.maxHeight ??
                Dimensions.get('window').height * 0.95,
              minHeight: this.props.params?.minHeight,
            }}
          >
            {!!this.state.view &&
              React.createElement(
                this.state.view.view(),
                this.state.view.props ?? this.state.data
              )}
            {!this.state.view &&
              this.props.children &&
              typeof this.props.children === 'function' &&
              this.props.children(this.state.data)}
            {!this.state.view &&
              this.props.children &&
              typeof this.props.children !== 'function' &&
              this.props.children}
          </View>
        </FittedSheetContext.Provider>
      </_FittedSheet>
    );
  }
}
