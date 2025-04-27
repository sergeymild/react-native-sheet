import React, { memo } from 'react';
import { ViewStyle, TextStyle, TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  label: string;
  labelStyle?: TextStyle;
  style?: ViewStyle;
  onPress: () => void;
}

const ButtonComponent = ({
  label,
  labelStyle,
  style,
  onPress,
}: ButtonProps) => (
  <TouchableOpacity
    style={style}
    onPress={onPress}
    children={
      <Text pointerEvents={'none'} children={label} style={labelStyle} />
    }
  />
);

export const Button = memo(ButtonComponent);
