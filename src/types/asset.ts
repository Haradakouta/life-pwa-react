/**
 * 資産（Asset）の型定義
 */

export type AssetType =
    | 'cash'        // 現金
    | 'bank'        // 銀行口座
    | 'credit_card' // クレジットカード（負債だが資産管理の一部として）
    | 'securities'  // 証券口座
    | 'points'      // ポイント
    | 'crypto'      // 暗号資産
    | 'real_estate' // 不動産
    | 'other';      // その他

export interface Asset {
    id: string;
    title: string;
    type: AssetType;
    amount: number; // 現在の評価額（または残高）

    // 投資用詳細用 (任意)
    code?: string; // 銘柄コード (例: 7203, BTC)
    quantity?: number; // 保有数量
    currentPrice?: number; // 現在値 (単価)
    purchasePrice?: number; // 取得単価 (損益計算用)

    currency?: string; // 通貨 (JPY, USD, etc.)
    memo?: string;
    color?: string; // グラフ表示用の色
    updatedAt: string;
}

export interface AssetFormData {
    title: string;
    type: AssetType;
    amount?: number; // 直接入力の場合

    // 投資用
    code?: string;
    quantity?: number;
    currentPrice?: number;
    purchasePrice?: number;

    currency?: string;
    memo?: string;
    color?: string;
}
