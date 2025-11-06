/**
 * 在庫（Stock）の型定義
 */
export interface Stock {
  id: string;
  name: string;
  quantity: number;
  daysRemaining: number; // 賞味期限までの残り日数
  expiryDate?: string; // 賞味期限（ISO 8601形式）
  price?: number;
  barcode?: string;
  manufacturer?: string;
  category?: StockCategory;
  createdAt: string;
  updatedAt?: string;
}

export type StockCategory =
  | 'staple' // 主食
  | 'protein' // たんぱく質
  | 'vegetable' // 野菜
  | 'fruit' // 果物
  | 'dairy' // 乳製品
  | 'seasoning' // 調味料
  | 'other'; // その他

export interface StockFormData {
  name: string;
  quantity: number;
  daysRemaining: number;
  expiryDate?: string; // 賞味期限（ISO 8601形式）
  price?: number;
  category?: StockCategory;
}
