import React from 'react';
import type { SheetProps } from './FittedSheet';
type GlobalProps = {
    name: string;
    onDismiss?: () => void;
    sheetProps?: SheetProps;
    children: React.ReactElement | React.ReactElement[];
};
export declare function presentGlobalFittedSheet(params: GlobalProps): void;
export declare function dismissGlobalFittedSheet(name: string): void;
export declare function attachScrollViewToGlobalFittedSheet(name: string): boolean;
interface Props {
    props: SheetProps | undefined;
}
export declare const GlobalSheetView: React.FC<Props>;
export {};
//# sourceMappingURL=GlobalSheetView.d.ts.map