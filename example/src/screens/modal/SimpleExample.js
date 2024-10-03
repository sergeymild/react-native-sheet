import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FittedSheet } from 'react-native-sheet2';
const Sim = () => {
    const data = useMemo(() => createContactListMockData(5), []);
    const renderItem = useCallback((item, index) => (React.createElement(ContactItem, { key: `${item.name}.${index}`, title: `${index}: ${item.name}`, subTitle: item.jobTitle })), []);
    return React.createElement(View, null, data.map(renderItem));
};
export const SimpleExample = () => {
    // refs
    const bottomSheetRef = useRef(null);
    // callbacks
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current.show();
    }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: { backgroundColor: 'yellow', topLeftRightCornerRadius: 20 } },
            React.createElement(View, { style: styles.contentContainerStyle },
                React.createElement(Sim, null)))));
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
