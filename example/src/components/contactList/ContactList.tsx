import React, { memo, useCallback, useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { createContactListMockData } from '../../utilities/createMockData';
import { ContactItem } from '../contactItem';
import { FlatList, Text, View } from 'react-native';
import {
  FITTED_SHEET_SCROLL_VIEW,
  useFittedSheetContext,
} from 'react-native-sheet2';

export interface ContactListProps {
  count?: number;
  onItemPress?: () => void;
  onRefresh?: () => void;
  nativeId?: string;
  readonly contentContainerStyle?: StyleProp<ViewStyle>;
}

const keyExtractor = (item: any, index: number) => `${item.name}.${index}`;

const ContactListComponent = ({
  count = 25,
  onRefresh,
  onItemPress,
  ...rest
}: ContactListProps) => {
  const context = useFittedSheetContext();
  // hooks

  //#region variables
  const data = useMemo(() => createContactListMockData(count), [count]);
  //#endregion

  // renders
  const renderFlatListItem = useCallback(
    ({ item, index }: any) => {
      if (index === 10) {
        return (
          <View style={{ height: 72 }}>
            <FlatList
              data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={(info) => {
                return (
                  <View
                    style={{
                      height: 72,
                      width: 72,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                    }}
                  >
                    <Text children={info.index.toString()} />
                  </View>
                );
              }}
            />
          </View>
        );
      }

      return (
        <ContactItem
          key={`${item.name}.${index}`}
          title={`${index}: ${item.name}`}
          subTitle={item.jobTitle}
          onPress={onItemPress}
        />
      );
    },
    [onItemPress]
  );

  return (
    <FlatList
      {...rest}
      data={data}
      onLayout={() =>
        context?.passScrollViewReactTag(
          rest.nativeId ?? FITTED_SHEET_SCROLL_VIEW
        )
      }
      nativeID={rest.nativeId ?? FITTED_SHEET_SCROLL_VIEW}
      refreshing={false}
      onRefresh={onRefresh}
      keyExtractor={keyExtractor}
      initialNumToRender={5}
      windowSize={10}
      maxToRenderPerBatch={5}
      renderItem={renderFlatListItem}
      keyboardDismissMode="interactive"
      indicatorStyle="black"
      contentContainerStyle={[rest.contentContainerStyle]}
    />
  );
};

export const ContactList = memo(ContactListComponent);
