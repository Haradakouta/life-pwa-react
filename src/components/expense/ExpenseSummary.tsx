/**
 * カテゴリ別支出集計コンポーネント（円グラフ表示）
 */
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useExpenseStore } from '../../store';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ExpenseCategory } from '../../types';
import { MdCalendarToday } from 'react-icons/md';
import { MonthPickerModal } from '../common/MonthPickerModal';
import { getPredefinedCategoryColor, getColorForCustomCategory } from '../../utils/categoryColors';

export const ExpenseSummary: React.FC = () => {
  const { t } = useTranslation();
  const { getTotalByCategory, getExpensesByMonth } = useExpenseStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const categories: Array<{ value: ExpenseCategory; label: string }> = [
    { value: 'food', label: t('expense.categories.food') },
    { value: 'transport', label: t('expense.categories.transport') },
    { value: 'utilities', label: t('expense.categories.utilities') },
    { value: 'entertainment', label: t('expense.categories.entertainment') },
    { value: 'health', label: t('expense.categories.health') },
  ];

  const monthlyExpenses = getExpensesByMonth(selectedYear, selectedMonth);

  // カテゴリ別の合計を取得（カスタムカテゴリを含む）
  const data = useMemo(() => {
    const categoryMap = new Map<string, { name: string; value: number; color: string }>();

    // 既定カテゴリを初期化
    categories.forEach((cat) => {
      const total = getTotalByCategory(cat.value, selectedYear, selectedMonth);
      if (total > 0) {
        categoryMap.set(cat.value, {
          name: cat.label,
          value: total,
          color: getPredefinedCategoryColor(cat.value),
        });
      }
    });

    // カスタムカテゴリを集計
    monthlyExpenses.forEach((expense) => {
      if ((expense.category === 'other' || expense.category === 'income_other') && expense.customCategory && expense.type === 'expense') {
        const key = `custom_${expense.customCategory}`;
        const existing = categoryMap.get(key);
        if (existing) {
          existing.value += expense.amount;
        } else {
          categoryMap.set(key, {
            name: expense.customCategory,
            value: expense.amount,
            color: getColorForCustomCategory(expense.customCategory),
          });
        }
      }
    });

    return Array.from(categoryMap.values());
  }, [selectedYear, selectedMonth, monthlyExpenses, getTotalByCategory]);

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const totalIncome = monthlyExpenses
    .filter((expense) => expense.type === 'income')
    .reduce((sum, expense) => sum + expense.amount, 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '15px' }}>{t('expense.summary.title')}</h3>

      <button
        onClick={() => setIsMonthPickerOpen(true)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--background)',
          color: 'var(--text)',
          border: '2px solid var(--border)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <span>{selectedYear}{t('common.year')} {selectedMonth}{t('common.month')}</span>
        <MdCalendarToday size={20} color="var(--primary)" />
      </button>

      {monthlyExpenses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
          {t('expense.summary.noData')}
        </p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                background: 'var(--background)',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>
                {t('expense.form.income')}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                ¥{formatAmount(totalIncome)}
              </div>
            </div>
            <div
              style={{
                background: 'var(--background)',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>
                {t('expense.summary.totalExpense')}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--danger)' }}>
                ¥{formatAmount(total)}
              </div>
            </div>
          </div>

          {data.length > 0 && (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ¥${formatAmount(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `¥${formatAmount(value)}`}
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ marginTop: '20px' }}>
                {data.map((item, index) => {
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: index < data.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '4px',
                            background: item.color,
                          }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold' }}>¥{formatAmount(item.value)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <MonthPickerModal
        isOpen={isMonthPickerOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onClose={() => setIsMonthPickerOpen(false)}
        onConfirm={handleMonthChange}
      />
    </div>
  );
};
