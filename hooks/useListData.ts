// src/hooks/useListData.ts
import { useEffect } from 'react';
import { useListStore } from '@/stores';

export function useListData(listId?: string) {
    const {
        lists,
        currentList,
        currentListItems,
        isLoading,
        error,
        fetchLists,
        selectList,
        clearCurrentList,
    } = useListStore();

    useEffect(() => {
        fetchLists();
    }, []);

    useEffect(() => {
        if (listId) {
            selectList(listId);
        } else {
            clearCurrentList();
        }

        return () => {
            clearCurrentList();
        };
    }, [listId]);

    return {
        lists,
        currentList,
        items: currentListItems,
        isLoading,
        error,
    };
}
