/**
 * 買い物リスト入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useShoppingStore } from '../../store';
import { checkHealthWarning } from '../../utils/healthAdvisor';
import { HealthAdvisorModal } from './HealthAdvisorModal';
import type { HealthWarning } from '../../utils/healthAdvisor';

export const ShoppingForm: React.FC = () => {
  const { addItem } = useShoppingStore();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [price, setPrice] = useState('');
  const [healthWarning, setHealthWarning] = useState<HealthWarning | null>(null);
  const [pendingItem, setPendingItem] = useState<{ name: string; quantity: number; price?: number } | null>(null);

  const handleSubmit = () => {
    if (!name) {
      alert('商品名を入力してください');
      return;
    }

    // 健康チェック
    const warning = checkHealthWarning(name);
    if (warning) {
      // 警告があればモーダル表示
      setHealthWarning(warning);
      setPendingItem({ name, quantity: Number(quantity), price: price ? Number(price) : undefined });
      return;
    }

    // 警告なしで追加
    addItemToList(name, Number(quantity), price ? Number(price) : undefined);
  };

  const addItemToList = (itemName: string, itemQuantity: number, itemPrice?: number) => {
    addItem({
      name: itemName,
      quantity: itemQuantity,
      price: itemPrice,
    });

    // フォームをリセット
    setName('');
    setQuantity('1');
    setPrice('');
  };

  const handleCloseModal = () => {
    setHealthWarning(null);
    setPendingItem(null);
  };

  const handleAddAlternative = (alternative: string) => {
    if (pendingItem) {
      addItemToList(alternative, pendingItem.quantity, pendingItem.price);
    }
    handleCloseModal();
  };

  const handleContinueAnyway = () => {
    if (pendingItem) {
      addItemToList(pendingItem.name, pendingItem.quantity, pendingItem.price);
    }
    handleCloseModal();
  };

  return (
    <>
      <div className="card">
        <h3>手動で追加</h3>
        <label>商品名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 牛乳"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <label>数量</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="1"
        />
        <label>価格（任意）</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="例: 300"
        />
        <button className="submit" onClick={handleSubmit}>
          リストに追加
        </button>
      </div>

      {/* 健康アドバイスモーダル */}
      {healthWarning && pendingItem && (
        <HealthAdvisorModal
          productName={pendingItem.name}
          warning={healthWarning}
          onClose={handleCloseModal}
          onAddAlternative={handleAddAlternative}
          onContinueAnyway={handleContinueAnyway}
        />
      )}
    </>
  );
};
