/**
 * クイックアクションコンポーネント（3x3グリッド）
 */
import React from 'react';
import type { Screen } from '../layout/BottomNav';
import {
  MdRestaurant,
  MdCamera,
  MdAttachMoney,
  MdInventory,
  MdRestaurantMenu,
  MdShoppingCart,
  MdBarChart,
  MdSettings,
  MdEmojiEvents
} from 'react-icons/md';

interface QuickActionsProps {
  onNavigate: (screen: Screen) => void;
}

interface FunctionCard {
  screen?: Screen;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const functionCards: FunctionCard[] = [
    {
      screen: 'meals',
      icon: <MdRestaurant size={32} />,
      label: '食事記録',
      color: '#3b82f6',
    },
    {
      screen: 'barcode',
      icon: <MdCamera size={32} />,
      label: 'スキャン',
      color: '#8b5cf6',
    },
    {
      screen: 'expense' as Screen,
      icon: <MdAttachMoney size={32} />,
      label: '家計簿',
      color: '#10b981',
    },
    {
      screen: 'stock' as Screen,
      icon: <MdInventory size={32} />,
      label: '在庫管理',
      color: '#f59e0b',
    },
    {
      screen: 'recipe' as Screen,
      icon: <MdRestaurantMenu size={32} />,
      label: 'AIレシピ',
      color: '#ef4444',
    },
    {
      screen: 'shopping' as Screen,
      icon: <MdShoppingCart size={32} />,
      label: '買い物',
      color: '#06b6d4',
    },
    {
      screen: 'report',
      icon: <MdBarChart size={32} />,
      label: 'レポート',
      color: '#6366f1',
    },
    {
      screen: 'badges' as Screen,
      icon: <MdEmojiEvents size={32} />,
      label: 'バッジ',
      color: '#f59e0b',
    },
    {
      screen: 'settings',
      icon: <MdSettings size={32} />,
      label: '設定',
      color: '#64748b',
    },
  ];

  const handleClick = (card: FunctionCard) => {
    if (card.onClick) {
      card.onClick();
    } else if (card.screen) {
      onNavigate(card.screen);
    }
  };

  return (
    <div className="function-grid">
      {functionCards.map((card, index) => (
        <button
          key={index}
          className="function-card"
          style={{ '--card-color': card.color } as React.CSSProperties}
          onClick={() => handleClick(card)}
        >
          <div className="function-icon" style={{ color: card.color }}>{card.icon}</div>
          <div className="function-label">{card.label}</div>
        </button>
      ))}
    </div>
  );
};
