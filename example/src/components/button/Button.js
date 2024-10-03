import React, { memo } from 'react';
import 'react-native';
import { ShowcaseButton, ShowcaseLabel } from '@gorhom/showcase-template';
const ButtonComponent = ({ label, labelStyle, style, onPress, }) => (React.createElement(ShowcaseButton, { containerStyle: style, onPress: onPress },
    React.createElement(ShowcaseLabel, { style: labelStyle }, label)));
export const Button = memo(ButtonComponent);
