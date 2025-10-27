/**
 * レポート生成ユーティリティ
 */
import type { Intake, Expense } from '../types';

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
    intakesCount: number; // %
    totalCalories: number; // %
    avgCalories: number; // %
    totalExpenses: number; // %
  };
}

/**
 * 指定月のデータをフィルター
 */
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

/**
 * 月次統計を生成
 */
export function generateMonthlyStats(
  year: number,
  month: number,
  intakes: Intake[],
  expenses: Expense[]
): MonthlyStats {
  const monthlyIntakes = filterByMonth(intakes, year, month);
  const monthlyExpenses = filterByMonth(expenses, year, month);

  // 食事統計
  const totalCalories = monthlyIntakes.reduce((sum, i) => sum + i.calories, 0);
  const totalIntakePrice = monthlyIntakes.reduce((sum, i) => sum + (i.price || 0), 0);

  // 支出統計
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory: Record<string, number> = {};

  monthlyExpenses.forEach((expense) => {
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

/**
 * 先月との比較データを生成
 */
export function generateMonthlyComparison(
  currentYear: number,
  currentMonth: number,
  intakes: Intake[],
  expenses: Expense[]
): MonthlyComparison {
  const current = generateMonthlyStats(currentYear, currentMonth, intakes, expenses);

  // 先月の年月を計算
  let previousYear = currentYear;
  let previousMonth = currentMonth - 1;
  if (previousMonth === 0) {
    previousMonth = 12;
    previousYear -= 1;
  }

  const previous = generateMonthlyStats(previousYear, previousMonth, intakes, expenses);

  // 変化率を計算（%）
  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  return {
    current,
    previous,
    changes: {
      intakesCount: calculateChange(current.intakes.count, previous.intakes.count),
      totalCalories: calculateChange(current.intakes.totalCalories, previous.intakes.totalCalories),
      avgCalories: calculateChange(current.intakes.avgCalories, previous.intakes.avgCalories),
      totalExpenses: calculateChange(current.expenses.total, previous.expenses.total),
    },
  };
}

/**
 * AI改善提案用のプロンプトを生成
 */
export function generateAIPrompt(comparison: MonthlyComparison): string {
  const { current, previous, changes } = comparison;

  return `以下のユーザーの月次健康・家計データを分析し、3〜5つの具体的な改善提案をしてください。

【今月のデータ（${current.year}年${current.month}月）】
- 食事記録: ${current.intakes.count}回
- 総カロリー: ${current.intakes.totalCalories.toLocaleString()}kcal
- 平均カロリー: ${Math.round(current.intakes.avgCalories)}kcal/食
- 食費: ¥${current.intakes.totalPrice.toLocaleString()}
- 総支出: ¥${current.expenses.total.toLocaleString()}

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
3. 家計面での改善提案を1〜2点
4. 具体的で実行可能なアドバイスをお願いします
5. 日本語で、親しみやすくわかりやすい表現で回答してください`;
}
