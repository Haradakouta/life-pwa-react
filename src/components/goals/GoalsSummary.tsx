/**
 * ダッシュボード用の目標サマリーコンポーネント
 * アクティブな目標の進捗を簡潔に表示
 */
import React, { useMemo, useEffect } from 'react';
import { useGoalStore } from '../../store/useGoalStore';
import { GoalProgressCard } from './GoalProgressCard';
import { MdTrendingUp, MdAdd } from 'react-icons/md';
import type { Screen } from '../layout/BottomNav';

interface GoalsSummaryProps {
  onNavigate: (screen: Screen) => void;
}

export const GoalsSummary: React.FC<GoalsSummaryProps> = ({ onNavigate }) => {
  const { goals, getActiveGoals, getGoalProgress, syncWithFirestore, subscribeToFirestore, initialized } = useGoalStore();

  // 初期化とリアルタイム同期
  useEffect(() => {
    if (!initialized) {
      syncWithFirestore();
    }
    subscribeToFirestore();
    return () => {
      useGoalStore.getState().unsubscribeFromFirestore();
    };
  }, [initialized]);

  // アクティブな目標を最大3つまで取得
  const activeGoals = useMemo(() => {
    return getActiveGoals().slice(0, 3);
  }, [goals]);

  // 目標がない場合の表示
  if (activeGoals.length === 0) {
    return (
      <div
        className="goals-summary-empty-modern"
        style={{
          margin: '16px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
          borderRadius: '20px',
          border: '2px dashed rgba(99, 102, 241, 0.2)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
          目標が設定されていません
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          目標を設定して、健康的な生活を始めましょう
        </div>
        <button
          onClick={() => onNavigate('goals')}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
          }}
        >
          <MdAdd size={18} />
          目標を作成
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: '16px' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            <MdTrendingUp size={20} color="white" />
          </div>
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              目標進捗
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {activeGoals.length}件のアクティブな目標
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate('goals')}
          style={{
            padding: '8px 16px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: 'none',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#6366f1',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          すべて見る
        </button>
      </div>

      {/* 目標カード */}
      <div>
        {activeGoals.map((goal) => {
          const progress = getGoalProgress(goal.id);
          if (!progress) return null;
          return (
            <div key={goal.id} style={{ marginBottom: '12px' }}>
              <GoalProgressCard goal={goal} progress={progress} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

