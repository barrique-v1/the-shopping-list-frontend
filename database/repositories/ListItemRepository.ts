// database/repositories/ListItemRepository.ts
import { BaseRepository } from './BaseRepository';
import type { ListItem } from '@/types/entities';
import { Category, Unit } from '@/types/constants';

interface DbListItem {
  id: string;
  list_id: string;
  name: string;
  description: string | null;
  quantity: string | null;
  unit: string | null;
  category: string | null;
  is_checked: number;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  checked_at: string | null;
}

export class ListItemRepository extends BaseRepository<ListItem> {
  protected tableName = 'list_items';

  // Convert database row to ListItem type
  private toListItem(row: DbListItem): ListItem {
    const item: ListItem = {
      id: row.id,
      listId: row.list_id,
      name: row.name,
      quantity: row.quantity || '',
      unit: (row.unit as Unit) || Unit.PIECE,
      category: (row.category as Category) || Category.SNACKS,
      isChecked: Boolean(row.is_checked),
      position: row.position,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    // Conditionally add optional properties
    if (row.description) {
      item.description = row.description;
    }
    if (row.notes) {
      item.notes = row.notes;
    }
    if (row.checked_at) {
      item.checkedAt = row.checked_at;
    }

    return item;
  }

  // Get all items for a list
  async getByListId(listId: string): Promise<ListItem[]> {
    const sql = `
      SELECT * FROM list_items 
      WHERE list_id = ? 
      ORDER BY position ASC, created_at ASC
    `;

    const rows = await this.query<DbListItem>(sql, [listId]);
    return rows.map(row => this.toListItem(row));
  }

  // Create new item
  async create(
    item: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt' | 'checkedAt'>
  ): Promise<ListItem> {
    const id = this.generateId();
    const now = this.getCurrentTimestamp();

    // Get the next position
    const maxPositionResult = await this.queryFirst<{
      max_pos: number | null;
    }>('SELECT MAX(position) as max_pos FROM list_items WHERE list_id = ?', [
      item.listId,
    ]);
    const position = item.position ?? (maxPositionResult?.max_pos ?? -1) + 1;

    const sql = `
      INSERT INTO list_items (
        id, list_id, name, description, quantity, unit, category,
        is_checked, notes, position, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.execute(sql, [
      id,
      item.listId,
      item.name,
      item.description || null,
      item.quantity || null,
      item.unit || null,
      item.category || null,
      item.isChecked ? 1 : 0,
      item.notes || null,
      position,
      now,
      now,
    ]);

    // Update list's updated_at
    await this.updateListTimestamp(item.listId);

    const newItem = await this.getById(id);
    if (!newItem) throw new Error('Failed to create item');

    return newItem;
  }

  // Update item
  async update(
    id: string,
    data: Partial<Omit<ListItem, 'id' | 'listId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ListItem | null> {
    const current = await this.getById(id);
    if (!current) return null;

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

    if (data.quantity !== undefined) {
      updates.push('quantity = ?');
      params.push(data.quantity || null);
    }

    if (data.unit !== undefined) {
      updates.push('unit = ?');
      params.push(data.unit);
    }

    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }

    if (data.isChecked !== undefined) {
      updates.push('is_checked = ?');
      params.push(data.isChecked ? 1 : 0);

      if (data.isChecked) {
        updates.push('checked_at = ?');
        params.push(this.getCurrentTimestamp());
      } else {
        updates.push('checked_at = NULL');
      }
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes || null);
    }

    if (data.position !== undefined) {
      updates.push('position = ?');
      params.push(data.position);
    }

    if (updates.length === 0) return current;

    updates.push('updated_at = ?');
    params.push(this.getCurrentTimestamp());
    params.push(id);

    const sql = `UPDATE list_items SET ${updates.join(', ')} WHERE id = ?`;
    await this.execute(sql, params);

    // Update list's updated_at
    await this.updateListTimestamp(current.listId);

    return this.getById(id);
  }

  // Toggle checked status
  async toggleChecked(id: string): Promise<ListItem | null> {
    const item = await this.getById(id);
    if (!item) return null;

    return this.update(id, { isChecked: !item.isChecked });
  }

  // Delete multiple items
  async deleteMultiple(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM list_items WHERE id IN (${placeholders})`;
    const result = await this.execute(sql, ids);

    return result.changes;
  }

  // Delete all checked items from a list
  async deleteCheckedItems(listId: string): Promise<number> {
    const sql = `DELETE FROM list_items WHERE list_id = ? AND is_checked = 1`;
    const result = await this.execute(sql, [listId]);

    if (result.changes > 0) {
      await this.updateListTimestamp(listId);
    }

    return result.changes;
  }

  // Get by ID with conversion
  async getById(id: string): Promise<ListItem | null> {
    const sql = `SELECT * FROM list_items WHERE id = ?`;
    const row = await this.queryFirst<DbListItem>(sql, [id]);
    return row ? this.toListItem(row) : null;
  }

  // Helper to update list's updated_at timestamp
  private async updateListTimestamp(listId: string): Promise<void> {
    const sql = `UPDATE lists SET updated_at = ? WHERE id = ?`;
    await this.execute(sql, [this.getCurrentTimestamp(), listId]);
  }

  // Batch create items (for adding from recipes)
  async createBatch(
    items: Omit<ListItem, 'id' | 'createdAt' | 'updatedAt' | 'checkedAt'>[]
  ): Promise<ListItem[]> {
    const createdItems: ListItem[] = [];

    // Use transaction for better performance
    await this.db.withTransactionAsync(async () => {
      for (const item of items) {
        const created = await this.create(item);
        createdItems.push(created);
      }
    });

    return createdItems;
  }
}

// Singleton instance
export const listItemRepository = new ListItemRepository();
