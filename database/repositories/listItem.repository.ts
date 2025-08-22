// src/database/repositories/listItem.repository.ts
import { ListItem } from '@/types';
import { BaseRepository } from './base.repository';
import { Unit, Category } from '@/types/constants';

interface DbListItem extends ListItem {
    deleted_at?: string;
    sync_status: string;
}

export class ListItemRepository extends BaseRepository<DbListItem> {
    protected tableName = 'list_items';

    async create(data: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ListItem> {
        const db = await this.getDb();
        const id = this.generateId();
        const now = this.getCurrentTimestamp();

        // Get next position if not provided
        let position = data.position;
        if (position === undefined) {
            const result = await db.getAllAsync<{ maxPos: number }>(
                'SELECT MAX(position) as maxPos FROM list_items WHERE list_id = ? AND deleted_at IS NULL',
                [data.listId]
            );
            position = (result[0]?.maxPos || 0) + 1;
        }

        await db.runAsync(
            `INSERT INTO list_items (
        id, list_id, name, description, quantity, unit, category, 
        is_checked, notes, position, created_at, updated_at, checked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.listId,
                data.name,
                data.description || null,
                data.quantity,
                data.unit,
                data.category,
                data.isChecked ? 1 : 0,
                data.notes || null,
                position,
                now,
                now,
                data.checkedAt || null
            ]
        );

        // Update list counts
        await this.updateListCounts(data.listId);

        return {
            id,
            listId: data.listId,
            name: data.name,
            description: data.description,
            quantity: data.quantity,
            unit: data.unit,
            category: data.category,
            isChecked: data.isChecked,
            notes: data.notes,
            position,
            createdAt: now,
            updatedAt: now,
            checkedAt: data.checkedAt
        };
    }

    async update(id: string, data: Partial<Omit<ListItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'>>): Promise<boolean> {
        const db = await this.getDb();
        const now = this.getCurrentTimestamp();

        const fields: string[] = ['updated_at = ?'];
        const values: any[] = [now];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.quantity !== undefined) {
            fields.push('quantity = ?');
            values.push(data.quantity);
        }
        if (data.unit !== undefined) {
            fields.push('unit = ?');
            values.push(data.unit);
        }
        if (data.category !== undefined) {
            fields.push('category = ?');
            values.push(data.category);
        }
        if (data.isChecked !== undefined) {
            fields.push('is_checked = ?');
            values.push(data.isChecked ? 1 : 0);

            if (data.isChecked) {
                fields.push('checked_at = ?');
                values.push(now);
            } else {
                fields.push('checked_at = ?');
                values.push(null);
            }
        }
        if (data.notes !== undefined) {
            fields.push('notes = ?');
            values.push(data.notes);
        }
        if (data.position !== undefined) {
            fields.push('position = ?');
            values.push(data.position);
        }

        values.push(id);

        const result = await db.runAsync(
            `UPDATE list_items SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        // Get listId and update counts
        if (result.changes > 0 && data.isChecked !== undefined) {
            const item = await this.findById(id);
            if (item) {
                await this.updateListCounts(item.listId);
            }
        }

        return result.changes > 0;
    }

    async toggleChecked(id: string): Promise<boolean> {
        const db = await this.getDb();
        const now = this.getCurrentTimestamp();

        const item = await this.findById(id);
        if (!item) return false;

        const newCheckedState = !item.isChecked;
        const result = await db.runAsync(
            `UPDATE list_items 
       SET is_checked = ?, checked_at = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
            [
                newCheckedState ? 1 : 0,
                newCheckedState ? now : null,
                now,
                id
            ]
        );

        if (result.changes > 0) {
            await this.updateListCounts(item.listId);
        }

        return result.changes > 0;
    }

    async findByListId(listId: string, options?: {
        sortBy?: 'position' | 'category' | 'name' | 'checked';
    }): Promise<ListItem[]> {
        const db = await this.getDb();

        let orderBy = 'position ASC';
        switch (options?.sortBy) {
            case 'category':
                orderBy = 'category ASC, position ASC';
                break;
            case 'name':
                orderBy = 'name ASC';
                break;
            case 'checked':
                orderBy = 'is_checked ASC, position ASC';
                break;
        }

        const results = await db.getAllAsync<any>(
            `SELECT * FROM list_items 
       WHERE list_id = ? AND deleted_at IS NULL 
       ORDER BY ${orderBy}`,
            [listId]
        );

        return results.map(row => ({
            id: row.id,
            listId: row.list_id,
            name: row.name,
            description: row.description,
            quantity: row.quantity,
            unit: row.unit as Unit,
            category: row.category as Category,
            isChecked: row.is_checked === 1,
            notes: row.notes,
            position: row.position,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            checkedAt: row.checked_at
        }));
    }

    async reorderItems(listId: string, itemIds: string[]): Promise<void> {
        const db = await this.getDb();

        await dbClient.transaction(async (db) => {
            for (let i = 0; i < itemIds.length; i++) {
                await db.runAsync(
                    'UPDATE list_items SET position = ? WHERE id = ? AND list_id = ?',
                    [i, itemIds[i], listId]
                );
            }
        });
    }

    private async updateListCounts(listId: string): Promise<void> {
        const db = await this.getDb();

        const counts = await db.getAllAsync<{ total: number; completed: number }>(
            `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_checked = 1 THEN 1 END) as completed
       FROM list_items 
       WHERE list_id = ? AND deleted_at IS NULL`,
            [listId]
        );

        if (counts[0]) {
            await db.runAsync(
                'UPDATE lists SET total_items = ?, completed_items = ? WHERE id = ?',
                [counts[0].total, counts[0].completed, listId]
            );
        }
    }

    async deleteByListId(listId: string, soft = true): Promise<number> {
        const db = await this.getDb();

        if (soft) {
            const result = await db.runAsync(
                'UPDATE list_items SET deleted_at = ? WHERE list_id = ? AND deleted_at IS NULL',
                [this.getCurrentTimestamp(), listId]
            );
            return result.changes;
        } else {
            const result = await db.runAsync(
                'DELETE FROM list_items WHERE list_id = ?',
                [listId]
            );
            return result.changes;
        }
    }
}