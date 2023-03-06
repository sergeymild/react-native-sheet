import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FittedSheet } from 'react-native-sheet';

const Sim: React.FC = () => {
  const data = useMemo(() => createContactListMockData(9), []);
  const renderItem = useCallback(
    (item, index) => (
      <ContactItem
        key={`${item.name}.${index}`}
        title={`${index}: ${item.name}`}
        subTitle={item.jobTitle}
      />
    ),
    []
  );

  return <View>{data.map(renderItem)}</View>;
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
      <FittedSheet ref={bottomSheetRef} params={{ sheetHeight: 1 }}>
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
