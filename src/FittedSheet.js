import React, { createContext, useContext } from 'react';
import { Dimensions, findNodeHandle, NativeModules, Platform, processColor, requireNativeComponent, StatusBar, View, } from 'react-native';
export const _FittedSheet = requireNativeComponent('SheetView');
export const FITTED_SHEET_SCROLL_VIEW = 'fittedSheetScrollView';
const FittedSheetContext = createContext(null);
export const useFittedSheetContext = () => {
    try {
        return useContext(FittedSheetContext);
    }
    catch {
        return undefined;
    }
};
export class FittedSheet extends React.PureComponent {
    cleanup;
    shouldShowBack = false;
    onHidePassThroughParam;
    sheetRef = React.createRef();
    constructor(props) {
        super(props);
        this.state = { show: false, data: null, currentHeight: -1 };
    }
    show = (data) => {
        this.setState({ show: true, data });
    };
    data = () => this.state.data;
    newOrMaxHeight(height) {
        const dim = Dimensions.get('screen');
        const maxHeight = Math.min(this.props.params?.maxHeight ?? Number.MAX_VALUE, dim.height - (StatusBar.currentHeight ?? 0));
        return Math.min(maxHeight, height);
    }
    onLayout = (e) => {
        this.setState({
            currentHeight: this.newOrMaxHeight(e.nativeEvent.layout.height),
        });
    };
    toggle = () => {
        this.setState({ show: !this.state.show });
    };
    passScrollViewReactTag = (nativeId) => {
        console.log('🍓[FittedSheet.passScrollViewReactTag]', nativeId);
        this.setState({ passScrollViewReactTag: nativeId });
    };
    hide = (passThroughParam) => {
        if (!this.state.show)
            return;
        this.onHidePassThroughParam = passThroughParam;
        const tag = findNodeHandle(this.sheetRef.current);
        if (!tag)
            return;
        NativeModules.SheetView.dismiss(tag);
    };
    onDismiss = () => {
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
            if (!this.state.show)
                return;
            if (this.shouldShowBack)
                return;
            this.shouldShowBack = true;
            this.hide();
        }).remove;
    }
    componentWillUnmount() {
        this.hide();
        this.cleanup?.();
        this.cleanup = undefined;
    }
    viewportSize() {
        if (Platform.OS === 'ios') {
            return NativeModules.SheetView.viewportSize();
        }
        return Dimensions.get('screen');
    }
    render() {
        if (!this.state.show)
            return null;
        const dim = this.viewportSize();
        const isLandscape = dim.width > dim.height;
        console.log('🍓[FittedSheet.render]', dim);
        let maxHeight = Math.min(this.props.params?.maxHeight ?? Number.MAX_VALUE, dim.height - (StatusBar.currentHeight ?? 0));
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
        console.log('🍓[FittedSheet.render]', this.state.currentHeight, fittedSheetParams);
        return (React.createElement(_FittedSheet, { onSheetDismiss: this.onDismiss, ref: this.sheetRef, style: {
                width: maxWidth,
                maxHeight,
                minHeight,
                position: 'absolute',
            }, fittedSheetParams: fittedSheetParams },
            React.createElement(FittedSheetContext.Provider, { value: this },
                React.createElement(View, { nativeID: 'fitted-sheet-root-view', style: { maxHeight, minHeight, maxWidth }, onLayout: this.onLayout },
                    this.props.children &&
                        typeof this.props.children === 'function' &&
                        this.props.children(this.state.data),
                    this.props.children &&
                        typeof this.props.children !== 'function' &&
                        this.props.children))));
    }
}
