/**
 * 設定（Settings）の型定義
 */

export interface Settings {
  monthlyBudget: number; // 月間予算
  darkMode: boolean; // ダークモード
  firstTime: boolean; // 初回起動フラグ（オンボーディング用）
  age?: number; // 年齢（AI健康アドバイスの精度向上用）
  height?: number; // 身長（cm）（AI健康アドバイスの精度向上用）
  weight?: number; // 体重（kg）（AI健康アドバイスの精度向上用）
  savings?: number; // 貯金額（円）
  weightHistory?: WeightRecord[]; // 体重履歴（週次記録用）
  lastWeightInputDate?: string; // 最後に体重を入力した日（ISO形式）
}

export interface WeightRecord {
  date: string; // ISO形式の日付
  weight: number; // 体重（kg）
}

export interface SettingsFormData {
  monthlyBudget: number;
  darkMode: boolean;
}
