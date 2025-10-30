/**
 * ヘッダーコンポーネント
 */
import React from 'react';

interface HeaderProps {
  title: string;
  onNavigate: (screen: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onNavigate }) => {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {title}
      <button onClick={() => onNavigate('admin')} style={{ background: 'none', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Admin</button>
    </header>
  );
};
