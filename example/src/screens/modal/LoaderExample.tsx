import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet';
import { ContactList } from '../../components/contactList';

const Sim: React.FC = () => {
  return <ContactList count={50} />;
};

export const LoaderExample = () => {
  const bottomSheetRef = useRef<FittedSheet>(null);
  const [isLoading, setLoading] = useState(true);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <FittedSheet ref={bottomSheetRef} params={{ maxHeight: 500 }}>
        {() => (
          <View style={styles.contentContainerStyle}>
            {isLoading && (
              <View
                accessibilityLabel={'loading'}
                key={1}
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 100,
                }}
              >
                <ActivityIndicator />
              </View>
            )}
            {!isLoading && <Sim />}
          </View>
        )}
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
