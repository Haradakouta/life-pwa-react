/**
 * 在庫入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useStockStore } from '../../store';
import type { StockCategory } from '../../types';
import { DatePickerModal } from '../common/DatePickerModal';
import { MdCalendarToday } from 'react-icons/md';

export const StockForm: React.FC = () => {
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
      alert('品目名を入力してください');
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

    alert('在庫を追加しました！');
  };

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const categoryOptions = [
    { value: 'staple', label: '🍚 主食' },
    { value: 'protein', label: '🍖 たんぱく質' },
    { value: 'vegetable', label: '🥬 野菜' },
    { value: 'fruit', label: '🍎 果物' },
    { value: 'dairy', label: '🥛 乳製品' },
    { value: 'seasoning', label: '🧂 調味料' },
    { value: 'other', label: '📦 その他' },
  ];

  return (
    <div className="card">
      <h3>手動で追加</h3>
      <label>品目</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="例: 牛乳"
      />
      <label>カテゴリ</label>
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
      <label>賞味期限</label>
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
      <label>数量</label>
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="1"
      />
      <button className="submit" onClick={handleSubmit}>
        在庫に登録
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
