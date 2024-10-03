import { findNodeHandle, NativeModules, requireNativeComponent, StyleSheet, View, } from 'react-native';
import React from 'react';
const TopModalView = requireNativeComponent('TopModalView');
export class TopModal extends React.PureComponent {
    sheetRef = React.createRef();
    constructor(props) {
        super(props);
        this.state = {
            show: false,
        };
    }
    show = () => {
        if (this.state.show)
            return;
        this.setState({ show: true });
    };
    hide = () => {
        if (!this.state.show)
            return;
        const tag = findNodeHandle(this.sheetRef.current);
        if (!tag)
            return;
        console.log('[TopModal.hide]', tag);
        NativeModules.TopModalView.dismiss(tag);
    };
    onDismiss = () => {
        console.log('[FittedSheet.onDismiss]');
        this.setState({ show: false });
        this.props.onModalDismiss?.();
    };
    componentWillUnmount() {
        this.hide();
        console.log('[TopModal.componentWillUnmount]');
    }
    render() {
        if (!this.state.show) {
            this.hide();
            console.log('[TopModal.render.remove]');
            return null;
        }
        return (React.createElement(TopModalView, { ref: this.sheetRef, onModalDismiss: this.onDismiss, animated: this.props.animated ?? true, animationType: this.props.animationType ?? 'slide', isEdgeToEdge: this.props.isEdgeToEdge ?? false, isStatusBarBgLight: this.props.isSystemUILight ?? false },
            React.createElement(View, { accessibilityLabel: 'top-modal-root-view', nativeID: 'top-modal-root-view', style: StyleSheet.absoluteFill, children: this.props.children })));
    }
}
