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
  createdAt: string; // アカウント作成日
  stats: UserStats;
}

export interface UserStats {
  postCount: number; // 投稿数
  followerCount: number; // フォロワー数
  followingCount: number; // フォロー中の数
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

export interface Follow {
  id: string;
  followerId: string;
  followerName: string;
  followerAvatar?: string;
  followingId: string;
  followingName: string;
  createdAt: string;
}

export interface Follower {
  uid: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  isFollowing: boolean; // 自分がこのユーザーをフォローしているか
}
