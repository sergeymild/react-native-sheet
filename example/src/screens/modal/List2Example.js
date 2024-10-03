import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet } from 'react-native-sheet2';
export const List2Example = () => {
    const bottomSheetRef = useRef(null);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current?.show();
    }, []);
    // renders
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: { maxHeight: 600 } },
            React.createElement(View, { style: styles.contentContainerStyle, onLayout: (e) => console.log('[ListExample.-----]', e.nativeEvent.layout.height) },
                React.createElement(ContactList, { count: 50 })))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    contentContainerStyle: {
        paddingTop: 12,
        paddingHorizontal: 24,
        backgroundColor: 'white',
        maxHeight: 600,
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
