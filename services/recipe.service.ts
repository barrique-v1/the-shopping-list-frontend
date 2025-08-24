// src/services/recipe.service.ts
import type { Recipe, RecipeIngredient, ListItem } from '@/types/entities';
import { recipeRepository, listItemRepository } from '@/database/repositories';

export class RecipeService {
    async createRecipe(
        data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Recipe> {
        if (!data.name || data.name.trim().length === 0) {
            throw new Error('Recipe name is required');
        }

        if (!data.ingredients || data.ingredients.length === 0) {
            throw new Error('Recipe must have at least one ingredient');
        }

        return recipeRepository.create({
            ...data,
            name: data.name.trim(),
            description: data.description?.trim(),
        });
    }

    async updateRecipe(
        id: string,
        updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<boolean> {
        const cleanUpdates: any = {};

        if (updates.name !== undefined) {
            if (updates.name.trim().length === 0) {
                throw new Error('Recipe name cannot be empty');
            }
            cleanUpdates.name = updates.name.trim();
        }

        if (updates.description !== undefined) {
            cleanUpdates.description = updates.description.trim() || null;
        }

        // Copy other fields
        [
            'servings',
            'prepTime',
            'cookTime',
            'difficulty',
            'instructions',
            'tags',
            'ingredients',
            'isFavorite',
            'rating',
        ].forEach((field) => {
            if (updates[field as keyof typeof updates] !== undefined) {
                cleanUpdates[field] = updates[field as keyof typeof updates];
            }
        });

        return recipeRepository.update(id, cleanUpdates);
    }

    async deleteRecipe(id: string, permanent = false): Promise<boolean> {
        return recipeRepository.delete(id, !permanent);
    }

    async restoreRecipe(id: string): Promise<boolean> {
        return recipeRepository.restore(id);
    }

    async getRecipe(id: string): Promise<Recipe | null> {
        return recipeRepository.getWithIngredients(id);
    }

    async getAllRecipes(): Promise<Recipe[]> {
        return recipeRepository.getAllWithIngredients();
    }

    async getFavoriteRecipes(): Promise<Recipe[]> {
        const all = await this.getAllRecipes();
        return all.filter((r) => r.isFavorite);
    }

    async searchRecipes(query: string): Promise<Recipe[]> {
        return recipeRepository.searchByName(query);
    }

    async toggleFavorite(id: string): Promise<boolean> {
        return recipeRepository.toggleFavorite(id);
    }

    async rateRecipe(id: string, rating: number): Promise<boolean> {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        return recipeRepository.update(id, { rating });
    }

    async addIngredientsToList(
        recipeId: string,
        listId: string,
        servingsMultiplier = 1
    ): Promise<ListItem[]> {
        const recipe = await this.getRecipe(recipeId);
        if (!recipe) {
            throw new Error('Recipe not found');
        }

        const createdItems: ListItem[] = [];

        for (const ingredient of recipe.ingredients) {
            // Skip optional ingredients
            if (ingredient.isOptional) continue;

            // Calculate adjusted quantity
            let adjustedQuantity = ingredient.quantity;
            if (servingsMultiplier !== 1 && ingredient.quantity) {
                const numericQuantity = parseFloat(ingredient.quantity);
                if (!isNaN(numericQuantity)) {
                    adjustedQuantity = (
                        numericQuantity * servingsMultiplier
                    ).toString();
                }
            }

            const item = await listItemRepository.create({
                listId,
                name: ingredient.name,
                description: `From recipe: ${recipe.name}`,
                quantity: adjustedQuantity,
                unit: ingredient.unit,
                category: ingredient.category,
                isChecked: false,
                notes: ingredient.notes,
                position: 0,
                checkedAt: undefined,
            });

            createdItems.push(item);
        }

        return createdItems;
    }

    async duplicateRecipe(id: string, newName?: string): Promise<Recipe> {
        const original = await this.getRecipe(id);
        if (!original) {
            throw new Error('Recipe not found');
        }

        return this.createRecipe({
            name: newName || `${original.name} (Copy)`,
            description: original.description,
            servings: original.servings,
            prepTime: original.prepTime,
            cookTime: original.cookTime,
            difficulty: original.difficulty,
            instructions: original.instructions,
            tags: [...original.tags],
            ingredients: original.ingredients.map((ing) => ({
                ...ing,
                id: '', // Will be generated
                recipeId: '', // Will be set
            })),
            isFavorite: false,
            rating: undefined,
        });
    }

    async scaleRecipe(
        id: string,
        targetServings: number
    ): Promise<{ recipe: Recipe; scaledIngredients: RecipeIngredient[] }> {
        const recipe = await this.getRecipe(id);
        if (!recipe) {
            throw new Error('Recipe not found');
        }

        const multiplier = targetServings / recipe.servings;

        const scaledIngredients = recipe.ingredients.map(
            (ingredient: { quantity: string }) => {
                let scaledQuantity = ingredient.quantity;

                if (ingredient.quantity) {
                    const numericQuantity = parseFloat(ingredient.quantity);
                    if (!isNaN(numericQuantity)) {
                        scaledQuantity = (numericQuantity * multiplier).toFixed(
                            2
                        );
                        // Remove trailing zeros
                        scaledQuantity = parseFloat(scaledQuantity).toString();
                    }
                }

                return {
                    ...ingredient,
                    quantity: scaledQuantity,
                };
            }
        );

        return {
            recipe: {
                ...recipe,
                servings: targetServings,
            },
            scaledIngredients,
        };
    }
}
