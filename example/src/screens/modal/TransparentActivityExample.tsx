import React, { useCallback, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '../../components/button';
import { TransparentActivityView } from 'react-native-sheet';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { KeyboardSpacer } from '../../components/KeyboardSpacer';
import { safeArea } from 'react-native-safe-area';

const Stack = createBottomTabNavigator<any>();

export const TabsScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
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

  const handlePresentPress = useCallback(async () => {
    // bottomSheetRef.current?.show();
    console.log(
      '🍓[TransparentActivityExample.]',
      await safeArea.actualSafeArea()
    );
    modalRef.current!.show();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={{
          height: 40,
          width: '100%',
          backgroundColor: 'gray',
        }}
      />
      <KeyboardSpacer handleAndroid />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
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
