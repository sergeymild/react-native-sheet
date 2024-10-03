import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';

const Nested: React.FC = () => {
  const shr = useRef<FittedSheet>(null);
  return (
    <>
      <View style={styles.contentContainerStyle}>
        <View style={{ height: 300 }}>
          <Button label="Present2" onPress={() => shr.current?.show()} />
        </View>
      </View>

      <FittedSheet ref={shr}>
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 100, backgroundColor: 'red' }} />
          <Button
            label="dismiss 2"
            onPress={() => {
              shr.current?.hide();
            }}
          />
        </View>
      </FittedSheet>
    </>
  );
};

export const Queue2Example = () => {
  // refs
  const bottomSheetRef = useRef<FittedSheet>(null);

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet ref={bottomSheetRef}>
        <Nested />
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
