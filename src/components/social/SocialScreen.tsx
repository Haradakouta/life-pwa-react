import { useState, useEffect } from 'react';
import { TimelineScreen } from './TimelineScreen';
import { PostDetailScreen } from './PostDetailScreen';
import { UserProfileScreen } from './UserProfileScreen';
import { SearchScreen } from './SearchScreen';
import NotificationScreen from './NotificationScreen';
import { ConversationListScreen } from './ConversationListScreen';
import { ChatScreen } from './ChatScreen';
import { RankingScreen } from './RankingScreen';
import { MdHome, MdSearch, MdNotifications, MdChat, MdTrendingUp, MdPerson } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToConversations } from '../../utils/chat';
import { subscribeToUnreadCount, markAllNotificationsAsRead } from '../../utils/notification';
import type { Conversation } from '../../utils/chat';

type SocialTab = 'timeline' | 'search' | 'notifications' | 'dm' | 'ranking';
type View = 'main' | 'post-detail' | 'profile' | 'chat';

export const SocialScreen: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<SocialTab>('timeline');
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [dmUnreadCount, setDmUnreadCount] = useState(0);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  // DM未読数を取得
  useEffect(() => {
    if (!user) {
      setDmUnreadCount(0);
      return;
    }

    const unsubscribe = subscribeToConversations(user.uid, (conversations: Conversation[]) => {
      const totalUnread = conversations.reduce((sum, conv) => {
        const unread = conv.unreadCount?.[user.uid] || 0;
        return sum + unread;
      }, 0);
      setDmUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [user]);

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
    setSelectedPostId(postId);
    setCurrentView('post-detail');
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('profile');
  };

  const handleNavigateToDM = (conversationId: string, participantIds: string[]) => {
    setSelectedConversationId(conversationId);
    setSelectedParticipantIds(participantIds);
    setCurrentView('chat');
  };

  const handleBackToTimeline = () => {
    setCurrentView('main');
    setSelectedPostId(null);
    setSelectedUserId(null);
    setSelectedConversationId(null);
    setSelectedParticipantIds([]);
  };

  const handlePostDeleted = () => {
    setCurrentView('main');
    setSelectedPostId(null);
  };

  // Chat画面
  if (currentView === 'chat' && selectedConversationId) {
    return (
      <ChatScreen
        conversationId={selectedConversationId}
        participants={selectedParticipantIds}
        onBack={handleBackToTimeline}
        onNavigateToProfile={handleUserClick}
      />
    );
  }

  // プロフィール画面
  if (currentView === 'profile' && selectedUserId) {
    return (
      <UserProfileScreen
        userId={selectedUserId}
        onBack={handleBackToTimeline}
        onPostClick={handlePostClick}
        onUserClick={handleUserClick}
        onNavigateToDM={handleNavigateToDM}
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
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 11,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--text)' }}>
            ソーシャル
          </h2>
          <button
            onClick={() => {
              setSelectedUserId(user.uid);
              setCurrentView('profile');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <MdPerson size={18} />
            <span>マイプロフィール</span>
          </button>
        </div>
      )}
      {/* タブナビゲーション */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky',
          top: user ? '56px' : '0',
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
        </button>
        <button
          onClick={async () => {
            setCurrentTab('notifications');
            // 通知タブを開いたらすべて既読にする
            if (user && notificationUnreadCount > 0) {
              try {
                await markAllNotificationsAsRead(user.uid);
              } catch (error) {
                console.error('通知を既読にするエラー:', error);
              }
            }
          }}
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
            position: 'relative',
          }}
        >
          <MdNotifications size={20} />
          {notificationUnreadCount > 0 && (
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
              }}
            >
              {notificationUnreadCount > 99 ? '99+' : notificationUnreadCount}
            </span>
          )}
        </button>
        <button
          onClick={async () => {
            setCurrentTab('dm');
            // DMタブを開いたら、すべての会話の未読数をリセット
            if (user && dmUnreadCount > 0) {
              try {
                const { getConversations } = await import('../../utils/chat');
                const { doc, updateDoc } = await import('firebase/firestore');
                const { db } = await import('../../config/firebase');
                const conversations = await getConversations(user.uid);
                // すべての会話の未読数を0にする
                await Promise.all(
                  conversations.map((conv) => {
                    const conversationRef = doc(db, 'conversations', conv.id);
                    return updateDoc(conversationRef, {
                      [`unreadCount.${user.uid}`]: 0,
                    });
                  })
                );
              } catch (error) {
                console.error('DM未読数をリセットするエラー:', error);
              }
            }
          }}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'dm' ? '2px solid var(--primary)' : '2px solid transparent',
            color: currentTab === 'dm' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: currentTab === 'dm' ? 600 : 400,
            position: 'relative',
          }}
        >
          <MdChat size={20} />
          {dmUnreadCount > 0 && (
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
              }}
            >
              {dmUnreadCount > 99 ? '99+' : dmUnreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setCurrentTab('ranking')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'ranking' ? '2px solid var(--primary)' : '2px solid transparent',
            color: currentTab === 'ranking' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: currentTab === 'ranking' ? 600 : 400,
          }}
        >
          <MdTrendingUp size={20} />
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
      {currentTab === 'dm' && (
        <ConversationListScreen
          onBack={handleBackToTimeline}
          onNavigateToProfile={handleUserClick}
        />
      )}
      {currentTab === 'ranking' && (
        <RankingScreen
          onPostClick={handlePostClick}
          onUserClick={handleUserClick}
        />
      )}
    </div>
  );
};
