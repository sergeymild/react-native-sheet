import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactItem } from '../../components/contactItem';
import { createContactListMockData } from '../../utilities/createMockData';
import { FittedSheet } from 'react-native-sheet2';
const DetachedExample = () => {
    // refs
    const bottomSheetRef = useRef(null);
    // variables
    const data = useMemo(() => createContactListMockData(2), []);
    // callbacks
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current.show();
    }, []);
    const handleDismissPress = useCallback(() => {
        bottomSheetRef.current.hide();
    }, []);
    const handleClosePress = useCallback(() => {
        bottomSheetRef.current?.hide();
    }, []);
    const renderItem = useCallback((item, index) => (React.createElement(ContactItem, { key: `${item.name}.${index}`, title: `${index}: ${item.name}`, subTitle: item.jobTitle })), []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(Button, { label: "Dismiss", onPress: handleDismissPress }),
        React.createElement(Button, { label: "Close", onPress: handleClosePress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef }, () => (React.createElement(View, { style: styles.sheetContainer }, data.map(renderItem))))));
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
