"use strict";

import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import { PrivateFittedSheet } from "./FittedSheet.js";
import { jsx as _jsx } from "react/jsx-runtime";
const handles = {};
export function presentFittedSheet(name, data) {
  if (!handles[name]) return false;
  handles[name]?.current?.show(data);
  return true;
}
export function attachScrollViewToFittedSheet(name) {
  if (!handles[name]) return false;
  handles[name]?.current?.attachScrollViewToSheet();
  return true;
}
export function dismissFittedSheet(name) {
  if (!handles[name]) return false;
  handles[name]?.current?.hide();
  return true;
}
export function dismissFittedSheetsAll() {
  PrivateFittedSheet.dismissAll();
  return true;
}
export function dismissFittedPresented() {
  PrivateFittedSheet.dismissPresented();
  return true;
}
export const PublicSheetView = /*#__PURE__*/memo(/*#__PURE__*/forwardRef((props, ref) => {
  const sheetRef = useRef(null);
  useImperativeHandle(ref, () => sheetRef.current, []);
  useEffect(() => {
    if (props.name) {
      if (handles[props.name]) console.warn(`Sheet with name ${props.name} exists`);
      handles[props.name] = sheetRef;
    }
    return () => {
      if (!props.name) return;
      delete handles[props.name];
    };
  }, [props.name]);
  return /*#__PURE__*/_jsx(PrivateFittedSheet, {
    ref: sheetRef,
    ...props
  });
}));
//# sourceMappingURL=PublicSheetView.js.map