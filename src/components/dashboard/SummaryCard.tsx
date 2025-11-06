/**
 * サマリーカードコンポーネント
 */
import React, { useMemo } from 'react';
import { useIntakeStore, useExpenseStore, useSettingsStore } from '../../store';
import { MdHealthAndSafety } from 'react-icons/md';

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

export const SummaryCard: React.FC = () => {
  const { getTotalCaloriesByDate } = useIntakeStore();
  const { getTotalByMonth } = useExpenseStore();
  const { settings } = useSettingsStore();

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

  return (
    <div className="summary-box">
      <div className="summary-row">
        <span className="summary-label">今日のカロリー</span>
        <span className="summary-value">{todayCalories} kcal</span>
      </div>
      <div className="summary-row">
        <span className="summary-label">今月の支出</span>
        <span className="summary-value positive">¥{monthExpense.toLocaleString()}</span>
      </div>
      {bmi && (
        <div className="summary-row">
          <span className="summary-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MdHealthAndSafety size={16} />
            BMI
          </span>
          <span className="summary-value" style={{ color: bmi >= 18.5 && bmi < 25 ? '#10b981' : '#f59e0b' }}>
            {bmi.toFixed(1)} ({bmiCategory})
          </span>
        </div>
      )}
    </div>
  );
};
