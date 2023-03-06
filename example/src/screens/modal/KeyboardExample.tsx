import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { KeyboardSpacer } from '../../components/KeyboardSpacer';
import { FittedSheet } from 'react-native-sheet';

const KeyboardExample = () => {
  const bottomSheetRef = useRef<FittedSheet>(null);
  const [keyboardHeight, setKH] = useState(0);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);
  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current?.hide();
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <Button label="Dismiss" onPress={handleDismissPress} />
      <FittedSheet params={{ maxHeight: 500 }} ref={bottomSheetRef}>
        {() => (
          <View style={styles.contentContainerStyle}>
            <TextInput
              style={{ height: 32, width: '100%', backgroundColor: 'yellow' }}
            />
            <ContactList count={100} />
            {/*<KeyboardSpacer*/}
            {/*  handleAndroid*/}
            {/*  onToggle={(e) => {*/}
            {/*    setKH(e);*/}
            {/*    console.log('[KeyboardExample.]', e);*/}
            {/*  }}*/}
            {/*/>*/}
          </View>
        )}
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
    flex: 1,
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
  },
});

export default KeyboardExample;
