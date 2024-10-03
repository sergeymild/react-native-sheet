import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShowcaseApp } from '@gorhom/showcase-template';
import { screens } from './screens';
const author = {
    username: 'SergeyMild',
    url: 'https://github.com/sergeymild',
};
export default function App() {
    return (React.createElement(View, { style: styles.container },
        React.createElement(ShowcaseApp, { name: "Bottom Sheet", description: '', version: '0.0', author: author, data: screens })));
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexGrow: 1,
    },
});
