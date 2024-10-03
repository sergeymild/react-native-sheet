import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { KeyboardSpacer } from '../../components/KeyboardSpacer';
import { FittedSheet } from 'react-native-sheet2';
const KeyboardExample = () => {
    const bottomSheetRef = useRef(null);
    const [keyboardHeight, setKH] = useState(0);
    const [count, setCount] = useState(2);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current?.show();
    }, []);
    const handleDismissPress = useCallback(() => {
        bottomSheetRef.current?.hide();
    }, []);
    console.log('🍓[KeyboardExample.KeyboardExample]', keyboardHeight > 0 ? keyboardHeight : 34);
    // renders
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(Button, { label: "Dismiss", onPress: handleDismissPress }),
        React.createElement(FittedSheet, { params: { maxHeight: 800 }, ref: bottomSheetRef, onSheetDismiss: () => {
                setKH(0);
                setCount(2);
            } },
            React.createElement(View, { style: [
                    styles.contentContainerStyle,
                    { paddingBottom: keyboardHeight > 0 ? keyboardHeight : 34 },
                ] },
                React.createElement(TextInput, { style: { height: 32, width: '100%', backgroundColor: 'yellow' } }),
                React.createElement(ContactList, { count: count }),
                React.createElement(KeyboardSpacer, { handleAndroid: true, onToggle: (e) => {
                        setKH(e);
                        setTimeout(() => {
                            setCount(20);
                            // setTimeout(() => {
                            //   setCount(4)
                            // }, 1000)
                        }, 1000);
                        console.log('[KeyboardExample.]', e);
                    } })))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    contentContainerStyle: {
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
export default KeyboardExample;
