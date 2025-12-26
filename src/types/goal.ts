/**
 * 目標（Goal）の型定義
 */

export type GoalType = 'calorie' | 'budget' | 'weight' | 'exercise';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface Goal {
  id: string;
  userId: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string; // 'kcal', '円', 'kg', '歩', '分' など
  period: GoalPeriod;
  startDate: string; // ISO string
  endDate?: string; // ISO string (custom periodの場合)
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  // 進捗履歴（日次）
  progressHistory?: {
    date: string;
    value: number;
  }[];
}

export interface GoalFormData {
  type: GoalType;
  title: string;
  description?: string;
  targetValue: number;
  unit: string;
  period: GoalPeriod;
  startDate: string;
  endDate?: string;
}

export interface GoalProgress {
  goal: Goal;
  percentage: number;
  remaining: number;
  daysRemaining?: number;
  averageDailyProgress?: number;
  isOnTrack: boolean;
  estimatedCompletionDate?: string;
}

