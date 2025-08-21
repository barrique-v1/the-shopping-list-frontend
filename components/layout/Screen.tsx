import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppTheme} from '@/theme';

interface ScreenProps {
    children: React.ReactNode;
}

export default function Screen({children}: ScreenProps) {
    const theme = useTheme<AppTheme>();
    const insets = useSafeAreaInsets();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 0,
            paddingHorizontal:theme.spacing.md,
            paddingBottom: insets.bottom,
            backgroundColor: theme.colors.surface,
        },
        content: {
            flex: 1,
            paddingTop:theme.spacing.md,
        },
    });

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

