import React, { memo, useEffect, useRef, useState } from 'react';
import { FittedSheet, type FittedSheetRef } from './index';
import type { SheetProps } from './FittedSheet';

type GlobalProps = {
  name: string;
  onDismiss?: () => void;
  sheetProps?: SheetProps;
  children: React.ReactElement | React.ReactElement[];
};

export function presentGlobalFittedSheet(params: GlobalProps): void {
  presentGlobalSheet?.(params);
}

export function dismissGlobalFittedSheet(name: string): void {
  dismissGlobalSheet?.(name);
}

interface Props {
  props: SheetProps | undefined;
}

let presentGlobalSheet: (params: GlobalProps) => void;
let dismissGlobalSheet: (name: string) => void;

export const GlobalSheetView: React.FC<Props> = memo((props) => {
  const sheetRefs = useRef<Map<string, FittedSheetRef>>(new Map());
  const [sheets, setSheets] = useState<Map<string, GlobalProps>>(new Map());
  console.log('[--GlobalSheetView.]', props, sheets);

  useEffect(() => {
    presentGlobalSheet = (params) => {
      setSheets((prev) => {
        const next = new Map(prev);
        next.set(params.name, params);
        return next;
      });
    };

    dismissGlobalSheet = (name) => {
      setSheets((prev) => {
        const next = new Map(prev);
        next.delete(name);
        return next;
      });
    };

    return () => {
      presentGlobalSheet = () => {};
      dismissGlobalSheet = () => {};
    };
  }, []);

  useEffect(() => {
    sheets.forEach((_, name) => {
      sheetRefs.current.get(name)?.show();
    });
  }, [sheets]);

  if (sheets.size === 0) return null;

  return (
    <>
      {Array.from(sheets.entries()).map(([name, dataToRender]) => (
        <FittedSheet
          key={name}
          ref={(ref) => {
            if (ref) {
              sheetRefs.current.set(name, ref);
            } else {
              sheetRefs.current.delete(name);
            }
          }}
          name={name}
          params={dataToRender.sheetProps?.params ?? props.props?.params}
          rootViewStyle={
            dataToRender.sheetProps?.rootViewStyle ?? props.props?.rootViewStyle
          }
          onSheetDismiss={() => {
            dataToRender?.onDismiss?.();
            setSheets((prev) => {
              const next = new Map(prev);
              next.delete(name);
              return next;
            });
          }}
          children={dataToRender?.children}
        />
      ))}
    </>
  );
});
