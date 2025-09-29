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
}

export default TurboModuleRegistry.getEnforcing<Spec>('Sheet');
