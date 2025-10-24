/**
 * レシピストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Recipe, RecipeHistory } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { recipeOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface RecipeStore {
  recipeHistory: RecipeHistory[];
  favoriteRecipes: Recipe[];
  loading: boolean;
  initialized: boolean;
  setRecipes: (history: RecipeHistory[], favorites: Recipe[]) => void;
  addToHistory: (recipe: Recipe) => Promise<void>;
  addToFavorites: (recipe: Recipe) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  syncWithFirestore: () => Promise<void>;
}

const MAX_HISTORY = 10;

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipeHistory: getFromStorage<RecipeHistory[]>(STORAGE_KEYS.RECIPE_HISTORY, []),
  favoriteRecipes: getFromStorage<Recipe[]>(STORAGE_KEYS.FAVORITE_RECIPES, []),
  loading: false,
  initialized: false,

  setRecipes: (history, favorites) =>
    set({ recipeHistory: history, favoriteRecipes: favorites }),

  addToHistory: async (recipe) => {
    const user = auth.currentUser;
    const historyItem: RecipeHistory = {
      id: generateUUID(),
      recipe,
      generatedAt: new Date().toISOString(),
    };

    // ローカル更新
    set((state) => {
      const newHistory = [historyItem, ...state.recipeHistory].slice(0, MAX_HISTORY);
      saveToStorage(STORAGE_KEYS.RECIPE_HISTORY, newHistory);
      return { recipeHistory: newHistory };
    });

    // Firestoreに保存
    if (user) {
      try {
        await recipeOperations.add(user.uid, historyItem as any);
      } catch (error) {
        console.error('Failed to add recipe history to Firestore:', error);
      }
    }
  },

  addToFavorites: async (recipe) => {
    const user = auth.currentUser;

    // 重複チェック
    const exists = get().favoriteRecipes.find((fav) => fav.id === recipe.id);
    if (exists) return;

    const favoriteRecipe = { ...recipe, isFavorite: true };

    // ローカル更新
    set((state) => {
      const newFavorites = [favoriteRecipe, ...state.favoriteRecipes];
      saveToStorage(STORAGE_KEYS.FAVORITE_RECIPES, newFavorites);
      return { favoriteRecipes: newFavorites };
    });

    // Firestoreに保存
    if (user) {
      try {
        await recipeOperations.add(user.uid, favoriteRecipe as any);
      } catch (error) {
        console.error('Failed to add favorite recipe to Firestore:', error);
      }
    }
  },

  removeFromFavorites: async (id) => {
    const user = auth.currentUser;

    // ローカル削除
    set((state) => {
      const newFavorites = state.favoriteRecipes.filter((recipe) => recipe.id !== id);
      saveToStorage(STORAGE_KEYS.FAVORITE_RECIPES, newFavorites);
      return { favoriteRecipes: newFavorites };
    });

    // Firestoreから削除
    if (user) {
      try {
        await recipeOperations.delete(user.uid, id);
      } catch (error) {
        console.error('Failed to delete favorite recipe from Firestore:', error);
      }
    }
  },

  isFavorite: (id) => {
    const favorites = get().favoriteRecipes;
    return favorites.some((recipe) => recipe.id === id);
  },

  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      console.log(`[RecipeStore] Syncing data for user: ${user.uid}`);
      const firestoreRecipes = await recipeOperations.getAll(user.uid);

      // レシピデータを履歴とお気に入りに分類
      // （実装簡略化のため、現在は全てお気に入りとして扱う）
      const favorites = firestoreRecipes as unknown as Recipe[];
      const history: RecipeHistory[] = [];

      console.log(`[RecipeStore] Loaded ${favorites.length} recipes from Firestore`);
      set({
        recipeHistory: history,
        favoriteRecipes: favorites,
        loading: false,
        initialized: true
      });
      saveToStorage(STORAGE_KEYS.RECIPE_HISTORY, history);
      saveToStorage(STORAGE_KEYS.FAVORITE_RECIPES, favorites);
    } catch (error) {
      console.error('Failed to sync recipes with Firestore:', error);
      set({ loading: false });
    }
  },
}));
