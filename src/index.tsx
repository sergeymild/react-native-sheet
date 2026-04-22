import type { FittedSheetParams, SheetProps } from './FittedSheet';
import {
  attachScrollViewToFittedSheet,
  dismissFittedSheet,
  type FittedSheetRef,
  presentFittedSheet,
  PublicSheetView,
  dismissFittedSheetsAll,
  dismissFittedPresented,
} from './PublicSheetView';
import SheetModule from './NativeSheet';

import type { ReactNode } from 'react';
import { Fragment } from 'react';
import {
  GlobalSheetView,
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet,
  attachScrollViewToGlobalFittedSheet,
} from './GlobalSheetView';

export function SheetProvider(props: {
  children?: ReactNode;
  addGlobalSheetView?: boolean;
  globalSheetProps?: Omit<SheetProps, 'children' | 'onSheetDismiss'>;
}) {
  return (
    <Fragment>
      {props.children}
      {!!props.addGlobalSheetView && (
        <GlobalSheetView props={props.globalSheetProps} />
      )}
    </Fragment>
  );
}

export function viewportSize(): { width: number; height: number } {
  return SheetModule.viewportSize();
}

export {
  PublicSheetView as FittedSheet,
  type FittedSheetRef,
  presentFittedSheet,
  dismissFittedSheet,
  dismissFittedSheetsAll,
  dismissFittedPresented,
  attachScrollViewToFittedSheet,
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet,
  attachScrollViewToGlobalFittedSheet,
  type FittedSheetParams,
};
