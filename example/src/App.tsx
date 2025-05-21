import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { screens } from './screens';
import { Button } from './components/button';
import { presentFittedSheet } from '../../src/PublicSheetView';
import { PortalProvider } from '@gorhom/portal';
import SheetModule from '../../src/NativeSheet';

const Stack = createNativeStackNavigator<any>();

const Buttons = () => {
  const nav = useNavigation() as any;
  return (
    <>
      <ScrollView>
        {screens.map((screen, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              nav.navigate(screen.name);
            }}
          >
            <Text children={screen.slug} />
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Button
        label="Yes"
        onPress={() => {
          SheetModule.presentToast({});
        }}
        style={{ backgroundColor: 'red' }}
      />
    </>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      {/*<GestureHandlerRootView style={{ flex: 1 }}>*/}
      <NavigationContainer>
        <PortalProvider>
          <Stack.Navigator>
            <Stack.Screen name={'Buttons'} component={Buttons} />
            {screens.map((s) => (
              <Stack.Screen
                {...s}
                component={s.getScreen()}
                key={s.slug}
                options={{
                  presentation: 'formSheet',
                  sheetAllowedDetents: [0.5],
                }}
              />
            ))}
          </Stack.Navigator>
        </PortalProvider>
      </NavigationContainer>

      {/*</GestureHandlerRootView>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
});
