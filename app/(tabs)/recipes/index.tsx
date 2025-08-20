import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Surface, useTheme} from 'react-native-paper';

export default function Index() {
    const theme = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            backgroundColor: theme.colors.background,
        },
        surface: {
            padding: 24,
            borderRadius: theme.roundness,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            backgroundColor: theme.colors.surface,
        },
        title: {
            marginBottom: 8,
            color: theme.colors.onSurface,
        },
        subtitle: {
            textAlign: 'center',
            color: theme.colors.onSurfaceVariant,
        },
    });

    return (
        <View style={styles.container}>
            <Surface style={styles.surface} elevation={2}>
                <Text variant="headlineMedium" style={styles.title}>
                    Rezepte
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Ihre Lieblings-Rezepte werden hier angezeigt
                </Text>
            </Surface>
        </View>
    );
}