import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet, TopModal } from 'react-native-sheet';
import { createContactListMockData } from '../../utilities/createMockData';
import { ContactItem } from '../../components/contactItem';

export const TopModalExample = () => {
  // refs
  const modalRef = useRef<TopModal>(null);
  const bottomSheetRef = useRef<FittedSheet>(null);
  const data = useMemo(() => createContactListMockData(2), []);

  const handlePresentPress = useCallback(() => {
    //bottomSheetRef.current?.show();
    modalRef.current!.show();
  }, []);

  const renderItem = useCallback(
    (item, index) => (
      <ContactItem
        key={`${item.name}.${index}`}
        title={`${index}: ${item.name}`}
        subTitle={item.jobTitle}
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <TopModal
        ref={modalRef}
        onModalDismiss={() => console.log('[TopModalExample.---ibd]')}
      >
        <View
          style={{
            height: 500,
            width: '100%',
            backgroundColor: 'red',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity onPress={() => modalRef.current?.hide()}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </TopModal>

      <FittedSheet ref={bottomSheetRef} params={{}}>
        {() => (
          <View style={styles.sheetContainer}>{data.map(renderItem)}</View>
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
  sheetContainer: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16.0,
    elevation: 24,
    marginBottom: 34,
  },
});
