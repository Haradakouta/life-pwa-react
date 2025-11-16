/**
 * 通知機能の型定義
 */

export type NotificationType =
  | 'like'           // いいね
  | 'comment'        // コメント
  | 'repost'         // リポスト
  | 'quote'          // 引用リポスト
  | 'reply'          // リプライ
  | 'follow'         // フォロー
  | 'friend_request' // フレンドリクエスト
  | 'friend_accept'  // フレンド承認
  | 'mention'        // メンション
  | 'message';       // DM

export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;        // 通知を受け取るユーザーのID
  actorId: string;            // 通知を発生させたユーザーのID
  actorName: string;          // 通知を発生させたユーザーの名前
  actorAvatar?: string;       // 通知を発生させたユーザーのアバター
  postId?: string;            // 関連する投稿のID（投稿関連の通知の場合）
  postContent?: string;       // 関連する投稿の内容（プレビュー用）
  commentId?: string;         // 関連するコメントのID（コメント通知の場合）
  commentContent?: string;    // コメントの内容（プレビュー用）
  isRead: boolean;            // 既読フラグ
  createdAt: string;          // 通知作成日時
}

export interface NotificationGroup {
  type: NotificationType;
  postId?: string;
  actors: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  latestNotification: Notification;
  count: number;
  isRead: boolean;
}
