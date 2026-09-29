import { type TurboModule, TurboModuleRegistry } from 'react-native';
import type {
  Double,
  UnsafeObject,
  //@ts-ignore
} from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  getConstants: () => {
    insets: UnsafeObject;
  };

  viewportSize(): { width: Double; height: Double };
  dismissAll(): void;
  dismissPresented(): void;
  /** Last native view-tree moves this library made — see SheetTreeLog. */
  getTreeLog(): string[];
}

export default TurboModuleRegistry.getEnforcing<Spec>('Sheet');
