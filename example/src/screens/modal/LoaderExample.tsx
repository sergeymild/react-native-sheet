import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';
import { ContactList } from '../../components/contactList';

export const LoaderExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);
  const [isLoading, setLoading] = useState<-1 | 0 | 1>(-1);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <FittedSheet
        name={'loaderExample'}
        ref={bottomSheetRef}
        params={{ backgroundColor: 'white' }}
        onSheetDismiss={() => setLoading(-1)}
      >
        <>{isLoading === -1 &&
            ((
            <TouchableOpacity
              style={{ height: 50, marginBottom: 50 }}
              onPress={() => {
                setLoading(0);
                setTimeout(() => setLoading(1), 2000);
              }}
            >
              <Text style={{ color: 'black' }}>Start</Text>
            </TouchableOpacity>
          ) as any)}
          {isLoading === 0 && (
            <View
              accessibilityLabel={'loading'}
              key={1}
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                height: 200,
              }}
            >
              <ActivityIndicator />
            </View>
          )}
          {isLoading === 1 && (
          <ContactList
            count={50}
            onReady={() => {
              console.log('[LoaderExample.onRea]');
              bottomSheetRef.current?.attachScrollViewToSheet();
            }}
          />
        )}
        </>
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  contentContainerStyle: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
  },
});
