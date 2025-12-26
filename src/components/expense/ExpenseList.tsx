/**
 * 収支一覧表示コンポーネント
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExpenseStore } from '../../store';
import { MdDelete, MdCalendarToday } from 'react-icons/md';
import { MonthPickerModal } from '../common/MonthPickerModal';
import { getPredefinedCategoryColor, getColorForCustomCategory } from '../../utils/categoryColors';
import type { Expense, ExpenseCategory } from '../../types';

export const ExpenseList: React.FC = () => {
  const { t } = useTranslation();
  const expenses = useExpenseStore((state) => state.expenses);
  const { deleteExpense } = useExpenseStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');

  const monthlyExpenses = expenses.filter((expense) => {
    const date = new Date(expense.date);
    return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
  });

  const categoryLabels: Record<ExpenseCategory, string> = {
    food: t('expense.categories.food'),
    transport: t('expense.categories.transport'),
    utilities: t('expense.categories.utilities'),
    entertainment: t('expense.categories.entertainment'),
    health: t('expense.categories.health'),
    other: t('expense.categories.other'),
    salary: t('expense.categories.salary'),
    bonus: t('expense.categories.bonus'),
    income_other: t('expense.categories.other'),
  };

  const getCategoryDisplay = (expense: Expense) => {
    if ((expense.category === 'other' || expense.category === 'income_other') && expense.customCategory) {
      return expense.customCategory;
    }
    return categoryLabels[expense.category] || expense.category;
  };

  const getCategoryColor = (expense: Expense) => {
    if ((expense.category === 'other' || expense.category === 'income_other') && expense.customCategory) {
      return getColorForCustomCategory(expense.customCategory);
    }
    return getPredefinedCategoryColor(expense.category);
  };

  const availableCategories = useMemo(() => {
    const base: ExpenseCategory[] =
      typeFilter === 'income'
        ? ['salary', 'bonus', 'income_other']
        : typeFilter === 'expense'
          ? ['food', 'transport', 'utilities', 'entertainment', 'health', 'other']
          : ['food', 'transport', 'utilities', 'entertainment', 'health', 'other', 'salary', 'bonus', 'income_other'];
    return base;
  }, [typeFilter]);

  useEffect(() => {
    if (categoryFilter === 'all') return;
    if (!availableCategories.includes(categoryFilter)) {
      setCategoryFilter('all');
    }
  }, [availableCategories, categoryFilter]);

  const filteredExpenses = useMemo(() => {
    return monthlyExpenses.filter((expense) => {
      if (typeFilter !== 'all' && expense.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;
      return true;
    });
  }, [monthlyExpenses, typeFilter, categoryFilter]);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px' }}>{t('expense.form.type')}</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}>
            <option value="all">{t('common.all')}</option>
            <option value="expense">{t('expense.form.expense')}</option>
            <option value="income">{t('expense.form.income')}</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px' }}>{t('expense.form.category')}</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}>
            <option value="all">{t('common.all')}</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredExpenses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
          {t('expense.list.noData')}
        </p>
      ) : (
        <div className="list">
          {filteredExpenses
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
