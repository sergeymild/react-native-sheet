import { StyleSheet, View } from 'react-native';
import { LoaderExample } from './screens/modal/LoaderExample';

export default function App() {
  return (
    <View style={styles.container}>
      <LoaderExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
