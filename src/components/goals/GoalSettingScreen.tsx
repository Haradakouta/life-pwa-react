/**
 * 目標設定画面コンポーネント
 * MyFitnessPal/YNABレベルの直感的なUI
 */
import React, { useState, useEffect, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import type { GoalType, GoalPeriod, GoalFormData } from '../../types';
import { MdArrowBack, MdCheck, MdCalendarToday } from 'react-icons/md';
import { DatePickerModal } from '../common/DatePickerModal';

interface GoalSettingScreenProps {
  onBack: () => void;
  editingGoalId?: string;
}

export const GoalSettingScreen: React.FC<GoalSettingScreenProps> = ({ onBack, editingGoalId }) => {
  const { t } = useTranslation();
  const { goals, addGoal, updateGoal } = useGoalStore();
  const { settings } = useSettingsStore();
  const [isPending, startTransition] = useTransition();

  const editingGoal = editingGoalId ? goals.find((g) => g.id === editingGoalId) : null;

  const [goalType, setGoalType] = useState<GoalType>(editingGoal?.type || 'calorie');
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [description, setDescription] = useState(editingGoal?.description || '');
  const [targetValue, setTargetValue] = useState(editingGoal?.targetValue.toString() || '');
  const [period, setPeriod] = useState<GoalPeriod>(editingGoal?.period || 'daily');
  const [startDate, setStartDate] = useState(editingGoal?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(editingGoal?.endDate || '');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // 目標タイプに応じたデフォルト値と単位
  const goalTypeConfig = {
    calorie: {
      icon: '🔥',
      label: t('goals.setting.calorie.label'),
      unit: t('goals.setting.calorie.unit'),
      defaultTarget: '2000',
      description: t('goals.setting.calorie.description'),
      suggestions: ['1500', '1800', '2000', '2200', '2500'],
    },
    budget: {
      icon: '💰',
      label: t('goals.setting.budget.label'),
      unit: t('goals.setting.budget.unit'),
      defaultTarget: '30000',
      description: t('goals.setting.budget.description'),
      suggestions: ['20000', '30000', '40000', '50000'],
    },
    weight: {
      icon: '⚖️',
      label: t('goals.setting.weight.label'),
      unit: t('goals.setting.weight.unit'),
      defaultTarget: settings.weight ? (settings.weight - 5).toString() : '60',
      description: t('goals.setting.weight.description'),
      suggestions: [],
    },
    exercise: {
      icon: '🏃',
      label: t('goals.setting.exercise.label'),
      unit: t('goals.setting.exercise.unit'),
      defaultTarget: '30',
      description: t('goals.setting.exercise.description'),
      suggestions: ['15', '30', '45', '60'],
    },
  };

  useEffect(() => {
    if (!editingGoal) {
      // 新規作成時はデフォルト値を設定
      const config = goalTypeConfig[goalType];
      if (!targetValue) {
        setTargetValue(config.defaultTarget);
      }
      if (!title) {
        setTitle(config.label);
      }
    }
  }, [goalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !targetValue) {
      alert(t('goals.setting.required'));
      return;
    }

    const goalData: GoalFormData = {
      type: goalType,
      title: title.trim(),
      description: description.trim() || undefined,
      targetValue: Number(targetValue),
      unit: goalTypeConfig[goalType].unit,
      period,
      startDate,
      endDate: period === 'custom' && endDate ? endDate : undefined,
    };

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await addGoal(goalData);
      }
      startTransition(() => {
        onBack();
      });
    } catch (error) {
      console.error('目標の保存に失敗しました:', error);
      alert(t('goals.setting.saveFailed'));
    }
  };

  const config = goalTypeConfig[goalType];

  return (
    <div style={{ paddingBottom: '80px', background: 'var(--card)', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div
        className="goal-setting-header-modern"
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
        <button
          onClick={onBack}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <MdArrowBack size={24} />
        </button>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
          }}
        >
          {editingGoal ? t('goals.setting.editTitle') : t('goals.setting.newTitle')}
        </h2>
        <div style={{ width: '40px' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
        {/* 目標タイプ選択 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
            {t('goals.setting.type')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {(['calorie', 'budget', 'weight', 'exercise'] as GoalType[]).map((type) => {
              const typeConfig = goalTypeConfig[type];
              const isSelected = goalType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGoalType(type)}
                  style={{
                    padding: '16px',
                    background: isSelected
                      ? `linear-gradient(135deg, ${typeConfig.icon === '🔥' ? '#f59e0b' : typeConfig.icon === '💰' ? '#10b981' : typeConfig.icon === '⚖️' ? '#3b82f6' : '#8b5cf6'} 0%, ${typeConfig.icon === '🔥' ? '#ef4444' : typeConfig.icon === '💰' ? '#059669' : typeConfig.icon === '⚖️' ? '#2563eb' : '#7c3aed'} 100%)`
                      : 'var(--background)',
                    border: `2px solid ${isSelected ? 'transparent' : 'var(--border)'}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    color: isSelected ? 'white' : 'var(--text)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: isSelected ? '0 8px 24px rgba(0, 0, 0, 0.15)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.borderColor = 'var(--primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }
                  }}
                >
                  <span style={{ fontSize: '32px' }}>{typeConfig.icon}</span>
                  <span>{typeConfig.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* タイトル */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            {t('goals.setting.titleLabel')}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={config.label}
            required
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--background)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              fontSize: '16px',
              color: 'var(--text)',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 説明（オプション） */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            {t('goals.setting.descriptionLabel')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={config.description}
            rows={3}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--background)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              fontSize: '16px',
              color: 'var(--text)',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 目標値 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            {t('goals.setting.targetValueLabel')} ({config.unit})
          </label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={config.defaultTarget}
            required
            min="1"
            step={goalType === 'weight' ? '0.1' : '1'}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--background)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text)',
              textAlign: 'center',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {config.suggestions.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {config.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setTargetValue(suggestion)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {suggestion} {config.unit}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 期間 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            {t('goals.setting.periodLabel')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {(['daily', 'weekly', 'monthly', 'custom'] as GoalPeriod[]).map((p) => {
              const labels = {
                daily: t('goals.progress.period.day'),
                weekly: t('goals.progress.period.week'),
                monthly: t('goals.progress.period.month'),
                custom: t('goals.progress.period.custom'),
              };
              const isSelected = period === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  style={{
                    padding: '12px',
                    background: isSelected ? 'var(--primary)' : 'var(--background)',
                    border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.background = 'var(--background)';
                    }
                  }}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 開始日 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
            開始日
          </label>
          <button
            type="button"
            onClick={() => setShowStartDatePicker(true)}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--background)',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              fontSize: '16px',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <span>{new Date(startDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <MdCalendarToday size={20} color="var(--primary)" />
          </button>
        </div>

        {/* 終了日（カスタム期間の場合） */}
        {period === 'custom' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '8px' }}>
              終了日
            </label>
            <button
              type="button"
              onClick={() => setShowEndDatePicker(true)}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--background)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                fontSize: '16px',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <span>
                {endDate
                  ? new Date(endDate).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '選択してください'}
              </span>
              <MdCalendarToday size={20} color="var(--primary)" />
            </button>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
            border: 'none',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: 700,
            color: 'white',
            cursor: isPending ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            opacity: isPending ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!isPending) {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPending) {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
            }
          }}
        >
          <MdCheck size={20} />
          {editingGoal ? '更新' : '目標を作成'}
        </button>
      </form>

      {/* 日付ピッカー */}
      {showStartDatePicker && (
        <DatePickerModal
          isOpen={showStartDatePicker}
          selectedDate={new Date(startDate)}
          onClose={() => setShowStartDatePicker(false)}
          onConfirm={(date) => {
            setStartDate(date.toISOString().split('T')[0]);
            setShowStartDatePicker(false);
          }}
        />
      )}
      {showEndDatePicker && (
        <DatePickerModal
          isOpen={showEndDatePicker}
          selectedDate={endDate ? new Date(endDate) : new Date(startDate)}
          onClose={() => setShowEndDatePicker(false)}
          onConfirm={(date) => {
            setEndDate(date.toISOString().split('T')[0]);
            setShowEndDatePicker(false);
          }}
        />
      )}
    </div>
  );
};

