import { useState } from 'react';
import { TimelineScreen } from './TimelineScreen';
import { PostDetailScreen } from './PostDetailScreen';
import { UserProfileScreen } from './UserProfileScreen';
import { SearchScreen } from './SearchScreen';
import NotificationScreen from './NotificationScreen';
import { MdHome, MdSearch, MdNotifications } from 'react-icons/md';

type SocialTab = 'timeline' | 'search' | 'notifications';
type View = 'main' | 'post-detail' | 'profile';

export const SocialScreen: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<SocialTab>('timeline');
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentView('post-detail');
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  const handleBackToTimeline = () => {
    setCurrentView('main');
    setSelectedPostId(null);
    setSelectedUserId(null);
  };

  const handlePostDeleted = () => {
    setCurrentView('main');
    setSelectedPostId(null);
  };

  // プロフィール画面
  if (currentView === 'profile' && selectedUserId) {
    return (
      <UserProfileScreen
        userId={selectedUserId}
        onBack={handleBackToTimeline}
        onPostClick={handlePostClick}
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
      />
    );
  }

  // メイン画面（タブ構成）
  return (
    <div>
      {/* タブナビゲーション */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => setCurrentTab('timeline')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'timeline' ? '2px solid var(--primary)' : '2px solid transparent',
            color: currentTab === 'timeline' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: currentTab === 'timeline' ? 600 : 400,
          }}
        >
          <MdHome size={20} />
          タイムライン
        </button>
        <button
          onClick={() => setCurrentTab('search')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'search' ? '2px solid var(--primary)' : '2px solid transparent',
            color: currentTab === 'search' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: currentTab === 'search' ? 600 : 400,
          }}
        >
          <MdSearch size={20} />
          検索
        </button>
        <button
          onClick={() => setCurrentTab('notifications')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'notifications' ? '2px solid var(--primary)' : '2px solid transparent',
            color: currentTab === 'notifications' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: currentTab === 'notifications' ? 600 : 400,
          }}
        >
          <MdNotifications size={20} />
          通知
        </button>
      </div>

      {/* タブコンテンツ */}
      {currentTab === 'timeline' && (
        <TimelineScreen onPostClick={handlePostClick} onUserClick={handleUserClick} />
      )}
      {currentTab === 'search' && (
        <SearchScreen onPostClick={handlePostClick} onUserClick={handleUserClick} />
      )}
      {currentTab === 'notifications' && (
        <NotificationScreen
          onNavigateToPost={handlePostClick}
          onNavigateToProfile={handleUserClick}
        />
      )}
    </div>
  );
};
