// types/entities/user.ts
import type { Unit } from '@/types/constants';

export interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'de' | 'en';
  defaultUnit: Unit;
  shopping: ShoppingPreferences;
}

export interface ShoppingPreferences {
  autoSort: boolean;
  sortBy: 'category' | 'alphabetical' | 'custom';
  groupByCategory: boolean;
}
