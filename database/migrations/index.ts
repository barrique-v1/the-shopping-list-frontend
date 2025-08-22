// src/database/migrations/index.ts
import type { Migration } from './types';
import { initialMigration } from './001_initial';
import { addIndexesMigration } from './002_add_indexes';

export const migrations: Migration[] = [initialMigration, addIndexesMigration];
