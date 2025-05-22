import type { FittedSheetParams } from './FittedSheet';
import {
  attachScrollViewToFittedSheet,
  dismissFittedSheet,
  type FittedSheetRef,
  presentFittedSheet,
  PublicSheetView,
} from './PublicSheetView';

import { PortalProvider } from '@gorhom/portal';
import type { ReactNode } from 'react';

export function SheetProvider(props: { children: ReactNode }) {
  return (
    <PortalProvider rootHostName={'SheetHost'}>{props.children}</PortalProvider>
  );
}

export {
  PublicSheetView as FittedSheet,
  type FittedSheetRef,
  presentFittedSheet,
  dismissFittedSheet,
  attachScrollViewToFittedSheet,
  type FittedSheetParams,
};
