/**
 * クイックアクションコンポーネント（3x3グリッド）
 * React 19のuseTransitionとstartTransitionを活用
 */
import React, { useMemo, useCallback, useState, useTransition } from 'react';
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

export const QuickActions: React.FC<QuickActionsProps> = React.memo(({ onNavigate }) => {
  const [isPending, startTransition] = useTransition();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const functionCards: FunctionCard[] = useMemo(() => [
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
  ], []);

  const handleClick = useCallback((card: FunctionCard, index: number) => {
    startTransition(() => {
      if (card.onClick) {
        card.onClick();
      } else if (card.screen) {
        onNavigate(card.screen);
      }
    });
  }, [onNavigate]);

  return (
    <div className="function-grid-modern">
      {functionCards.map((card, index) => {
        const isHovered = hoveredIndex === index;
        return (
          <button
            key={index}
            className={`function-card-modern ${isHovered ? 'hovered' : ''}`}
            style={{ 
              '--card-color': card.color,
              '--card-index': index,
            } as React.CSSProperties & { '--card-index': number }}
            onClick={() => handleClick(card, index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-label={card.label}
          >
            <div 
              className="function-icon-modern" 
              style={{ 
                color: card.color,
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {card.icon}
            </div>
            <div 
              className="function-label-modern"
              style={{
                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {card.label}
            </div>
            {isHovered && (
              <div 
                className="function-ripple"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${card.color}20 0%, transparent 70%)`,
                  transform: 'translate(-50%, -50%)',
                  animation: 'ripple 0.6s ease-out',
                  pointerEvents: 'none',
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
});
