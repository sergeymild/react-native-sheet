"use strict";

import { attachScrollViewToFittedSheet, dismissFittedSheet, presentFittedSheet, PublicSheetView, dismissFittedSheetsAll, dismissFittedPresented } from "./PublicSheetView.js";
import SheetModule from "./NativeSheet.js";
import { PortalProvider } from '@gorhom/portal';
import { GlobalSheetView, presentGlobalFittedSheet, dismissGlobalFittedSheet, attachScrollViewToGlobalFittedSheet } from "./GlobalSheetView.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function SheetProvider(props) {
  return /*#__PURE__*/_jsxs(PortalProvider, {
    rootHostName: 'SheetHost',
    children: [props.children, !!props.addGlobalSheetView && /*#__PURE__*/_jsx(GlobalSheetView, {
      props: props.globalSheetProps
    })]
  });
}
export function viewportSize() {
  return SheetModule.viewportSize();
}
export { PublicSheetView as FittedSheet, presentFittedSheet, dismissFittedSheet, dismissFittedSheetsAll, dismissFittedPresented, attachScrollViewToFittedSheet, presentGlobalFittedSheet, dismissGlobalFittedSheet, attachScrollViewToGlobalFittedSheet };
//# sourceMappingURL=index.js.map