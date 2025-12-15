/**
 * コレクションシステムの型定義
 */

export type Rarity = 'common' | 'rare' | 'super_rare';

export interface CollectionItem {
    id: string;
    name: string;
    description: string;
    rarity: Rarity;
    imageUrl: string; // 画像URL（生成されるまではプレースホルダー）
}

export interface UserCollectionItem {
    itemId: string;
    count: number;
    obtainedAt: string;
}

export interface UserCollection {
    userId: string;
    items: UserCollectionItem[];
    partnerItemId?: string; // ダッシュボードに表示するパートナー
    iconItemId?: string; // プロフィールアイコンとして使用するアイテム
}
