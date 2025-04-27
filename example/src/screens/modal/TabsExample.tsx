import React, {
  type ComponentType,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import {
  FITTED_SHEET_SCROLL_VIEW,
  FittedSheet,
  useFittedSheetContext,
} from 'react-native-sheet';

import { SceneMap, TabView } from 'react-native-tab-view';

const tabRoutes: any[] = [
  { key: 'general', title: 'General' },
  { key: 'setting', title: 'Settings' },
  { key: 'list', title: 'List' },
];

const Tab = () => {
  return (
    <ContactList count={100} nativeId={`${FITTED_SHEET_SCROLL_VIEW}_general`} />
  );
};

const Tab2 = () => {
  return (
    <ContactList count={100} nativeId={`${FITTED_SHEET_SCROLL_VIEW}_setting`} />
  );
};

const Tab3 = () => {
  return (
    <ContactList count={100} nativeId={`${FITTED_SHEET_SCROLL_VIEW}_list`} />
  );
};

const renderScene = SceneMap({
  general: Tab,
  setting: Tab2,
  list: Tab3,
} as Record<string, ComponentType>);

const SheetView = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const navigationState = { index: tabIndex, routes: tabRoutes };
  const sheetContext = useFittedSheetContext();
  return (
    <TabView
      navigationState={navigationState}
      onIndexChange={(index) => {
        setTabIndex(index);
        setTimeout(
          (idx) => {
            sheetContext?.passScrollViewReactTag(
              `${FITTED_SHEET_SCROLL_VIEW}_${
                idx === 0 ? 'general' : idx === 1 ? 'setting' : 'list'
              }`
            );
          },
          0,
          index
        );
      }}
      renderScene={renderScene}
    />
  );
};

export const TabsExample = () => {
  const bottomSheetRef = useRef<FittedSheet>(null);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        ref={bottomSheetRef}
        params={{
          backgroundColor: 'white',
          minHeight: Dimensions.get('screen').height - 50,
          topLeftRightCornerRadius: 8,
        }}
      >
        <SheetView />
      </FittedSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  message: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: 'black',
  },
  emoji: {
    fontSize: 156,
    textAlign: 'center',
    alignSelf: 'center',
  },
  emojiContainer: {
    overflow: 'hidden',
    justifyContent: 'center',
  },
});
