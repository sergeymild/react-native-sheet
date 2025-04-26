import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { ViewProps } from 'react-native';
import type {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';

interface NativeProps extends ViewProps {
  dismissable: boolean;
  maxWidth?: Double;
  maxHeight?: Double;
  minHeight?: Double;
  calculatedHeight?: Double;
  topLeftRightCornerRadius?: Double;
  backgroundColor: string;
  isSystemUILight: boolean;
  passScrollViewReactTag?: string;
  onSheetDismiss: DirectEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>('SheetView');
