/**
 * レポート生成ユーティリティ
 */
import type { Intake, Expense } from '../types';
import type { Asset } from '../types/asset';
import type { FixedCost } from '../types/fixedCost';

export interface MonthlyStats {
  year: number;
  month: number;
  intakes: {
    count: number;
    totalCalories: number;
    avgCalories: number;
    totalPrice: number;
  };
  expenses: {
    count: number;
    total: number;
    byCategory: Record<string, number>;
  };
}

export interface MonthlyComparison {
  current: MonthlyStats;
  previous: MonthlyStats;
  changes: {
    intakesCount: number;
    totalCalories: number;
    avgCalories: number;
    totalExpenses: number;
  };
  assets?: {
    total: number;
    breakdown: Record<string, number>;
  };
  fixedCosts?: {
    totalMonthly: number;
    count: number;
  };
}

function filterByMonth<T extends { date: string }>(
  data: T[],
  year: number,
  month: number
): T[] {
  return data.filter((item) => {
    const date = new Date(item.date);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

export function generateMonthlyStats(
  year: number,
  month: number,
  intakes: Intake[],
  expenses: Expense[]
): MonthlyStats {
  const monthlyIntakes = filterByMonth(intakes, year, month);
  const monthlyExpenses = filterByMonth(expenses, year, month);

  const totalCalories = monthlyIntakes.reduce((sum, i) => sum + i.calories, 0);
  const totalIntakePrice = monthlyIntakes.reduce((sum, i) => sum + (i.price || 0), 0);

  const expenseItems = monthlyExpenses.filter(e => e.type === 'expense');
  const totalExpenses = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory: Record<string, number> = {};

  expenseItems.forEach((expense) => {
    expensesByCategory[expense.category] =
      (expensesByCategory[expense.category] || 0) + expense.amount;
  });

  return {
    year,
    month,
    intakes: {
      count: monthlyIntakes.length,
      totalCalories,
      avgCalories: monthlyIntakes.length > 0 ? totalCalories / monthlyIntakes.length : 0,
      totalPrice: totalIntakePrice,
    },
    expenses: {
      count: monthlyExpenses.length,
      total: totalExpenses,
      byCategory: expensesByCategory,
    },
  };
}

export function generateMonthlyComparison(
  currentYear: number,
  currentMonth: number,
  intakes: Intake[],
  expenses: Expense[],
  assets: Asset[] = [],
  fixedCosts: FixedCost[] = []
): MonthlyComparison {
  const current = generateMonthlyStats(currentYear, currentMonth, intakes, expenses);

  let previousYear = currentYear;
  let previousMonth = currentMonth - 1;
  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear -= 1;
  }

  const previous = generateMonthlyStats(previousYear, previousMonth, intakes, expenses);

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // 資産統計
  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);
  const assetsBreakdown: Record<string, number> = {};
  assets.forEach(a => {
    assetsBreakdown[a.type] = (assetsBreakdown[a.type] || 0) + a.amount;
  });

  // 固定費統計 (月額換算)
  const fixedCostsTotal = fixedCosts.reduce((sum, fc) => {
    if (fc.cycle === 'monthly') return sum + fc.amount;
    return sum + Math.round(fc.amount / 12);
  }, 0);

  return {
    current,
    previous,
    changes: {
      intakesCount: calculateChange(current.intakes.count, previous.intakes.count),
      totalCalories: calculateChange(current.intakes.totalCalories, previous.intakes.totalCalories),
      avgCalories: calculateChange(current.intakes.avgCalories, previous.intakes.avgCalories),
      totalExpenses: calculateChange(current.expenses.total, previous.expenses.total),
    },
    assets: {
      total: totalAssets,
      breakdown: assetsBreakdown
    },
    fixedCosts: {
      totalMonthly: fixedCostsTotal,
      count: fixedCosts.length
    }
  };
}

export function generateAIPrompt(comparison: MonthlyComparison): string {
  const { current, previous, changes, assets, fixedCosts } = comparison;

  let assetInfo = '';
  if (assets && assets.total > 0) {
    assetInfo = `
【資産状況】
- 総資産: ¥${assets.total.toLocaleString()}
- 現金・預金: ¥${((assets.breakdown['cash'] || 0) + (assets.breakdown['bank'] || 0)).toLocaleString()}
- 投資・運用: ¥${((assets.breakdown['securities'] || 0) + (assets.breakdown['crypto'] || 0)).toLocaleString()}
`;
  }

  let fixedCostInfo = '';
  if (fixedCosts && fixedCosts.count > 0) {
    fixedCostInfo = `
【固定費（目安）】
- 登録数: ${fixedCosts.count}件
- 月額合計: ¥${fixedCosts.totalMonthly.toLocaleString()}
`;
  }

  return `以下のユーザーの月次健康・家計データを分析し、3〜5つの具体的な改善提案をしてください。

【今月のデータ（${current.year}年${current.month}月）】
- 食事記録: ${current.intakes.count}回
- 総カロリー: ${current.intakes.totalCalories.toLocaleString()}kcal
- 平均カロリー: ${Math.round(current.intakes.avgCalories)}kcal/食
- 食費: ¥${current.intakes.totalPrice.toLocaleString()}
- 総支出: ¥${current.expenses.total.toLocaleString()}
${assetInfo}${fixedCostInfo}
【先月のデータ（${previous.year}年${previous.month}月）】
- 食事記録: ${previous.intakes.count}回
- 総カロリー: ${previous.intakes.totalCalories.toLocaleString()}kcal
- 平均カロリー: ${Math.round(previous.intakes.avgCalories)}kcal/食
- 総支出: ¥${previous.expenses.total.toLocaleString()}

【先月比の変化】
- 食事記録回数: ${changes.intakesCount > 0 ? '+' : ''}${changes.intakesCount.toFixed(1)}%
- 総カロリー: ${changes.totalCalories > 0 ? '+' : ''}${changes.totalCalories.toFixed(1)}%
- 平均カロリー: ${changes.avgCalories > 0 ? '+' : ''}${changes.avgCalories.toFixed(1)}%
- 総支出: ${changes.totalExpenses > 0 ? '+' : ''}${changes.totalExpenses.toFixed(1)}%

【お願い】
1. データの傾向を簡潔に分析してください
2. 健康面での改善提案を2〜3点
3. 家計・資産形成面での改善提案を1〜2点（固定費の見直しや資産運用についても触れてください）
4. 具体的で実行可能なアドバイスをお願いします
5. 日本語で、親しみやすくわかりやすい表現で回答してください`;
}
