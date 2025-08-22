import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { AppTheme } from '@/theme';
import ListCard from '@/components/lists/ListCard';

export default function Index() {
    const theme = useTheme<AppTheme>();

    // Placeholder-Daten für die Listen
    const placeholderLists = [
        {
            id: '1',
            title: 'Wocheneinkauf',
            itemCount: 12,
            completedCount: 8,
        },
        {
            id: '2',
            title: 'Geburtstag',
            itemCount: 5,
            completedCount: 5,
        },
        {
            id: '3',
            title: 'Baumarkt',
            itemCount: 7,
            completedCount: 2,
        },
        {
            id: '4',
            title: 'Apotheke',
            itemCount: 3,
            completedCount: 0,
        },
        {
            id: '5',
            title: 'Urlaubsplanung',
            itemCount: 10,
            completedCount: 4,
        },
        {
            id: '6',
            title: 'Weihnachtsgeschenke',
            itemCount: 15,
            completedCount: 1,
        },
        {
            id: '7',
            title: 'Wochenendtrip',
            itemCount: 8,
            completedCount: 3,
        },
        {
            id: '8',
            title: 'Fitnessziele',
            itemCount: 6,
            completedCount: 2,
        },
    ];

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
                <View style={styles.listContainer}>
                    {placeholderLists.map((list) => (
                        <ListCard
                            key={list.id}
                            id={list.id}
                            title={list.title}
                            itemCount={list.itemCount}
                            completedCount={list.completedCount}
                            onPress={() => handleListPress(list.id)}
                        />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
