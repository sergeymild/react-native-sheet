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
  windowLevel?: string;
  useInlinePresentation?: boolean;
  onSheetDismiss: DirectEventHandler<null>;
}

// `interfaceOnly: true` tells codegen NOT to emit a default
// `SheetViewShadowNode` typedef / ComponentDescriptor. The library provides
// those itself in `android/src/main/cpp/` so that the custom shadow node can
// override `getContentOriginOffset` (needed to keep Pressability coords in
// sync when the Android host view is re-parented for inline presentation).
export default codegenNativeComponent<NativeProps>('SheetView', {
  interfaceOnly: true,
});

type MyNativeViewType = HostComponent<NativeProps>;
export interface NativeCommands {
  dismissSheet: (viewRef: React.ElementRef<MyNativeViewType>) => void;
}

export const Commands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['dismissSheet'],
});
