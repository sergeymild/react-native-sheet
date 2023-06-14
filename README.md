# react-native-bottom-sheet

Native implementation of Bottom sheet

![React Native Bottom Sheet](./preview.gif)

## Installation

```sh
"react-native-sheet": "sergeymild/react-native-sheet#0.8.8"
```

## Usage

```typescript
import {
  FITTED_SHEET_SCROLL_VIEW,
  FittedSheet,
} from 'react-native-sheet';
import { ScrollView, TouchableOpacity } from 'react-native';

const App: React.FC = () => {
  const sheetRef = useRef<FittedSheet>(null);

  return (
    <>
      <TouchableOpacity onPress={() => {
        // pass data object which will be available in child render function
        sheetRef.current?.show({field: 'value'})

        // also there is `showElement` method
        // which accept function for lazy require component and render it
        sheetRef.current?.showElement(() => require('./someLazyView').default, {field: 'value'})
      }}>
        <Text>Show sheet</Text>
      </TouchableOpacity>


      <FittedSheet
        ref={sheetRef}
        params={{
          // top left right corner sheet view radius
          topLeftRightCornerRadius: 20,
          // background color of sheet view
          backgroundColor: 'purple',
          // max allowed height of sheet view
          maxHeight: 600
        }}
        ref={sheetRef}
        >
          // this all doesn't need it `showElement`
          // was call as FittedSheet will render require component
          {(data) => {
            return (
              <ScrollView
                // used for find scrollView in Native Code
                nativeId={FITTED_SHEET_SCROLL_VIEW}
                // used in android which allows scrollView/FlatList scroll
                nestedScrollEnabled
              />
            );
        }}
      </FittedSheet>
    </>
  )
}
```

## More examples
More detailed examples may be found in `example` project


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
