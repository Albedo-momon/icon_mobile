import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    isDisabled && styles.disabled,
    style,
  ];

  const getTextColor = () => {
    if (isDisabled) return '#999999';
    
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#ffffff';
      case 'outline':
        return '#007AFF';
      case 'ghost':
        return '#007AFF';
      default:
        return '#ffffff';
    }
  };

  const textVariant = size === 'small' ? 'buttonSm' : 'button';

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text variant={textVariant} color={getTextColor()}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  // Variants
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#34C759',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // Sizes
  small: {
    paddingHorizontal: 8,
    paddingVertical: 0,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  // States
  disabled: {
    backgroundColor: '#E5E5E5',
    borderColor: '#E5E5E5',
  },
});