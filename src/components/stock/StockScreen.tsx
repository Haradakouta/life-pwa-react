/**
 * 在庫管理画面コンポーネント
 */
import React from 'react';
import { StockForm } from './StockForm';
import { StockList } from './StockList';
import { ExpiringAlert } from './ExpiringAlert';
import { StockStats } from './StockStats';

export const StockScreen: React.FC = () => {
  return (
    <section className="screen active">
      <h2>在庫管理</h2>
      <ExpiringAlert />
      <StockStats />
      <StockForm />
      <StockList />
    </section>
  );
};
