import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';
import { ContactList } from '../../components/contactList';
const Sim = () => {
    return React.createElement(ContactList, { count: 50 });
};
export const LoaderExample = () => {
    const bottomSheetRef = useRef(null);
    const [isLoading, setLoading] = useState(-1);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current.show();
    }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: { backgroundColor: 'white', maxHeight: 500 }, onSheetDismiss: () => setLoading(-1) },
            isLoading === -1 && (React.createElement(TouchableOpacity, { style: { height: 50, marginBottom: 50 }, onPress: () => {
                    setLoading(0);
                    setTimeout(() => setLoading(1), 2000);
                } },
                React.createElement(Text, { style: { color: 'black' } }, "Start"))),
            isLoading === 0 && (React.createElement(View, { accessibilityLabel: 'loading', key: 1, style: {
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 200,
                } },
                React.createElement(ActivityIndicator, null))),
            isLoading === 1 && (React.createElement(View, { style: styles.contentContainerStyle },
                React.createElement(Sim, null))))));
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
