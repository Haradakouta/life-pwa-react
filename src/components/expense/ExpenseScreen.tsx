/**
 * 家計簿画面コンポーネント
 */
import React from 'react';
import { ExpenseForm } from './ExpenseForm';
import { BudgetProgress } from './BudgetProgress';
import { ExpenseSummary } from './ExpenseSummary';
import { ExpenseList } from './ExpenseList';

export const ExpenseScreen: React.FC = () => {
  return (
    <section className="screen active">
      <h2>家計簿</h2>

      {/* 月次予算と進捗 */}
      <BudgetProgress />

      {/* 支出入力フォーム */}
      <ExpenseForm />

      {/* カテゴリ別集計グラフ */}
      <ExpenseSummary />

      {/* 支出一覧 */}
      <h3>支出履歴</h3>
      <ExpenseList />
    </section>
  );
};
