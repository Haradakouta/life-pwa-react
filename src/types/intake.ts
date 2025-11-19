/**
 * 食事記録（Intake）の型定義
 */
export interface Intake {
  id: string;
  name: string;
  calories: number;
  price: number;
  date: string; // ISO 8601形式
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  barcode?: string; // バーコード情報
  manufacturer?: string; // メーカー名
  source?: 'receipt' | 'recipe' | 'manual'; // データの出所（レシート/AIレシピ/手動入力）
  createdAt: string;
  updatedAt?: string;
}

export interface IntakeFormData {
  name: string;
  calories: number;
  price: number;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source?: 'receipt' | 'recipe' | 'manual' | 'stock'; // データの出所
}

export interface MealTemplate {
  id: string;
  name: string;
  calories: number;
  price: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MealTemplateFormData {
  name: string;
  calories: number;
  price: number;
}
