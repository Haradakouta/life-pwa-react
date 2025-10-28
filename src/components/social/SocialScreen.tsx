import { useState } from 'react';
import { TimelineScreen } from './TimelineScreen';
import { PostDetailScreen } from './PostDetailScreen';
import { UserProfileScreen } from './UserProfileScreen';

type SocialTab = 'timeline' | 'recipes' | 'ranking' | 'notifications';
type View = 'main' | 'post-detail' | 'profile';

export const SocialScreen: React.FC = () => {
  const [currentTab] = useState<SocialTab>('timeline');
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
      {/* タブ（Phase 2ではタイムラインのみ） */}
      {currentTab === 'timeline' && (
        <TimelineScreen onPostClick={handlePostClick} onUserClick={handleUserClick} />
      )}

      {/* Phase 3以降で実装予定 */}
      {/* {currentTab === 'recipes' && <RecipeSquareScreen />} */}
      {/* {currentTab === 'ranking' && <RankingScreen />} */}
      {/* {currentTab === 'notifications' && <NotificationsScreen />} */}
    </div>
  );
};
