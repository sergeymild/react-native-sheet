import {
  findNodeHandle,
  NativeModules,
  requireNativeComponent,
  StyleSheet,
  View,
} from 'react-native';
import React from 'react';

const TopModalView = requireNativeComponent<any>('TopModalView');

interface Props {
  onModalDismiss?: () => void;
}

interface State {
  show: boolean;
}

export class TopModal extends React.PureComponent<Props, State> {
  private sheetRef = React.createRef<any>();

  constructor(props: Props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  show = () => {
    this.setState({ show: true });
  };

  hide = () => {
    if (!this.state.show) return;
    const tag = findNodeHandle(this.sheetRef.current);
    if (!tag) return;
    console.log('[TopModal.hide]', tag);
    NativeModules.TopModalView.dismiss(tag);
  };

  private onDismiss = () => {
    console.log('[FittedSheet.onDismiss]');
    this.setState({ show: false });
    this.props.onModalDismiss?.();
  };

  render() {
    if (!this.state.show) {
      console.log('[TopModal.render.remove]');
      return null;
    }
    return (
      <TopModalView onModalDismiss={this.onDismiss} ref={this.sheetRef}>
        <View
          accessibilityLabel={'top-modal-root-view'}
          nativeID={'top-modal-root-view'}
          style={StyleSheet.absoluteFill}
          children={this.props.children}
        />
      </TopModalView>
    );
  }
}
