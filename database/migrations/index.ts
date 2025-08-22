// src/database/migrations/index.ts
import { Migration } from './types';
import { initialMigration } from './001_initial';
import { addIndexesMigration } from './002_add_indexes';

export const migrations: Migration[] = [
    initialMigration,
    addIndexesMigration,
];

// src/database/migrations/types.ts
export interface Migration {
    version: number;
    name: string;
    up: string;
    down?: string;
}
