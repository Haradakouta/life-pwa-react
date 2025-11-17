/**
 * サマリーカードコンポーネント
 * React 19のuseDeferredValueを活用した最適化版
 */
import React, { useMemo, useDeferredValue, useState, useEffect } from 'react';
import { useIntakeStore, useExpenseStore, useSettingsStore } from '../../store';
import { MdHealthAndSafety, MdLocalFireDepartment, MdAccountBalanceWallet, MdTrendingUp } from 'react-icons/md';

/**
 * BMIを計算する関数
 */
const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * BMIカテゴリを取得する関数
 */
const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return '低体重';
  if (bmi < 25) return '普通体重';
  if (bmi < 30) return '肥満度1';
  if (bmi < 35) return '肥満度2';
  if (bmi < 40) return '肥満度3';
  return '肥満度4';
};

export const SummaryCard: React.FC = React.memo(() => {
  const { getTotalCaloriesByDate } = useIntakeStore();
  const { getTotalByMonth } = useExpenseStore();
  const { settings } = useSettingsStore();
  const [isVisible, setIsVisible] = useState(false);

  // 今日のカロリー
  const todayCalories = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return getTotalCaloriesByDate(today);
  }, [getTotalCaloriesByDate]);

  // 今月の支出
  const monthExpense = useMemo(() => {
    const now = new Date();
    return getTotalByMonth(now.getFullYear(), now.getMonth() + 1);
  }, [getTotalByMonth]);

  // BMI計算
  const bmi = useMemo(() => {
    if (settings.height && settings.weight) {
      return calculateBMI(settings.height, settings.weight);
    }
    return null;
  }, [settings.height, settings.weight]);

  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // React 19のuseDeferredValueで重い計算を遅延
  const deferredBMI = useDeferredValue(bmi);
  const deferredCalories = useDeferredValue(todayCalories);
  const deferredExpense = useDeferredValue(monthExpense);

  // フェードインアニメーション
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className={`summary-card-modern ${isVisible ? 'visible' : ''}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '16px',
        margin: '16px',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        <div className="summary-row-modern" style={{ margin: 0 }}>
          <div className="summary-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' }}>
            <MdLocalFireDepartment size={18} color="white" />
          </div>
          <div className="summary-content">
            <span className="summary-label-modern" style={{ fontSize: '12px' }}>今日のカロリー</span>
            <span className="summary-value-modern" style={{ color: '#f59e0b', fontSize: '18px' }}>
              {deferredCalories} <span style={{ fontSize: '12px', opacity: 0.7 }}>kcal</span>
            </span>
          </div>
        </div>
        
        <div className="summary-row-modern" style={{ margin: 0 }}>
          <div className="summary-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <MdAccountBalanceWallet size={18} color="white" />
          </div>
          <div className="summary-content">
            <span className="summary-label-modern" style={{ fontSize: '12px' }}>今月の支出</span>
            <span className="summary-value-modern" style={{ color: '#10b981', fontSize: '18px' }}>
              ¥{deferredExpense.toLocaleString()}
            </span>
          </div>
        </div>
        
        {deferredBMI && (
          <div className="summary-row-modern" style={{ margin: 0, gridColumn: '1 / -1' }}>
            <div className="summary-icon-wrapper" style={{ 
              background: deferredBMI >= 18.5 && deferredBMI < 25 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)'
            }}>
              <MdHealthAndSafety size={18} color="white" />
            </div>
            <div className="summary-content">
              <span className="summary-label-modern" style={{ fontSize: '12px' }}>BMI</span>
              <span 
                className="summary-value-modern" 
                style={{ 
                  color: deferredBMI >= 18.5 && deferredBMI < 25 ? '#10b981' : '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '18px'
                }}
              >
                {deferredBMI.toFixed(1)}
                <span style={{ fontSize: '11px', opacity: 0.7, fontWeight: 'normal' }}>
                  ({bmiCategory})
                </span>
                {deferredBMI >= 18.5 && deferredBMI < 25 && (
                  <MdTrendingUp size={14} style={{ opacity: 0.7 }} />
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
