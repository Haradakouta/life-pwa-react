/**
 * 在庫管理画面コンポーネント
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StockForm } from './StockForm';
import { StockList } from './StockList';
import { ExpiringAlert } from './ExpiringAlert';
import { StockStats } from './StockStats';

export const StockScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="screen active">
      <h2>{t('stock.screen.title')}</h2>
      <ExpiringAlert />
      <StockStats />
      <StockForm />
      <StockList />
    </section>
  );
};
