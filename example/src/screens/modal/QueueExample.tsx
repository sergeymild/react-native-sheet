import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';

export const QueueExample = () => {
  // refs
  const bottomSheetRef = useRef<FittedSheet>(null);
  const bottomSheetRef2 = useRef<FittedSheet>(null);
  const [value, setValue] = useState('empty');

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);

  const handlePresentPress2 = useCallback(() => {
    bottomSheetRef2.current!.show();
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        onSheetDismiss={() => setValue('empty')}
      >
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300 }}>
            <Button label="Present2" onPress={handlePresentPress2} />
            <Text style={{ color: 'red' }}>{value}</Text>
          </View>
        </View>
      </FittedSheet>

      <FittedSheet ref={bottomSheetRef2}>
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300, backgroundColor: 'red' }} />
          <Button
            label="dismiss 2"
            onPress={() => {
              setValue('from sheet 2');
              bottomSheetRef2.current?.hide();
            }}
          />
        </View>
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  contentContainerStyle: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
});
