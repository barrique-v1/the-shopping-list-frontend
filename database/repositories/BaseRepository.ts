// database/repositories/BaseRepository.ts
import * as SQLite from 'expo-sqlite';
import database from '../database';

export abstract class BaseRepository<T> {
    protected abstract tableName: string;

    protected get db(): SQLite.SQLiteDatabase {
        return database.getDatabase();
    }

    // Generate UUID v4
    protected generateId(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    }

    // Get current ISO timestamp
    protected getCurrentTimestamp(): string {
        return new Date().toISOString();
    }

    // Execute query and return all results
    protected async query<R = T>(
        sql: string,
        params: any[] = []
    ): Promise<R[]> {
        const result = await this.db.getAllAsync(sql, params);
        return result as R[];
    }

    // Execute query and return first result
    protected async queryFirst<R = T>(
        sql: string,
        params: any[] = []
    ): Promise<R | null> {
        const result = await this.db.getFirstAsync(sql, params);
        return result as R | null;
    }

    // Execute non-query statement (INSERT, UPDATE, DELETE)
    protected async execute(
        sql: string,
        params: any[] = []
    ): Promise<SQLite.SQLiteRunResult> {
        return await this.db.runAsync(sql, params);
    }

    // Get all records
    async getAll(): Promise<T[]> {
        const sql = `SELECT *
                     FROM ${this.tableName}
                     ORDER BY created_at DESC`;
        return await this.query<T>(sql);
    }

    // Get by ID
    async getById(id: string): Promise<T | null> {
        const sql = `SELECT *
                     FROM ${this.tableName}
                     WHERE id = ?`;
        return await this.queryFirst<T>(sql, [id]);
    }

    // Delete by ID
    async delete(id: string): Promise<boolean> {
        const sql = `DELETE
                     FROM ${this.tableName}
                     WHERE id = ?`;
        const result = await this.execute(sql, [id]);
        return result.changes > 0;
    }

    // Count all records
    async count(): Promise<number> {
        const sql = `SELECT COUNT(*) as count
                     FROM ${this.tableName}`;
        const result = await this.queryFirst<{ count: number }>(sql);
        return result?.count || 0;
    }
}
