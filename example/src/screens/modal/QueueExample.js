import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';
export const QueueExample = () => {
    // refs
    const bottomSheetRef = useRef(null);
    const bottomSheetRef2 = useRef(null);
    const [value, setValue] = useState('empty');
    // callbacks
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current.show();
    }, []);
    const handlePresentPress2 = useCallback(() => {
        bottomSheetRef2.current.show();
    }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, onSheetDismiss: () => setValue('empty') },
            React.createElement(View, { style: styles.contentContainerStyle },
                React.createElement(View, { style: { height: 300 } },
                    React.createElement(Button, { label: "Present2", onPress: handlePresentPress2 }),
                    React.createElement(Text, { style: { color: 'red' } }, value)))),
        React.createElement(FittedSheet, { ref: bottomSheetRef2 },
            React.createElement(View, { style: styles.contentContainerStyle },
                React.createElement(View, { style: { height: 300, backgroundColor: 'red' } }),
                React.createElement(Button, { label: "dismiss 2", onPress: () => {
                        setValue('from sheet 2');
                        bottomSheetRef2.current?.hide();
                    } })))));
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
        backgroundColor: 'white',
    },
});
