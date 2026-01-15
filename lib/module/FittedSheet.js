"use strict";

import React from 'react';
import { Dimensions, Platform, StatusBar, View } from 'react-native';
import She, { Commands } from './SheetViewNativeComponent';
import SheetModule from "./NativeSheet.js";
import { Portal } from '@gorhom/portal';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const _FittedSheet = She;
let index = 0;
export class PrivateFittedSheet extends React.PureComponent {
  sheetRef = /*#__PURE__*/React.createRef();
  uniqueId = 0;
  constructor(props) {
    super(props);
    this.uniqueId = ++index;
    this.dimensions = this.viewportSize();
    this.state = {
      show: false,
      data: null,
      isLandscape: this.dimensions.width > this.dimensions.height
    };
  }
  log = (key, message = undefined) => {
    //if (true) return;
    if (message) console.log(`${this.uniqueId} - FittedSheet.${key}`, message);else console.log(`${this.uniqueId} - FittedSheet.${key}`);
  };
  show = data => {
    this.setState({
      show: true,
      data
    });
  };
  onLayout = e => {
    this.log('onLayout', e.nativeEvent.layout.height);
    this.setState({
      height: e.nativeEvent.layout.height
    });
  };
  attachScrollViewToSheet = () => {
    this.log(`attachScrollViewToSheet`);
    this.setState({
      passScrollViewReactTag: Date.now().toString()
    });
  };
  hide = passThroughParam => {
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
  onDismiss = () => {
    this.log('onDismiss');
    this.setState({
      show: false,
      height: undefined
    });
    const passValue = this.onHidePassThroughParam;
    this.onHidePassThroughParam = undefined;
    this.props.onSheetDismiss?.(passValue);
  };
  insets() {
    return SheetModule.getConstants().insets ?? {
      top: 0,
      bottom: 0
    };
  }
  componentDidMount() {
    this.log('componentDidMount');
    this.cleanup = Dimensions.addEventListener('change', () => {
      this.dimensions = this.viewportSize();
      const isLandscape = this.dimensions.width > this.dimensions.height;
      this.setState({
        isLandscape
      });
    }).remove;
  }
  componentWillUnmount() {
    this.log('componentWillUnmount');
    this.hide();
    this.cleanup?.();
    this.cleanup = undefined;
  }
  viewportSize() {
    if (Platform.OS === 'ios') {
      return SheetModule.viewportSize();
    }
    return Dimensions.get('window');
  }
  _shouldSetResponder() {
    return true;
  }
  render() {
    if (!this.state.show) return null;
    let maxHeight = Math.min(this.props.params?.maxHeight ?? Number.MAX_VALUE, this.dimensions.height - this.insets().top - this.insets().bottom);
    const paramsMaxWidth = this.state.isLandscape ? this.props.params?.maxLandscapeWidth : this.props.params?.maxPortraitWidth;
    let maxWidth = Math.min(paramsMaxWidth ?? Number.MAX_VALUE, this.dimensions.width);
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
      const logJson = JSON.stringify({
        maxHeight,
        maxWidth,
        nativeHeight,
        isLandscape: this.state.isLandscape,
        h: Dimensions.get('window').height,
        sb: StatusBar.currentHeight,
        dimensions: this.dimensions
      }, undefined, 2);
      this.log('render');
    }
    const background = this.props?.params?.backgroundColor;
    return /*#__PURE__*/_jsx(Portal, {
      hostName: 'SheetHost',
      children: /*#__PURE__*/_jsx(_FittedSheet, {
        onSheetDismiss: this.onDismiss,
        uniqueId: this.uniqueId.toString(),
        ref: this.sheetRef,
        onStartShouldSetResponder: this._shouldSetResponder,
        style: {
          width: maxWidth,
          position: 'absolute'
        },
        dismissable: this.props.params?.dismissable ?? true,
        maxWidth: maxWidth,
        maxHeight: maxHeight,
        sheetBackgroundColor: background,
        minHeight: minHeight,
        topLeftRightCornerRadius: this.props.params?.topLeftRightCornerRadius ?? 20,
        isSystemUILight: this.props.params?.isSystemUILight ?? true,
        calculatedHeight: nativeHeight,
        passScrollViewReactTag: this.state.passScrollViewReactTag,
        children: /*#__PURE__*/_jsxs(View, {
          nativeID: 'fitted-sheet-root-view',
          onLayout: this.onLayout,
          style: [{
            width: maxWidth,
            maxHeight,
            backgroundColor: background
          }, this.props.rootViewStyle],
          children: [this.props.children && typeof this.props.children === 'function' && this.props.children(this.state.data), this.props.children && typeof this.props.children !== 'function' && this.props.children]
        })
      }, this.uniqueId.toString())
    });
  }
}
//# sourceMappingURL=FittedSheet.js.map