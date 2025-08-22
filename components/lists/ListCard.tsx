import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Text, Card, useTheme, ProgressBar} from 'react-native-paper';
import type {AppTheme} from '@/theme';

interface ListCardProps {
    id: string;
    title: string;
    itemCount: number;
    completedCount: number;
    onPress?: () => void;
}

export default function ListCard({
                                     id,
                                     title,
                                     itemCount,
                                     completedCount,
                                     onPress
                                 }: ListCardProps) {
    const theme = useTheme<AppTheme>();

    const progress = itemCount > 0 ? completedCount / itemCount : 0;
    const isCompleted = progress === 1;

    const styles = StyleSheet.create({
        card: {
            marginVertical: theme.spacing.xs,
            marginHorizontal: theme.spacing.md,
            backgroundColor: theme.colors.elevation.level3,
        },
        cardContent: {
            padding: theme.spacing.md,
        },
        titleContainer: {
            flex: 1,
            marginRight: theme.spacing.sm,
        },
        iconContainer: {
            borderRadius: theme.customRoundness.lg,
            padding: theme.spacing.sm,
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
            marginBottom: theme.spacing.xs,
        },
        progressBar: {
            height: 8,
            borderRadius: theme.customRoundness.sm,
        },
        bottomInfo: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
    });

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={styles.card} mode="contained">
                <View style={styles.cardContent}>
                    <View style={styles.titleContainer}>
                        <Text style={[theme.fonts.titleLarge, {color: theme.colors.primary}]}>{title}</Text>
                        <Text style={[theme.fonts.bodyMedium, {color: theme.colors.onSurface}]}>
                            {itemCount} {itemCount === 1 ? 'Artikel' : 'Artikel'}
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <Text style={[theme.fonts.bodyMedium, {color: theme.colors.onSurface}]}>
                                    {completedCount} von {itemCount} erledigt
                                </Text>
                            </View>
                            <ProgressBar
                                progress={progress}
                                style={styles.progressBar}
                                color={isCompleted ? theme.colors.primary : theme.colors.secondary}
                            />
                        </View>
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );
}
