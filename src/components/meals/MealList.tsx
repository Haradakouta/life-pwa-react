/**
 * 食事一覧表示コンポーネント
 */
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntakeStore } from '../../store';
import { MdDelete } from 'react-icons/md';

export const MealList: React.FC = () => {
  const { t } = useTranslation();
  const { intakes, deleteIntake, getTotalCaloriesByDate, getTotalPriceByDate } =
    useIntakeStore();

  // 今日の食事記録
  const todayIntakes = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return intakes.filter((intake) => intake.date.startsWith(today));
  }, [intakes]);

  // 今日の集計
  const today = new Date().toISOString().split('T')[0];
  const todayCalories = getTotalCaloriesByDate(today);
  const todayPrice = getTotalPriceByDate(today);

  const handleDelete = (id: string) => {
    if (confirm(t('meals.list.deleteConfirm'))) {
      deleteIntake(id);
    }
  };

  return (
    <div className="card">
      <h3>{t('meals.list.title')}</h3>
      {todayIntakes.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          {t('meals.list.empty')}
        </p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {todayIntakes.map((intake) => (
              <li
                key={intake.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>{intake.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {intake.calories} kcal · ¥{intake.price}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(intake.id)}
                  className="delete-btn"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '18px',
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
              padding: '12px',
              background: 'var(--card)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>
              <strong>{t('meals.list.totalCalories', { calories: todayCalories })}</strong>
            </span>
            <span>
              <strong>{t('meals.list.totalPrice', { price: todayPrice })}</strong>
            </span>
          </div>
        </>
      )}
    </div>
  );
};
