import { DeviceEventEmitter, type EmitterSubscription } from 'react-native';

import SheetModule from './NativeSheet';

const EVENT = 'sheet2:tree';

/**
 * Native view-tree operations this library performs on views React Native
 * believes it owns: presenting and dismissing a sheet moves them between
 * containers, and an overlay child never reaches the host view at all.
 *
 * The mounting crashes those operations can end in name nothing of ours — the
 * Android one is "addViewAt: failed to insert view [child] into parent [parent]
 * at index N" with a stack made of React Native and framework frames. Each entry
 * here names the views by the id React Native uses as the tag, so an app that
 * turns these into breadcrumbs can answer, from the crash report alone, whether
 * a sheet had touched the views in question.
 *
 * Android only for now; the iOS side is not wired yet.
 *
 * @example
 * addSheetTreeListener(entry =>
 *   Sentry.addBreadcrumb({ category: 'sheet2', message: entry, level: 'info' }),
 * )
 */
export function addSheetTreeListener(
  handler: (entry: string) => void
): EmitterSubscription {
  return DeviceEventEmitter.addListener(EVENT, handler);
}

/**
 * The last native view-tree moves, newest last (32 are kept). iOS has no event
 * channel yet, so this is how the trail is read there — for a report attached by
 * hand, or from a debug screen.
 */
export function getSheetTreeLog(): string[] {
  return SheetModule.getTreeLog();
}
