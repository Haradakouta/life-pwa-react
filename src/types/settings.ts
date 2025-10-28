/**
 * 設定（Settings）の型定義
 */

export interface Settings {
  monthlyBudget: number; // 月間予算
  darkMode: boolean; // ダークモード
  firstTime: boolean; // 初回起動フラグ（オンボーディング用）
}

export interface SettingsFormData {
  monthlyBudget: number;
  darkMode: boolean;
}
