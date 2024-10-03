import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';
import { ContactList } from '../../components/contactList';
export const PropsExample = () => {
    const bottomSheetRef = useRef(null);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current?.show({ count: 4 });
    }, []);
    const handleDismissPress = useCallback(() => {
        bottomSheetRef.current?.hide();
    }, []);
    // renders
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(Button, { label: "Dismiss", onPress: handleDismissPress }),
        React.createElement(FittedSheet, { params: { maxHeight: 600, backgroundColor: 'white' }, ref: bottomSheetRef }, (data) => {
            return React.createElement(ContactList, { count: data.count });
        })));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    contentContainerStyle: {
        flex: 1,
        paddingTop: 12,
        paddingHorizontal: 24,
        backgroundColor: 'white',
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
