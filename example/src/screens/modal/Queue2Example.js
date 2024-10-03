import React, { useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';
const Nested = () => {
    const shr = useRef(null);
    return (React.createElement(React.Fragment, null,
        React.createElement(View, { style: styles.contentContainerStyle },
            React.createElement(View, { style: { height: 300 } },
                React.createElement(Button, { label: "Present2", onPress: () => shr.current?.show() }))),
        React.createElement(FittedSheet, { ref: shr },
            React.createElement(View, { style: styles.contentContainerStyle },
                React.createElement(View, { style: { height: 100, backgroundColor: 'red' } }),
                React.createElement(Button, { label: "dismiss 2", onPress: () => {
                        shr.current?.hide();
                    } })))));
};
export const Queue2Example = () => {
    // refs
    const bottomSheetRef = useRef(null);
    // callbacks
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current.show();
    }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef },
            React.createElement(Nested, null))));
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
