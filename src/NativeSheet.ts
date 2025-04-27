import { type TurboModule, TurboModuleRegistry } from 'react-native';
import type { UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  getConstants: () => {
    insets: UnsafeObject;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('Sheet');
