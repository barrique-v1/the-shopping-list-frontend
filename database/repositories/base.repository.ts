// src/database/repositories/base.repository.ts
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { dbClient } from '../client';

export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    sync_status?: 'local' | 'synced' | 'pending' | 'conflict';
}

export abstract class BaseRepository<T extends BaseEntity> {
    protected abstract tableName: string;

    protected async getDb(): Promise<SQLite.SQLiteDatabase> {
        return dbClient.getDatabase();
    }

    protected generateId(): string {
        return Crypto.randomUUID();
    }

    protected getCurrentTimestamp(): string {
        return new Date().toISOString();
    }

    async findById(id: string): Promise<T | null> {
        const db = await this.getDb();
        const result = await db.getAllAsync<T>(
            `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted_at IS NULL`,
            [id]
        );
        return result[0] || null;
    }

    async findAll(options?: {
        orderBy?: string;
        limit?: number;
        offset?: number;
    }): Promise<T[]> {
        const db = await this.getDb();
        let query = `SELECT * FROM ${this.tableName} WHERE deleted_at IS NULL`;

        if (options?.orderBy) {
            query += ` ORDER BY ${options.orderBy}`;
        }
        if (options?.limit) {
            query += ` LIMIT ${options.limit}`;
            if (options?.offset) {
                query += ` OFFSET ${options.offset}`;
            }
        }

        return db.getAllAsync<T>(query);
    }

    async delete(id: string, soft = true): Promise<boolean> {
        const db = await this.getDb();

        if (soft) {
            const result = await db.runAsync(
                `UPDATE ${this.tableName} SET deleted_at = ?, updated_at = ? WHERE id = ?`,
                [this.getCurrentTimestamp(), this.getCurrentTimestamp(), id]
            );
            return result.changes > 0;
        } else {
            const result = await db.runAsync(
                `DELETE FROM ${this.tableName} WHERE id = ?`,
                [id]
            );
            return result.changes > 0;
        }
    }

    async restore(id: string): Promise<boolean> {
        const db = await this.getDb();
        const result = await db.runAsync(
            `UPDATE ${this.tableName} SET deleted_at = NULL, updated_at = ? WHERE id = ?`,
            [this.getCurrentTimestamp(), id]
        );
        return result.changes > 0;
    }
}