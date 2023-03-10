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
    modalRef.current!.show();
    setTimeout(() => {
      bottomSheetRef.current?.show();
    }, 1000);
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

      <View
        style={{
          position: 'absolute',
          height: 20,
          bottom: 10,
          left: 0,
          right: 0,
          backgroundColor: 'green',
        }}
      />

      <TopModal
        ref={modalRef}
        onModalDismiss={() => console.log('[TopModalExample.---ibd]')}
      >
        <View
          accessibilityLabel={'inModal'}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TouchableOpacity onPress={() => modalRef.current?.hide()}>
            <Text
              style={{
                color: 'red',
                backgroundColor: 'green',
                height: 100,
                width: 100,
              }}
            >
              Close
            </Text>
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
