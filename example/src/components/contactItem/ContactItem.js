import React, { memo, useMemo } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, } from 'react-native';
const ContactItemComponent = ({ title, subTitle, titleStyle, subTitleStyle, thumbnailStyle, iconStyle, onPress, }) => {
    const ContentWrapper = useMemo(() => (onPress ? TouchableOpacity : View), [onPress]);
    // render
    return (React.createElement(ContentWrapper, { onPress: onPress, style: styles.container },
        React.createElement(View, { style: [styles.thumbnail, thumbnailStyle] }),
        React.createElement(View, { style: styles.contentContainer },
            React.createElement(Text, { style: [styles.title, titleStyle] }, title),
            subTitle && (React.createElement(Text, { style: [styles.subtitle, subTitleStyle] }, subTitle))),
        React.createElement(View, { style: [styles.icon, iconStyle] })));
};
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignContent: 'center',
        marginVertical: 12,
    },
    contentContainer: {
        flex: 1,
        alignSelf: 'center',
        marginLeft: 12,
    },
    thumbnail: {
        width: 46,
        height: 46,
        borderRadius: 46,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
    },
    icon: {
        alignSelf: 'center',
        width: 24,
        height: 24,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.125)',
    },
    title: {
        color: '#111',
        fontSize: 16,
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    subtitle: {
        color: '#666',
        fontSize: 14,
        textTransform: 'capitalize',
    },
});
export const ContactItem = memo(ContactItemComponent);
