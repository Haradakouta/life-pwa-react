/**
 * レポート画面コンポーネント
 */
import React from 'react';
import { MonthlyReport } from './MonthlyReport';
import { CalorieChart } from './CalorieChart';
import { ExpenseChart } from './ExpenseChart';
import { ProductRanking } from './ProductRanking';
import { ManufacturerAnalysis } from './ManufacturerAnalysis';

export const ReportScreen: React.FC = () => {
  return (
    <section className="screen active">
      <h2>📊 レポート</h2>

      {/* 月次レポート */}
      <MonthlyReport />

      {/* カロリー推移グラフ */}
      <CalorieChart />

      {/* 支出推移グラフ */}
      <ExpenseChart />

      {/* よく買う商品ランキング */}
      <ProductRanking />

      {/* メーカー別支出分析 */}
      <ManufacturerAnalysis />
    </section>
  );
};
