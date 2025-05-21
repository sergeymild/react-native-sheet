import { type TurboModule, TurboModuleRegistry } from 'react-native';
import type {
  Double,
  UnsafeObject,
} from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
  getConstants: () => {
    insets: UnsafeObject;
  };

  viewportSize(): { width: Double; height: Double };
  presentToast: (params: UnsafeObject) => void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Sheet');
