/**
 * 運動入力フォームコンポーネント
 */
import React, { useState } from 'react';
import { useExerciseStore } from '../../store';

export const ExerciseForm: React.FC = () => {
  const { addExercise } = useExerciseStore();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('運動名を入力してください');
      return;
    }
    
    if (!duration || Number(duration) <= 0) {
      alert('運動時間を入力してください');
      return;
    }

    try {
      await addExercise({
        name: name.trim(),
        duration: Number(duration),
        calories: calories ? Number(calories) : undefined,
      });

      // フォームをリセット
      setName('');
      setDuration('');
      setCalories('');

      alert('運動を記録しました！');
    } catch (error) {
      console.error('運動記録エラー:', error);
      alert('運動記録に失敗しました');
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
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>運動を記録</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            運動名
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: ランニング、筋トレ、ウォーキング"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
            autoFocus
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            運動時間（分）
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="例: 30"
            min="1"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
            消費カロリー（オプション）
          </label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="例: 200"
            min="0"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              fontSize: '16px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
        >
          記録する
        </button>
      </form>
    </div>
  );
};

