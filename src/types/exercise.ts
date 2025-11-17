/**
 * 運動記録（Exercise）の型定義
 */

export interface Exercise {
  id: string;
  name: string; // 運動名（例: ランニング、筋トレ）
  duration: number; // 運動時間（分）
  calories?: number; // 消費カロリー（オプション）
  date: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt?: string; // ISO date string
}

export interface ExerciseFormData {
  name: string;
  duration: number;
  calories?: number;
  date?: string; // 指定しない場合は現在日時
}

