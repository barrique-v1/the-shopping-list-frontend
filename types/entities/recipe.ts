import { Category, Difficulty, type Unit } from '@/types/constants';

export interface Recipe {
    id: string;
    name: string;
    description?: string;
    servings: number; // Portionen
    prepTime?: number; // Minuten
    cookTime?: number; // Minuten
    difficulty: Difficulty;
    instructions: string;
    ingredients: RecipeIngredient[];
    tags: string[]; // ["vegetarisch", "schnell", "familie"]
    createdAt: string;
    updatedAt: string;
    isFavorite: boolean;
    rating?: number; // 1-5 stars
}

export interface RecipeIngredient {
    id: string;
    recipeId: string;
    name: string;
    quantity: string;
    unit: Unit;
    category: Category;
    isOptional: boolean;
    notes?: string;
    position: number;
}
