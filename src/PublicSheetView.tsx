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
  minimizeCurrent(name);
  handles[name]?.current?.show(data);
  console.log('[PublicSheetView.presentFittedSheet]', name, presentedStack);
  return true;
}

export function dismissFittedSheet(name: string, data?: any): boolean {
  if (!handles[name]) return false;
  handles[name]?.current?.hide(data);
  return true;
}

export function attachScrollViewToFittedSheet(name: string): boolean {
  if (!handles[name]) return false;
  handles[name]?.current?.attachScrollViewToSheet();
  return true;
}

type Props = SheetProps & { name?: string };
export type FittedSheetRef = Pick<
  PrivateFittedSheet,
  'show' | 'hide' | 'attachScrollViewToSheet'
>;

const presentedStack: string[] = [];

function onDismissSheet(name: string) {
  const popped = presentedStack.pop();
  console.log('[PublicSheetView.onDismissSheet]', {
    popped,
    name,
    handles: Object.keys(handles),
  });
  if (popped === name) {
    const toPresent = presentedStack.at(-1);
    console.log('[PublicSheetView.onDismissSheet]', toPresent);
    if (toPresent) {
      const current = handles[toPresent]?.current;
      console.log(
        '[PublicSheetView.onDismissSheet.exists]',
        toPresent,
        'curr',
        !!current
      );
      if (current) {
        current.minimized = false;
        current.show(current.presentData);
      }
    }
  }
}

function minimizeCurrent(newName: string) {
  const presentedName = presentedStack.at(-1);
  if (presentedName) {
    const current = handles[presentedName]?.current;
    if (current) {
      current.minimized = true;
      current.hide();
    }
  }
  presentedStack.push(newName);
}

let id = 0;
function getSheetName(passedName?: string): string {
  return passedName ?? (++id).toString();
}

export const PublicSheetView = memo(
  forwardRef<FittedSheetRef, Props>((props, ref) => {
    const sheetRef = useRef<PrivateFittedSheet>(null);
    const name = useRef<string | undefined>();
    if (!name.current) {
      name.current = getSheetName(props.name);
      if (__DEV__) {
        console.log('[PublicSheetView.name]', name.current);
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        attachScrollViewToSheet: sheetRef.current!.attachScrollViewToSheet,
        hide: (p) => {
          sheetRef.current!.hide(p);
        },
        show: (p) => {
          minimizeCurrent(name.current!);
          sheetRef.current!.show(p);
          console.log('[PublicSheetView.show]', presentedStack);
        },
      }),
      []
    );

    useEffect(() => {
      handles[name.current!] = sheetRef;
      return () => {
        delete handles[name.current!];
      };
    }, []);

    return (
      <PrivateFittedSheet
        ref={sheetRef}
        {...props}
        onSheetDismiss={(p) => {
          props.onSheetDismiss?.(p);
          onDismissSheet(name.current!);
        }}
      />
    );
  })
);
