/**
 * 称号（タイトル）システムの型定義
 */

export type TitleCategory = 
  | 'beginner'      // 初心者
  | 'poster'        // 投稿者
  | 'social'        // ソーシャル
  | 'recipe'        // レシピ
  | 'achievement'   // アチーブメント
  | 'special'       // 特別
  | 'prefecture';   // 都道府県

export interface Title {
  id: string;
  name: string;
  description: string;
  category: TitleCategory;
  icon: string; // 絵文字またはアイコン名
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; // レアリティ
  condition: TitleCondition; // 獲得条件
  order: number; // 表示順序
}

export interface TitleCondition {
  type: 
    | 'first_post'              // 初めての投稿
    | 'post_count'              // 投稿数
    | 'like_count'              // いいね数
    | 'follower_count'          // フォロワー数
    | 'following_count'         // フォロー数
    | 'recipe_count'            // レシピ投稿数
    | 'consecutive_days'        // 連続投稿日数
    | 'total_likes'             // 総いいね数
    | 'comment_count'            // コメント数
    | 'repost_count'            // リポスト数
    | 'hashtag_trend'            // トレンドハッシュタグ
    | 'profile_complete'        // プロフィール完成
    | 'veteran'                 // ベテラン（登録から日数）
    | 'popular'                 // 人気（投稿がトレンド入り）
    | 'prefecture'              // 都道府県設定
    | 'prefecture_post'         // 都道府県×投稿
    | 'prefecture_recipe'       // 都道府県×レシピ
    | 'prefecture_like'         // 都道府県×いいね
    | 'prefecture_comment'      // 都道府県×コメント
    | 'prefecture_follower'     // 都道府県×フォロワー
    | 'special';                // 特別（手動付与など）
  threshold?: number; // 閾値（必要回数・日数など）
  prefectureCode?: string; // 都道府県コード（01-47）
  field?: string; // 分野（post, recipe, like, comment, followerなど）
  metadata?: Record<string, any>; // 追加条件
}

export interface UserTitle {
  userId: string;
  titleId: string;
  earnedAt: string; // 獲得日時
  isEquipped: boolean; // 装備中かどうか
}

