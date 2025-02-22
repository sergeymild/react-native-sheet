import React, { useCallback, useEffect, useRef } from 'react';
import {
  AppState,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/button';
import { TopModal } from 'react-native-sheet2';

export const TopModalExample = () => {
  // refs
  const modalRef = useRef<TopModal>(null);

  useEffect(() => {
    AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        modalRef.current?.show();
      }
    });
  }, []);

  const handlePresentPress = useCallback(() => {
    //bottomSheetRef.current?.show();
    modalRef.current!.show();
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <TextInput
        style={{ height: 40, width: '100%', backgroundColor: 'gray' }}
      />
      <View
        style={{
          position: 'absolute',
          height: 200,
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
            backgroundColor: 'green',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            onPress={() => {
              modalRef.current?.hide();
            }}
          >
            <Text
              children={'Close'}
              style={{
                color: 'red',
                backgroundColor: 'green',
                height: 100,
                width: 100,
              }}
            />
          </TouchableOpacity>
          <TextInput
            multiline
            style={{ minHeight: 56, width: '100%', backgroundColor: 'yellow' }}
          />
        </View>
      </TopModal>
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
