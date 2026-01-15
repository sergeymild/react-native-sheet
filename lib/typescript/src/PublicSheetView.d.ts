import React from 'react';
import { PrivateFittedSheet, type SheetProps } from './FittedSheet';
export declare function presentFittedSheet(name: string, data?: any): boolean;
export declare function attachScrollViewToFittedSheet(name: string): boolean;
export declare function dismissFittedSheet(name: string): boolean;
export declare function dismissFittedSheetsAll(): boolean;
export declare function dismissFittedPresented(): boolean;
export type FittedSheetRef = Pick<PrivateFittedSheet, 'show' | 'hide' | 'attachScrollViewToSheet'>;
export declare const PublicSheetView: React.NamedExoticComponent<SheetProps & {
    name?: string;
} & React.RefAttributes<FittedSheetRef>>;
//# sourceMappingURL=PublicSheetView.d.ts.map