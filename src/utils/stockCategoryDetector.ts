/**
 * 商品名から在庫カテゴリを自動判定するユーティリティ
 */
import type { StockCategory } from '../types';

/**
 * 商品名からカテゴリを自動判定
 */
export function detectStockCategory(name: string): StockCategory {
  const lowerName = name.toLowerCase();

  // 主食
  const stapleKeywords = [
    '米', 'ご飯', 'ごはん', 'ライス', 'rice',
    'パン', 'bread', '食パン', 'ロールパン',
    'うどん', 'そば', 'ラーメン', 'パスタ', 'スパゲッティ',
    '麺', 'めん', 'そうめん', '冷やし中華',
    '餅', 'もち', 'お餅',
  ];
  if (stapleKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'staple';
  }

  // たんぱく質
  const proteinKeywords = [
    '肉', '鶏', '牛', '豚', 'meat', 'chicken', 'beef', 'pork',
    '魚', 'さば', '鮭', 'まぐろ', 'fish', 'salmon', 'tuna',
    '卵', 'たまご', 'egg',
    '豆腐', 'tofu', '納豆', 'natto',
    'ハム', 'ソーセージ', 'ham', 'sausage',
    'チキン', 'chicken', 'ササミ', 'もも肉',
  ];
  if (proteinKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'protein';
  }

  // 野菜
  const vegetableKeywords = [
    '野菜', 'やさい',
    'キャベツ', 'cabbage', 'レタス', 'lettuce',
    'トマト', 'tomato', 'きゅうり', 'cucumber',
    'にんじん', '人参', 'carrot', '玉ねぎ', 'たまねぎ', 'onion',
    'じゃがいも', 'potato', 'さつまいも', 'sweet potato',
    'ピーマン', 'pepper', 'なす', 'eggplant',
    'ほうれん草', 'spinach', 'ブロッコリー', 'broccoli',
    '白菜', 'hakusai', '大根', 'daikon',
    'きのこ', 'mushroom', 'しいたけ', 'しめじ',
    'もやし', 'bean sprout', 'ねぎ', 'green onion',
  ];
  if (vegetableKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'vegetable';
  }

  // 果物
  const fruitKeywords = [
    '果物', 'くだもの', 'フルーツ', 'fruit',
    'りんご', 'apple', 'みかん', 'mandarin', 'オレンジ', 'orange',
    'バナナ', 'banana', 'いちご', 'strawberry',
    'ぶどう', 'grape', 'もも', 'peach',
    '梨', 'なし', 'pear', 'スイカ', 'watermelon',
  ];
  if (fruitKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'fruit';
  }

  // 乳製品
  const dairyKeywords = [
    '牛乳', 'ミルク', 'milk', '乳',
    'チーズ', 'cheese', 'バター', 'butter',
    'ヨーグルト', 'yogurt', 'ヨーグルト',
    '生クリーム', 'cream', 'クリーム',
  ];
  if (dairyKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'dairy';
  }

  // 調味料
  const seasoningKeywords = [
    '塩', 'salt', 'しょうゆ', '醤油', 'soy sauce',
    'みそ', '味噌', 'miso', '砂糖', 'sugar',
    '酢', 'vinegar', '油', 'oil', 'サラダ油',
    '胡椒', 'こしょう', 'pepper', 'スパイス', 'spice',
    'マヨネーズ', 'mayonnaise', 'ケチャップ', 'ketchup',
    'ソース', 'sauce', 'ドレッシング', 'dressing',
    'だし', '出汁', 'dashi', 'コンソメ', 'consomme',
  ];
  if (seasoningKeywords.some(keyword => lowerName.includes(keyword))) {
    return 'seasoning';
  }

  // デフォルトはその他
  return 'other';
}

