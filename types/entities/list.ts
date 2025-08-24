// types/entities/list.ts
import { Category, type Unit } from '@/types/constants';

export interface List {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    totalItems: number;
    completedItems: number;
}

export interface ListItem {
    id: string;
    listId: string;
    name: string;
    description?: string;
    quantity: string; // "2", "1.5", "ein paar"
    unit: Unit;
    category: Category;
    isChecked: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    checkedAt?: string; // Wann wurde es abgehakt
    position: number; // Für custom sorting
}
