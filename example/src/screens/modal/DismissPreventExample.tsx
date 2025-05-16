import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

export const DismissPreventExample = () => {
  // refs
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{ dismissable: false }}
        onSheetDismiss={() => console.log('[DismissPreventExample.----]')}
      >
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300 }}>
            <Button
              label="Hide"
              onPress={() => bottomSheetRef.current?.hide()}
            />
          </View>
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
