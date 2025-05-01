import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  HostComponent,
  ProcessedColorValue,
  ViewProps,
} from 'react-native';
import type {
  DirectEventHandler,
  Double,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';

interface NativeProps extends ViewProps {
  dismissable: boolean;
  maxWidth?: Double;
  maxHeight?: Double;
  minHeight?: Double;
  calculatedHeight?: Double;
  topLeftRightCornerRadius?: Double;
  sheetBackgroundColor?: ProcessedColorValue;
  isSystemUILight: boolean;
  passScrollViewReactTag?: string;
  onSheetDismiss: DirectEventHandler<null>;
}

export default codegenNativeComponent<NativeProps>('SheetView');

type MyNativeViewType = HostComponent<NativeProps>;
export interface NativeCommands {
  dismissSheet: (viewRef: React.ElementRef<MyNativeViewType>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['dismissSheet'],
});
