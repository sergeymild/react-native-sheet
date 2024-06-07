import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FITTED_SHEET_SCROLL_VIEW, FittedSheetView } from 'react-native-sheet';

const Sim: React.FC = () => {
  const [data] = useState(() => createContactListMockData(30));

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

export const SimpleMultipleViewExample = () => {
  // refs
  const bottomSheetRef = useRef<FittedSheetView>(null);
  const bottomSheetRef2 = useRef<FittedSheetView>(null);

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);
  const handlePresentPress2 = useCallback(() => {
    bottomSheetRef2.current!.show();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row' }}>
        <Button
          style={{ flex: 1 }}
          label="Present"
          onPress={handlePresentPress}
        />
        <Button
          style={{ flex: 1 }}
          label="Present2"
          onPress={handlePresentPress2}
        />
        <Button
          style={{ flex: 1 }}
          label="increase1"
          onPress={() => {
            bottomSheetRef.current?.increaseHeight(100);
          }}
        />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Text>Botto</Text>
      </View>

      <FittedSheetView
        ref={bottomSheetRef}
        params={{
          backgroundColor: 'yellow',
          topLeftRightCornerRadius: 20,
          minHeight: 200,
          maxHeight: 400,
        }}
      >
        <ScrollView
          nestedScrollEnabled
          accessibilityLabel={FITTED_SHEET_SCROLL_VIEW}
          nativeID={FITTED_SHEET_SCROLL_VIEW}
          style={styles.contentContainerStyle}
        >
          <Sim />
        </ScrollView>
      </FittedSheetView>
      <FittedSheetView
        ref={bottomSheetRef2}
        params={{
          backgroundColor: 'yellow',
          topLeftRightCornerRadius: 20,
          minHeight: 200,
          maxHeight: 400,
        }}
      >
        <View
          accessibilityLabel={FITTED_SHEET_SCROLL_VIEW}
          nativeID={FITTED_SHEET_SCROLL_VIEW}
          style={styles.contentContainerStyle}
        >
          <Sim />
        </View>
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
