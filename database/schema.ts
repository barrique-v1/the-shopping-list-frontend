// src/database/schema.ts
export const SCHEMA = {
    LISTS: `
    CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT DEFAULT 'local',
      version INTEGER DEFAULT 1,
      total_items INTEGER DEFAULT 0,
      completed_items INTEGER DEFAULT 0
    );
  `,

    LIST_ITEMS: `
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
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      checked_at TEXT,
      deleted_at TEXT,
      sync_status TEXT DEFAULT 'local',
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
    );
  `,

    RECIPES: `
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      servings INTEGER DEFAULT 4,
      prep_time INTEGER,
      cook_time INTEGER,
      difficulty TEXT DEFAULT 'medium',
      instructions TEXT,
      tags TEXT, -- JSON array
      is_favorite INTEGER DEFAULT 0,
      rating INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      sync_status TEXT DEFAULT 'local'
    );
  `,

    RECIPE_INGREDIENTS: `
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      name TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      category TEXT,
      is_optional INTEGER DEFAULT 0,
      notes TEXT,
      position INTEGER NOT NULL,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `,

    INDEXES: `
    CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
    CREATE INDEX IF NOT EXISTS idx_list_items_category ON list_items(category);
    CREATE INDEX IF NOT EXISTS idx_list_items_checked ON list_items(is_checked);
    CREATE INDEX IF NOT EXISTS idx_lists_deleted ON lists(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
    CREATE INDEX IF NOT EXISTS idx_recipes_deleted ON recipes(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_recipes_favorite ON recipes(is_favorite);
  `
};