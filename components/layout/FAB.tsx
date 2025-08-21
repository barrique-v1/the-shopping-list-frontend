import React from 'react';
import { FAB as PaperFAB, useTheme } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { AppTheme } from '@/theme';

interface FABProps {
    icon: string;
    label?: string;
    onPress: () => void;
    style?: any;
}

export default function FAB({ icon, label, onPress, style }: FABProps) {
    const theme = useTheme<AppTheme>();

    const styles = StyleSheet.create({
        fab: {
            position: 'absolute',
            right: theme.spacing.md,
            bottom: theme.spacing.md,
            backgroundColor: theme.colors.tertiaryContainer,
        },
    });

    return (
        <PaperFAB
            icon={icon}
            style={[styles.fab, style]}
            onPress={onPress}
            label={label}
        />
    );
}
