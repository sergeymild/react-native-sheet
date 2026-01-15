import type { FittedSheetParams, SheetProps } from './FittedSheet';
import { attachScrollViewToFittedSheet, dismissFittedSheet, type FittedSheetRef, presentFittedSheet, PublicSheetView, dismissFittedSheetsAll, dismissFittedPresented } from './PublicSheetView';
import type { ReactNode } from 'react';
import { presentGlobalFittedSheet, dismissGlobalFittedSheet, attachScrollViewToGlobalFittedSheet } from './GlobalSheetView';
export declare function SheetProvider(props: {
    children: ReactNode;
    addGlobalSheetView?: boolean;
    globalSheetProps?: Omit<SheetProps, 'children' | 'onSheetDismiss'>;
}): import("react/jsx-runtime").JSX.Element;
export declare function viewportSize(): {
    width: number;
    height: number;
};
export { PublicSheetView as FittedSheet, type FittedSheetRef, presentFittedSheet, dismissFittedSheet, dismissFittedSheetsAll, dismissFittedPresented, attachScrollViewToFittedSheet, presentGlobalFittedSheet, dismissGlobalFittedSheet, attachScrollViewToGlobalFittedSheet, type FittedSheetParams, };
//# sourceMappingURL=index.d.ts.map