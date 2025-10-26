import React, { memo, useEffect, useRef, useState } from 'react';
import { FittedSheet, type FittedSheetRef } from './index';
import type { SheetProps } from './FittedSheet';

type GlobalProps = {
  onDismiss?: () => void;
  sheetProps?: SheetProps;
  children: React.ReactElement | React.ReactElement[];
};

export function presentGlobalFittedSheet(params: GlobalProps): void {
  presentGlobalSheet?.(params);
}

interface Props {
  props: SheetProps | undefined;
}

let presentGlobalSheet: (params: GlobalProps | undefined) => void;

export const GlobalSheetView: React.FC<Props> = memo((props) => {
  const sheetRef = useRef<FittedSheetRef>(null);
  const [dataToRender, setDataToRender] = useState<GlobalProps | undefined>();
  console.log('[--GlobalSheetView.]', props, dataToRender);

  useEffect(() => {
    if (dataToRender) sheetRef.current?.show();
    console.log('[GlobalSheetView.useEffect]');
    presentGlobalSheet = (params) => {
      setDataToRender(params);
    };

    return () => {
      presentGlobalSheet = () => {};
    };
  }, [dataToRender]);

  if (!dataToRender) return null;

  return (
    <FittedSheet
      ref={sheetRef}
      name={'__GLOBAL_SHEET__'}
      params={dataToRender.sheetProps?.params ?? props.props?.params}
      rootViewStyle={
        dataToRender.sheetProps?.rootViewStyle ?? props.props?.rootViewStyle
      }
      onSheetDismiss={() => {
        dataToRender?.onDismiss?.();
        setDataToRender(undefined);
      }}
      children={dataToRender?.children}
    />
  );
});
