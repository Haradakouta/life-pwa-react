/**
 * スキャンした商品情報表示・追加コンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntakeStore, useStockStore } from '../../store';
import type { ProductInfo } from '../../types';
import { detectStockCategory } from '../../utils/stockCategoryDetector';
import { MdCheckCircle, MdRestaurant, MdInventory } from 'react-icons/md';

interface ProductDisplayProps {
  product: ProductInfo;
  onAdded: () => void;
  onNavigateToStock?: () => void;
}

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product,
  onAdded,
  onNavigateToStock,
}) => {
  const { t } = useTranslation();
  const { addIntake } = useIntakeStore();
  const { addStock } = useStockStore();

  const [calories, setCalories] = useState('');
  const [price, setPrice] = useState(product.price?.toString() || '');
  const [daysRemaining, setDaysRemaining] = useState('7');

  const handleAddToMeals = () => {
    if (!calories) {
      alert(t('product.addToMeals.caloriesRequired'));
      return;
    }
    if (!price) {
      alert(t('product.addToMeals.priceRequired'));
      return;
    }

    addIntake({
      name: product.name,
      calories: Number(calories),
      price: Number(price),
    });

    alert(t('product.addToMeals.success'));
    onAdded();
  };

  const handleAddToStock = () => {
    if (!daysRemaining) {
      alert(t('product.addToStock.expiryDaysRequired'));
      return;
    }

    addStock({
      name: product.name,
      quantity: 1,
      daysRemaining: Number(daysRemaining),
      price: price ? Number(price) : undefined,
      category: detectStockCategory(product.name),
    });

    if (onNavigateToStock) {
      // 在庫画面に遷移する場合
      onAdded();
      setTimeout(() => {
        onNavigateToStock();
      }, 100);
    } else {
      // 従来通りアラート表示
      alert(t('product.addToStock.success'));
      onAdded();
    }
  };

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MdCheckCircle size={24} color="#10b981" />
        {t('product.productInfo')}
      </h3>

      {/* 商品情報 */}
      <div
        style={{
          background: 'var(--background)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
            {t('product.productName')}
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
            {product.name}
          </div>
        </div>

        {product.manufacturer && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
              {t('product.manufacturer')}
            </div>
            <div style={{ fontWeight: 500 }}>{product.manufacturer}</div>
          </div>
        )}

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
            {t('product.barcode')}
          </div>
          <div style={{ fontFamily: 'monospace', color: '#666' }}>
            {product.barcode}
          </div>
        </div>

        {product.price && (
          <div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>
              {t('product.price')}
            </div>
            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
              ¥{product.price.toLocaleString()}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: product.source === 'rakuten_ichiba' ? '#bf0000' :
                       product.source === 'rakuten_product' ? '#bf0000' :
                       product.source === 'jancode_lookup' ? '#3b82f6' : '#10b981',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 500,
            display: 'inline-block',
          }}
        >
          {product.source === 'rakuten_ichiba' && t('product.source.rakutenIchiba')}
          {product.source === 'rakuten_product' && t('product.source.rakutenProduct')}
          {product.source === 'jancode_lookup' && t('product.source.jancodeLookup')}
          {product.source === 'openfoodfacts' && t('product.source.openfoodfacts')}
          {product.source === 'mock' && t('product.source.mock')}
        </div>
      </div>

      {/* 食事記録に追加 */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MdRestaurant size={18} />
          {t('product.addToMeals.title')}
        </h4>
        <label>{t('product.addToMeals.calories')}</label>
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder={t('product.addToMeals.caloriesPlaceholder')}
        />
        <label>{t('product.addToMeals.price')}</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={t('product.addToMeals.pricePlaceholder')}
        />
        <button
          className="submit"
          onClick={handleAddToMeals}
          style={{ background: '#3b82f6' }}
        >
          {t('product.addToMeals.button')}
        </button>
      </div>

      {/* 在庫管理に追加 */}
      <div>
        <h4 style={{ marginBottom: '12px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <MdInventory size={18} />
          {t('product.addToStock.title')}
        </h4>
        <label>{t('product.addToStock.expiryDays')}</label>
        <input
          type="number"
          value={daysRemaining}
          onChange={(e) => setDaysRemaining(e.target.value)}
          placeholder={t('product.addToStock.expiryDaysPlaceholder')}
        />
        <button
          className="submit"
          onClick={handleAddToStock}
          style={{ background: '#10b981' }}
        >
          {onNavigateToStock ? t('product.addToStock.buttonWithNavigate') : t('product.addToStock.button')}
        </button>
      </div>

      <button
        onClick={onAdded}
        style={{
          marginTop: '16px',
          width: '100%',
          padding: '12px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          cursor: 'pointer',
          color: '#666',
        }}
      >
        {t('product.cancel')}
      </button>
    </div>
  );
};
