/**
 * 運動記録画面コンポーネント
 */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ExerciseForm } from './ExerciseForm';
import { ExerciseList } from './ExerciseList';
import { useExerciseStore } from '../../store';

export const ExerciseScreen: React.FC = () => {
  const { t } = useTranslation();
  const { syncWithFirestore, subscribeToFirestore, initialized } = useExerciseStore();

  // 初期化とリアルタイム同期
  useEffect(() => {
    if (!initialized) {
      syncWithFirestore();
    }
    subscribeToFirestore();
    return () => {
      useExerciseStore.getState().unsubscribeFromFirestore();
    };
  }, [initialized]);

  return (
    <section className="screen active">
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>{t('exercise.title')}</h2>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {t('exercise.subtitle')}
        </div>
      </div>
      <ExerciseForm />
      <ExerciseList />
    </section>
  );
};

