import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FittedSheet } from 'react-native-sheet';

const Sim: React.FC = () => {
  const data = useMemo(() => createContactListMockData(5), []);
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

export const SimpleExample = () => {
  // refs
  const bottomSheetRef = useRef<FittedSheet>(null);

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);
  const handleDismissPress = useCallback(() => {
    bottomSheetRef.current!.hide();
  }, []);

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <Button label="Dismiss" onPress={handleDismissPress} />
      <FittedSheet ref={bottomSheetRef} params={{ sheetHeight: 1 }}>
        {() => (
          <View style={styles.contentContainerStyle}>
            <Sim />
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
