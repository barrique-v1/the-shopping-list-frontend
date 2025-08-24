// database/repositories/ListRepository.ts
import { BaseRepository } from './BaseRepository';
import type { List } from '@/types/entities';

interface DbList {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

interface ListWithStats extends DbList {
    total_items: number;
    completed_items: number;
}

export class ListRepository extends BaseRepository<List> {
    protected tableName = 'lists';

    // Convert database row to List type
    private toList(row: ListWithStats): List {
        const list: List = {
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            totalItems: row.total_items || 0,
            completedItems: row.completed_items || 0,
        };

        // Conditionally add optional properties
        if (row.description) {
            list.description = row.description;
        }

        return list;
    }

    // Get all lists with item stats
    async getAll(): Promise<List[]> {
        const sql = `
      SELECT 
        l.*,
        COUNT(li.id) as total_items,
        SUM(CASE WHEN li.is_checked = 1 THEN 1 ELSE 0 END) as completed_items
      FROM lists l
      LEFT JOIN list_items li ON l.id = li.list_id
      GROUP BY l.id
      ORDER BY l.updated_at DESC
    `;

        const rows = await this.query<ListWithStats>(sql);
        return rows.map((row) => this.toList(row));
    }

    // Get single list with stats
    async getById(id: string): Promise<List | null> {
        const sql = `
      SELECT 
        l.*,
        COUNT(li.id) as total_items,
        SUM(CASE WHEN li.is_checked = 1 THEN 1 ELSE 0 END) as completed_items
      FROM lists l
      LEFT JOIN list_items li ON l.id = li.list_id
      WHERE l.id = ?
      GROUP BY l.id
    `;

        const row = await this.queryFirst<ListWithStats>(sql, [id]);
        return row ? this.toList(row) : null;
    }

    // Create new list
    async create(name: string, description?: string): Promise<List> {
        const id = this.generateId();
        const now = this.getCurrentTimestamp();

        const sql = `
      INSERT INTO lists (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `;

        await this.execute(sql, [id, name, description || null, now, now]);

        const newList = await this.getById(id);
        if (!newList) throw new Error('Failed to create list');

        return newList;
    }

    // Update list
    async update(
        id: string,
        data: Partial<Pick<List, 'name' | 'description'>>
    ): Promise<List | null> {
        const updates: string[] = [];
        const params: any[] = [];

        if (data.name !== undefined) {
            updates.push('name = ?');
            params.push(data.name);
        }

        if (data.description !== undefined) {
            updates.push('description = ?');
            params.push(data.description || null);
        }

        if (updates.length === 0) return this.getById(id);

        updates.push('updated_at = ?');
        params.push(this.getCurrentTimestamp());
        params.push(id);

        const sql = `UPDATE lists SET ${updates.join(', ')} WHERE id = ?`;
        await this.execute(sql, params);

        return this.getById(id);
    }

    // Delete list (cascade deletes items)
    async delete(id: string): Promise<boolean> {
        const sql = `DELETE FROM lists WHERE id = ?`;
        const result = await this.execute(sql, [id]);
        return result.changes > 0;
    }

    // Get recent lists
    async getRecent(limit: number = 5): Promise<List[]> {
        const sql = `
      SELECT 
        l.*,
        COUNT(li.id) as total_items,
        SUM(CASE WHEN li.is_checked = 1 THEN 1 ELSE 0 END) as completed_items
      FROM lists l
      LEFT JOIN list_items li ON l.id = li.list_id
      GROUP BY l.id
      ORDER BY l.updated_at DESC
      LIMIT ?
    `;

        const rows = await this.query<ListWithStats>(sql, [limit]);
        return rows.map((row) => this.toList(row));
    }
}

// Singleton instance
export const listRepository = new ListRepository();
