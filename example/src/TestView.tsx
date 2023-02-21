import React from 'react';
import {
  FlatList,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useFittedSheetContext } from 'react-native-sheet';

interface Props {
  readonly data: string;
  readonly styles?: StyleProp<ViewStyle>;
}

console.log('[TestView.-----------]');

const data = [...Array(100)].map((_, index) => index);

const renderItem = (info: any) => (
  <Text
    key={info}
    style={{ height: 56, width: '100%', borderBottomWidth: 1 }}
    children={info}
  />
);

export const TestView: React.FC<Props> = (props) => {
  const sheetContext = useFittedSheetContext();
  console.log('[App.CustomV]', props);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ width: '100%', height: 50 }}
        onLayout={(e) =>
          console.log('[TestView.firstTouchableOpacity]', e.nativeEvent.layout)
        }
        onPress={() => sheetContext?.setHeight(600)}
      >
        <Text
          style={{ color: 'black', backgroundColor: 'red' }}
          children={'SetSize'}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ width: '100%', height: 50 }}
        onLayout={(e) =>
          console.log('[TestView.secondTouchableOpacity]', e.nativeEvent.layout)
        }
        onPress={() => sheetContext?.setHeight(300)}
      >
        <Text
          style={{ color: 'black', backgroundColor: 'red' }}
          children={'DecreaseSize'}
        />
      </TouchableOpacity>
      <View
        style={{ height: 50, width: '100%', backgroundColor: 'yellow' }}
        onLayout={(e) =>
          console.log('[TestView.yellowView]', e.nativeEvent.layout)
        }
      />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <FlatList
            onLayout={(e) =>
              console.log('[TestView.FlatList]', e.nativeEvent.layout.height)
            }
            nestedScrollEnabled
            style={{ flex: 1 }}
            data={data}
            keyExtractor={(item) => item.toString()}
            renderItem={(info) => renderItem(info.item)}
          />
        </View>
      </View>
      {/*<FittedSheetScrollView*/}
      {/*  // nativeID={FITTED_SHEET_SCROLL_VIEW}*/}
      {/*  style={{ flex: 1, backgroundColor: 'yellow', height: 400 }}*/}
      {/*>*/}
      {/*  {data.map((item) => (*/}
      {/*    <React.Fragment key={item}>{renderItem(item)}</React.Fragment>*/}
      {/*  ))}*/}
      {/*</FittedSheetScrollView>*/}
    </View>
  );
};
