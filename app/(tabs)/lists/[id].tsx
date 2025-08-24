// app/(tabs)/lists/[id].tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
    useTheme,
    Text,
    ActivityIndicator,
    Appbar,
    TextInput,
    IconButton,
    List,
    Checkbox,
    Divider,
    Button,
    Portal,
    Dialog,
    FAB,
    Snackbar,
    Chip,
} from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { AppTheme } from '@/theme';
import useListStore from '@/stores/useListStore';
import { Unit, Category } from '@/types/constants';
import type { ListItem } from '@/types/entities';

export default function ListDetail() {
    const theme = useTheme<AppTheme>();
    const { id } = useLocalSearchParams<{ id: string }>();

    const {
        currentList,
        currentItems,
        isLoading,
        error,
        selectList,
        addItem,
        toggleItem,
        deleteItem,
        deleteCheckedItems,
        clearError,
    } = useListStore();

    const [quickAddText, setQuickAddText] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Load list and items
    useEffect(() => {
        if (id) {
            selectList(id);
        }
    }, [id]);

    // Quick add item
    const handleQuickAdd = async () => {
        if (!quickAddText.trim() || !id) return;

        setIsAddingItem(true);
        try {
            await addItem({
                listId: id,
                name: quickAddText.trim(),
                quantity: '1',
                unit: Unit.PIECE,
                category: Category.SNACKS,
                isChecked: false,
                position: 0,
            });
            setQuickAddText('');
        } catch (error) {
            console.error('Failed to add item:', error);
        } finally {
            setIsAddingItem(false);
        }
    };

    // Toggle item checked status
    const handleToggleItem = async (itemId: string) => {
        try {
            await toggleItem(itemId);
        } catch (error) {
            console.error('Failed to toggle item:', error);
        }
    };

    // Delete single item
    const handleDeleteItem = async (itemId: string) => {
        try {
            await deleteItem(itemId);
        } catch (error) {
            console.error('Failed to delete item:', error);
        }
    };

    // Delete all checked items
    const handleDeleteCheckedItems = async () => {
        if (!id) return;

        try {
            await deleteCheckedItems(id);
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Failed to delete checked items:', error);
        }
    };

    // Group items by checked status
    const uncheckedItems = currentItems.filter((item) => !item.isChecked);
    const checkedItems = currentItems.filter((item) => item.isChecked);
    const hasCheckedItems = checkedItems.length > 0;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        quickAddContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.surfaceVariant,
        },
        quickAddInput: {
            flex: 1,
            marginRight: theme.spacing.sm,
        },
        scrollContent: {
            flex: 1,
            paddingBottom: theme.spacing.xl,
        },
        sectionHeader: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            backgroundColor: theme.colors.surfaceVariant,
        },
        itemContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            backgroundColor: theme.colors.surface,
        },
        itemContent: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
        },
        itemText: {
            flex: 1,
            marginLeft: theme.spacing.sm,
        },
        itemName: {
            color: theme.colors.onSurface,
        },
        itemNameChecked: {
            textDecorationLine: 'line-through',
            color: theme.colors.onSurfaceVariant,
        },
        itemMeta: {
            flexDirection: 'row',
            gap: theme.spacing.xs,
            marginTop: theme.spacing.xs,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        deleteButton: {
            marginTop: theme.spacing.md,
        },
    });

    if (isLoading && !currentList) {
        return (
            <SafeAreaView style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => router.back()} />
                    <Appbar.Content title="Lädt..." />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                    />
                </View>
            </SafeAreaView>
        );
    }

    if (!currentList) {
        return (
            <SafeAreaView style={styles.container}>
                <Appbar.Header>
                    <Appbar.BackAction onPress={() => router.back()} />
                    <Appbar.Content title="Liste nicht gefunden" />
                </Appbar.Header>
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge">
                        Diese Liste existiert nicht.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => router.back()} />
                <Appbar.Content title={currentList.name} />
                {hasCheckedItems && (
                    <Appbar.Action
                        icon="delete-sweep"
                        onPress={() => setShowDeleteDialog(true)}
                    />
                )}
            </Appbar.Header>

            {/* Quick Add */}
            <View style={styles.quickAddContainer}>
                <TextInput
                    value={quickAddText}
                    onChangeText={setQuickAddText}
                    placeholder="Artikel hinzufügen..."
                    mode="outlined"
                    style={styles.quickAddInput}
                    dense
                    onSubmitEditing={handleQuickAdd}
                    disabled={isAddingItem}
                />
                <IconButton
                    icon="plus"
                    mode="contained"
                    onPress={handleQuickAdd}
                    disabled={!quickAddText.trim() || isAddingItem}
                />
            </View>

            {/* Items List */}
            <ScrollView style={styles.scrollContent}>
                {currentItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text
                            variant="headlineSmall"
                            style={{ marginBottom: theme.spacing.sm }}
                        >
                            Liste ist leer
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={{ color: theme.colors.onSurfaceVariant }}
                        >
                            Füge oben deinen ersten Artikel hinzu
                        </Text>
                    </View>
                ) : (
                    <>
                        {/* Unchecked Items */}
                        {uncheckedItems.length > 0 && (
                            <>
                                {uncheckedItems.map((item) => (
                                    <View
                                        key={item.id}
                                        style={styles.itemContainer}
                                    >
                                        <Checkbox
                                            status={
                                                item.isChecked
                                                    ? 'checked'
                                                    : 'unchecked'
                                            }
                                            onPress={() =>
                                                handleToggleItem(item.id)
                                            }
                                            color={theme.colors.primary}
                                        />
                                        <View style={styles.itemText}>
                                            <Text
                                                variant="bodyLarge"
                                                style={styles.itemName}
                                            >
                                                {item.name}
                                            </Text>
                                            {(item.quantity !== '1' ||
                                                item.unit !== Unit.PIECE) && (
                                                <View style={styles.itemMeta}>
                                                    <Chip
                                                        compact
                                                        mode="flat"
                                                        textStyle={{
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        {item.quantity}{' '}
                                                        {item.unit}
                                                    </Chip>
                                                </View>
                                            )}
                                        </View>
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            onPress={() =>
                                                handleDeleteItem(item.id)
                                            }
                                        />
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Divider */}
                        {uncheckedItems.length > 0 &&
                            checkedItems.length > 0 && (
                                <Divider
                                    style={{ marginVertical: theme.spacing.sm }}
                                />
                            )}

                        {/* Checked Items */}
                        {checkedItems.length > 0 && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <Text
                                        variant="titleSmall"
                                        style={{
                                            color: theme.colors
                                                .onSurfaceVariant,
                                        }}
                                    >
                                        Erledigt ({checkedItems.length})
                                    </Text>
                                </View>
                                {checkedItems.map((item) => (
                                    <View
                                        key={item.id}
                                        style={styles.itemContainer}
                                    >
                                        <Checkbox
                                            status={
                                                item.isChecked
                                                    ? 'checked'
                                                    : 'unchecked'
                                            }
                                            onPress={() =>
                                                handleToggleItem(item.id)
                                            }
                                            color={theme.colors.primary}
                                        />
                                        <View style={styles.itemText}>
                                            <Text
                                                variant="bodyLarge"
                                                style={styles.itemNameChecked}
                                            >
                                                {item.name}
                                            </Text>
                                            {(item.quantity !== '1' ||
                                                item.unit !== Unit.PIECE) && (
                                                <View style={styles.itemMeta}>
                                                    <Chip
                                                        compact
                                                        mode="flat"
                                                        textStyle={{
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        {item.quantity}{' '}
                                                        {item.unit}
                                                    </Chip>
                                                </View>
                                            )}
                                        </View>
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            onPress={() =>
                                                handleDeleteItem(item.id)
                                            }
                                        />
                                    </View>
                                ))}
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Delete Checked Dialog */}
            <Portal>
                <Dialog
                    visible={showDeleteDialog}
                    onDismiss={() => setShowDeleteDialog(false)}
                >
                    <Dialog.Title>Erledigte Artikel löschen?</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Möchtest du alle {checkedItems.length} erledigten
                            Artikel löschen?
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setShowDeleteDialog(false)}>
                            Abbrechen
                        </Button>
                        <Button
                            onPress={handleDeleteCheckedItems}
                            mode="contained"
                            buttonColor={theme.colors.error}
                        >
                            Löschen
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Error Snackbar */}
            <Snackbar visible={!!error} onDismiss={clearError} duration={3000}>
                {error}
            </Snackbar>
        </SafeAreaView>
    );
}
