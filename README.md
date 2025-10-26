# react-native-sheet
![React Native Bottom Sheet](./preview.gif)
A high-performance, native bottom sheet component for React Native with auto-sizing and Fabric architecture support.

## Features

- **Native Implementation** - Built with Fabric architecture for iOS and modern Android APIs
- **Auto-sizing** - Automatically sizes to content height with dynamic updates
- **Landscape/Portrait Support** - Different constraints for device orientations
- **Data Passing** - Pass data to sheets and receive values on dismiss
- **Multiple Sheets** - Support for stacked sheets with named identifiers
- **Dual APIs** - Both imperative and declarative approaches
- **Global Sheet API** - Show sheets without pre-declaring components
- **Customizable** - Control corner radius, colors, sizing constraints
- **Dismissal Control** - Optional prevention of outside tap dismissal
- **ScrollView Integration** - Special handling for scrollable content

## Installation

```sh
//package.json
"react-native-sheet":"sergeymild/react-native-sheet#7.0.0"
yarn
```

## Usage

### Setup

Wrap your app with `SheetProvider`:

```tsx
import { SheetProvider } from 'react-native-sheet';

export default function App() {
  return (
    <SheetProvider>
      <YourApp />
    </SheetProvider>
  );
}
```

### Basic Example

```tsx
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';
import { useRef } from 'react';
import { View, Text, Button } from 'react-native';

export const BasicExample = () => {
  const sheetRef = useRef<FittedSheetRef>(null);

  return (
    <View>
      <Button
        title="Open Sheet"
        onPress={() => sheetRef.current?.show()}
      />

      <FittedSheet ref={sheetRef}>
        <View style={{ padding: 20 }}>
          <Text>Hello from Bottom Sheet!</Text>
          <Button
            title="Close"
            onPress={() => sheetRef.current?.hide()}
          />
        </View>
      </FittedSheet>
    </View>
  );
};
```

### Named Sheets (Imperative API)

```tsx
import {
  FittedSheet,
  presentFittedSheet,
  dismissFittedSheet
} from 'react-native-sheet';

export const NamedExample = () => {
  return (
    <>
      <Button
        title="Open Sheet"
        onPress={() => presentFittedSheet('mySheet')}
      />

      <FittedSheet name="mySheet">
        <View style={{ padding: 20 }}>
          <Text>Named Sheet</Text>
          <Button
            title="Close"
            onPress={() => dismissFittedSheet('mySheet')}
          />
        </View>
      </FittedSheet>
    </>
  );
};
```

### Global Sheet (Imperative API without Component Declaration)

For scenarios where you need to show a sheet without pre-declaring a `FittedSheet` component, you can use the global sheet API:

```tsx
import { presentGlobalFittedSheet } from 'react-native-sheet';
import { View, Text, Button } from 'react-native';

export const GlobalSimpleUsage = () => {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Button
        title="Present"
        onPress={() => {
          presentGlobalFittedSheet({
            onDismiss: () => {
              console.log('Sheet dismissed');
            },
            sheetProps: {
              params: {
                backgroundColor: 'white',
                topLeftRightCornerRadius: 10,
              },
              rootViewStyle: {
                paddingBottom: 56,
              },
            },
            children: (
              <View style={{ flexGrow: 1 }}>
                <Text>Text in sheet</Text>
              </View>
            ),
          });
        }}
      />
    </View>
  );
};
```

**Setup**: To enable the global sheet, add the `addGlobalSheetView` prop to `SheetProvider`:

```tsx
import { SheetProvider } from 'react-native-sheet';

export default function App() {
  return (
    <SheetProvider addGlobalSheetView>
      <YourApp />
    </SheetProvider>
  );
}
```

You can also provide default sheet properties that will be used for all global sheets:

```tsx
<SheetProvider
  addGlobalSheetView
  globalSheetProps={{
    params: {
      backgroundColor: '#f5f5f5',
      topLeftRightCornerRadius: 16,
    },
    rootViewStyle: {
      padding: 16,
    },
  }}
>
  <YourApp />
</SheetProvider>
```

### Passing Data

```tsx
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';
import { useRef } from 'react';

export const DataExample = () => {
  const sheetRef = useRef<FittedSheetRef>(null);

  const openWithData = () => {
    sheetRef.current?.show({ userId: 123, name: 'John' });
  };

  return (
    <>
      <Button title="Open Sheet" onPress={openWithData} />

      <FittedSheet
        ref={sheetRef}
        onSheetDismiss={(returnValue) => {
          console.log('Sheet dismissed with:', returnValue);
        }}
      >
        {(data) => (
          <View style={{ padding: 20 }}>
            <Text>User: {data?.name}</Text>
            <Text>ID: {data?.userId}</Text>
            <Button
              title="Close with Result"
              onPress={() => sheetRef.current?.hide({ success: true })}
            />
          </View>
        )}
      </FittedSheet>
    </>
  );
};
```

### Customization

```tsx
<FittedSheet
  ref={sheetRef}
  params={{
    maxHeight: 600,
    minHeight: 200,
    maxPortraitWidth: 400,
    maxLandscapeWidth: 600,
    topLeftRightCornerRadius: 24,
    backgroundColor: '#ffffff',
    dismissable: true,
  }}
  rootViewStyle={{ padding: 16 }}
>
  <YourContent />
</FittedSheet>
```

### Multiple Sheets

```tsx
export const MultipleExample = () => {
  return (
    <>
      <Button
        title="Open First Sheet"
        onPress={() => presentFittedSheet('first')}
      />

      <FittedSheet
        name="first"
        params={{ backgroundColor: '#f0f0f0' }}
      >
        <View style={{ padding: 20 }}>
          <Text>First Sheet</Text>
          <Button
            title="Open Second Sheet"
            onPress={() => presentFittedSheet('second')}
          />
        </View>
      </FittedSheet>

      <FittedSheet
        name="second"
        params={{ backgroundColor: '#e0e0ff' }}
      >
        <View style={{ padding: 20 }}>
          <Text>Second Sheet</Text>
          <Button
            title="Dismiss All"
            onPress={() => dismissFittedSheetsAll()}
          />
        </View>
      </FittedSheet>
    </>
  );
};
```

## API Reference

### FittedSheet Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | `undefined` | Optional identifier for imperative API control |
| `params` | `SheetParams` | `{}` | Configuration options for the sheet |
| `onSheetDismiss` | `(value?: any) => void` | `undefined` | Callback when sheet is dismissed |
| `rootViewStyle` | `ViewStyle` | `undefined` | Style for internal root view |
| `children` | `ReactNode \| ((data?: any) => ReactNode)` | - | Content to render in sheet |

### SheetParams

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `applyMaxHeightToMinHeight` | `boolean` | `false` | Apply max height constraint to min height |
| `dismissable` | `boolean` | `true` | Allow dismissing by tapping outside |
| `maxPortraitWidth` | `number` | `undefined` | Maximum width in portrait mode |
| `maxLandscapeWidth` | `number` | `undefined` | Maximum width in landscape mode |
| `maxHeight` | `number` | `undefined` | Maximum height of sheet |
| `minHeight` | `number` | `undefined` | Minimum height of sheet |
| `topLeftRightCornerRadius` | `number` | `20` | Radius for top corners |
| `backgroundColor` | `string` | `'white'` | Background color of sheet |
| `isSystemUILight` | `boolean` | `undefined` | Android only - status bar styling |

### FittedSheetRef Methods

```typescript
interface FittedSheetRef {
  show(data?: any): void;                    // Show sheet with optional data
  hide(passThroughParam?: any): void;        // Hide sheet with optional callback param
  attachScrollViewToSheet(): void;           // Attach scrollview for better scrolling
}
```

### Imperative API

```typescript
// Show a named sheet
presentFittedSheet(name: string, data?: any): void

// Hide a specific named sheet
dismissFittedSheet(name: string, passThroughParam?: any): void

// Hide all sheets
dismissFittedSheetsAll(): void

// Hide the most recently presented sheet
dismissFittedPresented(): void

// Attach scrollview to a named sheet
attachScrollViewToFittedSheet(name: string): void

// Show a global sheet without pre-declaring a component
presentGlobalFittedSheet(params: {
  onDismiss?: () => void;
  sheetProps?: SheetProps;
  children: ReactElement | ReactElement[];
}): void
```

### SheetProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Your app content |
| `addGlobalSheetView` | `boolean` | `false` | Enable global sheet API |
| `globalSheetProps` | `Omit<SheetProps, 'children' \| 'onSheetDismiss'>` | `undefined` | Default props for global sheets |

## Advanced Examples

### Dynamic Content Height

The sheet automatically resizes when content height changes:

```tsx
export const DynamicExample = () => {
  const [items, setItems] = useState([1, 2, 3]);
  const sheetRef = useRef<FittedSheetRef>(null);

  return (
    <FittedSheet ref={sheetRef}>
      <View style={{ padding: 20 }}>
        {items.map(item => (
          <View key={item} style={{ height: 50, marginBottom: 10 }}>
            <Text>Item {item}</Text>
          </View>
        ))}
        <Button
          title="Add Item"
          onPress={() => setItems([...items, items.length + 1])}
        />
      </View>
    </FittedSheet>
  );
};
```

### Preventing Dismissal

```tsx
<FittedSheet
  ref={sheetRef}
  params={{ dismissable: false }}
>
  <View style={{ padding: 20 }}>
    <Text>This sheet can't be dismissed by tapping outside</Text>
    <Button
      title="Close"
      onPress={() => sheetRef.current?.hide()}
    />
  </View>
</FittedSheet>
```

### ScrollView Integration

When using scrollable content, avoid wrapping in an additional `View`. Use a fragment instead for better performance:

```tsx
import { ScrollView } from 'react-native';

export const ScrollExample = () => {
  const sheetRef = useRef<FittedSheetRef>(null);

  useEffect(() => {
    // Attach scrollview for better scroll handling
    sheetRef.current?.attachScrollViewToSheet();
  }, []);

  return (
    <FittedSheet ref={sheetRef}>
      <>
        <ScrollView style={{ maxHeight: 400 }}>
          {/* Your scrollable content */}
        </ScrollView>
      </>
    </FittedSheet>
  );
};
```

**Important:** When using `ScrollView`, `FlatList`, or other scrollable components, do not wrap them in an additional `View`:

```tsx
// ✅ Good - use fragment
<FittedSheet ref={sheetRef}>
  <>
    <ScrollView>...</ScrollView>
  </>
</FittedSheet>

// ❌ Bad - avoid extra View wrapper
<FittedSheet ref={sheetRef}>
  <View>
    <ScrollView>...</ScrollView>
  </View>
</FittedSheet>
```

## Platform-Specific Notes

### iOS
- Uses native UIViewController presentation
- Supports safe area insets automatically
- Corner radius applied to top-left and top-right corners

### Android
- Uses Material BottomSheetDialog
- Supports status bar styling via `isSystemUILight` param

## Requirements

- React Native >= 0.70 (Fabric support)
- iOS >= 12.0
- Android minSdkVersion >= 21

## Troubleshooting

### Sheet not appearing
Make sure your app is wrapped with `SheetProvider`:
```tsx
<SheetProvider>
  <App />
</SheetProvider>
```

### Content not resizing
Ensure your content has proper height constraints or use `flexGrow` instead of `flex: 1`.

## Example App

To run the example app:

```sh
# Install dependencies
yarn

# Run on iOS
yarn example ios

# Run on Android
yarn example android
```

The example app includes demonstrations of:
- Basic usage
- Named sheets
- Global sheet API
- Data passing
- Multiple sheets
- Dynamic content
- ScrollView integration
- Queue management
- Custom styling

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Development workflow
- Sending pull requests
- Code of conduct

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
