# react-native-bottom-sheet

Native implementation of Bottom sheet

![React Native Bottom Sheet](./preview.gif)

## Installation

```sh
"react-native-sheet": "1.2.1"
```

## Usage

```typescript
import {
  FITTED_SHEET_SCROLL_VIEW,
  FittedSheet,
  useFittedSheetContext,
} from 'react-native-sheet';
import { ScrollView, TouchableOpacity } from 'react-native';


const RenderSheetComponent: React.FC = () => {
  // context available in bottom sheet
  // these are methods available: hide, passScrollViewReactTag
  // method hide accepts parameters which will be passed to onDimiss callback from bottomSheet 
  const sheetContext = useFittedSheetContext()
  
  return (
    <ScrollView
      // used for find scrollView in Native Code
      nativeId={FITTED_SHEET_SCROLL_VIEW}
    />
  )
}

const App: React.FC = () => {
  const sheetRef = useRef<FittedSheet>(null);
  
  useEffect(() => {
    // if scrollView creates dynamically  in bottom sheet (for example after loading)
    // you have to pass nativeID of scroll view by calling passScrollViewReactTag
    sheetRef.current?.passScrollViewReactTag('scrollView')
  }, [])

  return (
    <>
      <TouchableOpacity onPress={() => {
        // show also accept params which will be passed to render function
        sheetRef.current?.show()
      }}>
        <Text>Show sheet</Text>
      </TouchableOpacity>


      <FittedSheet
        ref={sheetRef}
        onSheetDismiss={(paramsPassedToHideMethod) => {
            // called when sheet completely hided
        }}
        params={{
          // top left right corner sheet view radius
          topLeftRightCornerRadius: 20,
          // background color of sheet view
          backgroundColor: 'purple',
          // max allowed height of sheet view
          maxHeight: 600,
          // min height of sheet view
          minHeight: 600,
          // max allowed width in portrait view
          maxPortraitWidth: 300
          // max allowed width in landscape view
          maxLandscapeWidth: 300,
          // should status bar on android be either dark of light
          isSystemUILight: false
        }}
        >
          // data which was passed to .show() method 
          {(data) => {
            return (
              <RenderSheetComponent/>
            );
        }}
        
        // if you do not need data you can omit render function and pass just component
        <RenderSheetComponent/>
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
