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

interface FittedSheetParams {
  readonly dismissable?: boolean;
  readonly sheetHeight?: number;
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly minHeight?: number;
  readonly topLeftRightCornerRadius?: number;
  readonly backgroundColor?: string;
}

type Children = ((data: any) => React.ReactNode) | React.ReactNode;

interface Props {
  readonly params?: FittedSheetParams;
  readonly onSheetDismiss?: () => void;
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
  hide: () => void;
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
  private sheetRef = React.createRef<any>();
  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
      data: null,
    };
  }

  show = (data?: any) => {
    console.log('[FittedSheet.show]', this.state);
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
    console.log('[FittedSheet.toggle]');
    this.setState({ show: !this.state.show });
  };

  setHeight = (size: number) => {
    console.log('[FittedSheet.setSize]', size);
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
    console.log('[FittedSheet.passScrollViewReactTag]', tag);
    this.sheetRef.current?.setNativeProps({ passScrollViewReactTag: tag });
  };

  increaseHeight = (by: number) => {
    console.log('[FittedSheet.increaseHeight]', by);
    this.sheetRef.current?.setNativeProps({ increaseHeight: by });
  };

  decreaseHeight = (by: number) => {
    console.log('[FittedSheet.decreaseHeight]', by);
    this.sheetRef.current?.setNativeProps({ decreaseHeight: by });
  };

  hide = () => {
    if (!this.state.show) return;
    const tag = findNodeHandle(this.sheetRef.current);
    if (!tag) return;
    console.log('[FittedSheet.hide]', tag);
    NativeModules.SheetView.dismiss(tag);
  };

  private onDismiss = () => {
    console.log('[FittedSheet.onDismiss]');
    this.setState({ show: false, view: undefined });
    this.props.onSheetDismiss?.();
  };

  componentWillUnmount() {
    this.hide();
  }

  render() {
    if (!this.state.show) {
      console.log('[FittedSheet.render.remove]');
      return null;
    }
    let height = this.props.params?.sheetHeight ?? -1;
    if (height === undefined && Platform.OS === 'android') height = -1;
    console.log('[FittedSheet.render]');
    return (
      <_FittedSheet
        onSheetDismiss={this.onDismiss}
        ref={this.sheetRef}
        fittedSheetParams={
          this.props.params
            ? {
                ...this.props.params,
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
