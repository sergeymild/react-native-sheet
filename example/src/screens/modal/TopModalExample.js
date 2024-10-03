import React, { useCallback, useEffect, useRef } from 'react';
import { AppState, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { Button } from '../../components/button';
import { TopModal } from 'react-native-sheet2';
import { useNavigation } from '@react-navigation/native';
export const TopModalExample = () => {
    const navigation = useNavigation();
    // refs
    const modalRef = useRef(null);
    useEffect(() => {
        AppState.addEventListener('change', (state) => {
            if (state === 'background') {
                modalRef.current?.show();
            }
        });
    }, []);
    const handlePresentPress = useCallback(() => {
        //bottomSheetRef.current?.show();
        modalRef.current.show();
    }, []);
    return (React.createElement(View, { style: styles.container },
        React.createElement(Button, { label: "Present", onPress: handlePresentPress }),
        React.createElement(TextInput, { style: { height: 40, width: '100%', backgroundColor: 'gray' } }),
        React.createElement(View, { style: {
                position: 'absolute',
                height: 200,
                bottom: 10,
                left: 0,
                right: 0,
                backgroundColor: 'green',
            } }),
        React.createElement(TopModal, { ref: modalRef, onModalDismiss: () => console.log('[TopModalExample.---ibd]') },
            React.createElement(View, { accessibilityLabel: 'inModal', style: {
                    flex: 1,
                    backgroundColor: 'green',
                    justifyContent: 'flex-end',
                } },
                React.createElement(TouchableOpacity, { onPress: () => {
                        modalRef.current?.hide();
                    } },
                    React.createElement(Text, { children: 'Close', style: {
                            color: 'red',
                            backgroundColor: 'green',
                            height: 100,
                            width: 100,
                        } })),
                React.createElement(TextInput, { multiline: true, style: { minHeight: 56, width: '100%', backgroundColor: 'yellow' } })))));
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
    },
    sheetContainer: {
        marginHorizontal: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        shadowColor: 'rgba(0,0,0,0.25)',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16.0,
        elevation: 24,
        marginBottom: 34,
    },
});
