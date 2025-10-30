/**
 * レシートOCR結果の確認・編集コンポーネント
 */
import React, { useState } from 'react';
import { useExpenseStore, useShoppingStore } from '../../store';
import type { ReceiptItem, ReceiptOCRResult } from '../../api/gemini';
import { MdDelete, MdEdit, MdAdd, MdSave, MdReceipt, MdShoppingCart } from 'react-icons/md';

interface ReceiptResultProps {
  result: ReceiptOCRResult;
  onClose: () => void;
}

export const ReceiptResult: React.FC<ReceiptResultProps> = ({ result, onClose }) => {
  const { addExpense } = useExpenseStore();
  const { addItem } = useShoppingStore();
  const [items, setItems] = useState<ReceiptItem[]>(result.items);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const totalAmount = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const handleEdit = (index: number) => {
    const item = items[index];
    setEditingIndex(index);
    setEditName(item.name);
    setEditPrice(item.price.toString());
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const price = parseInt(editPrice, 10);
    if (isNaN(price) || price <= 0) {
      alert('正しい金額を入力してください');
      return;
    }

    const newItems = [...items];
    newItems[editingIndex] = {
      ...newItems[editingIndex],
      name: editName.trim(),
      price,
    };

    setItems(newItems);
    setEditingIndex(null);
    setEditName('');
    setEditPrice('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditName('');
    setEditPrice('');
  };

  const handleDelete = (index: number) => {
    if (window.confirm('この商品を削除しますか？')) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleAddNew = () => {
    const name = window.prompt('商品名を入力してください');
    if (!name || !name.trim()) return;

    const priceStr = window.prompt('金額を入力してください');
    if (!priceStr) return;

    const price = parseInt(priceStr, 10);
    if (isNaN(price) || price <= 0) {
      alert('正しい金額を入力してください');
      return;
    }

    setItems([...items, { name: name.trim(), price, quantity: 1 }]);
  };

  const handleSaveToExpenses = () => {
    if (items.length === 0) {
      alert('商品が1つもありません');
      return;
    }

    if (!window.confirm(`${items.length}個の商品を家計簿に登録しますか？\n合計金額: ¥${totalAmount.toLocaleString()}`)) {
      return;
    }

    const today = new Date().toISOString();

    // 各商品を支出として登録
    items.forEach((item) => {
      const quantity = item.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        addExpense({
          category: 'food', // デフォルトで食費
          amount: item.price,
          memo: item.name,
          date: result.date || today,
        });
      }
    });

    alert('家計簿に登録しました！');
    onClose();
  };

  const handleSaveToShoppingList = () => {
    if (items.length === 0) {
      alert('商品が1つもありません');
      return;
    }

    if (!window.confirm(`${items.length}個の商品を買い物リストに追加しますか？`)) {
      return;
    }

    // 各商品を買い物リストに追加
    items.forEach((item) => {
      addItem({
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
      });
    });

    alert('買い物リストに追加しました！');
    onClose();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <MdReceipt size={20} />
          レシート内容
        </h3>
        <button
          onClick={handleAddNew}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <MdAdd size={18} />
          追加
        </button>
      </div>

      {/* 店名と日付 */}
      <div
        style={{
          background: 'var(--background)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
        }}
      >
        {result.storeName && (
          <div style={{ marginBottom: '4px' }}>
            <strong>店舗:</strong> {result.storeName}
          </div>
        )}
        {result.date && (
          <div>
            <strong>日付:</strong> {result.date}
          </div>
        )}
      </div>

      {/* 商品リスト */}
      {items.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
          商品が検出されませんでした。「追加」ボタンから手動で追加してください。
        </p>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                borderBottom: index < items.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {editingIndex === index ? (
                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="商品名"
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                    }}
                  />
                  <input
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    type="number"
                    placeholder="金額"
                    style={{
                      width: '80px',
                      padding: '6px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border)',
                      fontSize: '14px',
                    }}
                  />
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    <MdSave size={16} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{item.name}</div>
                    {item.quantity && item.quantity > 1 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        数量: {item.quantity}個
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--danger)' }}>
                      ¥{formatAmount(item.price * (item.quantity || 1))}
                    </span>
                    <button
                      onClick={() => handleEdit(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: 'var(--primary)',
                      }}
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#ef4444',
                      }}
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 合計金額 */}
      <div
        style={{
          background: 'var(--background)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>合計</span>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger)' }}>
          ¥{formatAmount(totalAmount)}
        </span>
      </div>

      {/* アクションボタン */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={handleSaveToShoppingList}
            className="submit"
            disabled={items.length === 0}
            style={{
              opacity: items.length === 0 ? 0.5 : 1,
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <MdShoppingCart size={18} />
            買い物リストに追加
          </button>
          <button
            onClick={handleSaveToExpenses}
            className="submit"
            disabled={items.length === 0}
            style={{
              opacity: items.length === 0 ? 0.5 : 1,
            }}
          >
            家計簿に登録
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'var(--border)',
            color: 'var(--text)',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          キャンセル
        </button>
      </div>

      {/* デバッグ用: 生テキスト表示 */}
      <details style={{ marginTop: '16px' }}>
        <summary style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--text-secondary)' }}>
          OCR生テキストを表示
        </summary>
        <pre
          style={{
            marginTop: '8px',
            padding: '12px',
            background: 'var(--background)',
            borderRadius: '4px',
            fontSize: '11px',
            overflow: 'auto',
            maxHeight: '200px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {result.rawText}
        </pre>
      </details>
    </div>
  );
};
