/**
 * バッジ（Badge）の型定義
 */

export type BadgeCategory = 'streak' | 'goal' | 'feature' | 'milestone';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: BadgeCategory;
  unlockedAt?: string; // ISO date
  requirement: string; // 達成条件の説明
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirement: string;
  checkCondition: (data: BadgeCheckData) => boolean;
}

export interface BadgeCheckData {
  intakesCount: number;
  expensesCount: number;
  stocksCount: number;
  consecutiveDays: number; // 連続記録日数
  totalCalories: number;
  budgetAchieved: boolean;
  recipesGenerated: number;
  barcodesScanned: number;
}
