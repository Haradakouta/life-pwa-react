/**
 * 在庫統計情報表示コンポーネント
 */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockStore } from '../../store';
import type { StockCategory } from '../../types';

export const StockStats: React.FC = () => {
  const { t } = useTranslation();
  const { stocks } = useStockStore();

  const stats = useMemo(() => {
    const categoryCount: Record<StockCategory | 'other', number> = {
      staple: 0,
      protein: 0,
      vegetable: 0,
      fruit: 0,
      dairy: 0,
      seasoning: 0,
      other: 0,
    };

    const expiryStats = {
      expired: 0, // 期限切れ
      today: 0, // 今日期限
      tomorrow: 0, // 明日期限
      soon: 0, // 3日以内
      safe: 0, // 4日以上
    };

    let totalQuantity = 0;

    stocks.forEach((stock) => {
      const category = stock.category || 'other';
      categoryCount[category] += stock.quantity;
      totalQuantity += stock.quantity;

      if (stock.daysRemaining <= 0) {
        expiryStats.expired++;
      } else if (stock.daysRemaining === 0) {
        expiryStats.today++;
      } else if (stock.daysRemaining === 1) {
        expiryStats.tomorrow++;
      } else if (stock.daysRemaining <= 3) {
        expiryStats.soon++;
      } else {
        expiryStats.safe++;
      }
    });

    return { categoryCount, expiryStats, totalQuantity };
  }, [stocks]);

  const getCategoryIcon = (category: StockCategory | 'other') => {
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

  const getCategoryLabel = (category: StockCategory | 'other') => {
    return t(`stock.categories.${category}`);
  };

  if (stocks.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3>{t('stock.stats.title')}</h3>

      {/* 総在庫数 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '16px',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '0.9rem', marginBottom: '8px', opacity: 0.9 }}>{t('stock.stats.totalStock')}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
          {stats.totalQuantity}
          <span style={{ fontSize: '1.2rem', marginLeft: '8px' }}>{t('stock.stats.items')}</span>
        </div>
        <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>
          {stocks.length}{t('stock.stats.types')}
        </div>
      </div>

      {/* カテゴリ別統計 */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>{t('stock.stats.byCategory')}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {(Object.keys(stats.categoryCount) as (StockCategory | 'other')[]).map((category) => {
            const count = stats.categoryCount[category];
            if (count === 0) return null;
            return (
              <div
                key={category}
                style={{
                  background: 'var(--background)',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{getCategoryIcon(category)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {getCategoryLabel(category)}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{count}個</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 期限別統計 */}
      <div>
        <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>{t('stock.stats.byExpiry')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {stats.expiryStats.expired > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: '6px',
                border: '2px solid #ef4444',
              }}
            >
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{t('stock.stats.expired')}</span>
              <span style={{ fontWeight: 'bold', color: '#ef4444' }}>
                {stats.expiryStats.expired}{t('stock.stats.items')}
              </span>
            </div>
          )}
          {stats.expiryStats.today > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#fff7ed',
                borderRadius: '6px',
                border: '2px solid #f59e0b',
              }}
            >
              <span style={{ color: '#f59e0b', fontWeight: 600 }}>{t('stock.stats.today')}</span>
              <span style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.expiryStats.today}{t('stock.stats.items')}
              </span>
            </div>
          )}
          {stats.expiryStats.tomorrow > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#fefce8',
                borderRadius: '6px',
                border: '2px solid #eab308',
              }}
            >
              <span style={{ color: '#eab308', fontWeight: 600 }}>{t('stock.stats.tomorrow')}</span>
              <span style={{ fontWeight: 'bold', color: '#eab308' }}>
                {stats.expiryStats.tomorrow}{t('stock.stats.items')}
              </span>
            </div>
          )}
          {stats.expiryStats.soon > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: 'var(--background)',
                borderRadius: '6px',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{t('stock.stats.soon')}</span>
              <span style={{ fontWeight: 'bold' }}>{stats.expiryStats.soon}{t('stock.stats.items')}</span>
            </div>
          )}
          {stats.expiryStats.safe > 0 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#f0fdf4',
                borderRadius: '6px',
              }}
            >
              <span style={{ color: '#10b981', fontWeight: 600 }}>{t('stock.stats.safe')}</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                {stats.expiryStats.safe}{t('stock.stats.items')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
