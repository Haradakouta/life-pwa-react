/**
 * ボトムナビゲーションコンポーネント
 */
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { FiHome, FiCamera, FiBarChart2, FiSettings } from 'react-icons/fi';
import { MdRestaurant, MdPeople } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToUnreadCount } from '../../utils/notification';
import { subscribeToConversations } from '../../utils/chat';

export type Screen = 'home' | 'meals' | 'barcode' | 'report' | 'social' | 'settings' | 'stock' | 'shopping' | 'recipe' | 'expense' | 'badges' | 'admin' | 'goals';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const { user } = useAuth();
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);

  // 通知の未読数を監視
  useEffect(() => {
    if (!user) {
      setNotificationUnreadCount(0);
      setDmUnreadCount(0);
      return;
    }

    const unsubscribeNotifications = subscribeToUnreadCount(user.uid, (count) => {
      setNotificationUnreadCount(count);
    });

    const unsubscribeConversations = subscribeToConversations(user.uid, (conversations) => {
      const totalUnread = conversations.reduce((sum, conv) => {
        const unread = conv.unreadCount?.[user.uid] || 0;
        return sum + unread;
      }, 0);
      setDmUnreadCount(totalUnread);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeConversations();
    };
  }, [user]);

  const totalUnreadCount = notificationUnreadCount + dmUnreadCount;

  const navItems: Array<{ screen: Screen; icon: React.ReactNode; label: string }> = useMemo(() => [
    { screen: 'home', icon: <FiHome size={24} />, label: 'ホーム' },
    { screen: 'meals', icon: <MdRestaurant size={24} />, label: '食事' },
    { screen: 'barcode', icon: <FiCamera size={24} />, label: 'スキャン' },
    { screen: 'report', icon: <FiBarChart2 size={24} />, label: 'レポート' },
    { screen: 'social', icon: <MdPeople size={24} />, label: 'ソーシャル' },
    { screen: 'settings', icon: <FiSettings size={24} />, label: '設定' },
  ], []);

  const handleNavClick = useCallback((screen: Screen) => {
    onNavigate(screen);
  }, [onNavigate]);

  return (
    <nav id="bottomNav" role="navigation" aria-label="メインナビゲーション">
      {navItems.map((item) => {
        const showBadge = item.screen === 'social' && totalUnreadCount > 0;
        return (
          <button
            key={item.screen}
            className={`nav-item ${currentScreen === item.screen ? 'active' : ''}`}
            onClick={() => handleNavClick(item.screen)}
            aria-label={item.label}
            aria-current={currentScreen === item.screen ? 'page' : undefined}
            style={{ position: 'relative' }}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {showBadge && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: 'calc(50% - 20px)',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  minWidth: '18px',
                }}
              >
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
