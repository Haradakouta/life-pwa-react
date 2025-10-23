/**
 * カスタムカテゴリの色を管理するユーティリティ
 */

const PREDEFINED_COLORS = [
  '#3b82f6', // 食費
  '#8b5cf6', // 交通費
  '#10b981', // 光熱費
  '#f59e0b', // 娯楽
  '#ef4444', // 医療
  '#6366f1', // その他（デフォルト）
];

// カスタムカテゴリ用のカラーパレット
const CUSTOM_COLORS = [
  '#ec4899', // ピンク
  '#14b8a6', // ティール
  '#f97316', // オレンジ
  '#a855f7', // パープル
  '#06b6d4', // シアン
  '#84cc16', // ライム
  '#f43f5e', // ローズ
  '#0ea5e9', // スカイブルー
  '#eab308', // イエロー
  '#22c55e', // グリーン
  '#d946ef', // フューシャ
  '#64748b', // スレート
];

// カスタムカテゴリ名から一貫した色を生成する
export const getColorForCustomCategory = (categoryName: string): string => {
  if (!categoryName) {
    return PREDEFINED_COLORS[5]; // デフォルトの「その他」色
  }

  // 文字列のハッシュ値を計算（簡易版）
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // 32bit整数に変換
  }

  // ハッシュ値を使ってカラーパレットからインデックスを選択
  const index = Math.abs(hash) % CUSTOM_COLORS.length;
  return CUSTOM_COLORS[index];
};

// 既定カテゴリの色を取得
export const getPredefinedCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    food: PREDEFINED_COLORS[0],
    transport: PREDEFINED_COLORS[1],
    utilities: PREDEFINED_COLORS[2],
    entertainment: PREDEFINED_COLORS[3],
    health: PREDEFINED_COLORS[4],
    other: PREDEFINED_COLORS[5],
  };
  return colorMap[category] || PREDEFINED_COLORS[5];
};
