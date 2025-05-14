import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet';
import {
  dismissFittedSheet,
  presentFittedSheet,
} from '../../../../src/PublicSheetView';

export const QueueExample = () => {
  const [value, setValue] = useState('empty');

  // callbacks
  const handlePresentPress = useCallback(() => {
    presentFittedSheet('first');
  }, []);

  const handlePresentPress2 = useCallback(() => {
    presentFittedSheet('second');
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet name={'first'} onSheetDismiss={() => setValue('empty')}>
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300 }}>
            <Button label="Present2" onPress={handlePresentPress2} />
            <Text style={{ color: 'red' }}>{value}</Text>
          </View>
        </View>
      </FittedSheet>

      <FittedSheet name={'second'}>
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300, backgroundColor: 'red' }} />
          <Button
            label="dismiss 2"
            onPress={() => {
              setValue('from sheet 2');
              dismissFittedSheet('second');
            }}
          />
          <Button
            label="Present2"
            onPress={() => presentFittedSheet('third')}
          />
          <Text style={{ color: 'red' }}>{value}</Text>
        </View>
      </FittedSheet>

      <FittedSheet name={'third'}>
        <View style={styles.contentContainerStyle}>
          <View style={{ height: 300, backgroundColor: 'red' }} />
          <Button
            label="dismiss 3"
            onPress={() => {
              setValue('from sheet 3');
              dismissFittedSheet('third');
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
