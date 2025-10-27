/**
 * バッジの定義リスト
 */
import type { BadgeDefinition } from '../types';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // 🔥 連続記録系
  {
    id: 'streak-3',
    name: '3日連続記録',
    description: '3日間連続で食事を記録しました',
    icon: '🔥',
    category: 'streak',
    requirement: '3日間連続で食事記録',
    checkCondition: (data) => data.consecutiveDays >= 3,
  },
  {
    id: 'streak-7',
    name: '1週間継続',
    description: '7日間連続で食事を記録しました',
    icon: '🎯',
    category: 'streak',
    requirement: '7日間連続で食事記録',
    checkCondition: (data) => data.consecutiveDays >= 7,
  },
  {
    id: 'streak-14',
    name: '2週間チャンピオン',
    description: '14日間連続で食事を記録しました',
    icon: '🏆',
    category: 'streak',
    requirement: '14日間連続で食事記録',
    checkCondition: (data) => data.consecutiveDays >= 14,
  },
  {
    id: 'streak-30',
    name: '1ヶ月マスター',
    description: '30日間連続で食事を記録しました',
    icon: '👑',
    category: 'streak',
    requirement: '30日間連続で食事記録',
    checkCondition: (data) => data.consecutiveDays >= 30,
  },

  // 📊 マイルストーン系
  {
    id: 'milestone-10-intakes',
    name: '記録の第一歩',
    description: '食事記録が10件に達しました',
    icon: '📝',
    category: 'milestone',
    requirement: '食事記録10件',
    checkCondition: (data) => data.intakesCount >= 10,
  },
  {
    id: 'milestone-50-intakes',
    name: '記録マスター',
    description: '食事記録が50件に達しました',
    icon: '📚',
    category: 'milestone',
    requirement: '食事記録50件',
    checkCondition: (data) => data.intakesCount >= 50,
  },
  {
    id: 'milestone-100-intakes',
    name: '記録の達人',
    description: '食事記録が100件に達しました',
    icon: '🎓',
    category: 'milestone',
    requirement: '食事記録100件',
    checkCondition: (data) => data.intakesCount >= 100,
  },

  // 💰 予算管理系
  {
    id: 'goal-budget-first',
    name: '節約家デビュー',
    description: '先月の支出が予算内に収まりました！',
    icon: '💰',
    category: 'goal',
    requirement: '月次予算達成（毎月1日に先月分を判定）',
    checkCondition: (data) => data.budgetAchieved,
  },

  // 🍽️ 機能活用系
  {
    id: 'feature-recipe-first',
    name: 'AIシェフデビュー',
    description: '初めてAIレシピを生成しました',
    icon: '👨‍🍳',
    category: 'feature',
    requirement: 'AIレシピ生成1回',
    checkCondition: (data) => data.recipesGenerated >= 1,
  },
  {
    id: 'feature-recipe-10',
    name: 'レシピマスター',
    description: 'AIレシピを10回生成しました',
    icon: '🍳',
    category: 'feature',
    requirement: 'AIレシピ生成10回',
    checkCondition: (data) => data.recipesGenerated >= 10,
  },
  {
    id: 'feature-barcode-first',
    name: 'スキャナーデビュー',
    description: '初めてバーコードをスキャンしました',
    icon: '📱',
    category: 'feature',
    requirement: 'バーコードスキャン1回',
    checkCondition: (data) => data.barcodesScanned >= 1,
  },
  {
    id: 'feature-barcode-10',
    name: 'スキャンマスター',
    description: 'バーコードを10回スキャンしました',
    icon: '🔍',
    category: 'feature',
    requirement: 'バーコードスキャン10回',
    checkCondition: (data) => data.barcodesScanned >= 10,
  },

  // 🌟 特別な達成
  {
    id: 'milestone-all-features',
    name: 'フル活用マスター',
    description: 'すべての機能を使いこなしています',
    icon: '⭐',
    category: 'milestone',
    requirement: '全機能の使用',
    checkCondition: (data) =>
      data.intakesCount >= 5 &&
      data.expensesCount >= 5 &&
      data.stocksCount >= 3 &&
      data.recipesGenerated >= 1 &&
      data.barcodesScanned >= 1,
  },
];

/**
 * バッジIDからバッジ定義を取得
 */
export function getBadgeDefinition(id: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((badge) => badge.id === id);
}

/**
 * カテゴリ別にバッジ定義を取得
 */
export function getBadgesByCategory(category: string): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((badge) => badge.category === category);
}
