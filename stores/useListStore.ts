// stores/useListStore.ts
import { create } from 'zustand';
import type { List, ListItem } from '@/types/entities';
import { listRepository } from '@/database/repositories/ListRepository';
import { listItemRepository } from '@/database/repositories/ListItemRepository';

interface ListStore {
    // State
    lists: List[];
    currentList: List | null;
    currentItems: ListItem[];
    isLoading: boolean;
    error: string | null;

    // List Actions
    fetchLists: () => Promise<void>;
    createList: (name: string, description?: string) => Promise<List>;
    updateList: (
        id: string,
        data: Partial<Pick<List, 'name' | 'description'>>
    ) => Promise<void>;
    deleteList: (id: string) => Promise<void>;
    selectList: (id: string) => Promise<void>;

    // Item Actions
    fetchItems: (listId: string) => Promise<void>;
    addItem: (
        item: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt' | 'checkedAt'>
    ) => Promise<void>;
    updateItem: (
        id: string,
        data: Partial<
            Omit<ListItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'>
        >
    ) => Promise<void>;
    toggleItem: (id: string) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
    deleteCheckedItems: (listId: string) => Promise<void>;

    // Utility
    clearError: () => void;
}

const useListStore = create<ListStore>((set, get) => ({
    // Initial state
    lists: [],
    currentList: null,
    currentItems: [],
    isLoading: false,
    error: null,

    // List Actions
    fetchLists: async () => {
        set({ isLoading: true, error: null });
        try {
            const lists = await listRepository.getAll();
            set({ lists, isLoading: false });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch lists',
                isLoading: false,
            });
        }
    },

    createList: async (name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
            const newList = await listRepository.create(name, description);
            set((state) => ({
                lists: [newList, ...state.lists],
                isLoading: false,
            }));
            return newList;
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to create list',
                isLoading: false,
            });
            throw error;
        }
    },

    updateList: async (
        id: string,
        data: Partial<Pick<List, 'name' | 'description'>>
    ) => {
        set({ error: null });
        try {
            const updatedList = await listRepository.update(id, data);
            if (updatedList) {
                set((state) => ({
                    lists: state.lists.map((list) =>
                        list.id === id ? updatedList : list
                    ),
                    currentList:
                        state.currentList?.id === id
                            ? updatedList
                            : state.currentList,
                }));
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update list',
            });
            throw error;
        }
    },

    deleteList: async (id: string) => {
        set({ error: null });
        try {
            const success = await listRepository.delete(id);
            if (success) {
                set((state) => ({
                    lists: state.lists.filter((list) => list.id !== id),
                    currentList:
                        state.currentList?.id === id ? null : state.currentList,
                    currentItems:
                        state.currentList?.id === id ? [] : state.currentItems,
                }));
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete list',
            });
            throw error;
        }
    },

    selectList: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const list = await listRepository.getById(id);
            if (list) {
                const items = await listItemRepository.getByListId(id);
                set({
                    currentList: list,
                    currentItems: items,
                    isLoading: false,
                });
            } else {
                set({
                    error: 'List not found',
                    isLoading: false,
                });
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to select list',
                isLoading: false,
            });
        }
    },

    // Item Actions
    fetchItems: async (listId: string) => {
        set({ isLoading: true, error: null });
        try {
            const items = await listItemRepository.getByListId(listId);
            set({ currentItems: items, isLoading: false });
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to fetch items',
                isLoading: false,
            });
        }
    },

    addItem: async (
        item: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt' | 'checkedAt'>
    ) => {
        set({ error: null });
        try {
            const newItem = await listItemRepository.create(item);
            set((state) => ({
                currentItems: [...state.currentItems, newItem],
            }));

            // Update list stats
            if (item.listId) {
                const updatedList = await listRepository.getById(item.listId);
                if (updatedList) {
                    set((state) => ({
                        lists: state.lists.map((list) =>
                            list.id === item.listId ? updatedList : list
                        ),
                        currentList:
                            state.currentList?.id === item.listId
                                ? updatedList
                                : state.currentList,
                    }));
                }
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to add item',
            });
            throw error;
        }
    },

    updateItem: async (
        id: string,
        data: Partial<
            Omit<ListItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'>
        >
    ) => {
        set({ error: null });
        try {
            const updatedItem = await listItemRepository.update(id, data);
            if (updatedItem) {
                set((state) => ({
                    currentItems: state.currentItems.map((item) =>
                        item.id === id ? updatedItem : item
                    ),
                }));
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to update item',
            });
            throw error;
        }
    },

    toggleItem: async (id: string) => {
        set({ error: null });
        try {
            const updatedItem = await listItemRepository.toggleChecked(id);
            if (updatedItem) {
                set((state) => ({
                    currentItems: state.currentItems.map((item) =>
                        item.id === id ? updatedItem : item
                    ),
                }));

                // Update list stats
                const listId = updatedItem.listId;
                const updatedList = await listRepository.getById(listId);
                if (updatedList) {
                    set((state) => ({
                        lists: state.lists.map((list) =>
                            list.id === listId ? updatedList : list
                        ),
                        currentList:
                            state.currentList?.id === listId
                                ? updatedList
                                : state.currentList,
                    }));
                }
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to toggle item',
            });
            throw error;
        }
    },

    deleteItem: async (id: string) => {
        set({ error: null });
        try {
            const item = get().currentItems.find((i) => i.id === id);
            const success = await listItemRepository.delete(id);

            if (success) {
                set((state) => ({
                    currentItems: state.currentItems.filter(
                        (item) => item.id !== id
                    ),
                }));

                // Update list stats
                if (item?.listId) {
                    const updatedList = await listRepository.getById(
                        item.listId
                    );
                    if (updatedList) {
                        set((state) => ({
                            lists: state.lists.map((list) =>
                                list.id === item.listId ? updatedList : list
                            ),
                            currentList:
                                state.currentList?.id === item.listId
                                    ? updatedList
                                    : state.currentList,
                        }));
                    }
                }
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete item',
            });
            throw error;
        }
    },

    deleteCheckedItems: async (listId: string) => {
        set({ error: null });
        try {
            const deletedCount =
                await listItemRepository.deleteCheckedItems(listId);

            if (deletedCount > 0) {
                // Refresh items
                const items = await listItemRepository.getByListId(listId);
                set({ currentItems: items });

                // Update list stats
                const updatedList = await listRepository.getById(listId);
                if (updatedList) {
                    set((state) => ({
                        lists: state.lists.map((list) =>
                            list.id === listId ? updatedList : list
                        ),
                        currentList:
                            state.currentList?.id === listId
                                ? updatedList
                                : state.currentList,
                    }));
                }
            }
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to delete checked items',
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useListStore;
