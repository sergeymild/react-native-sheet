import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { screens } from './screens';

const Stack = createNativeStackNavigator<any>();

const Buttons = () => {
  const nav = useNavigation();
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
    </>
  );
};

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name={'Buttons'} component={Buttons} />
          {screens.map((s) => (
            <Stack.Screen {...s} component={s.getScreen()} key={s.slug} />
          ))}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
});
