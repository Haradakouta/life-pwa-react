/**
 * ボトムナビゲーションコンポーネント
 */
import React from 'react';
import { FiHome, FiCamera, FiBarChart2, FiSettings } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';

export type Screen = 'home' | 'meals' | 'barcode' | 'report' | 'settings' | 'stock' | 'shopping' | 'recipe' | 'expense' | 'badges';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems: Array<{ screen: Screen; icon: React.ReactNode; label: string }> = [
    { screen: 'home', icon: <FiHome size={24} />, label: 'ホーム' },
    { screen: 'meals', icon: <MdRestaurant size={24} />, label: '食事' },
    { screen: 'barcode', icon: <FiCamera size={24} />, label: 'スキャン' },
    { screen: 'report', icon: <FiBarChart2 size={24} />, label: 'レポート' },
    { screen: 'settings', icon: <FiSettings size={24} />, label: '設定' },
  ];

  return (
    <nav id="bottomNav">
      {navItems.map((item) => (
        <button
          key={item.screen}
          className={`nav-item ${currentScreen === item.screen ? 'active' : ''}`}
          onClick={() => onNavigate(item.screen)}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};
