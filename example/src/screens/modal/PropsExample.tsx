import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';
import { ContactList } from '../../components/contactList';

export const PropsExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show({ count: 4 });
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <FittedSheet
        params={{ maxHeight: 600, backgroundColor: 'white' }}
        ref={bottomSheetRef}
      >
        {(data) => {
          return <ContactList count={data.count} />;
        }}
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
