import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useFittedSheetContext } from 'react-native-sheet';

interface Props {}

export const IncreaseView: React.FC<Props> = (props) => {
  const sheetContext = useFittedSheetContext();
  const [text, setText] = useState('lorem\n');

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ width: '100%', height: 50 }}
        onLayout={(e) =>
          console.log('[TestView.firstTouchableOpacity]', e.nativeEvent.layout)
        }
        onPress={() => setText(text + text)}
      >
        <Text
          style={{ color: 'black', backgroundColor: 'red' }}
          children={'SetSize'}
        />
      </TouchableOpacity>
      <Text children={text} />
    </View>
  );
};
