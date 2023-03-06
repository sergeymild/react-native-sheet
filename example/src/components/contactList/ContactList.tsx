import React, { memo, useCallback, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { createContactListMockData } from '../../utilities/createMockData';
import { ContactItem } from '../contactItem';
import { FlatList } from 'react-native';
import { FITTED_SHEET_SCROLL_VIEW } from 'react-native-sheet';

export interface ContactListProps {
  count?: number;
  style?: ViewStyle;
  onItemPress?: () => void;
  onRefresh?: () => void;
}

const keyExtractor = (item: any, index: number) => `${item.name}.${index}`;

const ContactListComponent = ({
  count = 25,
  onRefresh,
  onItemPress,
  ...rest
}: ContactListProps) => {
  // hooks

  //#region variables
  const data = useMemo(() => createContactListMockData(count), [count]);
  //#endregion

  // renders
  const renderFlatListItem = useCallback(
    ({ item, index }) => (
      <ContactItem
        key={`${item.name}.${index}`}
        title={`${index}: ${item.name}`}
        subTitle={item.jobTitle}
        onPress={onItemPress}
      />
    ),
    [onItemPress]
  );

  return (
    <FlatList
      {...rest}
      data={data}
      nestedScrollEnabled
      nativeID={FITTED_SHEET_SCROLL_VIEW}
      accessibilityLabel={FITTED_SHEET_SCROLL_VIEW}
      refreshing={false}
      onRefresh={onRefresh}
      keyExtractor={keyExtractor}
      initialNumToRender={5}
      bounces={true}
      windowSize={10}
      maxToRenderPerBatch={5}
      renderItem={renderFlatListItem}
      keyboardDismissMode="interactive"
      indicatorStyle="black"
      contentContainerStyle={{ paddingBottom: 34 }}
    />
  );
};

export const ContactList = memo(ContactListComponent);
