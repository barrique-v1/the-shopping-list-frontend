// src/services/index.ts
import { ListService } from './list.service';
import { ListItemService } from './listItem.service';
import { RecipeService } from './recipe.service';
import { ImportExportService } from './import-export.service';

// Export service instances
export const listService = new ListService();
export const listItemService = new ListItemService();
export const recipeService = new RecipeService();
export const importExportService = new ImportExportService();

// Export service classes
export { ListService } from './list.service';
export { ListItemService } from './listItem.service';
export { RecipeService } from './recipe.service';
export { ImportExportService } from './import-export.service';
