// app/%28tabs%29/lists/index.tsx

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { AppTheme } from '@/theme';
import ListCard from '@/components/lists/ListCard';

export default function Index() {
    const theme = useTheme<AppTheme>();

    const handleListPress = (listId: string) => {
        console.log('Liste angeklickt:', listId);
        // Hier würde später die Navigation zur Detailansicht erfolgen
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            paddingTop: theme.spacing.sm,
        },
        listContainer: {
            paddingBottom: theme.spacing.xl,
        },
    });

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.listContainer}></View>
            </ScrollView>
        </View>
    );
}
