import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {useTheme} from 'react-native-paper';
import { AppTheme } from '@/theme';
import ListCard from '@/components/lists/ListCard';
import FAB from '@/components/layout/FAB';

export default function Index() {
    const theme = useTheme<AppTheme>();

    // Placeholder-Daten für die Listen
    const placeholderLists = [
        {
            id: '1',
            title: 'Wocheneinkauf',
            itemCount: 12,
            completedCount: 8,
            lastModified: 'vor 2 Stunden',
        },
        {
            id: '2',
            title: 'Geburtstag Sarah',
            itemCount: 5,
            completedCount: 5,
            lastModified: 'gestern',
        },
        {
            id: '3',
            title: 'Baumarkt',
            itemCount: 7,
            completedCount: 2,
            lastModified: 'vor 3 Tagen',
        },
        {
            id: '4',
            title: 'Apotheke',
            itemCount: 3,
            completedCount: 0,
            lastModified: 'vor 1 Woche',
        },
    ];

    const handleListPress = (listId: string) => {
        console.log('Liste angeklickt:', listId);
        // Hier würde später die Navigation zur Detailansicht erfolgen
    };

    const handleCreateList = () => {
        console.log('Neue Liste erstellen');
        // Hier würde später die Navigation zum Erstellen einer neuen Liste erfolgen
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
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.listContainer}>
                    {placeholderLists.map((list) => (
                        <ListCard
                            key={list.id}
                            id={list.id}
                            title={list.title}
                            itemCount={list.itemCount}
                            completedCount={list.completedCount}
                            lastModified={list.lastModified}
                            onPress={() => handleListPress(list.id)}
                        />
                    ))}
                </View>
            </ScrollView>

            <FAB
                icon="plus"
                onPress={handleCreateList}
                label="Neue Liste"
            />
        </View>
    );
}
