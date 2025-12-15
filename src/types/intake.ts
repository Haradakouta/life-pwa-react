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
  source?: 'receipt' | 'recipe' | 'manual' | 'stock'; // データの出所（レシート/AIレシピ/手動入力/在庫）
  memo?: string; // AI分析の根拠やメモ
  createdAt: string;
  updatedAt?: string;
}

export interface IntakeFormData {
  name: string;
  calories: number;
  price: number;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  source?: 'receipt' | 'recipe' | 'manual' | 'stock'; // データの出所
  memo?: string; // AI分析の根拠やメモ
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
