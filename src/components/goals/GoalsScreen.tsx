/**
 * 目標一覧画面コンポーネント
 * MyFitnessPal/YNABレベルの美しいUI
 */
import React, { useState, useEffect, useTransition, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalStore } from '../../store/useGoalStore';
import { GoalProgressCard } from './GoalProgressCard';
import { GoalSettingScreen } from './GoalSettingScreen';
import { MdAdd, MdFilterList } from 'react-icons/md';
import type { GoalProgress } from '../../types';

type GoalsView = 'list' | 'create' | 'edit';

export const GoalsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { goals, getActiveGoals, getGoalProgress, updateGoalProgress, syncWithFirestore, subscribeToFirestore, initialized } = useGoalStore();
  const [currentView, setCurrentView] = useState<GoalsView>('list');
  const [editingGoalId, setEditingGoalId] = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [isPending, startTransition] = useTransition();
  const [progressMap, setProgressMap] = useState<Record<string, GoalProgress>>({});

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

  // 進捗を定期的に更新
  useEffect(() => {
    const interval = setInterval(() => {
      const activeGoals = getActiveGoals();
      activeGoals.forEach((goal) => {
        updateGoalProgress(goal.id);
      });
    }, 60000); // 1分ごと

    return () => clearInterval(interval);
  }, [goals]);

  // フィルタリング
  const filteredGoals = useMemo(() => {
    let filtered = goals;
    if (filterStatus === 'active') {
      filtered = filtered.filter((g) => g.status === 'active');
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter((g) => g.status === 'completed');
    }
    return filtered.sort((a, b) => {
      // アクティブな目標を優先、その後は作成日順
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [goals, filterStatus]);

  // 目標の進捗を非同期で取得
  useEffect(() => {
    const updateProgresses = async () => {
      const progresses: Record<string, GoalProgress> = {};
      for (const goal of filteredGoals) {
        const progress = await getGoalProgress(goal.id);
        if (progress) {
          progresses[goal.id] = progress;
        }
      }
      setProgressMap(progresses);
    };
    updateProgresses();
  }, [filteredGoals, getGoalProgress]);

  // 統計情報
  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status === 'active').length;
    const completed = goals.filter((g) => g.status === 'completed').length;
    const total = goals.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    return { active, completed, total, completionRate };
  }, [goals]);

  const handleEdit = (goal: { id: string }) => {
    startTransition(() => {
      setEditingGoalId(goal.id);
      setCurrentView('edit');
    });
  };

  const handleDelete = async (goalId: string) => {
    try {
      await useGoalStore.getState().deleteGoal(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert(t('goals.deleteFailed'));
    }
  };

  const handleBack = () => {
    startTransition(() => {
      setCurrentView('list');
      setEditingGoalId(undefined);
    });
  };

  // 目標作成/編集画面
  if (currentView === 'create' || currentView === 'edit') {
    return <GoalSettingScreen onBack={handleBack} editingGoalId={editingGoalId} />;
  }

  // 一覧画面
  return (
    <div style={{ paddingBottom: '80px', background: 'var(--card)', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div
        className="goals-header-modern"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.02) 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {t('goals.title')}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {stats.active}{t('goals.subtitle')}
          </div>
        </div>
        <button
          onClick={() => {
            startTransition(() => {
              setCurrentView('create');
            });
          }}
          className="create-goal-button-modern"
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
            border: 'none',
            borderRadius: '24px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <MdAdd size={20} />
          {t('goals.newGoal')}
        </button>
      </div>

      {/* 統計カード */}
      {stats.total > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '16px 20px',
            background: 'var(--card)',
          }}
        >
          <div
            className="goal-stat-card-modern"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6', marginBottom: '4px' }}>
              {stats.active}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('goals.active')}</div>
          </div>
          <div
            className="goal-stat-card-modern"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
              {stats.completed}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('goals.completed')}</div>
          </div>
          <div
            className="goal-stat-card-modern"
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid rgba(245, 158, 11, 0.2)',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b', marginBottom: '4px' }}>
              {Math.round(stats.completionRate)}%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('goals.completionRate')}</div>
          </div>
        </div>
      )}

      {/* フィルター */}
      {stats.total > 0 && (
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <MdFilterList size={20} color="var(--text-secondary)" />
          {(['all', 'active', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '8px 16px',
                background: filterStatus === status ? 'var(--primary)' : 'var(--background)',
                border: `2px solid ${filterStatus === status ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: filterStatus === status ? 700 : 500,
                color: filterStatus === status ? 'white' : 'var(--text)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (filterStatus !== status) {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (filterStatus !== status) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.background = 'var(--background)';
                }
              }}
            >
              {status === 'all' && t('goals.all')}
              {status === 'active' && t('goals.activeFilter')}
              {status === 'completed' && t('goals.completedFilter')}
            </button>
          ))}
        </div>
      )}

      {/* 目標一覧 */}
      <div style={{ padding: '0 20px', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
        {filteredGoals.length === 0 ? (
          <div
            className="empty-goals-modern"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'fadeInUp 0.5s ease' }}>
              {filterStatus === 'completed' ? '🎉' : filterStatus === 'active' ? '🎯' : '📋'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
              {filterStatus === 'completed'
                ? t('goals.empty.completed')
                : filterStatus === 'active'
                  ? t('goals.empty.active')
                  : t('goals.empty.all')}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>
              {filterStatus === 'active' && t('goals.empty.suggestion')}
            </div>
            {filterStatus === 'active' && (
              <button
                onClick={() => {
                  startTransition(() => {
                    setCurrentView('create');
                  });
                }}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
                }}
              >
                <MdAdd size={20} />
                {t('goals.createGoal')}
              </button>
            )}
          </div>
        ) : (
          <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>{t('common.loading')}</div>}>
            <div>
              {filteredGoals.map((goal, index) => {
                const progress = progressMap[goal.id];
                if (!progress) return null;
                return (
                  <div
                    key={goal.id}
                    style={{
                      animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                    }}
                  >
                    <GoalProgressCard
                      goal={goal}
                      progress={progress}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  </div>
                );
              })}
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
};

