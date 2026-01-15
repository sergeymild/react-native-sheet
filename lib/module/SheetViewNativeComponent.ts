import {
  type ColorValue,
  type HostComponent,
  type ViewProps,
  codegenNativeComponent,
  codegenNativeCommands,
} from 'react-native';
import type {
  DirectEventHandler,
  Double,
  //@ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';
import React from 'react';

interface NativeProps extends ViewProps {
  dismissable: boolean;
  maxWidth?: Double;
  maxHeight?: Double;
  minHeight?: Double;
  calculatedHeight?: Double;
  topLeftRightCornerRadius?: Double;
  isSystemUILight: boolean;
  passScrollViewReactTag?: string;
  uniqueId: string;
  sheetBackgroundColor?: ColorValue;
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
