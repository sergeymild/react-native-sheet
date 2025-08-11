import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

export const DetachedExample = () => {
  // refs

  const bottomSheetRef = useRef<FittedSheetRef>(null);

  // variables
  const data = useMemo(() => createContactListMockData(2), []);

  // callbacks
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current!.show();
  }, []);

  const renderItem = useCallback(
    (item: any, index: number) => (
      <ContactItem
        key={`${item.name}.${index}`}
        title={`${index}: ${item.name}`}
        subTitle={item.jobTitle}
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />
      <FittedSheet ref={bottomSheetRef}>
        {() => (
          <View style={styles.sheetContainer}>{data.map(renderItem)}</View>
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
  sheetContainer: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16.0,
    elevation: 24,
    marginBottom: 34,
  },
});

export default DetachedExample;
