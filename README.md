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
import {
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet
} from 'react-native-sheet';
import { View, Text, Button } from 'react-native';

export const GlobalSimpleUsage = () => {
  return (
    <View style={{ flex: 1, padding: 24 }}>
      <Button
        title="Present Global Sheet"
        onPress={() => {
          presentGlobalFittedSheet({
            name: 'myGlobalSheet',
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
              <View style={{ flexGrow: 1, padding: 20 }}>
                <Text>Global Sheet Content</Text>
                <Button
                  title="Dismiss"
                  onPress={() => dismissGlobalFittedSheet('myGlobalSheet')}
                />
              </View>
            ),
          });
        }}
      />

      {/* Dismiss from outside */}
      <Button
        title="Dismiss Global Sheet"
        onPress={() => dismissGlobalFittedSheet('myGlobalSheet')}
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

#### Advanced Global Sheet Usage

**Multiple Global Sheets:**

You can present multiple global sheets simultaneously by using unique names:

```tsx
import {
  presentGlobalFittedSheet,
  dismissGlobalFittedSheet
} from 'react-native-sheet';

// Present first sheet
presentGlobalFittedSheet({
  name: 'sheet1',
  sheetProps: {
    params: { backgroundColor: 'white' }
  },
  children: (
    <View style={{ padding: 20 }}>
      <Text>First Sheet</Text>
      <Button
        title="Open Second Sheet"
        onPress={() => {
          presentGlobalFittedSheet({
            name: 'sheet2',
            sheetProps: {
              params: { backgroundColor: 'lightblue' }
            },
            children: (
              <View style={{ padding: 20 }}>
                <Text>Second Sheet</Text>
                <Button
                  title="Dismiss This"
                  onPress={() => dismissGlobalFittedSheet('sheet2')}
                />
                <Button
                  title="Dismiss First Sheet"
                  onPress={() => dismissGlobalFittedSheet('sheet1')}
                />
              </View>
            ),
          });
        }}
      />
    </View>
  ),
});
```

**Dynamic ScrollView in Global Sheet:**

When your sheet content loads asynchronously and includes a ScrollView, you need to attach the scrollview after it renders:

```tsx
import {
  presentGlobalFittedSheet,
  attachScrollViewToGlobalFittedSheet
} from 'react-native-sheet';
import { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator } from 'react-native';

const DynamicContent = ({ sheetName }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate async data loading
    setTimeout(() => {
      setData(Array.from({ length: 20 }, (_, i) => i + 1));
      setLoading(false);

      // Attach ScrollView after it appears
      setTimeout(() => {
        attachScrollViewToGlobalFittedSheet(sheetName);
      }, 100);
    }, 2000);
  }, [sheetName]);

  if (loading) {
    return (
      <View style={{ padding: 40 }}>
        <ActivityIndicator size="large" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text>Scrollable Content</Text>
      {data.map(item => (
        <View key={item} style={{ padding: 16 }}>
          <Text>Item {item}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

// Present the sheet
presentGlobalFittedSheet({
  name: 'dynamicSheet',
  sheetProps: {
    params: {
      backgroundColor: 'white',
      topLeftRightCornerRadius: 10,
    },
  },
  children: <DynamicContent sheetName="dynamicSheet" />,
});
```

**Dismissing Multiple Sheets:**

```tsx
// Dismiss all global sheets at once
dismissGlobalFittedSheet('sheet1');
dismissGlobalFittedSheet('sheet2');
dismissGlobalFittedSheet('sheet3');
```

**Passing Data to Global Sheets:**

Since global sheets don't support the `show(data)` / `hide(returnValue)` pattern, you can pass data using these approaches:

```tsx
// 1. Pass data via closure/variables
const userId = 123;
const userName = 'John Doe';

presentGlobalFittedSheet({
  name: 'userProfile',
  children: (
    <View style={{ padding: 20 }}>
      <Text>User ID: {userId}</Text>
      <Text>Name: {userName}</Text>
    </View>
  ),
});

// 2. Return data via closure in onDismiss callback
let result = null;

presentGlobalFittedSheet({
  name: 'confirmDialog',
  onDismiss: () => {
    // Handle the result here
    if (result?.confirmed) {
      console.log('User confirmed!');
    }
  },
  children: (
    <View style={{ padding: 20 }}>
      <Button
        title="Confirm"
        onPress={() => {
          result = { confirmed: true };
          dismissGlobalFittedSheet('confirmDialog');
        }}
      />
    </View>
  ),
});

// 3. Use a component with useState for dynamic data
const FormSheet = () => {
  const [name, setName] = useState('');
  return (
    <View style={{ padding: 20 }}>
      <TextInput value={name} onChangeText={setName} />
      <Button
        title="Submit"
        onPress={() => {
          console.log('Submitted:', name);
          dismissGlobalFittedSheet('formSheet');
        }}
      />
    </View>
  );
};

presentGlobalFittedSheet({
  name: 'formSheet',
  children: <FormSheet />,
});
```

### Passing Data (FittedSheet with Ref)

For `FittedSheet` components with refs, you can pass data using the `show(data)` method and receive return values via `hide(returnValue)`:

> **Note**: This pattern only works with `FittedSheet` components that have a ref. For Global Sheets, see the "Passing Data to Global Sheets" section above.

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

// Global Sheet API - Show a sheet without pre-declaring a component
presentGlobalFittedSheet(params: {
  name: string;
  onDismiss?: () => void;
  sheetProps?: SheetProps;
  children: ReactElement | ReactElement[];
}): void

// Dismiss a specific global sheet by name
dismissGlobalFittedSheet(name: string): void

// Attach scrollview to a global sheet by name (for dynamic ScrollView content)
attachScrollViewToGlobalFittedSheet(name: string): boolean
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

### Global sheet not working
Make sure you've enabled global sheets in `SheetProvider`:
```tsx
<SheetProvider addGlobalSheetView>
  <YourApp />
</SheetProvider>
```

### ScrollView not working in global sheet
If you're loading ScrollView content asynchronously, you need to attach it after the content renders:
```tsx
attachScrollViewToGlobalFittedSheet('sheetName');
```
This should be called after your ScrollView component has mounted (typically in a `useEffect` hook after data loading completes).

### How to pass data to global sheets?
Global sheets don't support the `show(data)` / `hide(returnValue)` pattern like FittedSheet with refs. Instead, use closures, variables, or component state:
- **Pass data in**: Use closure variables or props in the children component
- **Return data**: Use a closure variable and set it before calling `dismissGlobalFittedSheet`, then handle it in `onDismiss` callback
- **Dynamic data**: Use a component with `useState` as children

See the "Passing Data to Global Sheets" section in the documentation for examples.

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
