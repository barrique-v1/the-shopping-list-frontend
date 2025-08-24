// src/services/import-export.service.ts
import type { List, Recipe } from '@/types/entities';
import { listService, listItemService, recipeService } from './index';

export interface ExportData {
    version: string;
    exportedAt: string;
    lists?: List[];
    recipes?: Recipe[];
}

export class ImportExportService {
    private readonly EXPORT_VERSION = '1.0.0';

    async exportAllData(): Promise<ExportData> {
        const lists = await listService.getAllLists();
        const recipes = await recipeService.getAllRecipes();

        // Get items for each list
        for (const list of lists) {
            const items = await listItemService.getItemsByList(list.id);
            (list as any).items = items;
        }

        return {
            version: this.EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            lists,
            recipes,
        };
    }

    async exportList(listId: string): Promise<ExportData> {
        const list = await listService.getList(listId);
        if (!list) {
            throw new Error('List not found');
        }

        const items = await listItemService.getItemsByList(listId);
        (list as any).items = items;

        return {
            version: this.EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            lists: [list],
            recipes: [],
        };
    }

    async exportRecipe(recipeId: string): Promise<ExportData> {
        const recipe = await recipeService.getRecipe(recipeId);
        if (!recipe) {
            throw new Error('Recipe not found');
        }

        return {
            version: this.EXPORT_VERSION,
            exportedAt: new Date().toISOString(),
            lists: [],
            recipes: [recipe],
        };
    }

    async importData(data: ExportData): Promise<{
        listsImported: number;
        recipesImported: number;
        errors: string[];
    }> {
        const errors: string[] = [];
        let listsImported = 0;
        let recipesImported = 0;

        // Import lists
        if (data.lists) {
            for (const list of data.lists) {
                try {
                    const newList = await listService.createList(
                        list.name,
                        list.description
                    );

                    // Import items if present
                    if ((list as any).items) {
                        await listItemService.addMultipleItems(
                            newList.id,
                            (list as any).items
                        );
                    }

                    listsImported++;
                } catch (error) {
                    errors.push(
                        `Failed to import list "${list.name}": ${error}`
                    );
                }
            }
        }

        // Import recipes
        if (data.recipes) {
            for (const recipe of data.recipes) {
                try {
                    await recipeService.createRecipe({
                        name: recipe.name,
                        description: recipe.description,
                        servings: recipe.servings,
                        prepTime: recipe.prepTime,
                        cookTime: recipe.cookTime,
                        difficulty: recipe.difficulty,
                        instructions: recipe.instructions,
                        tags: recipe.tags,
                        ingredients: recipe.ingredients,
                        isFavorite: recipe.isFavorite,
                        rating: recipe.rating,
                    });
                    recipesImported++;
                } catch (error) {
                    errors.push(
                        `Failed to import recipe "${recipe.name}": ${error}`
                    );
                }
            }
        }

        return {
            listsImported,
            recipesImported,
            errors,
        };
    }

    exportToJSON(data: ExportData): string {
        return JSON.stringify(data, null, 2);
    }

    parseImportJSON(json: string): ExportData {
        try {
            const data = JSON.parse(json);

            // Validate structure
            if (!data.version || !data.exportedAt) {
                throw new Error('Invalid export format');
            }

            return data;
        } catch (error) {
            throw new Error(`Failed to parse import data: ${error}`);
        }
    }
}
