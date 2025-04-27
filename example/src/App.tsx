import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LoaderExample } from './screens/modal/LoaderExample';
import { useState } from 'react';

export default function App() {
  const [state, setState] = useState(0);
  return (
    <View style={styles.container} key={444}>
      {state === 0 && <LoaderExample />}
      <TouchableOpacity
        onPress={() => (state === 0 ? setState(1) : setState(0))}
      >
        <Text children={'Toggle'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
