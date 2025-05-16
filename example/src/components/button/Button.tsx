import {
  type ViewStyle,
  type TextStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { memo } from 'react';

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
    style={[style, { height: 30, borderBottomWidth: 1 }]}
    onPress={onPress}
    onPressIn={() => {
      console.log('[Button.onPressIn]');
    }}
    onPressOut={() => {
      console.log('[Button.onPressOut]');
    }}
    children={<Text children={label} style={labelStyle} />}
  />
);

export const Button = memo(ButtonComponent);
