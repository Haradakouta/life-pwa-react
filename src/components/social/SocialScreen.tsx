import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { TimelineScreen } from './TimelineScreen';
import { PostDetailScreen } from './PostDetailScreen';
import { UserProfileScreen } from './UserProfileScreen';
import { SearchScreen } from './SearchScreen';
import NotificationScreen from './NotificationScreen';
import { MdHome, MdSearch, MdNotifications, MdPerson } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToUnreadCount, markAllNotificationsAsRead } from '../../utils/notification';

type SocialTab = 'timeline' | 'search' | 'notifications';
type View = 'main' | 'post-detail' | 'profile';

export const SocialScreen: React.FC = React.memo(() => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<SocialTab>('timeline');
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 通知の未読数を取得
  useEffect(() => {
    if (!user) {
      setNotificationUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToUnreadCount(user.uid, (count) => {
      setNotificationUnreadCount(count);
    });

    return () => unsubscribe();
  }, [user]);

  const handlePostClick = (postId: string) => {
    startTransition(() => {
      setSelectedPostId(postId);
      setCurrentView('post-detail');
    });
  };

  const handleUserClick = (userId: string) => {
    startTransition(() => {
      setSelectedUserId(userId);
      setCurrentView('profile');
    });
  };

  const handleBackToTimeline = () => {
    startTransition(() => {
      setCurrentView('main');
      setSelectedPostId(null);
      setSelectedUserId(null);
    });
  };

  const handlePostDeleted = () => {
    startTransition(() => {
      setCurrentView('main');
      setSelectedPostId(null);
    });
  };

  const handleTabChange = (tab: SocialTab) => {
    startTransition(() => {
      setCurrentTab(tab);
    });
  };

  // プロフィール画面
  if (currentView === 'profile' && selectedUserId) {
    return (
      <UserProfileScreen
        userId={selectedUserId}
        onBack={handleBackToTimeline}
        onPostClick={handlePostClick}
        onUserClick={handleUserClick}
      />
    );
  }

  // 投稿詳細画面
  if (currentView === 'post-detail' && selectedPostId) {
    return (
      <PostDetailScreen
        postId={selectedPostId}
        onBack={handleBackToTimeline}
        onPostDeleted={handlePostDeleted}
        onUserClick={handleUserClick}
        onPostClick={handlePostClick}
      />
    );
  }

  // メイン画面（タブ構成）
  return (
    <div>
      {/* ヘッダー（マイプロフィールボタン） */}
      {user && (
        <div
          className="social-header-modern"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(96, 165, 250, 0.02) 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 11,
          }}
        >
          <h2 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 700,
            background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            ソーシャル
          </h2>
          <button
            onClick={() => {
              startTransition(() => {
                setSelectedUserId(user.uid);
                setCurrentView('profile');
              });
            }}
            className="my-profile-button-modern"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <MdPerson size={18} />
            <span>マイプロフィール</span>
          </button>
        </div>
      )}
      {/* タブナビゲーション */}
      <div
        className="social-tabs-modern"
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky',
          top: user ? '72px' : '0',
          zIndex: 10,
        }}
      >
        {([
          { id: 'timeline' as SocialTab, icon: MdHome, label: 'ホーム' },
          { id: 'search' as SocialTab, icon: MdSearch, label: '検索' },
          { id: 'notifications' as SocialTab, icon: MdNotifications, label: '通知', badge: notificationUnreadCount },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={async () => {
              handleTabChange(tab.id);
              if (tab.id === 'notifications' && user && notificationUnreadCount > 0) {
                try {
                  await markAllNotificationsAsRead(user.uid);
                } catch (error) {
                  console.error('通知を既読にするエラー:', error);
                }
              }
            }}
            className={`social-tab-modern ${currentTab === tab.id ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              borderBottom: currentTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              color: currentTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: currentTab === tab.id ? 700 : 500,
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (currentTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.color = 'var(--primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab !== tab.id) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <tab.icon size={20} />
            {tab.badge !== undefined && tab.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '8px',
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
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
                }}
              >
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>読み込み中...</div>}>
          {currentTab === 'timeline' && (
            <TimelineScreen onPostClick={handlePostClick} onUserClick={handleUserClick} />
          )}
          {currentTab === 'search' && (
            <SearchScreen onPostClick={handlePostClick} onUserClick={handleUserClick} />
          )}
          {currentTab === 'notifications' && (
            <NotificationScreen
              onNavigateToPost={handlePostClick}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
});
