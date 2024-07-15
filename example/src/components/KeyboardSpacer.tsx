/**
 * Created by andrewhurst on 10/5/15.
 */
import React, { PureComponent } from 'react';
import {
  EmitterSubscription,
  Keyboard,
  KeyboardEvent,
  LayoutAnimation,
  LayoutAnimationConfig,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

// From: https://medium.com/man-moon/writing-modern-react-native-ui-e317ff956f02
const defaultAnimation: LayoutAnimationConfig = {
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

interface Props {
  readonly onToggle?: (height: number) => void;
  readonly handleAndroid?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly defaultBottomSpacing?: number;
  readonly openedSpacing?: number;
}

interface State {
  keyboardSpace: number;
  isKeyboardOpened: boolean;
}

export class KeyboardSpacer extends PureComponent<Props, State> {
  private _listeners: Array<EmitterSubscription> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      keyboardSpace: 0,
      isKeyboardOpened: false,
    };
  }

  get style(): StyleProp<ViewStyle> {
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
    const updateListener =
      Platform.OS === 'android' ? 'keyboardDidShow' : 'keyboardWillShow';
    const resetListener =
      Platform.OS === 'android' ? 'keyboardDidHide' : 'keyboardWillHide';
    this._listeners = [
      Keyboard.addListener(updateListener, this.updateKeyboardSpace),
      Keyboard.addListener(resetListener, this.resetKeyboardSpace),
    ];
  }

  componentWillUnmount() {
    this._listeners.forEach((listener) => listener.remove());
  }

  updateKeyboardSpace = (event: KeyboardEvent) => {
    if (!event.endCoordinates) {
      return;
    }

    let animationConfig = defaultAnimation;
    if (Platform.OS === 'ios') {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity
      );
    }
    LayoutAnimation.configureNext(animationConfig);

    this.setState(
      {
        keyboardSpace: event.endCoordinates.height,
        isKeyboardOpened: true,
      },
      () => {
        this.props.onToggle?.(event.endCoordinates.height);
      }
    );
  };

  resetKeyboardSpace = (event: KeyboardEvent) => {
    let animationConfig = defaultAnimation;
    if (Platform.OS === 'ios') {
      animationConfig = LayoutAnimation.create(
        event.duration,
        LayoutAnimation.Types[event.easing],
        LayoutAnimation.Properties.opacity
      );
    }
    LayoutAnimation.configureNext(animationConfig);
    this.setState(
      {
        keyboardSpace: 0,
        isKeyboardOpened: false,
      },
      () => {
        this.props.onToggle?.(0);
      }
    );
  };

  render() {
    return <View style={this.style} />;
  }
}

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    bottom: 0,
  },
});
