// src/hooks/useRecipeData.ts
import { useEffect } from 'react';
import { useRecipeStore } from '@/stores';

export function useRecipeData(recipeId?: string) {
    const {
        recipes,
        currentRecipe,
        favoriteRecipes,
        isLoading,
        error,
        fetchRecipes,
        fetchFavorites,
        selectRecipe,
        clearCurrentRecipe
    } = useRecipeStore();

    useEffect(() => {
        fetchRecipes();
        fetchFavorites();
    }, []);

    useEffect(() => {
        if (recipeId) {
            selectRecipe(recipeId);
        } else {
            clearCurrentRecipe();
        }

        return () => {
            clearCurrentRecipe();
        };
    }, [recipeId]);

    return {
        recipes,
        currentRecipe,
        favoriteRecipes,
        isLoading,
        error
    };
}