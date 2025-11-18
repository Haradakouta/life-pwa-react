/**
 * 食事記録画面コンポーネント
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MealForm } from './MealForm';
import { MealList } from './MealList';

export const MealsScreen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="screen active">
      <h2>{t('meals.screen.title')}</h2>
      <MealForm />
      <MealList />
    </section>
  );
};
