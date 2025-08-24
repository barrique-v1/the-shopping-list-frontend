import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { FAB as PaperFAB, useTheme } from 'react-native-paper';
import type { AppTheme } from '@/theme';

interface FABProps {
  icon: string;
  onPress: () => void;
  style?: ViewStyle;
  iconColor?: string;
  backgroundColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  margin?: number;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function FAB({
  icon,
  onPress,
  style,
  iconColor,
  backgroundColor,
  position = 'bottom-right',
  margin,
  disabled = false,
  size = 'medium',
}: FABProps) {
  const theme = useTheme<AppTheme>();

  const getPositionStyle = (): ViewStyle => {
    const defaultMargin = margin ?? theme.spacing.md;

    switch (position) {
      case 'bottom-left':
        return {
          position: 'absolute',
          margin: defaultMargin,
          left: 0,
          bottom: 0,
        };
      case 'top-right':
        return {
          position: 'absolute',
          margin: defaultMargin,
          right: 0,
          top: 0,
        };
      case 'top-left':
        return {
          position: 'absolute',
          margin: defaultMargin,
          left: 0,
          top: 0,
        };
      case 'bottom-right':
      default:
        return {
          position: 'absolute',
          margin: defaultMargin,
          right: 0,
          bottom: 0,
        };
    }
  };

  const fabStyle = StyleSheet.create({
    fab: {
      ...getPositionStyle(),
      backgroundColor: backgroundColor ?? theme.colors.primaryContainer,
    },
  });

  return (
    <PaperFAB
      icon={icon}
      style={[fabStyle.fab, style]}
      onPress={onPress}
      color={iconColor ?? theme.colors.onPrimaryContainer}
      disabled={disabled}
      size={size}
    />
  );
}
