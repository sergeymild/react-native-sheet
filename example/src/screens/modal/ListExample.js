import React, { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/button';
import { ContactList } from '../../components/contactList';
import { FittedSheet } from 'react-native-sheet2';
const ListExample = () => {
    const bottomSheetRef = useRef(null);
    const handlePresentPress = useCallback(() => {
        bottomSheetRef.current?.show();
    }, []);
    const handleDismissPress = useCallback(() => {
        bottomSheetRef.current?.hide();
    }, []);
    // renders
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(Button, { label: "Dismiss", onPress: handleDismissPress }),
        React.createElement(FittedSheet, { ref: bottomSheetRef, params: {
                backgroundColor: 'white',
                maxLandscapeWidth: 560,
                maxPortraitWidth: 300,
                maxHeight: 500,
                topLeftRightCornerRadius: 8,
            } },
            React.createElement(Text, { style: { color: 'black', paddingHorizontal: 12 } }, "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem eligendi nesciunt nulla ullam voluptatem voluptates. Aliquam aut eveniet excepturi laboriosam minus optio pariatur quis. Ea hic obcaecati provident quisquam voluptate. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolorem eligendi nesciunt nulla ullam voluptatem voluptates. Aliquam aut eveniet excepturi laboriosam minus optio pariatur quis. Ea hic obcaecati provident quisquam voluptate."),
            React.createElement(ContactList, { count: 50, contentContainerStyle: { paddingHorizontal: 12 } }))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
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
export default ListExample;
