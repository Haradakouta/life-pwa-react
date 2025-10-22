/**
 * 支出入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useExpenseStore } from '../../store';
import type { ExpenseCategory } from '../../types';
import { MdAdd, MdCalendarToday } from 'react-icons/md';
import { DatePickerModal } from '../common/DatePickerModal';

export const ExpenseForm: React.FC = () => {
  const { addExpense } = useExpenseStore();
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const categories: Array<{ value: ExpenseCategory; label: string }> = [
    { value: 'food', label: '食費' },
    { value: 'transport', label: '交通費' },
    { value: 'utilities', label: '光熱費' },
    { value: 'entertainment', label: '娯楽' },
    { value: 'health', label: '医療' },
    { value: 'other', label: 'その他' },
  ];

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      alert('正しい金額を入力してください');
      return;
    }

    addExpense({
      category,
      amount: Number(amount),
      memo: memo || undefined,
      date: selectedDate.toISOString(),
    });

    // フォームをリセット
    setAmount('');
    setMemo('');

    alert('支出を記録しました！');
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="card">
      <label>日付</label>
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

      <label>カテゴリ</label>
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

      <label>金額(円)</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="1000"
        min="0"
      />

      <label>メモ（任意）</label>
      <input
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        placeholder="例: 昼食"
      />

      <button className="submit" onClick={handleSubmit}>
        <MdAdd size={20} />
        記録する
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
