/**
 * 買い物リスト画面コンポーネント
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingActions } from './ShoppingActions';
import { ShoppingForm } from './ShoppingForm';
import { ShoppingList } from './ShoppingList';

export const ShoppingScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="screen active">
      <h2>{t('shopping.screen.title')}</h2>
      <ShoppingActions />
      <ShoppingForm />
      <ShoppingList />
    </section>
  );
};
