/**
 * ユーザープロフィール型定義
 */

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string; // ユニークID（@username）
  email: string;
  bio?: string; // 自己紹介
  avatarUrl?: string; // プロフィール画像URL
  coverUrl?: string; // カバー画像URL
  websiteUrl?: string; // WebサイトURL
  isPublic: boolean; // 公開/非公開
  pinnedPostId?: string; // ピン留めされた投稿ID（Twitter機能）
  createdAt: string; // アカウント作成日
  stats: UserStats;
}

export interface UserStats {
  postCount: number; // 投稿数
  friendCount: number; // フレンド数
  recipeCount: number; // レシピ投稿数
  likeCount: number; // いいね獲得数
}

export interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  websiteUrl: string;
  isPublic: boolean;
}

export interface Friend {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  status: 'pending_sent' | 'pending_received' | 'accepted';
  initiatedBy: string; // リクエストを送信したユーザーのUID
  createdAt: string;
  acceptedAt?: string;
}
