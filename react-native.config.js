module.exports = {
  dependency: {
    platforms: {
      android: {
        // Declare our Fabric ComponentDescriptor so `autolinking.cpp` registers
        // it. Paired with the custom `android/src/main/jni/CMakeLists.txt`,
        // which shadows the codegen include path so our subclass (with the
        // `getContentOriginOffset` override) is picked up.
        componentDescriptors: ['SheetViewComponentDescriptor'],
        cmakeListsPath: '../android/src/main/jni/CMakeLists.txt',
      },
    },
  },
};
