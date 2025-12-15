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
import { getUserCollection } from '../../utils/collection';
import { collectionItems } from '../../data/collection';
import type { CollectionItem } from '../../types/collection';
import { getUserNameColor } from '../../utils/cosmetic';
import { getUserProfile } from '../../utils/profile';

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
  const [partnerItem, setPartnerItem] = useState<CollectionItem | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [nameColor, setNameColor] = useState<string | undefined>(undefined);

  // ポイント、パートナー、プロフィール取得
  useEffect(() => {
    if (user) {
      getUserTotalPoints(user.uid).then(setPoints);
      getUserCollection(user.uid).then(col => {
        if (col && col.partnerItemId) {
          const item = collectionItems.find(i => i.id === col.partnerItemId);
          setPartnerItem(item || null);
        }
      });
      getUserProfile(user.uid).then(profile => {
        if (profile) {
          setDisplayName(profile.displayName);
        }
      });
      getUserNameColor(user.uid).then(setNameColor);
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
    <section className="screen active dashboard-screen" style={{ position: 'relative' }}>
      <div className="dashboard-header" style={{ padding: '12px 16px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="dashboard-title" style={{ fontSize: '22px', marginBottom: '2px' }}>
            {t('dashboard.title')}
            {displayName && (
              <span style={{
                marginLeft: '8px',
                fontSize: '16px',
                background: nameColor && nameColor.includes('gradient') ? nameColor : undefined,
                color: nameColor && !nameColor.includes('gradient') ? nameColor : 'inherit',
                WebkitBackgroundClip: nameColor && nameColor.includes('gradient') ? 'text' : undefined,
                WebkitTextFillColor: nameColor && nameColor.includes('gradient') ? 'transparent' : undefined,
              }}>
                {displayName}
              </span>
            )}
          </h2>
          <div className="dashboard-subtitle" style={{ fontSize: '13px' }}>{t('dashboard.subtitle')}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Partner Monster */}
          {partnerItem && (
            <div
              onClick={() => handleNavigate('collection')}
              style={{
                fontSize: '32px',
                cursor: 'pointer',
                animation: 'bounce 2s infinite ease-in-out',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {partnerItem.imageUrl.startsWith('/') ? (
                <img src={partnerItem.imageUrl} alt={partnerItem.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
              ) : (
                partnerItem.imageUrl
              )}
            </div>
          )}

          {points !== null && (
            <div
              onClick={() => handleNavigate('collection')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                cursor: 'pointer'
              }}
            >
              <MdMonetizationOn size={20} color="#F59E0B" />
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#D97706' }}>{points.toLocaleString()}</span>
              <span style={{ fontSize: '0.8rem', color: '#D97706' }}>pt</span>
            </div>
          )}
        </div>
      </div>

      {/* Raid Banner */}
      <div
        onClick={() => handleNavigate('raid')}
        style={{
          margin: '0 16px 16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #2a0845 0%, #6441a5 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          boxShadow: '0 4px 12px rgba(42, 8, 69, 0.3)',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>RAID BATTLE</div>
          <div style={{ fontSize: '18px', fontWeight: 800 }}>BOSS: ジャンクフード・ゴーレム</div>
          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>Click to Battle!</div>
        </div>
        <div style={{ fontSize: '40px', position: 'relative', zIndex: 1 }}>
          🍔
        </div>
        {/* Background Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
        }} />
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
