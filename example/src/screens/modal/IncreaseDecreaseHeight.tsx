import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet } from 'react-native-sheet2';

export const IncreaseDecreaseHeight = () => {
  const bottomSheetRef = useRef<FittedSheet>(null);
  const [height, setHeight] = useState(400);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  const increase = useCallback(() => {
    setHeight((p) => Math.min(400, p + 30));
  }, []);

  const decrease = useCallback(() => {
    setHeight((p) => Math.max(200, p - 30));
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{ maxHeight: 400, minHeight: 200, backgroundColor: 'white' }}
      >
        <View style={{ height }}>
          <View style={{ flexDirection: 'row' }}>
            <Button label="increase" onPress={increase} />
            <Button label="decrease" onPress={decrease} />
          </View>
          <ContactList count={10} />
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
    paddingHorizontal: 24,
    //backgroundColor: 'white',
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
  },
});
