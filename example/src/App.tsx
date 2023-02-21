import * as React from 'react';
import { useEffect, useRef } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FittedSheet } from 'react-native-sheet';
import { TestView } from './TestView';

export default function App() {
  const ref = useRef<TouchableOpacity>(null);
  const ref2 = useRef<TouchableOpacity>(null);

  const sheetRef = useRef<FittedSheet>(null);
  useEffect(() => {
    // sheetRef.current?.setElement(() => require('./TestView').TestView, {
    //   data: 'one',
    // });
  }, []);

  return (
    <>
      <View style={styles.container} accessibilityLabel={'container'}>
        <Text style={{ marginBottom: 10 }} accessibilityLabel={'text'}>
          The constructor is init(controller:, sizes:, options:). Sizes is
          optional, but if specified, the first size in the array will determine
          the initial size of the sheet. Options is also optional, if not
          specified, the default options will be used.
        </Text>

        <TouchableOpacity
          onPress={() => {
            // sheetRef.current?.show('dsdsds')
            sheetRef.current?.show();
          }}
        >
          <Text>Show</Text>
        </TouchableOpacity>
      </View>

      <FittedSheet
        params={{
          topLeftRightCornerRadius: 20,
          backgroundColor: 'purple',
          maxHeight: 400,
        }}
        ref={sheetRef}
      >
        {() => <TestView data={'some da'} styles={{ width: '100%' }} />}
      </FittedSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    flex: 1,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
