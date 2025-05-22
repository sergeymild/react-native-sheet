import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';
import { Portal } from '@gorhom/portal';

export const DynamicSnapPointExample = () => {
  // state
  const [count, setCount] = useState(0);

  const bottomSheetRef = useRef<FittedSheetRef>(null);

  // callbacks
  const handleIncreaseContentPress = useCallback(() => {
    console.log('[DynamicSnapPointExample.handleIncreaseContentPress]');
    setCount((state) => state + 1);
  }, []);
  const handleDecreaseContentPress = useCallback(() => {
    setCount((state) => Math.max(state - 1, 0));
  }, []);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  const emojiContainerStyle = useMemo(
    () => ({
      ...styles.emojiContainer,
      height: 50 * count,
    }),
    [count]
  );

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      {/*<Portal hostName={'SheetHost'}>*/}
      <FittedSheet
        ref={bottomSheetRef}
        params={{
          topLeftRightCornerRadius: 20,
        }}
        onSheetDismiss={() => setCount(0)}
      >
        <View
          onLayout={(e) =>
            console.log(
              '🍓[DynamicSnapPointExample.lay]',
              e.nativeEvent.layout.height
            )
          }
          style={{
            paddingBottom: 34,
            backgroundColor: 'white',
            paddingTop: 16,
            paddingHorizontal: 16,
          }}
        >
          <Text style={styles.message}>
            Could this sheet modal resize to its content height ?
          </Text>
          <View style={emojiContainerStyle}>
            <Text style={styles.emoji}>😍</Text>
          </View>
          <Button
            label="Yes"
            onPress={handleIncreaseContentPress}
            style={{ height: 32, backgroundColor: 'red' }}
          />
          <Button label="Maybe" onPress={handleDecreaseContentPress} />
        </View>
      </FittedSheet>
      {/*</Portal>*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: 'purple',
  },
  contentContainerStyle: {
    paddingTop: 12,
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: 'black',
  },
  emoji: {
    fontSize: 156,
    textAlign: 'center',
    alignSelf: 'center',
  },
  emojiContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: 'green',
  },
});

export default DynamicSnapPointExample;
