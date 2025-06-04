import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet';
import {
  dismissFittedPresented,
  presentFittedSheet,
} from '../../../../src/PublicSheetView';

export const DismissPresentedExample = () => {
  // callbacks
  const handlePresentPress = useCallback(() => {
    presentFittedSheet('first');
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet name={'first'} params={{ backgroundColor: 'yellow' }}>
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300 }}>
            <Button label="Dismiss" onPress={dismissFittedPresented} />
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
