/**
 * 月次予算と進捗バー表示コンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExpenseStore } from '../../store';
import { useSettingsStore } from '../../store/useSettingsStore';
import { MdTrendingUp, MdWarning, MdCheckCircle, MdCalendarToday } from 'react-icons/md';
import { MonthPickerModal } from '../common/MonthPickerModal';

export const BudgetProgress: React.FC = () => {
  const { t } = useTranslation();
  const { getTotalByMonth } = useExpenseStore();
  const { settings } = useSettingsStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);

  const monthlyBudget = settings.monthlyBudget ?? 30000;
  const totalExpense = getTotalByMonth(selectedYear, selectedMonth);
  const percentage = (totalExpense / monthlyBudget) * 100;
  const remaining = monthlyBudget - totalExpense;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ja-JP').format(amount);
  };

  // 進捗状態を判定
  const getStatus = () => {
    if (percentage >= 100) {
      return { color: '#ef4444', icon: <MdWarning size={24} />, message: t('expense.budget.status.exceeded') };
    } else if (percentage >= 80) {
      return { color: '#f59e0b', icon: <MdTrendingUp size={24} />, message: t('expense.budget.status.low') };
    } else {
      return { color: '#10b981', icon: <MdCheckCircle size={24} />, message: t('expense.budget.status.onTrack') };
    }
  };

  const status = getStatus();

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '15px' }}>{t('expense.budget.title')}</h3>

      <button
        onClick={() => setIsMonthPickerOpen(true)}
        style={{
          width: '100%',
          padding: '12px',
          background: 'var(--background)',
          color: 'var(--text)',
          border: '2px solid var(--border)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <span>{selectedYear}{t('common.year')} {selectedMonth}{t('common.month')}</span>
        <MdCalendarToday size={20} color="var(--primary)" />
      </button>

      {/* ステータス表示 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '15px',
          background: 'var(--background)',
          borderRadius: '8px',
          marginBottom: '20px',
        }}
      >
        <div style={{ color: status.color }}>{status.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', color: status.color }}>{status.message}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {remaining >= 0 ? t('expense.budget.remaining', { amount: formatAmount(remaining) }) : t('expense.budget.exceeded', { amount: formatAmount(Math.abs(remaining)) })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: status.color }}>
            {percentage.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 進捗バー */}
      <div
        style={{
          background: 'var(--background)',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '40px',
          position: 'relative',
          marginBottom: '15px',
        }}
      >
        <div
          style={{
            background: `linear-gradient(90deg, ${status.color}, ${status.color}dd)`,
            height: '100%',
            width: `${Math.min(percentage, 100)}%`,
            transition: 'width 0.3s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontWeight: 'bold',
            color: percentage > 50 ? 'white' : 'var(--text)',
            fontSize: '14px',
          }}
        >
          ¥{formatAmount(totalExpense)} / ¥{formatAmount(monthlyBudget)}
        </div>
      </div>

      {/* 詳細情報 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div
          style={{
            padding: '12px',
            background: 'var(--background)',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            {t('expense.budget.expense')}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--danger)' }}>
            ¥{formatAmount(totalExpense)}
          </div>
        </div>
        <div
          style={{
            padding: '12px',
            background: 'var(--background)',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            {t('expense.budget.budget')}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
            ¥{formatAmount(monthlyBudget)}
          </div>
        </div>
      </div>

      <MonthPickerModal
        isOpen={isMonthPickerOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onClose={() => setIsMonthPickerOpen(false)}
        onConfirm={handleMonthChange}
      />
    </div>
  );
};
