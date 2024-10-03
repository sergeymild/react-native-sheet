import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet } from 'react-native-sheet2';
export const IncreaseDecreaseHeight = () => {
    const bottomSheetRef = useRef(null);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current?.show();
    }, []);
    const increase = useCallback(() => {
        bottomSheetRef.current?.increaseHeight(30);
    }, []);
    const decrease = useCallback(() => {
        bottomSheetRef.current?.decreaseHeight(30);
    }, []);
    // renders
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: { maxHeight: 400, minHeight: 200, backgroundColor: 'white' } },
            React.createElement(View, { style: { flexDirection: 'row' } },
                React.createElement(Button, { label: "increase", onPress: increase }),
                React.createElement(Button, { label: "decrease", onPress: decrease })),
            React.createElement(ContactList, { count: 10 }))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    contentContainerStyle: {
        paddingHorizontal: 24,
        //backgroundColor: 'white',
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
