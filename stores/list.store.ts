// src/stores/list.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { List, ListItem } from '@/types/entities';
import { listService, listItemService } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ListState {
    // State
    lists: List[];
    currentList: List | null;
    currentListItems: ListItem[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    sortBy: 'position' | 'category' | 'name' | 'checked';

    // List Actions
    fetchLists: () => Promise<void>;
    createList: (name: string, description?: string) => Promise<List>;
    updateList: (
        id: string,
        updates: { name?: string; description?: string }
    ) => Promise<void>;
    deleteList: (id: string, permanent?: boolean) => Promise<void>;
    duplicateList: (id: string, newName?: string) => Promise<void>;
    selectList: (id: string) => Promise<void>;
    clearCurrentList: () => void;

    // List Item Actions
    fetchListItems: (listId: string) => Promise<void>;
    addItem: (
        listId: string,
        item: {
            name: string;
            quantity?: string;
            unit?: string;
            category?: string;
            notes?: string;
        }
    ) => Promise<void>;
    updateItem: (id: string, updates: any) => Promise<void>;
    toggleItem: (id: string) => Promise<void>;
    deleteItem: (id: string, permanent?: boolean) => Promise<void>;
    reorderItems: (listId: string, itemIds: string[]) => Promise<void>;

    // Bulk Actions
    addMultipleItems: (listId: string, text: string) => Promise<void>;
    clearCheckedItems: (listId: string) => Promise<void>;
    uncheckAllItems: (listId: string) => Promise<void>;

    // UI State
    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: 'position' | 'category' | 'name' | 'checked') => void;
    clearError: () => void;
}

export const useListStore = create<ListState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                lists: [],
                currentList: null,
                currentListItems: [],
                isLoading: false,
                error: null,
                searchQuery: '',
                sortBy: 'position',

                // List Actions
                fetchLists: async () => {
                    set({ isLoading: true, error: null });
                    try {
                        const lists = await listService.getAllLists();
                        set({ lists, isLoading: false });
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                createList: async (name: string, description?: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const newList = await listService.createList(
                            name,
                            description
                        );
                        set((state) => ({
                            lists: [newList, ...state.lists],
                            isLoading: false,
                        }));
                        return newList;
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                updateList: async (
                    id: string,
                    updates: { name?: string; description?: string }
                ) => {
                    set({ isLoading: true, error: null });
                    try {
                        await listService.updateList(id, updates);

                        // Update local state
                        set((state) => ({
                            lists: state.lists.map((list) =>
                                list.id === id ? { ...list, ...updates } : list
                            ),
                            currentList:
                                state.currentList?.id === id
                                    ? { ...state.currentList, ...updates }
                                    : state.currentList,
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                deleteList: async (id: string, permanent = false) => {
                    set({ isLoading: true, error: null });
                    try {
                        await listService.deleteList(id, permanent);

                        set((state) => ({
                            lists: state.lists.filter((list) => list.id !== id),
                            currentList:
                                state.currentList?.id === id
                                    ? null
                                    : state.currentList,
                            currentListItems:
                                state.currentList?.id === id
                                    ? []
                                    : state.currentListItems,
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                duplicateList: async (id: string, newName?: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const newList = await listService.duplicateList(
                            id,
                            newName
                        );
                        set((state) => ({
                            lists: [newList, ...state.lists],
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                selectList: async (id: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const list = await listService.getList(id);
                        if (list) {
                            const items = await listItemService.getItemsByList(
                                id,
                                get().sortBy
                            );
                            set({
                                currentList: list,
                                currentListItems: items,
                                isLoading: false,
                            });
                        }
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                clearCurrentList: () => {
                    set({ currentList: null, currentListItems: [] });
                },

                // List Item Actions
                fetchListItems: async (listId: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const items = await listItemService.getItemsByList(
                            listId,
                            get().sortBy
                        );
                        set({ currentListItems: items, isLoading: false });
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                addItem: async (listId: string, item: any) => {
                    set({ isLoading: true, error: null });
                    try {
                        const newItem = await listItemService.addItem(
                            listId,
                            item
                        );

                        set((state) => ({
                            currentListItems: [
                                ...state.currentListItems,
                                newItem,
                            ],
                            currentList: state.currentList
                                ? {
                                      ...state.currentList,
                                      totalItems:
                                          state.currentList.totalItems + 1,
                                  }
                                : null,
                            isLoading: false,
                        }));

                        // Update list counts
                        await get().fetchLists();
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                updateItem: async (id: string, updates: any) => {
                    set({ isLoading: true, error: null });
                    try {
                        await listItemService.updateItem(id, updates);

                        set((state) => ({
                            currentListItems: state.currentListItems.map(
                                (item) =>
                                    item.id === id
                                        ? { ...item, ...updates }
                                        : item
                            ),
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                toggleItem: async (id: string) => {
                    try {
                        await listItemService.toggleItemChecked(id);

                        set((state) => ({
                            currentListItems: state.currentListItems.map(
                                (item) =>
                                    item.id === id
                                        ? {
                                              ...item,
                                              isChecked: !item.isChecked,
                                          }
                                        : item
                            ),
                        }));

                        // Update list counts
                        const state = get();
                        if (state.currentList) {
                            const checkedCount = state.currentListItems.filter(
                                (i) =>
                                    i.id === id ? !i.isChecked : i.isChecked
                            ).length;

                            set((state) => ({
                                currentList: state.currentList
                                    ? {
                                          ...state.currentList,
                                          completedItems: checkedCount,
                                      }
                                    : null,
                            }));
                        }

                        await get().fetchLists();
                    } catch (error) {
                        set({ error: String(error) });
                    }
                },

                deleteItem: async (id: string, permanent = false) => {
                    set({ isLoading: true, error: null });
                    try {
                        await listItemService.deleteItem(id, permanent);

                        set((state) => ({
                            currentListItems: state.currentListItems.filter(
                                (item) => item.id !== id
                            ),
                            currentList: state.currentList
                                ? {
                                      ...state.currentList,
                                      totalItems:
                                          state.currentList.totalItems - 1,
                                  }
                                : null,
                            isLoading: false,
                        }));

                        await get().fetchLists();
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                reorderItems: async (listId: string, itemIds: string[]) => {
                    try {
                        await listItemService.reorderItems(listId, itemIds);

                        // Reorder items in local state
                        set((state) => {
                            const reorderedItems = itemIds
                                .map(
                                    (id) =>
                                        state.currentListItems.find(
                                            (item) => item.id === id
                                        )!
                                )
                                .filter(Boolean);

                            return { currentListItems: reorderedItems };
                        });
                    } catch (error) {
                        set({ error: String(error) });
                    }
                },

                // Bulk Actions
                addMultipleItems: async (listId: string, text: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const items = await listItemService.parseAndAddItems(
                            listId,
                            text
                        );

                        set((state) => ({
                            currentListItems: [
                                ...state.currentListItems,
                                ...items,
                            ],
                            currentList: state.currentList
                                ? {
                                      ...state.currentList,
                                      totalItems:
                                          state.currentList.totalItems +
                                          items.length,
                                  }
                                : null,
                            isLoading: false,
                        }));

                        await get().fetchLists();
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                clearCheckedItems: async (listId: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const deletedCount =
                            await listService.clearCheckedItems(listId);

                        set((state) => ({
                            currentListItems: state.currentListItems.filter(
                                (item) => !item.isChecked
                            ),
                            currentList: state.currentList
                                ? {
                                      ...state.currentList,
                                      totalItems:
                                          state.currentList.totalItems -
                                          deletedCount,
                                      completedItems: 0,
                                  }
                                : null,
                            isLoading: false,
                        }));

                        await get().fetchLists();
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                uncheckAllItems: async (listId: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        await listService.uncheckAllItems(listId);

                        set((state) => ({
                            currentListItems: state.currentListItems.map(
                                (item) => ({
                                    ...item,
                                    isChecked: false,
                                    checkedAt: undefined,
                                })
                            ),
                            currentList: state.currentList
                                ? { ...state.currentList, completedItems: 0 }
                                : null,
                            isLoading: false,
                        }));

                        await get().fetchLists();
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                // UI State
                setSearchQuery: (query: string) => set({ searchQuery: query }),

                setSortBy: (
                    sortBy: 'position' | 'category' | 'name' | 'checked'
                ) => {
                    set({ sortBy });
                    // Re-fetch items with new sort
                    const state = get();
                    if (state.currentList) {
                        state.fetchListItems(state.currentList.id);
                    }
                },

                clearError: () => set({ error: null }),
            }),
            {
                name: 'list-storage',
                storage: {
                    getItem: async (name) => {
                        const value = await AsyncStorage.getItem(name);
                        return value ? JSON.parse(value) : null;
                    },
                    setItem: async (name, value) => {
                        await AsyncStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: async (name) => {
                        await AsyncStorage.removeItem(name);
                    },
                },
                partialize: (state) => ({
                    sortBy: state.sortBy,
                }),
            }
        ),
        {
            name: 'list-store',
        }
    )
);
