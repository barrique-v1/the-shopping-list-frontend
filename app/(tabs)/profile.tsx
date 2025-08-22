import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AppTheme } from '@/theme';

export default function Profile() {
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            paddingTop: 0,
            paddingHorizontal: theme.spacing.md,
            paddingBottom: insets.bottom,
        },
        content: {
            flex: 1,
            paddingTop: theme.spacing.md,
        },
        surface: {
            padding: theme.spacing.lg,
            borderRadius: theme.roundness,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
        },
        title: {
            marginBottom: theme.spacing.sm,
            color: theme.colors.onSurface,
        },
        subtitle: {
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Surface style={styles.surface} elevation={2}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Profil
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Ihre Profileinstellungen werden hier angezeigt
                    </Text>
                </Surface>
            </View>
        </View>
    );
}
