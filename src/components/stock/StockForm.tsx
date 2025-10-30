/**
 * 在庫入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useStockStore } from '../../store';
import type { StockCategory } from '../../types';

export const StockForm: React.FC = () => {
  const { addStock } = useStockStore();
  const [name, setName] = useState('');
  const [daysRemaining, setDaysRemaining] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<StockCategory>('other');

  const handleSubmit = () => {
    if (!name || !daysRemaining) {
      alert('品目名と残り日数を入力してください');
      return;
    }

    addStock({
      name,
      daysRemaining: Number(daysRemaining),
      quantity: Number(quantity),
      category,
    });

    // フォームをリセット
    setName('');
    setDaysRemaining('');
    setQuantity('1');
    setCategory('other');

    alert('在庫を追加しました！');
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
      <label>残り日数</label>
      <input
        type="number"
        value={daysRemaining}
        onChange={(e) => setDaysRemaining(e.target.value)}
        placeholder="例: 3"
      />
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
    </div>
  );
};
