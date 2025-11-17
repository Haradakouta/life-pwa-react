/**
 * Dashboard画面コンポーネント
 * React 19の機能を活用したモダンなUI
 */
import React, { useTransition, Suspense } from 'react';
import { SummaryCard } from './SummaryCard';
import { QuickActions } from './QuickActions';
import type { Screen } from '../layout/BottomNav';

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
  const [isPending, startTransition] = useTransition();

  const handleNavigate = React.useCallback((screen: Screen) => {
    startTransition(() => {
      onNavigate(screen);
    });
  }, [onNavigate]);

  return (
    <section className="screen active dashboard-screen">
      <div className="dashboard-header">
        <h2 className="dashboard-title">ホーム</h2>
        <div className="dashboard-subtitle">健康と家計を管理</div>
      </div>
      <Suspense fallback={<SummaryCardSkeleton />}>
        <SummaryCard />
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
