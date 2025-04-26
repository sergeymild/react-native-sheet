import React, { useCallback, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TextInput, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { KeyboardSpacer } from '../../components/KeyboardSpacer';
import { FittedSheet } from 'react-native-sheet2';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const KeyboardExample = () => {
  const bottomSheetRef = useRef<FittedSheet>(null);
  const [keyboardHeight, setKH] = useState(0);
  const [count, setCount] = useState(2);
  const insets = useSafeAreaInsets();
  const maxHeight =
    Dimensions.get('window').height - insets.top - insets.bottom;

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  console.log(
    '🍓[KeyboardExample.KeyboardExample]',
    keyboardHeight > 0 ? keyboardHeight : 34
  );

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{ maxHeight }}
        onSheetDismiss={() => {
          setKH(0);
          setCount(2);
        }}
      >
        <ContactList count={count} />
        <TextInput style={{ height: 56, backgroundColor: 'yellow' }} />
        <KeyboardSpacer
          handleAndroid
          onToggle={(e) => {
            setTimeout(() => {
              setCount(20);
              // setTimeout(() => {
              //   setCount(4)
              // }, 1000)
            }, 5000);
            console.log('[KeyboardExample.]', e);
          }}
        />
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    paddingHorizontal: 24,
    backgroundColor: 'white',
  },
});

export default KeyboardExample;
