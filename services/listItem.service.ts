// src/services/listItem.service.ts
import { ListItem } from '@/types';
import { listItemRepository } from '@/database/repositories';
import { Unit, Category } from '@/types/constants';

export class ListItemService {
    async addItem(
        listId: string,
        data: {
            name: string;
            quantity?: string;
            unit?: Unit;
            category?: Category;
            notes?: string;
        }
    ): Promise<ListItem> {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Item name is required');
        }

        return listItemRepository.create({
            listId,
            name: data.name.trim(),
            description: undefined,
            quantity: data.quantity || '1',
            unit: data.unit || Unit.PIECE,
            category: data.category || Category.GRAINS,
            isChecked: false,
            notes: data.notes?.trim(),
            position: 0, // Will be calculated
            checkedAt: undefined
        });
    }

    async updateItem(
        id: string,
        updates: Partial<{
            name: string;
            quantity: string;
            unit: Unit;
            category: Category;
            notes: string;
            isChecked: boolean;
        }>
    ): Promise<boolean> {
        const cleanUpdates: any = {};

        if (updates.name !== undefined) {
            if (updates.name.trim().length === 0) {
                throw new Error('Item name cannot be empty');
            }
            cleanUpdates.name = updates.name.trim();
        }

        if (updates.quantity !== undefined) {
            cleanUpdates.quantity = updates.quantity;
        }

        if (updates.unit !== undefined) {
            cleanUpdates.unit = updates.unit;
        }

        if (updates.category !== undefined) {
            cleanUpdates.category = updates.category;
        }

        if (updates.notes !== undefined) {
            cleanUpdates.notes = updates.notes.trim() || null;
        }

        if (updates.isChecked !== undefined) {
            cleanUpdates.isChecked = updates.isChecked;
        }

        return listItemRepository.update(id, cleanUpdates);
    }

    async toggleItemChecked(id: string): Promise<boolean> {
        return listItemRepository.toggleChecked(id);
    }

    async deleteItem(id: string, permanent = false): Promise<boolean> {
        return listItemRepository.delete(id, !permanent);
    }

    async restoreItem(id: string): Promise<boolean> {
        return listItemRepository.restore(id);
    }

    async getItemsByList(
        listId: string,
        sortBy?: 'position' | 'category' | 'name' | 'checked'
    ): Promise<ListItem[]> {
        return listItemRepository.findByListId(listId, { sortBy });
    }

    async reorderItems(listId: string, itemIds: string[]): Promise<void> {
        return listItemRepository.reorderItems(listId, itemIds);
    }

    async addMultipleItems(
        listId: string,
        items: Array<{
            name: string;
            quantity?: string;
            unit?: Unit;
            category?: Category;
            notes?: string;
        }>
    ): Promise<ListItem[]> {
        const createdItems: ListItem[] = [];

        for (const item of items) {
            try {
                const created = await this.addItem(listId, item);
                createdItems.push(created);
            } catch (error) {
                console.error(`Failed to add item ${item.name}:`, error);
            }
        }

        return createdItems;
    }

    async parseAndAddItems(listId: string, text: string): Promise<ListItem[]> {
        // Parse text input (one item per line)
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        const items: Array<{
            name: string;
            quantity?: string;
            unit?: Unit;
            category?: Category;
        }> = [];

        for (const line of lines) {
            // Simple parsing: "2x Tomaten" or "500g Mehl" or just "Milch"
            const match = line.match(/^(\d+\.?\d*)\s*([a-zA-Z]+)?\s+(.+)$/);

            if (match) {
                const [, quantity, unitStr, name] = match;

                // Try to match unit
                let unit: Unit | undefined;
                if (unitStr) {
                    const unitLower = unitStr.toLowerCase();
                    unit = Object.values(Unit).find(u =>
                        u.toLowerCase() === unitLower ||
                        u.toLowerCase().startsWith(unitLower)
                    );
                }

                items.push({
                    name: name.trim(),
                    quantity,
                    unit: unit || Unit.PIECE,
                    category: this.suggestCategory(name.trim())
                });
            } else {
                // No quantity/unit found, just add the name
                items.push({
                    name: line.trim(),
                    quantity: '1',
                    unit: Unit.PIECE,
                    category: this.suggestCategory(line.trim())
                });
            }
        }

        return this.addMultipleItems(listId, items);
    }

    private suggestCategory(itemName: string): Category {
        const name = itemName.toLowerCase();

        // Simple keyword-based categorization
        const categoryKeywords: Record<Category, string[]> = {
            [Category.FRUITS]: ['apfel', 'birne', 'banane', 'orange', 'beere', 'frucht', 'obst'],
            [Category.VEGETABLES]: ['tomate', 'gurke', 'salat', 'karotte', 'zwiebel', 'gemüse', 'kartoffel'],
            [Category.MEAT]: ['fleisch', 'hack', 'steak', 'schnitzel', 'wurst'],
            [Category.FISH]: ['fisch', 'lachs', 'thunfisch', 'forelle'],
            [Category.DAIRY]: ['milch', 'joghurt', 'quark', 'sahne', 'butter'],
            [Category.CHEESE]: ['käse', 'gouda', 'mozzarella', 'parmesan'],
            [Category.GRAINS]: ['nudel', 'reis', 'mehl', 'brot', 'pasta', 'getreide'],
            [Category.BEVERAGES]: ['wasser', 'saft', 'cola', 'getränk', 'tee', 'kaffee'],
            [Category.CLEANING]: ['reiniger', 'putzmittel', 'seife', 'waschmittel'],
            [Category.PERSONAL_CARE]: ['shampoo', 'duschgel', 'zahnpasta', 'deo'],
        };

        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                return category as Category;
            }
        }

        return Category.GRAINS; // Default category
    }
}