import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Icon, useTheme, ProgressBar } from 'react-native-paper';
import { AppTheme } from '@/theme';

interface ListCardProps {
    id: string;
    title: string;
    itemCount: number;
    completedCount: number;
    lastModified: string;
    onPress?: () => void;
}

export default function ListCard({
    id,
    title,
    itemCount,
    completedCount,
    lastModified,
    onPress
}: ListCardProps) {
    const theme = useTheme<AppTheme>();

    const progress = itemCount > 0 ? completedCount / itemCount : 0;
    const isCompleted = progress === 1;

    const styles = StyleSheet.create({
        card: {
            marginVertical: theme.spacing.xs,
            marginHorizontal: theme.spacing.md,
        },
        cardContent: {
            padding: theme.spacing.md,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.sm,
        },
        titleContainer: {
            flex: 1,
            marginRight: theme.spacing.sm,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.onSurface,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 14,
            color: theme.colors.onSurfaceVariant,
        },
        iconContainer: {
            backgroundColor: theme.colors.primaryContainer,
            borderRadius: 20,
            padding: 8,
        },
        footer: {
            flexDirection: 'column',
            marginTop: theme.spacing.sm,
        },
        progressContainer: {
            marginBottom: theme.spacing.xs,
        },
        progressHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
        },
        progressText: {
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
        },
        progressBar: {
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.colors.surfaceVariant,
        },
        bottomInfo: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        lastModified: {
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
        },
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={styles.card} mode="contained">
                <View style={styles.cardContent}>
                    <View style={styles.header}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>
                                {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
                            </Text>
                        </View>
                        <View style={styles.iconContainer}>
                            <Icon
                                source={isCompleted ? "check-circle" : "format-list-bulleted"}
                                size={24}
                                color={theme.colors.primary}
                            />
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressText}>
                                    {completedCount} von {itemCount} erledigt
                                </Text>
                                <Text style={styles.progressText}>
                                    {Math.round(progress * 100)}%
                                </Text>
                            </View>
                            <ProgressBar
                                progress={progress}
                                style={styles.progressBar}
                                color={isCompleted ? theme.colors.primary : theme.colors.secondary}
                            />
                        </View>
                        <View style={styles.bottomInfo}>
                            <Text style={styles.lastModified}>
                                {lastModified}
                            </Text>
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}
