import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

const ListExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{
          backgroundColor: 'white',
          maxLandscapeWidth: 560,
          maxPortraitWidth: 300,
          topLeftRightCornerRadius: 8,
        }}
      >
        <Text style={{ color: 'black', paddingHorizontal: 12 }}>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem
          eligendi nesciunt nulla ullam voluptatem voluptates. Aliquam aut
          eveniet excepturi laboriosam minus optio pariatur quis. Ea hic
          obcaecati provident quisquam voluptate. Lorem ipsum dolor sit amet,
          consectetur adipisicing elit. Dolorem eligendi nesciunt nulla ullam
          voluptatem voluptates. Aliquam aut eveniet excepturi laboriosam minus
          optio pariatur quis. Ea hic obcaecati provident quisquam voluptate.
        </Text>

        <ContactList
          count={50}
          contentContainerStyle={{ paddingHorizontal: 12 }}
        />
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
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

export default ListExample;
