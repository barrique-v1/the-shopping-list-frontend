// src/stores/recipe.store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Recipe, ListItem } from '@/types';
import { recipeService } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecipeState {
    // State
    recipes: Recipe[];
    currentRecipe: Recipe | null;
    favoriteRecipes: Recipe[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    filterTags: string[];

    // Recipe Actions
    fetchRecipes: () => Promise<void>;
    fetchFavorites: () => Promise<void>;
    createRecipe: (
        recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
    ) => Promise<Recipe>;
    updateRecipe: (
        id: string,
        updates: Partial<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>>
    ) => Promise<void>;
    deleteRecipe: (id: string, permanent?: boolean) => Promise<void>;
    duplicateRecipe: (id: string, newName?: string) => Promise<void>;
    selectRecipe: (id: string) => Promise<void>;
    clearCurrentRecipe: () => void;

    // Recipe Features
    toggleFavorite: (id: string) => Promise<void>;
    rateRecipe: (id: string, rating: number) => Promise<void>;
    searchRecipes: (query: string) => Promise<void>;
    filterByTags: (tags: string[]) => void;

    // Shopping List Integration
    addIngredientsToList: (
        recipeId: string,
        listId: string,
        servingsMultiplier?: number
    ) => Promise<ListItem[]>;
    scaleRecipe: (id: string, targetServings: number) => Promise<void>;

    // UI State
    setSearchQuery: (query: string) => void;
    clearError: () => void;
}

export const useRecipeStore = create<RecipeState>()(
    devtools(
        persist(
            (set, get) => ({
                // Initial state
                recipes: [],
                currentRecipe: null,
                favoriteRecipes: [],
                isLoading: false,
                error: null,
                searchQuery: '',
                filterTags: [],

                // Recipe Actions
                fetchRecipes: async () => {
                    set({ isLoading: true, error: null });
                    try {
                        const recipes = await recipeService.getAllRecipes();
                        set({ recipes, isLoading: false });
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                fetchFavorites: async () => {
                    set({ isLoading: true, error: null });
                    try {
                        const favorites =
                            await recipeService.getFavoriteRecipes();
                        set({ favoriteRecipes: favorites, isLoading: false });
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                createRecipe: async (
                    recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
                ) => {
                    set({ isLoading: true, error: null });
                    try {
                        const newRecipe =
                            await recipeService.createRecipe(recipe);
                        set((state) => ({
                            recipes: [newRecipe, ...state.recipes],
                            isLoading: false,
                        }));
                        return newRecipe;
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                updateRecipe: async (
                    id: string,
                    updates: Partial<
                        Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>
                    >
                ) => {
                    set({ isLoading: true, error: null });
                    try {
                        await recipeService.updateRecipe(id, updates);

                        set((state) => ({
                            recipes: state.recipes.map((recipe) =>
                                recipe.id === id
                                    ? { ...recipe, ...updates }
                                    : recipe
                            ),
                            currentRecipe:
                                state.currentRecipe?.id === id
                                    ? { ...state.currentRecipe, ...updates }
                                    : state.currentRecipe,
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                deleteRecipe: async (id: string, permanent = false) => {
                    set({ isLoading: true, error: null });
                    try {
                        await recipeService.deleteRecipe(id, permanent);

                        set((state) => ({
                            recipes: state.recipes.filter(
                                (recipe) => recipe.id !== id
                            ),
                            favoriteRecipes: state.favoriteRecipes.filter(
                                (recipe) => recipe.id !== id
                            ),
                            currentRecipe:
                                state.currentRecipe?.id === id
                                    ? null
                                    : state.currentRecipe,
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                duplicateRecipe: async (id: string, newName?: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const newRecipe = await recipeService.duplicateRecipe(
                            id,
                            newName
                        );
                        set((state) => ({
                            recipes: [newRecipe, ...state.recipes],
                            isLoading: false,
                        }));
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                selectRecipe: async (id: string) => {
                    set({ isLoading: true, error: null });
                    try {
                        const recipe = await recipeService.getRecipe(id);
                        set({ currentRecipe: recipe, isLoading: false });
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                clearCurrentRecipe: () => {
                    set({ currentRecipe: null });
                },

                // Recipe Features
                toggleFavorite: async (id: string) => {
                    try {
                        await recipeService.toggleFavorite(id);

                        set((state) => {
                            const updatedRecipes = state.recipes.map(
                                (recipe) =>
                                    recipe.id === id
                                        ? {
                                              ...recipe,
                                              isFavorite: !recipe.isFavorite,
                                          }
                                        : recipe
                            );

                            const updatedFavorites = updatedRecipes.filter(
                                (r) => r.isFavorite
                            );

                            return {
                                recipes: updatedRecipes,
                                favoriteRecipes: updatedFavorites,
                                currentRecipe:
                                    state.currentRecipe?.id === id
                                        ? {
                                              ...state.currentRecipe,
                                              isFavorite:
                                                  !state.currentRecipe
                                                      .isFavorite,
                                          }
                                        : state.currentRecipe,
                            };
                        });
                    } catch (error) {
                        set({ error: String(error) });
                    }
                },

                rateRecipe: async (id: string, rating: number) => {
                    try {
                        await recipeService.rateRecipe(id, rating);

                        set((state) => ({
                            recipes: state.recipes.map((recipe) =>
                                recipe.id === id
                                    ? { ...recipe, rating }
                                    : recipe
                            ),
                            currentRecipe:
                                state.currentRecipe?.id === id
                                    ? { ...state.currentRecipe, rating }
                                    : state.currentRecipe,
                        }));
                    } catch (error) {
                        set({ error: String(error) });
                    }
                },

                searchRecipes: async (query: string) => {
                    set({ isLoading: true, error: null, searchQuery: query });
                    try {
                        if (query.trim()) {
                            const results =
                                await recipeService.searchRecipes(query);
                            set({ recipes: results, isLoading: false });
                        } else {
                            await get().fetchRecipes();
                        }
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                    }
                },

                filterByTags: (tags: string[]) => {
                    set({ filterTags: tags });
                    // Note: Actual filtering would be done in the UI component
                    // based on the filterTags state
                },

                // Shopping List Integration
                addIngredientsToList: async (
                    recipeId: string,
                    listId: string,
                    servingsMultiplier = 1
                ) => {
                    set({ isLoading: true, error: null });
                    try {
                        const items = await recipeService.addIngredientsToList(
                            recipeId,
                            listId,
                            servingsMultiplier
                        );
                        set({ isLoading: false });
                        return items;
                    } catch (error) {
                        set({ error: String(error), isLoading: false });
                        throw error;
                    }
                },

                scaleRecipe: async (id: string, targetServings: number) => {
                    try {
                        const { recipe, scaledIngredients } =
                            await recipeService.scaleRecipe(id, targetServings);

                        // Update current recipe with scaled ingredients
                        set((state) => ({
                            currentRecipe:
                                state.currentRecipe?.id === id
                                    ? {
                                          ...recipe,
                                          ingredients: scaledIngredients,
                                      }
                                    : state.currentRecipe,
                        }));
                    } catch (error) {
                        set({ error: String(error) });
                    }
                },

                // UI State
                setSearchQuery: (query: string) => set({ searchQuery: query }),
                clearError: () => set({ error: null }),
            }),
            {
                name: 'recipe-storage',
                storage: {
                    getItem: async (name) => {
                        const value = await AsyncStorage.getItem(name);
                        return value ? JSON.parse(value) : null;
                    },
                    setItem: async (name, value) => {
                        await AsyncStorage.setItem(name, JSON.stringify(value));
                    },
                    removeItem: async (name) => {
                        await AsyncStorage.removeItem(name);
                    },
                },
                partialize: (state) => ({
                    filterTags: state.filterTags,
                }),
            }
        ),
        {
            name: 'recipe-store',
        }
    )
);
