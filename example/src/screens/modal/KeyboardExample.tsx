import { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { KeyboardSpacer } from '../../components/KeyboardSpacer';
import { FittedSheet } from 'react-native-sheet2';

const KeyboardExample = () => {
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
        ref={bottomSheetRef}
        onSheetDismiss={() => {
          setKH(0);
          setCount(2);
        }}
      >
        <TextInput style={{ height: 132, backgroundColor: 'yellow' }} />
        <ContactList count={count} />
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
