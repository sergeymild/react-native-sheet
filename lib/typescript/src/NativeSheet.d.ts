import { type TurboModule } from 'react-native';
import type { Double, UnsafeObject } from 'react-native/Libraries/Types/CodegenTypes';
export interface Spec extends TurboModule {
    getConstants: () => {
        insets: UnsafeObject;
    };
    viewportSize(): {
        width: Double;
        height: Double;
    };
    dismissAll(): void;
    dismissPresented(): void;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeSheet.d.ts.map