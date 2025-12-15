/**
 * ヘッダーコンポーネント
 */
import React, { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { Screen } from './BottomNav';
import { useTranslation } from 'react-i18next';
import { getUserCollection } from '../../utils/collection';
import { collectionItems } from '../../data/collection';
import type { CollectionItem } from '../../types/collection';
import { useAuth } from '../../hooks/useAuth';

interface HeaderProps {
  title: string;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, currentScreen, onNavigate }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [iconItem, setIconItem] = useState<CollectionItem | null>(null);

  // アイコン取得
  useEffect(() => {
    if (user) {
      getUserCollection(user.uid).then(col => {
        if (col && col.iconItemId) {
          const item = collectionItems.find(i => i.id === col.iconItemId);
          setIconItem(item || null);
        }
      });
    }
  }, [user]);

  // ホーム画面以外で戻るボタンを表示
  const showBackButton = currentScreen !== 'home';

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
      {showBackButton && (
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            position: 'absolute',
            left: '8px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <MdArrowBack size={24} />
        </button>
      )}
      <div style={{ flex: 1, textAlign: 'center', marginLeft: showBackButton ? '40px' : '0', marginRight: '40px' }}>
        {title}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {iconItem && (
          <div
            onClick={() => onNavigate('settings')}
            style={{
              fontSize: '24px',
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {iconItem.imageUrl.startsWith('/') ? (
              <img src={iconItem.imageUrl} alt={iconItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              iconItem.imageUrl
            )}
          </div>
        )}
        <button
          onClick={() => onNavigate('admin')}
          style={{
            background: 'none',
            border: '1px solid white',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          {t('common.admin', '管理者')}
        </button>
      </div>
    </header>
  );
};
