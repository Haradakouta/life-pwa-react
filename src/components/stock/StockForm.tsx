/**
 * 在庫入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockStore } from '../../store';
import type { StockCategory } from '../../types';
import { DatePickerModal } from '../common/DatePickerModal';
import { MdCalendarToday } from 'react-icons/md';

export const StockForm: React.FC = () => {
  const { t } = useTranslation();
  const { addStock } = useStockStore();
  const [name, setName] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // デフォルトは7日後
    return date;
  });
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<StockCategory>('other');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleSubmit = () => {
    if (!name) {
      alert(t('stock.form.itemRequired'));
      return;
    }

    // 賞味期限から残り日数を計算
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    addStock({
      name,
      daysRemaining,
      expiryDate: expiryDate.toISOString(),
      quantity: Number(quantity),
      category,
    });

    // フォームをリセット
    setName('');
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setExpiryDate(defaultDate);
    setQuantity('1');
    setCategory('other');

    alert(t('stock.form.success'));
  };

  const formatDate = (date: Date) => {
    return t('expense.dateFormat', { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
  };

  const categoryOptions = [
    { value: 'staple', label: `🍚 ${t('stock.categories.staple')}` },
    { value: 'protein', label: `🍖 ${t('stock.categories.protein')}` },
    { value: 'vegetable', label: `🥬 ${t('stock.categories.vegetable')}` },
    { value: 'fruit', label: `🍎 ${t('stock.categories.fruit')}` },
    { value: 'dairy', label: `🥛 ${t('stock.categories.dairy')}` },
    { value: 'seasoning', label: `🧂 ${t('stock.categories.seasoning')}` },
    { value: 'other', label: `📦 ${t('stock.categories.other')}` },
  ];

  return (
    <div className="card">
      <h3>{t('stock.form.title')}</h3>
      <label>{t('stock.form.item')}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('stock.form.itemPlaceholder')}
      />
      <label>{t('stock.form.category')}</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as StockCategory)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '2px solid var(--border)',
          fontSize: '16px',
          marginBottom: '16px',
        }}
      >
        {categoryOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label>{t('stock.form.expiryDate')}</label>
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
        <span>{formatDate(expiryDate)}</span>
        <MdCalendarToday size={20} color="var(--primary)" />
      </button>
      <label>{t('stock.form.quantity')}</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="1"
      />
      <button className="submit" onClick={handleSubmit}>
        {t('stock.form.submit')}
      </button>

      <DatePickerModal
        isOpen={isDatePickerOpen}
        selectedDate={expiryDate}
        onClose={() => setIsDatePickerOpen(false)}
        onConfirm={setExpiryDate}
      />
    </div>
  );
};
