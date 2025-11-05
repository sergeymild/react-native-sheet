# Testing Guide for react-native-sheet

This document provides an overview of the testing infrastructure for the `react-native-sheet` library.

## Test Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Unit Tests (Jest + @testing-library/react-native)     │
│  ✅ 64 tests covering React/JavaScript logic           │
│  ✅ ~80% code coverage                                  │
│  ⚡ Fast (~1 second)                                    │
│  📁 Location: src/__tests__/                            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  E2E Tests (Detox)                                      │
│  ✅ 4 tests covering native functionality               │
│  ✅ Tests real device behavior                          │
│  🐌 Slower (~minutes)                                   │
│  📁 Location: e2e/                                      │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
# Run all unit tests
yarn test

# Run unit tests with coverage
yarn test --coverage

# Run E2E tests on iOS
yarn test:e2e:build:ios
yarn test:e2e:ios

# Run E2E tests on Android
yarn test:e2e:build:android
yarn test:e2e:android
```

## Unit Tests (Jest)

### What They Test

✅ **React Component Logic**
- Component rendering and state management
- Props handling and validation
- Callbacks and event handlers
- Context and Provider functionality
- useEffect hooks and lifecycle

✅ **API Functions**
- `presentFittedSheet()`
- `dismissFittedSheet()`
- `presentGlobalFittedSheet()`
- Named sheets management
- Queue behavior

❌ **What They DON'T Test**
- Native module behavior
- Actual sheet animations
- Real gesture handling
- Native insets and safe area
- Backdrop rendering

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `FittedSheet.test.tsx` | 11 | Core component functionality |
| `SheetProvider.test.tsx` | 8 | Provider and context |
| `NamedSheets.test.tsx` | 11 | Named sheets API |
| `GlobalSheets.test.tsx` | 13 | Global sheets API |
| `EdgeCases.test.tsx` | 18 | Edge cases and complex scenarios |
| `Utils.test.tsx` | 3 | Utility functions |
| **Total** | **64** | |

### Code Coverage

```
All files:             80.79% statements | 79.1% branches | 73.33% functions
FittedSheet.tsx:       77.61% statements | 76.92% branches | 68.75% functions
GlobalSheetView.tsx:   82.05% statements | 75% branches | 70% functions
PublicSheetView.tsx:   87.09% statements | 91.66% branches | 88.88% functions
```

### Running Unit Tests

```bash
# Run all tests
yarn test

# Run in watch mode
yarn test --watch

# Run with coverage
yarn test --coverage

# Run specific test file
yarn test FittedSheet

# Run tests matching pattern
yarn test --testNamePattern="should present"

# Update snapshots
yarn test -u
```

## E2E Tests (Detox)

### What They Test

✅ **Native Functionality**
- Real bottom sheet rendering
- Native animations
- Gesture handling (swipe to dismiss)
- Scroll view integration
- Backdrop interactions

✅ **User Interactions**
- Tap actions
- Swipe gestures
- Scrolling
- Keyboard interactions (coming soon)

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `sheet.test.ts` | 4 | Basic sheet operations |

**Current Tests:**
1. Open and close with button
2. Swipe to dismiss
3. Scroll in sheet content
4. Multiple open/close cycles

### Test Screen

E2E tests use a dedicated test screen with testIDs:
- **Location**: `example/src/screens/modal/E2ETestScreen.tsx`
- **Test IDs**:
  - `open-sheet-button` - Button to open sheet
  - `sheet-content` - Sheet container
  - `sheet-title` - Title in sheet
  - `close-sheet-button` - Button to close
  - `sheet-scroll-view` - Scroll view in sheet

### Running E2E Tests

#### iOS

```bash
# Prerequisites
brew tap wix/brew
brew install applesimutils

# Build and test
yarn test:e2e:build:ios
yarn test:e2e:ios

# Run specific test
detox test e2e/sheet.test.ts --configuration ios.sim.debug
```

#### Android

```bash
# Start emulator
emulator -avd Pixel_3a_API_30_x86

# Build and test
yarn test:e2e:build:android
yarn test:e2e:android

# Run specific test
detox test e2e/sheet.test.ts --configuration android.emu.debug
```

## Test Structure

### Unit Test Example

```typescript
import { render, waitFor } from '@testing-library/react-native';
import { FittedSheet, SheetProvider } from '../index';

it('should render sheet when shown', async () => {
  const TestComponent = () => {
    const sheetRef = useRef<FittedSheetRef>(null);

    React.useEffect(() => {
      sheetRef.current?.show();
    }, []);

    return (
      <SheetProvider>
        <FittedSheet ref={sheetRef}>
          <Text>Sheet Content</Text>
        </FittedSheet>
      </SheetProvider>
    );
  };

  const { getByText } = render(<TestComponent />);

  await waitFor(() => {
    expect(getByText('Sheet Content')).toBeTruthy();
  });
});
```

### E2E Test Example

```typescript
import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

it('should open and close sheet', async () => {
  // Open sheet
  await element(by.id('open-sheet-button')).tap();

  // Verify sheet is visible
  await waitFor(element(by.id('sheet-content')))
    .toBeVisible()
    .withTimeout(2000);

  // Close sheet
  await element(by.id('close-sheet-button')).tap();

  // Verify sheet is hidden
  await waitFor(element(by.id('sheet-content')))
    .not.toBeVisible()
    .withTimeout(2000);
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn test --coverage
      - uses: codecov/codecov-action@v3

  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: brew tap wix/brew && brew install applesimutils
      - run: yarn test:e2e:build:ios
      - run: yarn test:e2e:ios
```

## Best Practices

### Unit Tests

1. **Test behavior, not implementation**
   ```typescript
   // Good ✅
   expect(getByText('Sheet Content')).toBeVisible();

   // Bad ❌
   expect(component.state.isVisible).toBe(true);
   ```

2. **Use waitFor for async operations**
   ```typescript
   await waitFor(() => {
     expect(getByText('Content')).toBeTruthy();
   });
   ```

3. **Clean up after tests**
   ```typescript
   beforeEach(() => {
     dismissFittedSheetsAll();
   });
   ```

### E2E Tests

1. **Always use testID for elements**
   ```tsx
   <TouchableOpacity testID="my-button">
   ```

2. **Use waitFor for animations**
   ```typescript
   await waitFor(element(by.id('sheet')))
     .toBeVisible()
     .withTimeout(2000);
   ```

3. **Reset state between tests**
   ```typescript
   beforeEach(async () => {
     await device.reloadReactNative();
   });
   ```

## Troubleshooting

### Unit Tests

**Tests are slow:**
- Use `--maxWorkers=50%` to limit CPU usage
- Run only changed tests with `--onlyChanged`

**Coverage not accurate:**
- Check `jest.config.js` collectCoverageFrom patterns
- Ensure all source files are included

### E2E Tests

**iOS build fails:**
```bash
cd example/ios
pod install
xcodebuild clean
```

**Android emulator issues:**
```bash
# Cold boot emulator
emulator -avd Pixel_3a_API_30_x86 -no-snapshot-load
```

**Tests are flaky:**
- Increase timeout values
- Add more waitFor calls
- Check if animations are interfering

## Documentation

- [Unit Tests README](src/__tests__/README.md) - Detailed unit test documentation
- [E2E Tests README](e2e/README.md) - E2E setup and usage guide
- [Detox Documentation](https://wix.github.io/Detox/) - Official Detox docs

## Future Improvements

### Unit Tests
- [ ] Add tests for iOS-specific behavior
- [ ] Add tests for Android-specific behavior
- [ ] Increase coverage to 90%+

### E2E Tests
- [ ] Keyboard handling tests
- [ ] Dynamic snap points tests
- [ ] Multiple sheets stacking tests
- [ ] Queue behavior tests
- [ ] Global sheet API tests
- [ ] Backdrop interaction tests
- [ ] Prevent dismiss behavior tests

## Contributing

When adding new features, please:
1. Write unit tests for JavaScript logic
2. Add E2E tests for user-facing behavior
3. Update this documentation
4. Ensure all tests pass before submitting PR

```bash
# Before committing
yarn test
yarn typecheck
yarn lint
```