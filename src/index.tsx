import type { FittedSheetParams } from './FittedSheet';
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

export function SheetProvider(props: { children: ReactNode }) {
  return (
    <PortalProvider rootHostName={'SheetHost'}>{props.children}</PortalProvider>
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
  type FittedSheetParams,
};
