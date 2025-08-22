// src/database/client.ts
import * as SQLite from 'expo-sqlite';
import { migrations } from './migrations';

class DatabaseClient {
    private static instance: DatabaseClient;
    private db: SQLite.SQLiteDatabase | null = null;
    private readonly DB_NAME = 'shopping.db';

    private constructor() {}

    static getInstance(): DatabaseClient {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new DatabaseClient();
        }
        return DatabaseClient.instance;
    }

    async getDatabase(): Promise<SQLite.SQLiteDatabase> {
        if (!this.db) {
            this.db = await SQLite.openDatabaseAsync(this.DB_NAME);
            await this.initialize();
        }
        return this.db;
    }

    private async initialize(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Enable foreign keys
        await this.db.execAsync('PRAGMA foreign_keys = ON;');

        // Run migrations
        await this.runMigrations();
    }

    private async runMigrations(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Create migrations table if not exists
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      );
    `);

        // Get current version
        const result = await this.db.getAllAsync<{ version: number }>(
            'SELECT MAX(version) as version FROM migrations'
        );
        const currentVersion = result[0]?.version || 0;

        // Run pending migrations
        for (const migration of migrations) {
            if (migration.version > currentVersion) {
                console.log(
                    `Running migration ${migration.version}: ${migration.name}`
                );

                await this.db.withTransactionAsync(async () => {
                    // Run migration
                    await this.db!.execAsync(migration.up);

                    // Record migration
                    await this.db!.runAsync(
                        'INSERT INTO migrations (version, name, applied_at) VALUES (?, ?, ?)',
                        migration.version,
                        migration.name,
                        new Date().toISOString()
                    );
                });
            }
        }
    }

    async transaction<T>(
        callback: (db: SQLite.SQLiteDatabase) => Promise<T>
    ): Promise<T> {
        const db = await this.getDatabase();
        return db.withTransactionAsync(() => callback(db));
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
        }
    }
}

export const dbClient = DatabaseClient.getInstance();
