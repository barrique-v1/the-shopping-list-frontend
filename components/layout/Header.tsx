// components/layout/Header.tsx
import React from 'react';
import { Appbar, useTheme, Button } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import type { AppTheme } from '@/theme';

interface HeaderProps {
  title: string;
  rightButton?:
    | {
        label: string;
        icon: string;
        onPress: () => void;
      }
    | undefined;
}

export default function Header({ title, rightButton }: HeaderProps) {
  const theme = useTheme<AppTheme>();

  const styles = StyleSheet.create({
    header: {
      backgroundColor: theme.colors.tertiaryContainer,
    },
    rightButton: {
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.tertiaryContainer,
    },
  });

  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
      <Appbar.Content title={title} titleStyle={theme.fonts.headlineMedium} />
      {rightButton && (
        <Button
          mode="contained"
          icon={rightButton.icon}
          onPress={rightButton.onPress}
          style={styles.rightButton}
          labelStyle={{ color: theme.colors.onTertiaryContainer }}
          theme={{
            colors: {
              onSurface: theme.colors.onTertiaryContainer,
            },
          }}
        >
          {rightButton.label}
        </Button>
      )}
    </Appbar.Header>
  );
}
