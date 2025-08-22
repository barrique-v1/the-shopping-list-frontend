// src/database/repositories/list.repository.ts
import type { List } from '@/types/entities';
import { BaseRepository } from './base.repository';

interface DbList extends List {
    deleted_at?: string;
    sync_status: string;
    version: number;
}

export class ListRepository extends BaseRepository<DbList> {
    protected tableName = 'lists';

    async create(
        data: Omit<
            List,
            'id' | 'createdAt' | 'updatedAt' | 'totalItems' | 'completedItems'
        >
    ): Promise<List> {
        const db = await this.getDb();
        const id = this.generateId();
        const now = this.getCurrentTimestamp();

        await db.runAsync(
            `INSERT INTO lists (id, name, description, created_at, updated_at, total_items, completed_items)
       VALUES (?, ?, ?, ?, ?, 0, 0)`,
            [id, data.name, data.description || null, now, now]
        );

        return {
            id,
            name: data.name,
            description: data.description,
            createdAt: now,
            updatedAt: now,
            totalItems: 0,
            completedItems: 0,
        };
    }

    async update(
        id: string,
        data: Partial<Omit<List, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<boolean> {
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
        if (data.totalItems !== undefined) {
            fields.push('total_items = ?');
            values.push(data.totalItems);
        }
        if (data.completedItems !== undefined) {
            fields.push('completed_items = ?');
            values.push(data.completedItems);
        }

        values.push(id);

        const result = await db.runAsync(
            `UPDATE lists SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        return result.changes > 0;
    }

    async getWithItemCounts(
        id: string
    ): Promise<(List & { itemCount: number; checkedCount: number }) | null> {
        const db = await this.getDb();
        const result = await db.getAllAsync<any>(
            `SELECT 
        l.*,
        COUNT(CASE WHEN li.deleted_at IS NULL THEN 1 END) as itemCount,
        COUNT(CASE WHEN li.deleted_at IS NULL AND li.is_checked = 1 THEN 1 END) as checkedCount
       FROM lists l
       LEFT JOIN list_items li ON l.id = li.list_id
       WHERE l.id = ? AND l.deleted_at IS NULL
       GROUP BY l.id`,
            [id]
        );

        if (!result[0]) return null;

        const row = result[0];
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            totalItems: row.total_items,
            completedItems: row.completed_items,
            itemCount: row.itemCount || 0,
            checkedCount: row.checkedCount || 0,
        };
    }

    async getAllWithCounts(): Promise<
        (List & { itemCount: number; checkedCount: number })[]
    > {
        const db = await this.getDb();
        const results = await db.getAllAsync<any>(
            `SELECT 
        l.*,
        COUNT(CASE WHEN li.deleted_at IS NULL THEN 1 END) as itemCount,
        COUNT(CASE WHEN li.deleted_at IS NULL AND li.is_checked = 1 THEN 1 END) as checkedCount
       FROM lists l
       LEFT JOIN list_items li ON l.id = li.list_id
       WHERE l.deleted_at IS NULL
       GROUP BY l.id
       ORDER BY l.updated_at DESC`
        );

        return results.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            totalItems: row.total_items,
            completedItems: row.completed_items,
            itemCount: row.itemCount || 0,
            checkedCount: row.checkedCount || 0,
        }));
    }
}
