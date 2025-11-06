/**
 * ヘッダーコンポーネント
 */
import React from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { Screen } from './BottomNav';

interface HeaderProps {
  title: string;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, currentScreen, onNavigate }) => {
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
        Admin
      </button>
    </header>
  );
};
