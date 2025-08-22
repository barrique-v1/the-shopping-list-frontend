// src/database/migrations/001_initial.ts
import type { Migration } from './types';
import { SCHEMA } from '../schema';

export const initialMigration: Migration = {
    version: 1,
    name: 'initial_schema',
    up: `
    ${SCHEMA.LISTS}
    ${SCHEMA.LIST_ITEMS}
    ${SCHEMA.RECIPES}
    ${SCHEMA.RECIPE_INGREDIENTS}
  `,
    down: `
    DROP TABLE IF EXISTS recipe_ingredients;
    DROP TABLE IF EXISTS recipes;
    DROP TABLE IF EXISTS list_items;
    DROP TABLE IF EXISTS lists;
  `,
};
