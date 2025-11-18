/**
 * 支出入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExpenseStore } from '../../store';
import type { ExpenseCategory } from '../../types';
import { MdAdd, MdCalendarToday } from 'react-icons/md';
import { DatePickerModal } from '../common/DatePickerModal';

export const ExpenseForm: React.FC = () => {
  const { t } = useTranslation();
  const { addExpense } = useExpenseStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [customCategory, setCustomCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const expenseCategories: Array<{ value: ExpenseCategory; label: string }> = [
    { value: 'food', label: t('expense.categories.food') },
    { value: 'transport', label: t('expense.categories.transport') },
    { value: 'utilities', label: t('expense.categories.utilities') },
    { value: 'entertainment', label: t('expense.categories.entertainment') },
    { value: 'health', label: t('expense.categories.health') },
    { value: 'other', label: t('expense.categories.other') },
  ];

  const incomeCategories: Array<{ value: ExpenseCategory; label: string }> = [
    { value: 'other', label: t('expense.categories.salary') },
    { value: 'other', label: t('expense.categories.bonus') },
    { value: 'other', label: t('expense.categories.other') },
  ];

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      alert(t('expense.form.amountRequired'));
      return;
    }

    if (category === 'other' && !customCategory.trim()) {
      alert(t('expense.form.customCategoryRequired'));
      return;
    }

    addExpense({
      type,
      category,
      customCategory: category === 'other' ? customCategory.trim() : undefined,
      amount: Number(amount),
      memo: memo || undefined,
      date: selectedDate.toISOString(),
    });

    // フォームをリセット
    setAmount('');
    setMemo('');
    setCustomCategory('');

    alert(type === 'expense' ? t('expense.form.expenseRecorded') : t('expense.form.incomeRecorded'));
  };

  const formatDate = (date: Date) => {
    return t('expense.dateFormat', { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
  };

  return (
    <div className="card">
      <label>{t('expense.form.type')}</label>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={() => {
            setType('expense');
            setCategory('food');
          }}
          style={{
            flex: 1,
            padding: '12px',
            background: type === 'expense' ? 'var(--primary)' : 'var(--background)',
            color: type === 'expense' ? '#fff' : 'var(--text)',
            border: `2px solid ${type === 'expense' ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: type === 'expense' ? 600 : 400,
          }}
        >
          {t('expense.form.expense')}
        </button>
        <button
          onClick={() => {
            setType('income');
            setCategory('other');
            setCustomCategory('');
          }}
          style={{
            flex: 1,
            padding: '12px',
            background: type === 'income' ? 'var(--primary)' : 'var(--background)',
            color: type === 'income' ? '#fff' : 'var(--text)',
            border: `2px solid ${type === 'income' ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: type === 'income' ? 600 : 400,
          }}
        >
          {t('expense.form.income')}
        </button>
      </div>

      <label>{t('expense.form.date')}</label>
      <button
        onClick={() => setIsDatePickerOpen(true)}
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
        <span>{formatDate(selectedDate)}</span>
        <MdCalendarToday size={20} color="var(--primary)" />
      </button>

      <label>{t('expense.form.category')}</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {category === 'other' && (
        <>
          <label>{t('expense.form.customCategory')}</label>
          <input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder={t('expense.form.customCategoryPlaceholder')}
          />
        </>
      )}

      <label>{t('expense.form.amount')}</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="1000"
        min="0"
      />

      <label>{t('expense.form.memo')}</label>
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder={t('expense.form.memoPlaceholder')}
      />

      <button className="submit" onClick={handleSubmit}>
        <MdAdd size={20} />
        {t('expense.form.submit')}
      </button>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        selectedDate={selectedDate}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={setSelectedDate}
      />
    </div>
  );
};
