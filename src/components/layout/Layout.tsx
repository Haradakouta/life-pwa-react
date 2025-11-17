/**
 * レイアウトコンポーネント
 */
import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { Screen } from './BottomNav';

// コード分割: 重いコンポーネントを遅延読み込み
const Dashboard = lazy(() => import('../dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const MealsScreen = lazy(() => import('../meals/MealsScreen').then(m => ({ default: m.MealsScreen })));
const SettingsScreen = lazy(() => import('../settings/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const StockScreen = lazy(() => import('../stock/StockScreen').then(m => ({ default: m.StockScreen })));
const ShoppingScreen = lazy(() => import('../shopping/ShoppingScreen').then(m => ({ default: m.ShoppingScreen })));
const RecipeScreen = lazy(() => import('../recipe/RecipeScreen').then(m => ({ default: m.RecipeScreen })));
const BarcodeScreen = lazy(() => import('../barcode/BarcodeScreen').then(m => ({ default: m.BarcodeScreen })));
const ReportScreen = lazy(() => import('../report/ReportScreen').then(m => ({ default: m.ReportScreen })));
const ExpenseScreen = lazy(() => import('../expense/ExpenseScreen').then(m => ({ default: m.ExpenseScreen })));
const BadgeScreen = lazy(() => import('../badges/BadgeScreen').then(m => ({ default: m.BadgeScreen })));
const SocialScreen = lazy(() => import('../social/SocialScreen').then(m => ({ default: m.SocialScreen })));
const AdminScreen = lazy(() => import('../admin/AdminScreen').then(m => ({ default: m.AdminScreen })));

// ローディングコンポーネント
const ScreenLoader: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
    color: 'var(--text-secondary)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '40px',
        height: '40px',
        margin: '0 auto 12px',
        border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div>読み込み中...</div>
    </div>
  </div>
);

export const Layout: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 画面遷移アニメーション
  useEffect(() => {
    if (prevScreen !== null && prevScreen !== currentScreen) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsTransitioning(false), 300);
      return () => clearTimeout(timer);
    }
    setPrevScreen(currentScreen);
  }, [currentScreen, prevScreen]);

  const getScreenTitle = (screen: Screen): string => {
    const titles: Record<Screen, string> = {
      home: '健康家計アプリ',
      meals: '食事記録',
      barcode: 'バーコードスキャン',
      report: 'レポート',
      social: 'ソーシャル',
      settings: '設定',
      stock: '在庫管理',
      shopping: '買い物リスト',
      recipe: 'AIレシピ',
      expense: '家計簿',
      badges: 'アチーブメント',
      admin: '管理者パネル',
    };
    return titles[screen];
  };

  const handleNavigate = (screen: Screen) => {
    if (screen !== currentScreen) {
      setCurrentScreen(screen);
    }
  };

  const renderScreen = () => {
    const screenProps = {
      onNavigate: handleNavigate,
      onNavigateToStock: () => handleNavigate('stock'),
      onBack: () => handleNavigate('home'),
    };

    switch (currentScreen) {
      case 'home':
        return <Dashboard {...screenProps} />;
      case 'meals':
        return <MealsScreen />;
      case 'barcode':
        return <BarcodeScreen {...screenProps} />;
      case 'report':
        return <ReportScreen />;
      case 'social':
        return <SocialScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'stock':
        return <StockScreen />;
      case 'shopping':
        return <ShoppingScreen />;
      case 'recipe':
        return <RecipeScreen />;
      case 'expense':
        return <ExpenseScreen />;
      case 'badges':
        return <BadgeScreen />;
      case 'admin':
        return <AdminScreen {...screenProps} />;
      default:
        return <Dashboard {...screenProps} />;
    }
  };

  return (
    <>
      <Header title={getScreenTitle(currentScreen)} currentScreen={currentScreen} onNavigate={handleNavigate} />
      <main 
        className={`screen-transition-modern ${isTransitioning ? 'transitioning' : ''}`}
        style={{
          opacity: isTransitioning ? 0.7 : 1,
          transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Suspense fallback={<ScreenLoader />}>
          {renderScreen()}
        </Suspense>
      </main>
      <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
    </>
  );
};
