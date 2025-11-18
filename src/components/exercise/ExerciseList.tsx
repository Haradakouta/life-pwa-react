/**
 * 運動一覧表示コンポーネント
 */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useExerciseStore } from '../../store';
import { MdDelete } from 'react-icons/md';

export const ExerciseList: React.FC = () => {
  const { t } = useTranslation();
  const { exercises, deleteExercise, getTotalDurationByDate } = useExerciseStore();

  // 今日の運動記録
  const todayExercises = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return exercises.filter((exercise) => exercise.date.startsWith(today));
  }, [exercises]);

  // 今日の集計
  const today = new Date().toISOString().split('T')[0];
  const todayDuration = getTotalDurationByDate(today);

  const handleDelete = (id: string) => {
    if (confirm(t('exercise.list.deleteConfirm'))) {
      deleteExercise(id);
    }
  };

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      padding: '20px',
      margin: '16px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>{t('exercise.list.title')}</h3>
      {todayExercises.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
          {t('exercise.list.empty')}
        </p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {todayExercises.map((exercise) => (
              <li
                key={exercise.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{exercise.name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {exercise.duration}{t('exercise.list.minutes')}
                    {exercise.calories && ` · ${exercise.calories} kcal`}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(exercise.id)}
                  className="delete-btn"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MdDelete size={20} />
                </button>
              </li>
            ))}
          </ul>
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '2px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '16px' }}>{t('exercise.list.total')}</span>
            <span style={{ fontWeight: 700, fontSize: '18px', color: '#6366f1' }}>
              {todayDuration}{t('exercise.list.minutes')}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

