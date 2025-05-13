import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

export const List2Example = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet ref={bottomSheetRef} params={{ maxHeight: 600 }}>
        <View style={styles.contentContainerStyle}>
          <ContactList count={50} />
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
    paddingHorizontal: 24,
    backgroundColor: 'white',
    maxHeight: 600,
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
