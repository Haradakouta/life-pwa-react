/**
 * 在庫一覧表示コンポーネント
 */
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockStore, useShoppingStore } from '../../store';
import { MdDelete, MdShoppingCart, MdAdd, MdRemove, MdSearch } from 'react-icons/md';
import type { StockCategory } from '../../types';

type SortOption = 'expiry' | 'name' | 'category';

export const StockList: React.FC = () => {
  const { t } = useTranslation();
  const { stocks, deleteStock, updateStock } = useStockStore();
  const { addItem } = useShoppingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('expiry');
  const [filterCategory, setFilterCategory] = useState<StockCategory | 'all'>('all');

  const handleDelete = (id: string) => {
    if (confirm(t('stock.list.deleteConfirm'))) {
      deleteStock(id);
    }
  };

  const handleAddToShopping = (stockName: string, stockQuantity: number) => {
    addItem({
      name: stockName,
      quantity: stockQuantity,
    });
    alert(t('stock.list.addToShoppingList', { name: stockName }));
  };

  const handleQuantityChange = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity <= 0) {
      if (confirm(t('stock.list.deleteWhenZero'))) {
        deleteStock(id);
      }
    } else {
      updateStock(id, { quantity: newQuantity });
    }
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining <= 0) return '#ef4444'; // 赤
    if (daysRemaining <= 1) return '#f59e0b'; // オレンジ
    if (daysRemaining <= 3) return '#eab308'; // 黄色
    return '#10b981'; // 緑
  };

  const getStatusLabel = (daysRemaining: number) => {
    if (daysRemaining <= 0) return t('stock.list.expiryStatus.expired');
    if (daysRemaining === 1) return t('stock.list.expiryStatus.tomorrow');
    return t('stock.list.expiryStatus.remaining', { days: daysRemaining });
  };

  const getCategoryIcon = (category?: StockCategory) => {
    switch (category) {
      case 'staple':
        return '🍚';
      case 'protein':
        return '🍖';
      case 'vegetable':
        return '🥬';
      case 'fruit':
        return '🍎';
      case 'dairy':
        return '🥛';
      case 'seasoning':
        return '🧂';
      default:
        return '📦';
    }
  };

  const getCategoryLabel = (category?: StockCategory) => {
    return t(`stock.categories.${category || 'other'}`);
  };

  // フィルタリング、検索、並び替え
  const filteredAndSortedStocks = useMemo(() => {
    let result = [...stocks];

    // カテゴリフィルタ
    if (filterCategory !== 'all') {
      result = result.filter((stock) => stock.category === filterCategory);
    }

    // 検索
    if (searchQuery) {
      result = result.filter((stock) =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 並び替え
    result.sort((a, b) => {
      switch (sortBy) {
        case 'expiry':
          return a.daysRemaining - b.daysRemaining;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          const categoryA = a.category || 'other';
          const categoryB = b.category || 'other';
          if (categoryA === categoryB) {
            return a.daysRemaining - b.daysRemaining;
          }
          return categoryA.localeCompare(categoryB);
        default:
          return 0;
      }
    });

    return result;
  }, [stocks, searchQuery, sortBy, filterCategory]);

  return (
    <div className="card">
      <h3>{t('stock.list.title', { count: filteredAndSortedStocks.length })}</h3>

      {/* 検索バー */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <MdSearch
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '20px',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('stock.list.searchPlaceholder')}
          style={{
            width: '100%',
            padding: '12px 12px 12px 40px',
            borderRadius: '8px',
            border: '2px solid var(--border)',
            fontSize: '16px',
          }}
        />
      </div>

      {/* フィルタと並び替え */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            {t('stock.list.category')}
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as StockCategory | 'all')}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '2px solid var(--border)',
              fontSize: '14px',
            }}
          >
            <option value="all">{t('stock.list.allCategories')}</option>
            <option value="staple">🍚 {t('stock.categories.staple')}</option>
            <option value="protein">🍖 {t('stock.categories.protein')}</option>
            <option value="vegetable">🥬 {t('stock.categories.vegetable')}</option>
            <option value="fruit">🍎 {t('stock.categories.fruit')}</option>
            <option value="dairy">🥛 {t('stock.categories.dairy')}</option>
            <option value="seasoning">🧂 {t('stock.categories.seasoning')}</option>
            <option value="other">📦 {t('stock.categories.other')}</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
            {t('stock.list.sortOrder')}
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '2px solid var(--border)',
              fontSize: '14px',
            }}
          >
            <option value="expiry">{t('stock.list.sortOptions.expiry')}</option>
            <option value="name">{t('stock.list.sortOptions.name')}</option>
            <option value="category">{t('stock.list.sortOptions.category')}</option>
          </select>
        </div>
      </div>

      {stocks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
          {t('stock.list.empty')}
        </p>
      ) : filteredAndSortedStocks.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
          {t('stock.list.noResults')}
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredAndSortedStocks.map((stock) => (
            <li
              key={stock.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--background)',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '24px' }}>{getCategoryIcon(stock.category)}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '16px' }}>{stock.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {getCategoryLabel(stock.category)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    color: getStatusColor(stock.daysRemaining),
                    fontWeight: 600,
                    marginBottom: '8px',
                  }}
                >
                  {getStatusLabel(stock.daysRemaining)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleQuantityChange(stock.id, stock.quantity, -1)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <MdRemove size={16} />
                  </button>
                  <span style={{ fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                    x{stock.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(stock.id, stock.quantity, 1)}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <MdAdd size={16} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '12px' }}>
                <button
                  onClick={() => handleAddToShopping(stock.name, stock.quantity)}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={t('stock.list.addToShoppingListTitle')}
                >
                  <MdShoppingCart size={20} />
                </button>
                <button
                  onClick={() => handleDelete(stock.id)}
                  style={{
                    background: 'transparent',
                    border: '2px solid #ef4444',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                  }}
                  title={t('stock.list.deleteTitle')}
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
