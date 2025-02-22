import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { KeyboardSpacer } from '../../components/KeyboardSpacer';
import { FittedSheet } from 'react-native-sheet2';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KeyboardExample = () => {
  const frame = useSafeAreaInsets();
  const bottomSheetRef = useRef<FittedSheet>(null);
  const [keyboardHeight, setKH] = useState(0);
  const [count, setCount] = useState(2);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current?.hide();
  }, []);

  console.log(
    '🍓[KeyboardExample.KeyboardExample]',
    keyboardHeight > 0 ? keyboardHeight : 34
  );

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <Button label="Dismiss" onPress={handleDismissPress} />

      <FittedSheet
        params={{ maxHeight: 800 }}
        ref={bottomSheetRef}
        onSheetDismiss={() => {
          setKH(0);
          setCount(2);
        }}
      >
        <View
          style={[
            styles.contentContainerStyle,
            {
              paddingBottom:
                keyboardHeight > 0 ? keyboardHeight + 0 : frame.bottom,
            },
          ]}
        >
          <TextInput
            style={{ height: 32, width: '100%', backgroundColor: 'yellow' }}
          />
          <ContactList count={count} />
          <KeyboardSpacer
            handleAndroid
            hideView
            onToggle={(e) => {
              setKH(e);
              setTimeout(() => {
                setCount(20);
                setTimeout(() => {
                  setCount(4);
                }, 1000);
              }, 3000);
              console.log('[KeyboardExample.]', e);
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
