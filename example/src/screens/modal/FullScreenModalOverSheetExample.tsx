import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

type ReproStackParams = {
  Home: undefined;
  FullScreenModal: undefined;
};

const Stack = createNativeStackNavigator<ReproStackParams>();

const HomeScreen = ({
  navigation,
}: NativeStackScreenProps<ReproStackParams, 'Home'>) => {
  const sheetRef = useRef<FittedSheetRef>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Full Screen Modal over Sheet</Text>
      <Text style={styles.description}>
        Press "Show Sheet", then tap "Open Full Screen Modal" from inside the
        sheet. On Android the modal appears BELOW the sheet (bug), on iOS it
        appears on top.
      </Text>

      <Button label="Show Sheet" onPress={() => sheetRef.current?.show()} />

      <FittedSheet
        ref={sheetRef}
        params={{
          backgroundColor: 'white',
          topLeftRightCornerRadius: 16,
          useInlinePresentation: true,
        }}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Sheet is open</Text>
          <Text style={styles.sheetHint}>
            Now navigate to the full screen modal — it should render ABOVE this
            sheet.
          </Text>
          <Button
            label="Open Full Screen Modal"
            onPress={() => navigation.navigate('FullScreenModal')}
          />
          <Button
            label="Dismiss Sheet"
            onPress={() => sheetRef.current?.hide()}
          />
        </View>
      </FittedSheet>
    </View>
  );
};

const FullScreenModalScreen = ({
  navigation,
}: NativeStackScreenProps<ReproStackParams, 'FullScreenModal'>) => (
  <View style={styles.modalContainer}>
    <Text style={styles.modalTitle}>Full Screen Modal</Text>
    <Text style={styles.modalBody}>
      If you can see this text and the sheet is hidden behind it — things work.
      If this is rendered under the sheet (you can't see the red background on
      Android) — bug reproduced.
    </Text>
    <Button label="Close" onPress={() => navigation.goBack()} />
  </View>
);

export const FullScreenModalOverSheetExample = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen
      name="FullScreenModal"
      component={FullScreenModalScreen}
      options={{ presentation: 'formSheet' }}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  sheetContent: {
    padding: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sheetHint: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  modalBody: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
  },
});
