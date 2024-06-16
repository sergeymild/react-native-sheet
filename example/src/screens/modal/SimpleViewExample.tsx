import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FITTED_SHEET_SCROLL_VIEW, FittedSheetView } from 'react-native-sheet';

const Sim: React.FC = () => {
  const [data, setData] = useState(() => createContactListMockData(20));

  useEffect(() => {
    // setTimeout(() => {
    //   setData(createContactListMockData(2));
    //   setTimeout(() => {
    //     setData(createContactListMockData(20));
    //   }, 2000);
    // }, 2000);
  }, []);

  const renderItem = useCallback(
    (item: any, index: any) => (
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

export const SimpleViewExample = () => {
  // refs
  const bottomSheetRef = useRef<FittedSheetView>(null);

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);

  const increse = useCallback(() => {
    bottomSheetRef.current!.increaseHeight(100);
  }, []);

  const decrease = useCallback(() => {
    bottomSheetRef.current!.decreaseHeight(100);
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        <Button
          style={{ flex: 1 }}
          label="Present"
          onPress={handlePresentPress}
        />
        <Button style={{ flex: 1 }} label="Increse" onPress={increse} />
        <Button style={{ flex: 1 }} label="Decrese" onPress={decrease} />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Text>Bottom</Text>
      </View>

      <FittedSheetView
        ref={bottomSheetRef}
        params={{
          backgroundColor: 'yellow',
          topLeftRightCornerRadius: 20,
          maxHeight: 700,
          minHeight: 200,
        }}
      >
        <ScrollView
          nativeID={FITTED_SHEET_SCROLL_VIEW}
          style={styles.contentContainerStyle}
        >
          <Sim />
        </ScrollView>
      </FittedSheetView>
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
  },
});
