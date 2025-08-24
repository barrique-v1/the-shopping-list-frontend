// src/services/list.service.ts
import type { List } from '@/types/entities';
import { listRepository, listItemRepository } from '@/database/repositories';

export class ListService {
    async createList(name: string, description?: string): Promise<List> {
        if (!name || name.trim().length === 0) {
            throw new Error('List name is required');
        }

        return listRepository.create({
            name: name.trim(),
            description: description?.trim(),
        });
    }

    async updateList(
        id: string,
        updates: { name?: string; description?: string }
    ): Promise<boolean> {
        const cleanUpdates: any = {};

        if (updates.name !== undefined) {
            if (updates.name.trim().length === 0) {
                throw new Error('List name cannot be empty');
            }
            cleanUpdates.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            cleanUpdates.description = updates.description.trim() || null;
        }

        return listRepository.update(id, cleanUpdates);
    }

    async deleteList(id: string, permanent = false): Promise<boolean> {
        // Also delete all items in the list
        await listItemRepository.deleteByListId(id, !permanent);
        return listRepository.delete(id, !permanent);
    }

    async restoreList(id: string): Promise<boolean> {
        return listRepository.restore(id);
    }

    async getList(id: string): Promise<List | null> {
        const list = await listRepository.getWithItemCounts(id);
        if (!list) return null;

        return {
            id: list.id,
            name: list.name,
            description: list.description,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
            totalItems: list.itemCount,
            completedItems: list.checkedCount,
        };
    }

    async getAllLists(): Promise<(List & { progress: number })[]> {
        const lists = await listRepository.getAllWithCounts();

        return lists.map((list) => ({
            id: list.id,
            name: list.name,
            description: list.description,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt,
            totalItems: list.itemCount,
            completedItems: list.checkedCount,
            progress:
                list.itemCount > 0
                    ? (list.checkedCount / list.itemCount) * 100
                    : 0,
        }));
    }

    async duplicateList(id: string, newName?: string): Promise<List> {
        const originalList = await this.getList(id);
        if (!originalList) {
            throw new Error('List not found');
        }

        const items = await listItemRepository.findByListId(id);

        // Create new list
        const newList = await this.createList(
            newName || `${originalList.name} (Copy)`,
            originalList.description
        );

        // Copy all items
        for (const item of items) {
            await listItemRepository.create({
                listId: newList.id,
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                isChecked: false, // Reset checked state
                notes: item.notes,
                position: item.position,
                checkedAt: undefined,
            });
        }

        return newList;
    }

    async clearCheckedItems(listId: string): Promise<number> {
        const items = await listItemRepository.findByListId(listId);
        const checkedItems = items.filter((item) => item.isChecked);

        let deletedCount = 0;
        for (const item of checkedItems) {
            const success = await listItemRepository.delete(item.id);
            if (success) deletedCount++;
        }

        return deletedCount;
    }

    async uncheckAllItems(listId: string): Promise<number> {
        const items = await listItemRepository.findByListId(listId);
        const checkedItems = items.filter((item) => item.isChecked);

        let updatedCount = 0;
        for (const item of checkedItems) {
            const success = await listItemRepository.update(item.id, {
                isChecked: false,
            });
            if (success) updatedCount++;
        }

        return updatedCount;
    }
}
