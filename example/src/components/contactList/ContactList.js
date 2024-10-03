import React, { memo, useCallback, useMemo } from 'react';
import { createContactListMockData } from '../../utilities/createMockData';
import { ContactItem } from '../contactItem';
import { FlatList, Text, View } from 'react-native';
import { FITTED_SHEET_SCROLL_VIEW } from 'react-native-sheet2';
const keyExtractor = (item, index) => `${item.name}.${index}`;
const ContactListComponent = ({ count = 25, onRefresh, onItemPress, ...rest }) => {
    // hooks
    //#region variables
    const data = useMemo(() => createContactListMockData(count), [count]);
    //#endregion
    // renders
    const renderFlatListItem = useCallback(({ item, index }) => {
        if (index === 10) {
            return (React.createElement(View, { style: { height: 72 } },
                React.createElement(FlatList, { data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], horizontal: true, showsHorizontalScrollIndicator: false, renderItem: (info) => {
                        return (React.createElement(View, { style: {
                                height: 72,
                                width: 72,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: 1,
                            } },
                            React.createElement(Text, { children: info.index.toString() })));
                    } })));
        }
        return (React.createElement(ContactItem, { key: `${item.name}.${index}`, title: `${index}: ${item.name}`, subTitle: item.jobTitle, onPress: onItemPress }));
    }, [onItemPress]);
    return (React.createElement(FlatList, { ...rest, data: data, nativeID: rest.nativeId ?? FITTED_SHEET_SCROLL_VIEW, refreshing: false, onRefresh: onRefresh, keyExtractor: keyExtractor, initialNumToRender: 5, windowSize: 10, maxToRenderPerBatch: 5, renderItem: renderFlatListItem, keyboardDismissMode: "interactive", indicatorStyle: "black", onLayout: (e) => console.log('🍓[ContactList.layout]', e.nativeEvent.layout.height), contentContainerStyle: [rest.contentContainerStyle] }));
};
export const ContactList = memo(ContactListComponent);
