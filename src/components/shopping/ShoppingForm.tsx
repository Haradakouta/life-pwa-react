/**
 * 買い物リスト入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useShoppingStore } from '../../store';
import { checkHealthWarning } from '../../utils/healthAdvisor';
import { HealthAdvisorModal } from './HealthAdvisorModal';
import type { HealthWarning } from '../../utils/healthAdvisor';

export const ShoppingForm: React.FC = () => {
  const { t } = useTranslation();
  const { addItem } = useShoppingStore();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [healthWarning, setHealthWarning] = useState<HealthWarning | null>(null);
  const [pendingItem, setPendingItem] = useState<{ name: string; quantity: number } | null>(null);

  const handleSubmit = () => {
    if (!name) {
      alert(t('shopping.form.productNameRequired'));
      return;
    }

    // 健康チェック
    const warning = checkHealthWarning(name);
    if (warning) {
      // 警告があればモーダル表示
      setHealthWarning(warning);
      setPendingItem({ name, quantity: Number(quantity) });
      return;
    }

    // 警告なしで追加
    addItemToList(name, Number(quantity));
  };

  const addItemToList = (itemName: string, itemQuantity: number) => {
    addItem({
      name: itemName,
      quantity: itemQuantity,
    });

    // フォームをリセット
    setName('');
    setQuantity('1');
  };

  const handleCloseModal = () => {
    setHealthWarning(null);
    setPendingItem(null);
  };

  const handleAddAlternative = (alternative: string) => {
    if (pendingItem) {
      addItemToList(alternative, pendingItem.quantity);
    }
    handleCloseModal();
  };

  const handleContinueAnyway = () => {
    if (pendingItem) {
      addItemToList(pendingItem.name, pendingItem.quantity);
    }
    handleCloseModal();
  };

  return (
    <>
      <div className="card">
        <h3>{t('shopping.form.title')}</h3>
        <label>{t('shopping.form.productName')}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('shopping.form.productNamePlaceholder')}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <label>{t('shopping.form.quantity')}</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="1"
        />
        <button className="submit" onClick={handleSubmit}>
          {t('shopping.form.submit')}
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
