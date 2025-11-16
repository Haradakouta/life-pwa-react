/**
 * 食事入力フォームコンポーネント
 */
import React, { useState, useEffect } from 'react';
import { useIntakeStore } from '../../store';
import { CalorieScanner } from './CalorieScanner';

export const MealForm: React.FC = () => {
  const { addIntake } = useIntakeStore();
  const [name, setName] = useState('');
  const [showCalorieScanner, setShowCalorieScanner] = useState(false);

  // 料理名が入力されたら、カロリー計測画面を表示
  useEffect(() => {
    if (name.trim() && !showCalorieScanner) {
      // 少し遅延させて、ユーザーが入力し終わってから表示
      const timer = setTimeout(() => {
        setShowCalorieScanner(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [name, showCalorieScanner]);

  const handleCalorieScanned = async (scannedCalories: number, reasoning: string) => {
    try {
      // 食事記録に料理名とカロリーだけを記録
      await addIntake({
        name: name.trim(),
        calories: scannedCalories,
        price: 0, // 金額は0で記録
        source: 'manual',
      });

      // フォームをリセット
      setName('');
      setShowCalorieScanner(false);

      alert(`食事を記録しました！\n\n${name}\n${scannedCalories} kcal\n\n${reasoning}`);
    } catch (error) {
      console.error('食事記録エラー:', error);
      alert('食事記録に失敗しました');
    }
  };

  const handleCancel = () => {
    setName('');
    setShowCalorieScanner(false);
  };

  return (
    <>
      {!showCalorieScanner ? (
        <div className="card">
          <label>料理名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: カレーライス"
            autoFocus
          />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            料理名を入力すると、カロリー計測画面が表示されます
          </p>
        </div>
      ) : (
        <CalorieScanner
          mealName={name}
          onCalorieScanned={handleCalorieScanned}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};
