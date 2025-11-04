import React, { memo, useEffect, useState } from 'react';
import { FittedSheet, type FittedSheetRef } from './index';
import type { SheetProps } from './FittedSheet';

type GlobalProps = {
  name: string;
  onDismiss?: () => void;
  sheetProps?: SheetProps;
  children: React.ReactElement | React.ReactElement[];
};

export function presentGlobalFittedSheet(params: GlobalProps): void {
  console.log('[presentGlobalFittedSheet] called', { name: params.name });
  presentGlobalSheet?.(params);
}

export function dismissGlobalFittedSheet(name: string): void {
  console.log('[dismissGlobalFittedSheet] called', { name });
  dismissGlobalSheet?.(name);
}

export function attachScrollViewToGlobalFittedSheet(name: string): boolean {
  console.log('[attachScrollViewToGlobalFittedSheet] called', { name });
  const ref = sheetRefs.get(name);
  if (!ref) {
    console.warn(
      `[attachScrollViewToGlobalFittedSheet] Sheet "${name}" not found`
    );
    return false;
  }
  ref.attachScrollViewToSheet();
  return true;
}

interface Props {
  props: SheetProps | undefined;
}

// Global state at module level
const sheetRefs = new Map<string, FittedSheetRef>();
const sheets = new Map<string, GlobalProps>();
let forceUpdate: () => void;

let presentGlobalSheet: (params: GlobalProps) => void;
let dismissGlobalSheet: (name: string) => void;

// Global stable callbacks
const handleSheetRef = (name: string, ref: FittedSheetRef | null) => {
  if (ref) {
    const isNewSheet = !sheetRefs.has(name);
    console.log('[GlobalSheetView.handleSheetRef] mounting', {
      name,
      isNewSheet,
      totalRefs: sheetRefs.size,
    });
    sheetRefs.set(name, ref);
    if (isNewSheet) {
      ref.show();
    }
  } else {
    const hadRef = sheetRefs.has(name);
    sheetRefs.delete(name);
    console.log('[GlobalSheetView.handleSheetRef] unmounting', {
      name,
      hadRef,
      totalRefs: sheetRefs.size,
    });
  }
};

const handleSheetDismiss = (name: string) => {
  console.log('[GlobalSheetView.handleSheetDismiss] start', {
    name,
    totalSheets: sheets.size,
    totalRefs: sheetRefs.size,
  });
  const dataToRender = sheets.get(name);
  dataToRender?.onDismiss?.();
  sheets.delete(name);
  // Note: Don't delete from sheetRefs here - let React unmounting clean it up via handleSheetRef
  console.log('[GlobalSheetView.handleSheetDismiss] after cleanup', {
    name,
    totalSheets: sheets.size,
    totalRefs: sheetRefs.size,
  });
  forceUpdate?.();
};

// Memoized sheet component to avoid unnecessary re-renders
const GlobalSheetItem = memo<{
  name: string;
  defaultProps: SheetProps | undefined;
}>(
  ({ name, defaultProps }) => {
    console.log('[GlobalSheetItem] render', { name });
    const dataToRender = sheets.get(name);
    if (!dataToRender) {
      console.log('[GlobalSheetItem] no data, returning null', { name });
      return null;
    }

    return (
      <FittedSheet
        ref={(ref) => handleSheetRef(name, ref)}
        name={name}
        params={dataToRender.sheetProps?.params ?? defaultProps?.params}
        rootViewStyle={
          dataToRender.sheetProps?.rootViewStyle ?? defaultProps?.rootViewStyle
        }
        onSheetDismiss={() => handleSheetDismiss(name)}
        children={dataToRender?.children}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to log when memo blocks re-renders
    const shouldSkip =
      prevProps.name === nextProps.name &&
      prevProps.defaultProps === nextProps.defaultProps;
    console.log('[GlobalSheetItem] memo check', {
      name: prevProps.name,
      shouldSkip,
      propsChanged: !shouldSkip,
    });
    return shouldSkip;
  }
);

export const GlobalSheetView: React.FC<Props> = memo((props) => {
  const [tick, setTick] = useState(0);
  console.log('[GlobalSheetView] render', {
    tick,
    totalSheets: sheets.size,
    totalRefs: sheetRefs.size,
    sheetNames: Array.from(sheets.keys()),
  });

  useEffect(() => {
    console.log('[GlobalSheetView] mounted - initializing global functions');

    forceUpdate = () => {
      console.log('[GlobalSheetView.forceUpdate] triggering re-render');
      setTick((t) => t + 1);
    };

    presentGlobalSheet = (params) => {
      console.log('[GlobalSheetView.presentGlobalSheet]', {
        name: params.name,
        beforeAdd: sheets.size,
      });
      sheets.set(params.name, params);
      console.log('[GlobalSheetView.presentGlobalSheet] after add', {
        name: params.name,
        afterAdd: sheets.size,
      });
      forceUpdate();
    };

    dismissGlobalSheet = (name) => {
      console.log('[GlobalSheetView.dismissGlobalSheet]', {
        name,
        beforeDelete: sheets.size,
      });
      sheets.delete(name);
      sheetRefs.delete(name); // Also clean up ref to prevent memory leak
      console.log('[GlobalSheetView.dismissGlobalSheet] after delete', {
        name,
        afterDelete: sheets.size,
      });
      forceUpdate();
    };

    return () => {
      console.log('[GlobalSheetView] unmounting - cleaning up', {
        sheetsToClean: sheets.size,
        refsToClean: sheetRefs.size,
      });
      // Clean up all sheets and refs to prevent memory leaks
      sheets.clear();
      sheetRefs.clear();

      // Reset functions to no-op
      presentGlobalSheet = () => {
        console.warn(
          '[GlobalSheetView] presentGlobalSheet called after unmount!'
        );
      };
      dismissGlobalSheet = () => {
        console.warn(
          '[GlobalSheetView] dismissGlobalSheet called after unmount!'
        );
      };
      forceUpdate = () => {};

      console.log('[GlobalSheetView] cleanup complete');
    };
  }, []);

  if (sheets.size === 0) {
    console.log('[GlobalSheetView] rendering null (no sheets)');
    return null;
  }

  console.log('[GlobalSheetView] rendering sheets', Array.from(sheets.keys()));
  return (
    <>
      {Array.from(sheets.keys()).map((name) => (
        <GlobalSheetItem key={name} name={name} defaultProps={props.props} />
      ))}
    </>
  );
});
