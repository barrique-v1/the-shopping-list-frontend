// src/database/migrations/types.ts
export interface Migration {
    version: number;
    name: string;
    up: string;
    down?: string;
}
