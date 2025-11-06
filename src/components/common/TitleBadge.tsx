/**
 * 称号バッジコンポーネント
 */
import React from 'react';
import type { Title } from '../../types/title';

interface TitleBadgeProps {
  title: Title;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  onClick?: () => void;
}

const rarityColors = {
  common: { bg: '#e5e7eb', text: '#374151', border: '#d1d5db' },
  rare: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  epic: { bg: '#ede9fe', text: '#6b21a8', border: '#c4b5fd' },
  legendary: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
};

export const TitleBadge: React.FC<TitleBadgeProps> = ({
  title,
  size = 'medium',
  showName = true,
  onClick,
}) => {
  const sizeStyles = {
    small: { fontSize: '12px', padding: '4px 8px', iconSize: '14px' },
    medium: { fontSize: '14px', padding: '6px 12px', iconSize: '18px' },
    large: { fontSize: '16px', padding: '8px 16px', iconSize: '22px' },
  };

  const style = sizeStyles[size];
  const colors = rarityColors[title.rarity];

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: style.padding,
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        fontSize: style.fontSize,
        fontWeight: 600,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...(onClick && {
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 4px 12px ${colors.border}40`,
          },
        }),
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      title={title.description}
    >
      <span style={{ fontSize: style.iconSize }}>{title.icon}</span>
      {showName && <span>{title.name}</span>}
    </div>
  );
};




