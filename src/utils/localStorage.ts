/**
 * localStorage管理ユーティリティ
 */

/**
 * localStorageからデータを取得
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`localStorage取得エラー (${key}):`, error);
    return defaultValue;
  }
}

/**
 * localStorageにデータを保存
 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`localStorage保存エラー (${key}):`, error);
  }
}

/**
 * localStorageからデータを削除
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`localStorage削除エラー (${key}):`, error);
  }
}

/**
 * localStorageを全消去
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('localStorage全消去エラー:', error);
  }
}

// ストレージキー定数
export const STORAGE_KEYS = {
  INTAKES: 'intakes',
  EXPENSES: 'expenses',
  STOCKS: 'stocks',
  SHOPPING: 'shopping',
  RECIPE_HISTORY: 'recipeHistory',
  FAVORITE_RECIPES: 'favoriteRecipes',
  SETTINGS: 'settings',
  BADGES: 'app-badges',
  GOALS: 'goals',
  EXERCISES: 'exercises',
} as const;
