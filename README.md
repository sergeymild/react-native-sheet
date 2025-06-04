# react-native-bottom-sheet

Native implementation of Bottom sheet

![React Native Bottom Sheet](./preview.gif)

## Installation

```sh
"react-native-sheet": "sergeymild/react-native-sheet#2.0.7"
```

## Usage

```typescript
import {
    FittedSheet, 
    attachScrollViewToFittedSheet,
    FittedSheetRef,
    presentFittedSheet,
    dismissFittedSheetsAll,
    dismissFittedPresented,
} from 'react-native-sheet';
import { ScrollView, TouchableOpacity } from 'react-native';


const RenderSheetComponent: React.FC = () => {
  const [isLoading, setLoading] = useState(true)
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
  }, []) 
  
  if (isLoading) {
    return <View style={{height: 200}}/>
  }
  
  return (
    // if scrollView creates dynamically in bottom sheet (for example after loading)
    // you have call attachScrollViewToFittedSheet to enable nestedScroll
    <ScrollView onLayout={() => attachScrollViewToFittedSheet("textSheet")}/>
  )
}

const App: React.FC = () => {
  const sheetRef = useRef<FittedSheetRef>(null);

  return (
    <>
      <TouchableOpacity 
        onPress={() => {
            // show also accept params which will be passed to render function
            sheetRef.current?.show()
            // or you can call just pass the name of sheet which want to show 
            // in this case there is no need to store ref on Sheet
            presentFittedSheet("textSheet")
        }}
        children={<Text children="Show sheet</"/>}
      />
      
      <TouchableOpacity 
        onPress={() => {
            // dismiss presented and all in queue sheets without animation
            dismissFittedSheetsAll()
            
            // dismiss top presented sheet
            dismissFittedPresented()
        }}
        children={<Text children="Dismiss sheet</"/>}
      />


      <FittedSheet
        // can be any string.
        // with this name sheet can be dismissed or presented via methods by passing that name
        // `presentFittedSheet`, `dismissFittedSheet`
        name="textSheet"
        ref={sheetRef}
        onSheetDismiss={(paramsPassedToHideMethod) => {
            // called when sheet completely hided
        }}
        params={{
          // if max min should be setted as max height
          applyMaxHeightToMinHeight: true | false,
          // allow to dismiss
          dismissable: false | true,
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
          // data which was passed to .show() method or in presentFittedSheet methods
          {(data) => <RenderSheetComponent/>)}
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
