/**
 * 目標進捗カードコンポーネント
 * MyFitnessPal/YNABレベルの美しいUI
 */
import React, { useMemo, useEffect, useState } from 'react';
import type { Goal, GoalProgress } from '../../types';
import { MdCheckCircle, MdTrendingUp, MdTrendingDown, MdWarning, MdCalendarToday, MdEdit, MdDelete } from 'react-icons/md';
import { formatCount } from '../../utils/formatNumber';

interface GoalProgressCardProps {
  goal: Goal;
  progress: GoalProgress;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = React.memo(({ goal, progress, onEdit, onDelete }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayPercentage, setDisplayPercentage] = useState(0);

  // アニメーション効果
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [progress.percentage]);

  // スムーズな進捗バーアニメーション
  useEffect(() => {
    const duration = 800;
    const startTime = Date.now();
    const startValue = displayPercentage;
    const endValue = progress.percentage;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progressValue = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progressValue, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      setDisplayPercentage(currentValue);

      if (progressValue < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [progress.percentage]);

  // 目標タイプに応じたアイコンと色
  const goalConfig = useMemo(() => {
    switch (goal.type) {
      case 'calorie':
        return {
          icon: '🔥',
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          color: '#f59e0b',
        };
      case 'budget':
        return {
          icon: '💰',
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#10b981',
        };
      case 'weight':
        return {
          icon: '⚖️',
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: '#3b82f6',
        };
      case 'exercise':
        return {
          icon: '🏃',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: '#8b5cf6',
        };
      default:
        return {
          icon: '🎯',
          gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: '#6366f1',
        };
    }
  }, [goal.type]);

  // ステータス判定
  const status = useMemo(() => {
    if (progress.percentage >= 100) {
      return {
        icon: <MdCheckCircle size={24} />,
        message: '達成！',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
      };
    } else if (progress.percentage >= 80) {
      return {
        icon: <MdTrendingUp size={24} />,
        message: '順調',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
      };
    } else if (!progress.isOnTrack && progress.percentage < 50) {
      return {
        icon: <MdTrendingDown size={24} />,
        message: 'ペースアップ',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
      };
    } else if (progress.percentage < 30) {
      return {
        icon: <MdWarning size={24} />,
        message: '要努力',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      };
    } else {
      return {
        icon: <MdTrendingUp size={24} />,
        message: '進行中',
        color: goalConfig.color,
        bgColor: `${goalConfig.color}15`,
      };
    }
  }, [progress.percentage, progress.isOnTrack, goalConfig.color]);

  // 期間表示
  const periodLabel = useMemo(() => {
    switch (goal.period) {
      case 'daily':
        return '1日';
      case 'weekly':
        return '1週間';
      case 'monthly':
        return '1ヶ月';
      case 'custom':
        if (goal.endDate) {
          const endDate = new Date(goal.endDate);
          const today = new Date();
          const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return `${daysRemaining}日間`;
        }
        return 'カスタム';
      default:
        return '';
    }
  }, [goal.period, goal.endDate]);

  return (
    <div
      className="goal-progress-card-modern"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: `2px solid ${goalConfig.color}20`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* 背景グラデーション */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: goalConfig.gradient,
          opacity: progress.percentage >= 100 ? 1 : 0.6,
        }}
      />

      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: goalConfig.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: `0 4px 12px ${goalConfig.color}40`,
              }}
            >
              {goalConfig.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: '4px',
                }}
              >
                {goal.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <MdCalendarToday size={14} />
                <span>{periodLabel}</span>
              </div>
            </div>
          </div>
          {goal.description && (
            <p style={{ margin: '8px 0 0 60px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {goal.description}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <MdEdit size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm('この目標を削除しますか？')) {
                  onDelete(goal.id);
                }
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <MdDelete size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 進捗表示 */}
      <div style={{ marginBottom: '16px' }}>
        {/* 円形プログレス（MyFitnessPal風） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
              {/* 背景円 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="rgba(0, 0, 0, 0.1)"
                strokeWidth="8"
              />
              {/* 進捗円 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={goalConfig.color}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - displayPercentage / 100)}`}
                style={{
                  transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter: progress.percentage >= 100 ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' : 'none',
                }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: goalConfig.color,
                  lineHeight: '1.2',
                }}
              >
                {Math.round(displayPercentage)}%
              </div>
            </div>
          </div>

          {/* 数値情報 */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ color: status.color }}>{status.icon}</div>
              <span style={{ fontSize: '16px', fontWeight: 600, color: status.color }}>{status.message}</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              現在: <strong style={{ color: 'var(--text)', fontSize: '16px' }}>
                {formatCount(goal.currentValue)} {goal.unit}
              </strong>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              目標: <strong style={{ color: goalConfig.color, fontSize: '16px' }}>
                {formatCount(goal.targetValue)} {goal.unit}
              </strong>
            </div>
            {progress.remaining > 0 && (
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                残り: <strong style={{ color: goalConfig.color }}>
                  {formatCount(progress.remaining)} {goal.unit}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* プログレスバー（YNAB風） */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            height: '12px',
            position: 'relative',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              background: goalConfig.gradient,
              height: '100%',
              width: `${Math.min(displayPercentage, 100)}%`,
              borderRadius: '12px',
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: progress.percentage >= 100 ? `0 0 12px ${goalConfig.color}60` : 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isAnimating && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                  animation: 'shimmer 1.5s infinite',
                }}
              />
            )}
          </div>
        </div>

        {/* 詳細情報 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          {progress.daysRemaining !== undefined && (
            <div
              style={{
                padding: '12px',
                background: status.bgColor,
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>残り日数</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: status.color }}>
                {progress.daysRemaining}日
              </div>
            </div>
          )}
          {progress.averageDailyProgress !== undefined && (
            <div
              style={{
                padding: '12px',
                background: status.bgColor,
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>1日平均</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: status.color }}>
                {formatCount(Math.round(progress.averageDailyProgress))} {goal.unit}
              </div>
            </div>
          )}
          {progress.estimatedCompletionDate && (
            <div
              style={{
                padding: '12px',
                background: status.bgColor,
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>予測達成日</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: status.color }}>
                {new Date(progress.estimatedCompletionDate).toLocaleDateString('ja-JP', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
});

