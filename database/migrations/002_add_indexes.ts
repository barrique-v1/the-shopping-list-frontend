// src/database/migrations/002_add_indexes.ts
import type { Migration } from './types';
import { SCHEMA } from '../schema';

export const addIndexesMigration: Migration = {
    version: 2,
    name: 'add_indexes',
    up: SCHEMA.INDEXES,
    down: `
    DROP INDEX IF EXISTS idx_list_items_list_id;
    DROP INDEX IF EXISTS idx_list_items_category;
    DROP INDEX IF EXISTS idx_list_items_checked;
    DROP INDEX IF EXISTS idx_lists_deleted;
    DROP INDEX IF EXISTS idx_recipe_ingredients_recipe_id;
    DROP INDEX IF EXISTS idx_recipes_deleted;
    DROP INDEX IF EXISTS idx_recipes_favorite;
  `,
};
