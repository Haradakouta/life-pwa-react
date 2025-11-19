/**
 * 収支（Expense/Income）の型定義
 */
export interface Expense {
  id: string;
  type: 'expense' | 'income'; // 支出 or 収入
  category: ExpenseCategory;
  customCategory?: string; // カテゴリが'other'の時のカスタムカテゴリ名
  amount: number;
  date: string; // ISO 8601形式
  memo?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ExpenseCategory =
  | 'food' // 食費
  | 'transport' // 交通費
  | 'utilities' // 光熱費
  | 'entertainment' // 娯楽
  | 'health' // 医療
  | 'other' // その他（支出）
  | 'salary' // 給与
  | 'bonus' // 賞与
  | 'income_other'; // その他（収入）

export interface ExpenseFormData {
  type: 'expense' | 'income'; // 支出 or 収入
  category: ExpenseCategory;
  customCategory?: string; // カテゴリが'other'の時のカスタムカテゴリ名
  amount: number;
  memo?: string;
  date?: string; // ISO 8601形式
}
