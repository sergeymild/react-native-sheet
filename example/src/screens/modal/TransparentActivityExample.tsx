import React, { useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/button';
import { TransparentActivityView } from 'react-native-sheet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createBottomTabNavigator<any>();

export const TabsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
    >
      <Stack.Screen
        name={'TransparentActivityExample'}
        component={TransparentActivityExample}
      />
      <Stack.Screen
        name={'TransparentActivityExample2'}
        component={TransparentActivityExample}
      />
    </Stack.Navigator>
  );
};

export const TransparentActivityExample = () => {
  // refs
  const modalRef = useRef<TransparentActivityView>(null);

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

      <TransparentActivityView
        ref={modalRef}
        onActivityDismiss={() =>
          console.log('[TransparentActivityView.dismiss]')
        }
      >
        <View
          accessibilityLabel={'inModal'}
          style={{
            flex: 1,
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
                backgroundColor: 'orange',
                height: 100,
                width: 100,
              }}
            />
          </TouchableOpacity>
          <TextInput
            multiline={false}
            style={{
              minHeight: 56,
              width: '100%',
              backgroundColor: 'yellow',
              marginBottom: 50,
            }}
          />
        </View>
      </TransparentActivityView>
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
