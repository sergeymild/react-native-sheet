import { useCallback, useRef } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

const SHEET_HEIGHT = Math.round(Dimensions.get('window').height * 0.8);

export const BigRedTouchExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  const handleRedPress = useCallback(() => {
    console.log('[BigRedTouchExample] tapped');
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{
          maxHeight: SHEET_HEIGHT,
          backgroundColor: 'red',
          useInlinePresentation: true,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.redArea}
          onPress={handleRedPress}
        />
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  redArea: {
    height: SHEET_HEIGHT,
    backgroundColor: 'yellow',
  },
});
