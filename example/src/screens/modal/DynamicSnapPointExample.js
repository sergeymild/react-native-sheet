import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/button';
import { FittedSheet } from 'react-native-sheet2';
const DynamicSnapPointExample = () => {
    // state
    const [count, setCount] = useState(0);
    const bottomSheetRef = useRef(null);
    // callbacks
    const handleIncreaseContentPress = useCallback(() => {
        setCount((state) => state + 1);
    }, []);
    const handleDecreaseContentPress = useCallback(() => {
        setCount((state) => Math.max(state - 1, 0));
    }, []);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current?.show();
    }, []);
    const handleDismissPress = useCallback(() => {
        bottomSheetRef.current?.hide();
    }, []);
    const emojiContainerStyle = useMemo(() => ({
        ...styles.emojiContainer,
        height: 50 * count,
    }), [count]);
    // renders
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(Button, { label: "Dismiss", onPress: handleDismissPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: {
                maxLandscapeWidth: 400,
                topLeftRightCornerRadius: 20,
                maxPortraitWidth: 350,
                isStatusBarBgLight: false,
            }, onSheetDismiss: () => setCount(0) },
            React.createElement(View, { onLayout: (e) => console.log('🍓[DynamicSnapPointExample.lay]', e.nativeEvent.layout.height), style: {
                    paddingBottom: 34,
                    backgroundColor: 'white',
                    paddingTop: 16,
                    paddingHorizontal: 16,
                } },
                React.createElement(Text, { style: styles.message }, "Could this sheet modal resize to its content height ?"),
                React.createElement(View, { style: emojiContainerStyle },
                    React.createElement(Text, { style: styles.emoji }, "\uD83D\uDE0D")),
                React.createElement(Button, { label: "Yes", onPress: handleIncreaseContentPress }),
                React.createElement(Button, { label: "Maybe", onPress: handleDecreaseContentPress })))));
};
const styles = StyleSheet.create({
    container: {
        padding: 24,
        flex: 1,
        backgroundColor: 'purple',
    },
    contentContainerStyle: {
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
        backgroundColor: 'green',
    },
});
export default DynamicSnapPointExample;
