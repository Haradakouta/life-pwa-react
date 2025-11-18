/**
 * 支出一覧表示コンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExpenseStore } from '../../store';
import { MdDelete, MdCalendarToday } from 'react-icons/md';
import { MonthPickerModal } from '../common/MonthPickerModal';
import { getPredefinedCategoryColor, getColorForCustomCategory } from '../../utils/categoryColors';

export const ExpenseList: React.FC = () => {
  const { t } = useTranslation();
  const { deleteExpense, getExpensesByMonth } = useExpenseStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const monthlyExpenses = getExpensesByMonth(selectedYear, selectedMonth);

  const categoryLabels: Record<string, string> = {
    food: t('expense.categories.food'),
    transport: t('expense.categories.transport'),
    utilities: t('expense.categories.utilities'),
    entertainment: t('expense.categories.entertainment'),
    health: t('expense.categories.health'),
    other: t('expense.categories.other'),
  };

  const getCategoryDisplay = (expense: any) => {
    if (expense.category === 'other' && expense.customCategory) {
      return expense.customCategory;
    }
    return categoryLabels[expense.category];
  };

  const getCategoryColor = (expense: any) => {
    if (expense.category === 'other' && expense.customCategory) {
      return getColorForCustomCategory(expense.customCategory);
    }
    return getPredefinedCategoryColor(expense.category);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('expense.list.deleteConfirm'))) {
      deleteExpense(id);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <div className="card">
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
          marginBottom: '15px',
        }}
      >
        <span>{selectedYear}{t('common.year')} {selectedMonth}{t('common.month')}</span>
        <MdCalendarToday size={20} color="var(--primary)" />
      </button>

      {monthlyExpenses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
          {t('expense.list.noData')}
        </p>
      ) : (
        <div className="list">
          {monthlyExpenses
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((expense) => (
              <div key={expense.id} className="list-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: getCategoryColor(expense),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {getCategoryDisplay(expense)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {formatDate(expense.date)}
                    </span>
                  </div>
                  {expense.memo && (
                    <div style={{ color: 'var(--text)', fontSize: '14px', marginTop: '4px' }}>
                      {expense.memo}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: (expense.type || 'expense') === 'income' ? '#10b981' : 'var(--danger)' }}>
                    {(expense.type || 'expense') === 'income' ? '+' : '-'}¥{formatAmount(expense.amount)}
                  </span>
                  <button
                    className="delete"
                    onClick={() => handleDelete(expense.id)}
                    style={{ padding: '8px' }}
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>
            ))}
        </div>
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
