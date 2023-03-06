import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Text, View } from 'react-native';
import { useFittedSheetContext } from 'react-native-sheet';

interface Props {}

export const WithLoadingView: React.FC<Props> = () => {
  const sheetContext = useFittedSheetContext();
  const [text, setText] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium aperiam debitis dicta dolor, eius incidunt ipsum iure, laborum necessitatibus, nesciunt obcaecati pariatur rem repellendus reprehenderit tempora ullam unde voluptates! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium aperiam debitis dicta dolor, eius incidunt ipsum iure, laborum necessitatibus, nesciunt obcaecati pariatur rem repellendus reprehenderit tempora ullam unde voluptates! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium aperiam debitis dicta dolor, eius incidunt ipsum iure, laborum necessitatibus, nesciunt obcaecati pariatur rem repellendus reprehenderit tempora ullam unde voluptates! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusantium aperiam debitis dicta dolor, eius incidunt ipsum iure, laborum necessitatibus, nesciunt obcaecati pariatur rem repellendus reprehenderit tempora ullam unde voluptates!'
  );
  const [isLoading, setLoading] = useState(true);

  console.log('[WithLoadingView.WithLoadingView]', isLoading);

  return (
    <View accessibilityLabel={'roo'} style={{ backgroundColor: 'orange' }}>
      {isLoading && (
        <View
          accessibilityLabel={'loading'}
          key={1}
          style={{
            width: Dimensions.get('window').width,
            alignItems: 'center',
            justifyContent: 'center',
            height: 100,
            backgroundColor: 'green',
          }}
        >
          <ActivityIndicator />
        </View>
      )}
      {!isLoading && (
        <Text
          accessibilityLabel={'textLabe'}
          key={2}
          nativeID={'textView'}
          children={text}
          style={{ backgroundColor: 'purple' }}
          onLayout={(e) =>
            console.log('[WithLoadingView.--]', e.nativeEvent.layout.height)
          }
        />
      )}
    </View>
  );
};
