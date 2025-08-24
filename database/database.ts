// database/database.ts
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'shopping.db';

class Database {
    private db: SQLite.SQLiteDatabase | null = null;

    async init(): Promise<void> {
        if (this.db) return;

        this.db = await SQLite.openDatabaseAsync(DATABASE_NAME);

        // Enable foreign keys
        await this.db.execAsync('PRAGMA foreign_keys = ON;');

        // Create tables
        await this.createTables();
    }

    private async createTables(): Promise<void> {
        if (!this.db) throw new Error('Database not initialized');

        // Lists table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS lists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

        // List items table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS list_items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        quantity TEXT,
        unit TEXT,
        category TEXT,
        is_checked INTEGER DEFAULT 0,
        notes TEXT,
        position INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        checked_at TEXT,
        FOREIGN KEY (list_id) REFERENCES lists (id) ON DELETE CASCADE
      );
    `);

        // Recipes table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        servings INTEGER DEFAULT 4,
        prep_time INTEGER,
        cook_time INTEGER,
        difficulty TEXT DEFAULT 'easy',
        instructions TEXT,
        is_favorite INTEGER DEFAULT 0,
        rating INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

        // Recipe ingredients table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id TEXT PRIMARY KEY,
        recipe_id TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity TEXT,
        unit TEXT,
        category TEXT,
        is_optional INTEGER DEFAULT 0,
        notes TEXT,
        position INTEGER DEFAULT 0,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );
    `);

        // Recipe tags table
        await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS recipe_tags (
        recipe_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        PRIMARY KEY (recipe_id, tag),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      );
    `);

        // Create indices for better performance
        await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
      CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
      CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
    `);
    }

    getDatabase(): SQLite.SQLiteDatabase {
        if (!this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }
        return this.db;
    }

    async close(): Promise<void> {
        if (this.db) {
            await this.db.closeAsync();
            this.db = null;
        }
    }
}

// Singleton instance
const database = new Database();
export default database;
