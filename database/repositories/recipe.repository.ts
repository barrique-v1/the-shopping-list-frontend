// src/database/repositories/recipe.repository.ts
import type { Recipe, RecipeIngredient } from '@/types/entities';
import { BaseRepository } from './base.repository';
import { Difficulty } from '@/types/constants';

interface DbRecipe extends Recipe {
    deleted_at?: string;
    sync_status: string;
}

export class RecipeRepository extends BaseRepository<DbRecipe> {
    protected tableName = 'recipes';

    async create(
        data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Recipe> {
        const db = await this.getDb();
        const id = this.generateId();
        const now = this.getCurrentTimestamp();

        await db.runAsync(
            `INSERT INTO recipes (
        id, name, description, servings, prep_time, cook_time,
        difficulty, instructions, tags, is_favorite, rating,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.name,
                data.description || null,
                data.servings,
                data.prepTime || null,
                data.cookTime || null,
                data.difficulty,
                data.instructions,
                JSON.stringify(data.tags || []),
                data.isFavorite ? 1 : 0,
                data.rating || null,
                now,
                now,
            ]
        );

        // Insert ingredients
        for (let i = 0; i < data.ingredients.length; i++) {
            const ingredient = data.ingredients[i];
            await this.createIngredient({
                ...ingredient,
                recipeId: id,
                position: i,
            });
        }

        return {
            id,
            name: data.name,
            description: data.description,
            servings: data.servings,
            prepTime: data.prepTime,
            cookTime: data.cookTime,
            difficulty: data.difficulty,
            instructions: data.instructions,
            tags: data.tags,
            ingredients: data.ingredients,
            isFavorite: data.isFavorite,
            rating: data.rating,
            createdAt: now,
            updatedAt: now,
        };
    }

    async update(
        id: string,
        data: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>
    ): Promise<boolean> {
        const db = await this.getDb();
        const now = this.getCurrentTimestamp();

        const fields: string[] = ['updated_at = ?'];
        const values: any[] = [now];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.servings !== undefined) {
            fields.push('servings = ?');
            values.push(data.servings);
        }
        if (data.prepTime !== undefined) {
            fields.push('prep_time = ?');
            values.push(data.prepTime);
        }
        if (data.cookTime !== undefined) {
            fields.push('cook_time = ?');
            values.push(data.cookTime);
        }
        if (data.difficulty !== undefined) {
            fields.push('difficulty = ?');
            values.push(data.difficulty);
        }
        if (data.instructions !== undefined) {
            fields.push('instructions = ?');
            values.push(data.instructions);
        }
        if (data.tags !== undefined) {
            fields.push('tags = ?');
            values.push(JSON.stringify(data.tags));
        }
        if (data.isFavorite !== undefined) {
            fields.push('is_favorite = ?');
            values.push(data.isFavorite ? 1 : 0);
        }
        if (data.rating !== undefined) {
            fields.push('rating = ?');
            values.push(data.rating);
        }

        values.push(id);

        const result = await db.runAsync(
            `UPDATE recipes SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
            values
        );

        // Update ingredients if provided
        if (data.ingredients && result.changes > 0) {
            await this.updateIngredients(id, data.ingredients);
        }

        return result.changes > 0;
    }

    async getWithIngredients(id: string): Promise<Recipe | null> {
        const db = await this.getDb();

        const recipeResult = await db.getAllAsync<any>(
            'SELECT * FROM recipes WHERE id = ? AND deleted_at IS NULL',
            [id]
        );

        if (!recipeResult[0]) return null;

        const ingredientsResult = await db.getAllAsync<any>(
            'SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY position',
            [id]
        );

        const recipe = recipeResult[0];
        return {
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            servings: recipe.servings,
            prepTime: recipe.prep_time,
            cookTime: recipe.cook_time,
            difficulty: recipe.difficulty as Difficulty,
            instructions: recipe.instructions,
            tags: JSON.parse(recipe.tags || '[]'),
            ingredients: ingredientsResult.map((ing) => ({
                id: ing.id,
                recipeId: ing.recipe_id,
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                category: ing.category,
                isOptional: ing.is_optional === 1,
                notes: ing.notes,
                position: ing.position,
            })),
            isFavorite: recipe.is_favorite === 1,
            rating: recipe.rating,
            createdAt: recipe.created_at,
            updatedAt: recipe.updated_at,
        };
    }

    async getAllWithIngredients(): Promise<Recipe[]> {
        const db = await this.getDb();

        const recipes = await db.getAllAsync<any>(
            'SELECT * FROM recipes WHERE deleted_at IS NULL ORDER BY updated_at DESC'
        );

        const recipeIds = recipes.map((r) => r.id);
        if (recipeIds.length === 0) return [];

        const placeholders = recipeIds.map(() => '?').join(',');
        const ingredients = await db.getAllAsync<any>(
            `SELECT * FROM recipe_ingredients WHERE recipe_id IN (${placeholders}) ORDER BY recipe_id, position`,
            recipeIds
        );

        // Group ingredients by recipe
        const ingredientsByRecipe = new Map<string, RecipeIngredient[]>();
        ingredients.forEach((ing) => {
            if (!ingredientsByRecipe.has(ing.recipe_id)) {
                ingredientsByRecipe.set(ing.recipe_id, []);
            }
            ingredientsByRecipe.get(ing.recipe_id)!.push({
                id: ing.id,
                recipeId: ing.recipe_id,
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                category: ing.category,
                isOptional: ing.is_optional === 1,
                notes: ing.notes,
                position: ing.position,
            });
        });

        return recipes.map((recipe) => ({
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            servings: recipe.servings,
            prepTime: recipe.prep_time,
            cookTime: recipe.cook_time,
            difficulty: recipe.difficulty as Difficulty,
            instructions: recipe.instructions,
            tags: JSON.parse(recipe.tags || '[]'),
            ingredients: ingredientsByRecipe.get(recipe.id) || [],
            isFavorite: recipe.is_favorite === 1,
            rating: recipe.rating,
            createdAt: recipe.created_at,
            updatedAt: recipe.updated_at,
        }));
    }

    async toggleFavorite(id: string): Promise<boolean> {
        const db = await this.getDb();
        const now = this.getCurrentTimestamp();

        const recipe = await this.findById(id);
        if (!recipe) return false;

        const result = await db.runAsync(
            'UPDATE recipes SET is_favorite = ?, updated_at = ? WHERE id = ?',
            [recipe.isFavorite ? 0 : 1, now, id]
        );

        return result.changes > 0;
    }

    async searchByName(query: string): Promise<Recipe[]> {
        const db = await this.getDb();
        const searchPattern = `%${query}%`;

        const results = await db.getAllAsync<any>(
            `SELECT * FROM recipes 
       WHERE name LIKE ? AND deleted_at IS NULL 
       ORDER BY name`,
            [searchPattern]
        );

        return this.hydrateRecipes(results);
    }

    private async createIngredient(
        ingredient: Omit<RecipeIngredient, 'id'>
    ): Promise<void> {
        const db = await this.getDb();
        const id = this.generateId();

        await db.runAsync(
            `INSERT INTO recipe_ingredients (
        id, recipe_id, name, quantity, unit, category,
        is_optional, notes, position
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                ingredient.recipeId,
                ingredient.name,
                ingredient.quantity,
                ingredient.unit,
                ingredient.category,
                ingredient.isOptional ? 1 : 0,
                ingredient.notes || null,
                ingredient.position,
            ]
        );
    }

    private async updateIngredients(
        recipeId: string,
        ingredients: RecipeIngredient[]
    ): Promise<void> {
        const db = await this.getDb();

        await dbClient.transaction(async (db) => {
            // Delete existing ingredients
            await db.runAsync(
                'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
                [recipeId]
            );

            // Insert new ingredients
            for (let i = 0; i < ingredients.length; i++) {
                const ingredient = ingredients[i];
                const id = this.generateId();

                await db.runAsync(
                    `INSERT INTO recipe_ingredients (
            id, recipe_id, name, quantity, unit, category,
            is_optional, notes, position
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id,
                        recipeId,
                        ingredient.name,
                        ingredient.quantity,
                        ingredient.unit,
                        ingredient.category,
                        ingredient.isOptional ? 1 : 0,
                        ingredient.notes || null,
                        i,
                    ]
                );
            }
        });
    }

    private async hydrateRecipes(rows: any[]): Promise<Recipe[]> {
        if (rows.length === 0) return [];

        const db = await this.getDb();
        const recipeIds = rows.map((r) => r.id);
        const placeholders = recipeIds.map(() => '?').join(',');

        const ingredients = await db.getAllAsync<any>(
            `SELECT * FROM recipe_ingredients WHERE recipe_id IN (${placeholders}) ORDER BY recipe_id, position`,
            recipeIds
        );

        const ingredientsByRecipe = new Map<string, RecipeIngredient[]>();
        ingredients.forEach((ing) => {
            if (!ingredientsByRecipe.has(ing.recipe_id)) {
                ingredientsByRecipe.set(ing.recipe_id, []);
            }
            ingredientsByRecipe.get(ing.recipe_id)!.push({
                id: ing.id,
                recipeId: ing.recipe_id,
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                category: ing.category,
                isOptional: ing.is_optional === 1,
                notes: ing.notes,
                position: ing.position,
            });
        });

        return rows.map((recipe) => ({
            id: recipe.id,
            name: recipe.name,
            description: recipe.description,
            servings: recipe.servings,
            prepTime: recipe.prep_time,
            cookTime: recipe.cook_time,
            difficulty: recipe.difficulty as Difficulty,
            instructions: recipe.instructions,
            tags: JSON.parse(recipe.tags || '[]'),
            ingredients: ingredientsByRecipe.get(recipe.id) || [],
            isFavorite: recipe.is_favorite === 1,
            rating: recipe.rating,
            createdAt: recipe.created_at,
            updatedAt: recipe.updated_at,
        }));
    }
}
