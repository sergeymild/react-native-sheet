/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { PureComponent } from 'react';
import { Keyboard, LayoutAnimation, Platform, StyleSheet, View, } from 'react-native';
// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation = {
    duration: 500,
    create: {
        duration: 300,
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
    },
    update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 200,
    },
};
export class KeyboardSpacer extends PureComponent {
    _listeners = [];
    constructor(props) {
        super(props);
        this.state = {
            keyboardSpace: 0,
            isKeyboardOpened: false,
        };
    }
    get style() {
        let spacing = this.props.defaultBottomSpacing ?? 0;
        if (this.state.keyboardSpace > 0) {
            spacing = this.props.openedSpacing ?? 0;
        }
        let height = this.state.keyboardSpace + spacing;
        if (Platform.OS === 'android' && this.props.handleAndroid !== true) {
            height = spacing;
        }
        return [styles.container, { height }, this.props.style];
    }
    componentDidMount() {
        const updateListener = Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
        const resetListener = Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
        this._listeners = [
            Keyboard.addListener(updateListener, this.updateKeyboardSpace),
            Keyboard.addListener(resetListener, this.resetKeyboardSpace),
        ];
    }
    componentWillUnmount() {
        this._listeners.forEach((listener) => listener.remove());
    }
    updateKeyboardSpace = (event) => {
        if (!event.endCoordinates) {
            return;
        }
        let animationConfig = defaultAnimation;
        if (Platform.OS === 'ios') {
            animationConfig = LayoutAnimation.create(event.duration, LayoutAnimation.Types[event.easing], LayoutAnimation.Properties.opacity);
        }
        LayoutAnimation.configureNext(animationConfig);
        this.setState({
            keyboardSpace: event.endCoordinates.height,
            isKeyboardOpened: true,
        }, () => {
            this.props.onToggle?.(event.endCoordinates.height);
        });
    };
    resetKeyboardSpace = (event) => {
        let animationConfig = defaultAnimation;
        if (Platform.OS === 'ios') {
            animationConfig = LayoutAnimation.create(event.duration, LayoutAnimation.Types[event.easing], LayoutAnimation.Properties.opacity);
        }
        LayoutAnimation.configureNext(animationConfig);
        this.setState({
            keyboardSpace: 0,
            isKeyboardOpened: false,
        }, () => {
            this.props.onToggle?.(0);
        });
    };
    render() {
        return React.createElement(View, { style: this.style });
    }
}
const styles = StyleSheet.create({
    container: {
        left: 0,
        right: 0,
        bottom: 0,
    },
});
