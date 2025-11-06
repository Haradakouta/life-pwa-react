/**
 * 装飾要素の型定義
 */
export type CosmeticType = 'frame' | 'nameColor' | 'skin';

export interface Cosmetic {
  id: string;
  name: string;
  description: string;
  type: CosmeticType;
  icon: string; // 絵文字またはアイコン名
  price: number; // 必要ポイント
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockCondition?: {
    type: 'points' | 'mission' | 'level';
    value: number;
  };
  data: CosmeticData; // 装飾データ（フレームパス、色コード、スキン設定など）
}

export interface CosmeticData {
  // フレームの場合
  frameUrl?: string;
  frameStyle?: React.CSSProperties;
  
  // 名前色の場合
  color?: string;
  gradient?: string;
  
  // スキンの場合
  skinConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundImage?: string;
    theme?: 'light' | 'dark' | 'custom';
    cssClass?: string; // CSSクラス名
  };
}

export interface UserCosmetic {
  userId: string;
  ownedCosmetics: string[]; // 所有している装飾IDのリスト
  equippedFrame?: string;
  equippedNameColor?: string;
  equippedSkin?: string;
  totalPoints: number; // 現在のポイント
}


