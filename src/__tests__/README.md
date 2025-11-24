# Test Suite for react-native-sheet

This directory contains comprehensive unit tests for the `react-native-sheet` library.

## Test Coverage

**Overall Coverage: ~80%**

| File                         | Statements | Branches | Functions | Lines |
|------------------------------|-----------|----------|-----------|-------|
| FittedSheet.tsx              | 77.61%    | 76.92%   | 68.75%    | 76.56% |
| GlobalSheetView.tsx          | 82.05%    | 75%      | 70%       | 81.81% |
| PublicSheetView.tsx          | 87.09%    | 91.66%   | 88.88%    | 84.61% |

## Test Files

### 1. **FittedSheet.test.tsx** (11 tests)
Tests for the core FittedSheet component:
- ✅ Basic rendering and visibility
- ✅ Props (backgroundColor, cornerRadius, heights, dismissable)
- ✅ Data passing to children
- ✅ ScrollView attachment
- ✅ Root view styling

### 2. **SheetProvider.test.tsx** (8 tests)
Tests for the SheetProvider component:
- ✅ Rendering with/without global sheet view
- ✅ Global sheet props inheritance
- ✅ Multiple and nested children support

### 3. **NamedSheets.test.tsx** (11 tests)
Tests for named sheet API:
- ✅ `presentFittedSheet()` with names and data
- ✅ `dismissFittedSheet()` functionality
- ✅ Multiple named sheets management
- ✅ `dismissFittedSheetsAll()` and `dismissFittedPresented()`
- ✅ `attachScrollViewToFittedSheet()`
- ✅ Name conflict warnings

### 4. **GlobalSheets.test.tsx** (13 tests)
Tests for global sheets API:
- ✅ `presentGlobalFittedSheet()` with custom props
- ✅ Multiple global sheets
- ✅ `dismissGlobalFittedSheet()`
- ✅ `attachScrollViewToGlobalFittedSheet()`
- ✅ Memory management with rapid operations
- ✅ Props inheritance from SheetProvider

### 5. **EdgeCases.test.tsx** (18 tests)
Tests for edge cases and complex scenarios:
- ✅ Non-dismissable sheets
- ✅ Rapid show/hide cycles
- ✅ Data passing edge cases (undefined, null, complex objects)
- ✅ Pass-through parameters
- ✅ Queue behavior with multiple sheets
- ✅ Size constraint edge cases
- ✅ Unmounting while shown

### 6. **Utils.test.tsx** (3 tests)
Tests for utility functions:
- ✅ `viewportSize()` function

## Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage

# Run specific test file
yarn test FittedSheet

# Run tests matching pattern
yarn test --testNamePattern="should present"
```

## Test Configuration

- **Framework**: Jest with React Native preset
- **Testing Library**: `@testing-library/react-native` v13.3.3
- **Test Renderer**: `react-test-renderer` v19.1.0

Configuration files:
- `jest.config.js` - Jest configuration
- `jest.setup.js` - Test environment setup and mocks

## Limitations

### Native Module Mocking

Some tests have limitations due to React Native's native module requirements:

1. **Dismiss Behavior**: Tests verify that dismiss methods can be called without errors, but actual sheet dismissal and DOM removal require native module integration that cannot be fully simulated in unit tests.

2. **onSheetDismiss Callbacks**: While the callbacks are properly configured, they are not triggered in unit tests without native module support.

3. **Animation**: Sheet animations are not tested as they require native rendering.

### Integration Testing

For complete end-to-end testing including native behaviors, consider:
- Using Detox or Maestro for E2E testing
- Running tests in actual React Native environment
- Testing on physical devices or emulators

## Notes

- All tests pass successfully (64/64) ✅
- Console logs from the library are suppressed during tests
- Tests focus on API correctness and component behavior
- Examples in `/example` directory remain for demonstration purposes