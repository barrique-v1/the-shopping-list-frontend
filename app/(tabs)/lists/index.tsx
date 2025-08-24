// app/(tabs)/lists/index.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
import {
  useTheme,
  Text,
  ActivityIndicator,
  Portal,
  Dialog,
  TextInput,
  Button,
  Snackbar,
} from 'react-native-paper';
import { router } from 'expo-router';
import type { AppTheme } from '@/theme';
import ListCard from '@/components/lists/ListCard';
import FAB from '@/components/layout/FAB';
import useListStore from '@/stores/useListStore';

export default function Index() {
  const theme = useTheme<AppTheme>();
  const {
    lists,
    isLoading,
    error,
    fetchLists,
    createList,
    deleteList,
    clearError,
  } = useListStore();

  const [refreshing, setRefreshing] = useState(false);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load lists on mount
  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setNewListName('');
    setNewListDescription('');
    setCreateDialogVisible(true);
  };

  // Close create dialog
  const handleCloseCreateDialog = () => {
    setCreateDialogVisible(false);
    setNewListName('');
    setNewListDescription('');
  };

  // Create new list
  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsCreating(true);
    try {
      const newList = await createList(
        newListName.trim(),
        newListDescription.trim() || undefined
      );
      handleCloseCreateDialog();
      // Navigate to the new list
      router.push(`/lists/${newList.id}`);
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle list press
  const handleListPress = (listId: string) => {
    router.push(`/lists/${listId}`);
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
      paddingBottom: theme.spacing.xl * 2, // Extra space for FAB
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      color: theme.colors.onSurfaceVariant,
      marginBottom: theme.spacing.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dialogContent: {
      paddingHorizontal: theme.spacing.lg,
    },
    input: {
      marginBottom: theme.spacing.md,
    },
    dialogActions: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
  });

  // Show loading on first load
  if (isLoading && lists.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={{ marginTop: theme.spacing.md }}>
          Listen werden geladen...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.listContainer}>
          {lists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="headlineSmall" style={styles.emptyText}>
                Keine Listen vorhanden
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Tippe auf + um deine erste Liste zu erstellen
              </Text>
            </View>
          ) : (
            lists.map(list => (
              <ListCard
                key={list.id}
                id={list.id}
                title={list.name}
                itemCount={list.totalItems}
                completedCount={list.completedItems}
                onPress={() => handleListPress(list.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB icon="plus" onPress={handleOpenCreateDialog} />

      {/* Create List Dialog */}
      <Portal>
        <Dialog
          visible={createDialogVisible}
          onDismiss={handleCloseCreateDialog}
        >
          <Dialog.Title>Neue Liste erstellen</Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              label="Name *"
              value={newListName}
              onChangeText={setNewListName}
              mode="outlined"
              style={styles.input}
              placeholder="z.B. Wocheneinkauf"
              autoFocus
              disabled={isCreating}
            />
            <TextInput
              label="Beschreibung (optional)"
              value={newListDescription}
              onChangeText={setNewListDescription}
              mode="outlined"
              style={styles.input}
              placeholder="z.B. Einkauf für die Woche"
              multiline
              numberOfLines={2}
              disabled={isCreating}
            />
          </Dialog.Content>
          <Dialog.Actions style={styles.dialogActions}>
            <Button onPress={handleCloseCreateDialog} disabled={isCreating}>
              Abbrechen
            </Button>
            <Button
              onPress={handleCreateList}
              mode="contained"
              disabled={!newListName.trim() || isCreating}
              loading={isCreating}
            >
              Erstellen
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Error Snackbar */}
      <Snackbar
        visible={!!error}
        onDismiss={clearError}
        duration={3000}
        action={{
          label: 'OK',
          onPress: clearError,
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}
