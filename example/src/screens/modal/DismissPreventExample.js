import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';
export const DismissPreventExample = () => {
    // refs
    const bottomSheetRef = useRef(null);
    // callbacks
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current.show();
    }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: { dismissable: false }, onSheetDismiss: () => console.log('[DismissPreventExample.----]') },
            React.createElement(View, { style: styles.contentContainerStyle },
                React.createElement(View, { style: { height: 300 } },
                    React.createElement(Button, { label: "Hide", onPress: () => bottomSheetRef.current?.hide() }))))));
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
