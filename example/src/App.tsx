import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { SimpleExample } from './screens/modal/SimpleExample';

export default function App() {
  return (
    <View style={styles.container}>
      <SimpleExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
  },
});
