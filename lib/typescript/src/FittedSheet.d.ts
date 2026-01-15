import React from 'react';
import { type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
export interface FittedSheetParams {
    applyMaxHeightToMinHeight?: boolean;
    dismissable?: boolean;
    maxPortraitWidth?: number;
    maxLandscapeWidth?: number;
    maxHeight?: number;
    minHeight?: number;
    topLeftRightCornerRadius?: number;
    backgroundColor?: string;
    /**
     * Android only
     */
    isSystemUILight?: boolean;
}
type FittedSheetChildren = ((data: any) => React.ReactElement) | React.ReactElement | React.ReactElement[];
export interface SheetProps {
    params?: FittedSheetParams;
    onSheetDismiss?: (passThroughParam?: any) => void;
    children?: FittedSheetChildren;
    rootViewStyle?: StyleProp<Omit<ViewStyle, 'flex' | 'flexGrow' | 'position'>>;
}
interface State {
    show: boolean;
    data: any | null;
    height?: number;
    passScrollViewReactTag?: string;
    isLandscape: boolean;
}
export declare class PrivateFittedSheet extends React.PureComponent<SheetProps, State> {
    private cleanup?;
    private onHidePassThroughParam?;
    private sheetRef;
    private uniqueId;
    private dimensions;
    constructor(props: SheetProps);
    private log;
    show: (data?: any) => void;
    onLayout: (e: LayoutChangeEvent) => void;
    attachScrollViewToSheet: () => void;
    hide: (passThroughParam?: any) => void;
    static dismissAll: () => void;
    static dismissPresented: () => void;
    private onDismiss;
    private insets;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private viewportSize;
    private _shouldSetResponder;
    render(): import("react/jsx-runtime").JSX.Element | null;
}
export {};
//# sourceMappingURL=FittedSheet.d.ts.map