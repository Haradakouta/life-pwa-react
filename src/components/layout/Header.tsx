/**
 * ヘッダーコンポーネント
 */
import React from 'react';

import type { Screen } from './BottomNav';

interface HeaderProps {
  title: string;
  onNavigate: (screen: Screen) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNavigate }) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {title}
      <button onClick={() => onNavigate('admin')} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Admin</button>
    </header>
  );
};
