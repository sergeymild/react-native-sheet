import {
  findNodeHandle,
  NativeModules,
  Platform,
  requireNativeComponent,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';

const TransparentActivity = requireNativeComponent<any>('TransparentActivity');
const TopModalView = requireNativeComponent<any>('TopModalView');

interface Props {
  onActivityDismiss?: () => void;
  children: React.ReactNode;
  animated?: boolean;
}

interface State {
  show: boolean;
}

export class TransparentActivityView extends React.PureComponent<Props, State> {
  private sheetRef = React.createRef<any>();

  constructor(props: Props) {
    super(props);
    this.state = { show: false };
  }

  show = () => {
    if (this.state.show) return;
    this.setState({ show: true });
  };

  hide = () => {
    if (!this.state.show) return;
    const tag = findNodeHandle(this.sheetRef.current);
    if (!tag) return;
    console.log('[TopModal.hide]', tag);
    if (Platform.OS === 'android')
      NativeModules.TransparentActivity.dismiss(tag);
    else NativeModules.TopModalView.dismiss(tag);
  };

  private onDismiss = () => {
    console.log('[FittedSheet.onDismiss]');
    this.setState({ show: false });
    this.props.onActivityDismiss?.();
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

    if (Platform.OS === 'android') {
      return (
        <TransparentActivity
          onActivityDismiss={this.onDismiss}
          ref={this.sheetRef}
          animated={this.props.animated ?? true}
        >
          <View
            accessibilityLabel={'transparent-activity-root-view'}
            nativeID={'transparent-activity-root-view'}
            style={StyleSheet.absoluteFill}
            children={this.props.children}
          />
        </TransparentActivity>
      );
    }

    return (
      <TopModalView
        animationType={'none'}
        animated={false}
        onModalDismiss={this.onDismiss}
        ref={this.sheetRef}
      >
        <View
          accessibilityLabel={'transparent-activity-root-view'}
          nativeID={'transparent-activity-root-view'}
          style={StyleSheet.absoluteFill}
          children={this.props.children}
        />
      </TopModalView>
    );
  }
}
