/**
 * レイアウトコンポーネント
 */
import React, { useState } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import type { Screen } from './BottomNav';
import { Dashboard } from '../dashboard/Dashboard';
import { MealsScreen } from '../meals/MealsScreen';
import { SettingsScreen } from '../settings/SettingsScreen';
import { StockScreen } from '../stock/StockScreen';
import { ShoppingScreen } from '../shopping/ShoppingScreen';
import { RecipeScreen } from '../recipe/RecipeScreen';
import { BarcodeScreen } from '../barcode/BarcodeScreen';
import { ReportScreen } from '../report/ReportScreen';

export const Layout: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');

  const getScreenTitle = (screen: Screen): string => {
    const titles: Record<Screen, string> = {
      home: '健康家計アプリ',
      meals: '食事記録',
      barcode: 'バーコードスキャン',
      report: 'レポート',
      settings: '設定',
      stock: '在庫管理',
      shopping: '買い物リスト',
      recipe: 'AIレシピ',
    };
    return titles[screen];
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <Dashboard onNavigate={setCurrentScreen} />;
      case 'meals':
        return <MealsScreen />;
      case 'barcode':
        return <BarcodeScreen />;
      case 'report':
        return <ReportScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'stock':
        return <StockScreen />;
      case 'shopping':
        return <ShoppingScreen />;
      case 'recipe':
        return <RecipeScreen />;
      default:
        return <Dashboard onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <>
      <Header title={getScreenTitle(currentScreen)} />
      <main>{renderScreen()}</main>
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </>
  );
};
