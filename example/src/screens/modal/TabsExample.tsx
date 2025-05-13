import React, {
  type ComponentType,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet, type FittedSheetRef } from 'react-native-sheet';

import { SceneMap, TabView } from 'react-native-tab-view';

const tabRoutes: any[] = [
  { key: 'general', title: 'General' },
  { key: 'setting', title: 'Settings' },
  { key: 'list', title: 'List' },
];

const Tab = () => {
  return <ContactList count={100} nativeId={`tab_1_list`} />;
};

const Tab2 = () => {
  return <ContactList count={100} nativeId={`tab_2_list`} />;
};

const Tab3 = () => {
  return <ContactList count={100} nativeId={`tab_3_list`} />;
};

const renderScene = SceneMap({
  general: Tab,
  setting: Tab2,
  list: Tab3,
} as Record<string, ComponentType>);

const SheetView = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const navigationState = { index: tabIndex, routes: tabRoutes };
  return (
    <View style={{ height: '100%', backgroundColor: 'green' }}>
      <TabView
        navigationState={navigationState}
        onIndexChange={(index) => {
          setTabIndex(index);
        }}
        renderScene={renderScene}
      />
    </View>
  );
};

export const TabsExample = () => {
  const bottomSheetRef = useRef<FittedSheetRef>(null);

  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.show();
  }, []);

  // renders
  return (
    <View style={styles.container}>
      <Button label="Present" onPress={handlePresentPress} />

      <FittedSheet
        name={'tabsSheet'}
        ref={bottomSheetRef}
        params={{
          backgroundColor: 'yellow',
          minHeight: Dimensions.get('screen').height - 200,
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
