# E2E Tests with Detox

This directory contains End-to-End (E2E) tests for `react-native-sheet` using [Detox](https://wix.github.io/Detox/).

## What E2E Tests Cover

Unlike unit tests that only test React/JavaScript logic, E2E tests verify:

✅ **Native Sheet Rendering** - Actual bottom sheet appears on screen
✅ **User Interactions** - Taps, swipes, scrolling
✅ **Animations** - Sheet opening/closing animations
✅ **Gesture Handling** - Swipe to dismiss
✅ **Real Device Behavior** - Tests run on iOS Simulator/Android Emulator

## Test Suite

### `sheet.test.ts` - Basic Sheet Operations

1. **Open and Close with Button** - Tests programmatic control
2. **Swipe to Dismiss** - Tests native gesture handling
3. **Scrolling in Sheet** - Tests scroll view integration
4. **Multiple Open/Close** - Tests stability with repeated operations

## Prerequisites

### iOS Setup

1. Install Xcode (latest stable version)
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```

3. Install iOS Simulator:
   ```bash
   # List available simulators
   xcrun simctl list devices
   ```

4. Install Apple Simulator Utils:
   ```bash
   brew tap wix/brew
   brew install applesimutils
   ```

### Android Setup

1. Install Android Studio with:
   - Android SDK
   - Android SDK Platform
   - Android Virtual Device (AVD)

2. Create an Android Emulator:
   - Open Android Studio → AVD Manager
   - Create device: Pixel 3a, API Level 30 (Android 11)
   - Name it: `Pixel_3a_API_30_x86`

3. Set up environment variables in `~/.bash_profile` or `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

## Running E2E Tests

### iOS

**IMPORTANT:** Metro bundler must be running before starting E2E tests!

```bash
# 1. Start Metro bundler (in separate terminal)
cd example && yarn start

# 2. Build the app for testing (in another terminal)
yarn test:e2e:build:ios

# 3. Run E2E tests
yarn test:e2e:ios

# Or in one command (slower - rebuilds every time)
detox test --configuration ios.sim.debug
```

### Android

**IMPORTANT:** Metro bundler must be running before starting E2E tests!

```bash
# 1. Start Metro bundler (in separate terminal)
cd example && yarn start

# 2. Start Android Emulator (in another terminal)
emulator -avd Pixel_3a_API_30_x86

# 3. Build the app for testing
yarn test:e2e:build:android

# 4. Run E2E tests
yarn test:e2e:android
```

## Test Development

### Adding Test IDs

Always add `testID` props to components you want to test:

```tsx
<TouchableOpacity testID="my-button" onPress={handlePress}>
  <Text>Click Me</Text>
</TouchableOpacity>

<View testID="my-content">
  <Text>Content</Text>
</View>
```

### Writing E2E Tests

```typescript
import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('My Feature', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should do something', async () => {
    // Find and tap element
    await element(by.id('my-button')).tap();

    // Wait for element to appear
    await waitFor(element(by.id('my-content')))
      .toBeVisible()
      .withTimeout(2000);

    // Assert element is visible
    await detoxExpect(element(by.id('my-content'))).toBeVisible();
  });
});
```

### Common Detox Actions

```typescript
// Tap
await element(by.id('button')).tap();

// Type text
await element(by.id('input')).typeText('Hello');

// Swipe
await element(by.id('sheet')).swipe('down', 'fast');

// Scroll
await element(by.id('scroll-view')).scrollTo('bottom');

// Wait for element
await waitFor(element(by.id('content')))
  .toBeVisible()
  .withTimeout(5000);
```

## Troubleshooting

### Common Issues

**"No script URL provided" error:**
```
This error means Metro bundler is not running. Make sure to start it:
cd example && yarn start

Then run E2E tests in a separate terminal.
```

### iOS Issues

**Build fails:**
```bash
# Clean iOS build
cd example/ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ../..
yarn test:e2e:build:ios
```

**Simulator not found:**
```bash
# List available simulators
xcrun simctl list devices

# Update device in .detoxrc.js
```

### Android Issues

**Emulator not running:**
```bash
# List available AVDs
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_3a_API_30_x86
```

**Build fails:**
```bash
# Clean Android build
cd example/android
./gradlew clean
cd ../..
yarn test:e2e:build:android
```

**Port conflicts:**
```bash
# Kill processes on port 8081
lsof -ti:8081 | xargs kill -9
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: brew tap wix/brew
      - run: brew install applesimutils
      - run: yarn test:e2e:build:ios
      - run: yarn test:e2e:ios

  e2e-android:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '11'
      - run: yarn install
      - run: yarn test:e2e:build:android
      - run: yarn test:e2e:android
```

## Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Detox API Reference](https://wix.github.io/Detox/docs/api/actions)
- [React Native Testing Guide](https://reactnative.dev/docs/testing-overview)

## Current Test Coverage

### Basic Tests (`sheet.test.ts`) - All Passing ✅
| Test | Status | Description |
|------|--------|-------------|
| Open/Close with button | ✅ | Tests programmatic show/hide |
| Swipe to dismiss | ✅ | Tests native gesture |
| Scroll in sheet | ✅ | Tests ScrollView integration |
| Multiple operations | ✅ | Tests stability |

### Comprehensive Tests (`comprehensive-sheet.test.ts`) - 3/10 Passing
| Test | Status | Description |
|------|--------|-------------|
| Data passing | ✅ | Tests data passing to sheets |
| Backdrop dismiss | ✅ | Tests dismiss by swiping down |
| Multiple open/close cycles | ✅ | Tests stability with repeated operations |
| Non-dismissable sheets | ⚠️ | WIP - Requires UI scroll improvements |
| Global sheets API | ⚠️ | WIP - Requires UI scroll improvements |
| Named sheets API | ⚠️ | WIP - Requires UI scroll improvements |
| Custom styling | ⚠️ | WIP - Requires UI scroll improvements |
| Min/max height | ⚠️ | WIP - Requires UI scroll improvements |
| Rapid operations | ⚠️ | WIP - Requires UI scroll improvements |

**Total: 7/14 tests passing (50%)**

**Note:** Some tests require UI improvements for scrolling to elements that are off-screen. These tests are functional but need refinement for consistent execution.

## Next Steps

Consider adding tests for:
- [ ] Keyboard handling
- [ ] Dynamic snap points
- [ ] Multiple sheets stacking
- [ ] Queue behavior
- [ ] Global sheet API
- [ ] Named sheets
- [ ] Data passing
- [ ] Backdrop tap to dismiss
- [ ] Prevent dismiss behavior