/**
 * 買い物リスト（Shopping）の型定義
 */
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price?: number; // 価格（円）
  checked: boolean;
  category?: ShoppingCategory;
  createdAt: string;
  updatedAt?: string;
}

export type ShoppingCategory =
  | 'staple' // 主食
  | 'protein' // たんぱく質
  | 'vegetable' // 野菜
  | 'fruit' // 果物
  | 'dairy' // 乳製品
  | 'seasoning' // 調味料
  | 'other'; // その他

export interface ShoppingFormData {
  name: string;
  quantity: number;
  price?: number; // 価格（円）
  category?: ShoppingCategory;
}

// 1週間分の定番食材
export interface WeeklyEssentials {
  name: string;
  quantity: number;
  category: ShoppingCategory;
}
