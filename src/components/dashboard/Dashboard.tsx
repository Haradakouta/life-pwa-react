/**
 * Dashboard画面コンポーネント
 * React 19の機能を活用したモダンなUI
 */
import React, { useTransition, Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SummaryCard } from './SummaryCard';
import { QuickActions } from './QuickActions';
import type { Screen } from '../layout/BottomNav';
import { getUserTotalPoints } from '../../utils/mission';
import { useAuth } from '../../hooks/useAuth';
import { MdMonetizationOn } from 'react-icons/md';

const GoalsSummary = lazy(() => import('../goals/GoalsSummary').then(m => ({ default: m.GoalsSummary })));

interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}

// スケルトンローダー
const SummaryCardSkeleton: React.FC = () => (
  <div className="summary-box" style={{
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(96, 165, 250, 0.05) 100%)',
    borderRadius: '16px',
    margin: '16px',
    padding: '20px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  }}>
    <div style={{ height: '60px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ height: '20px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', width: '60%' }} />
      <div style={{ height: '20px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', width: '40%' }} />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [points, setPoints] = useState<number | null>(null);

  // ポイント取得
  useEffect(() => {
    if (user) {
      getUserTotalPoints(user.uid).then(setPoints);
    }
  }, [user]);

  // 言語変更を監視して再レンダリング
  useEffect(() => {
    const handleLanguageChange = () => {
      // 強制的に再レンダリング
      startTransition(() => { });
    };

    window.addEventListener('i18n:languageChanged', handleLanguageChange);
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('i18n:languageChanged', handleLanguageChange);
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n, startTransition]);

  const handleNavigate = React.useCallback((screen: Screen) => {
    startTransition(() => {
      onNavigate(screen);
    });
  }, [onNavigate]);

  return (
    <section className="screen active dashboard-screen">
      <div className="dashboard-header" style={{ padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-title" style={{ fontSize: '22px', marginBottom: '2px' }}>{t('dashboard.title')}</h2>
          <div className="dashboard-subtitle" style={{ fontSize: '13px' }}>{t('dashboard.subtitle')}</div>
        </div>
        {points !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(245, 158, 11, 0.1)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <MdMonetizationOn size={20} color="#F59E0B" />
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#D97706' }}>{points.toLocaleString()}</span>
            <span style={{ fontSize: '0.8rem', color: '#D97706' }}>pt</span>
          </div>
        )}
      </div>
      <Suspense fallback={<SummaryCardSkeleton />}>
        <SummaryCard />
      </Suspense>
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>{t('common.loading')}</div>}>
        <GoalsSummary onNavigate={handleNavigate} />
      </Suspense>
      <QuickActions onNavigate={handleNavigate} />
      {isPending && (
        <div className="transition-overlay">
          <div className="transition-spinner" />
        </div>
      )}
    </section>
  );
};
