// Mock native modules
jest.mock('./src/NativeSheet', () => ({
  __esModule: true,
  default: {
    viewportSize: jest.fn(() => ({ width: 375, height: 812 })),
    dismissAll: jest.fn(),
    dismissPresented: jest.fn(),
    getConstants: jest.fn(() => ({
      insets: { top: 44, bottom: 34 },
    })),
  },
}));

jest.mock('./src/SheetViewNativeComponent', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => {
      // Simulate native dismiss behavior by calling onSheetDismiss after a short delay
      React.useImperativeHandle(ref, () => ({
        dismiss: () => {
          setTimeout(() => {
            props.onSheetDismiss?.();
          }, 50);
        },
      }));
      return React.createElement('SheetView', { ...props, ref });
    }),
    Commands: {
      dismissSheet: jest.fn((ref) => {
        // Trigger the dismiss callback after a short delay to simulate native behavior
        if (ref?.current) {
          setTimeout(() => {
            // Access the props from the ref and call onSheetDismiss
            const element = ref.current;
            if (element && element.props && element.props.onSheetDismiss) {
              element.props.onSheetDismiss();
            }
          }, 50);
        }
      }),
    },
  };
});

// Mock @gorhom/portal
jest.mock('@gorhom/portal', () => ({
  Portal: ({ children }) => children,
  PortalProvider: ({ children }) => children,
  PortalHost: ({ children }) => children,
}));

// Suppress console logs during tests
global.console = {
  ...console,
  // Uncomment to suppress console logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};