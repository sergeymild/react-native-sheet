import { type ColorValue, type HostComponent, type ViewProps } from 'react-native';
import type { DirectEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';
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
declare const _default: import("react-native/types_generated/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
type MyNativeViewType = HostComponent<NativeProps>;
export interface NativeCommands {
    dismissSheet: (viewRef: React.ElementRef<MyNativeViewType>) => void;
}
export declare const Commands: NativeCommands;
//# sourceMappingURL=SheetViewNativeComponent.d.ts.map