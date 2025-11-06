/**
 * デイリーミッションの型定義
 */
export type MissionType = 
  | 'post'           // 投稿
  | 'like'           // いいね
  | 'comment'        // コメント
  | 'recipe'         // レシピ投稿
  | 'follow'         // フォロー
  | 'repost'         // リポスト
  | 'login'          // ログイン
  | 'intake'         // 食事記録
  | 'expense';       // 支出記録

export interface DailyMission {
  id: string;
  type: MissionType;
  name: string;
  description: string;
  icon: string; // 絵文字またはアイコン名
  target: number; // 目標数
  points: number; // 獲得ポイント
  order: number; // 表示順序
}

export interface MissionProgress {
  missionId: string;
  current: number; // 現在の進捗
  target: number; // 目標値（DailyMissionからコピー）
  completed: boolean; // 完了済みか
  completedAt?: string; // 完了日時（ISO string）
  date: string; // 日付（YYYY-MM-DD形式）
}

export interface UserMissionData {
  userId: string;
  date: string; // YYYY-MM-DD
  missions: MissionProgress[];
  totalPoints: number; // 累計ポイント
  lastResetDate: string; // 最後にリセットした日付
}


