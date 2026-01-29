/**
 * お問い合わせの型定義
 */
export interface Inquiry {
    id: string;
    userId: string;
    userEmail: string;
    subject: string;
    body: string;
    createdAt: string; // ISO 8601
    status: 'open' | 'replied' | 'closed';
    reply?: string;
    replyAt?: string;
    isRead: boolean; // ユーザーが返信を読んだかどうか
}
