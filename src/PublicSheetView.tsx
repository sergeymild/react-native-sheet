import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { PrivateFittedSheet, type SheetProps } from './FittedSheet';

const handles: {
  [name: string]: React.RefObject<PrivateFittedSheet | null>;
} = {};
export function presentFittedSheet(name: string, data?: any): boolean {
  if (!handles[name]) return false;
  handles[name]?.current?.show(data);
  return true;
}

export function attachScrollViewToFittedSheet(name: string): boolean {
  if (!handles[name]) return false;
  handles[name]?.current?.attachScrollViewToSheet();
  return true;
}

export function dismissFittedSheet(name: string): boolean {
  if (!handles[name]) return false;
  handles[name]?.current?.hide();
  return true;
}

export function dismissFittedSheetsAll(): boolean {
  PrivateFittedSheet.dismissAll();
  return true;
}

type Props = SheetProps & { name?: string };
export type FittedSheetRef = Pick<
  PrivateFittedSheet,
  'show' | 'hide' | 'attachScrollViewToSheet'
>;
export const PublicSheetView = memo(
  forwardRef<FittedSheetRef, Props>((props, ref) => {
    const sheetRef = useRef<PrivateFittedSheet>(null);

    useImperativeHandle(ref, () => sheetRef.current!, []);

    useEffect(() => {
      if (props.name) {
        if (handles[props.name])
          console.warn(`Sheet with name ${props.name} exists`);
        handles[props.name] = sheetRef;
      }
      return () => {
        if (!props.name) return;
        delete handles[props.name];
      };
    }, [props.name]);

    return <PrivateFittedSheet ref={sheetRef} {...props} />;
  })
);
