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

import { PortalProvider } from '@gorhom/portal';
import type { ReactNode } from 'react';
import {
  GlobalSheetView,
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet,
} from './GlobalSheetView';

export function SheetProvider(props: {
  children: ReactNode;
  addGlobalSheetView?: boolean;
  globalSheetProps?: Omit<SheetProps, 'children' | 'onSheetDismiss'>;
}) {
  return (
    <PortalProvider rootHostName={'SheetHost'}>
      {props.children}
      {!!props.addGlobalSheetView && (
        <GlobalSheetView props={props.globalSheetProps} />
      )}
    </PortalProvider>
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
  type FittedSheetParams,
};
