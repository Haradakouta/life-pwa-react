import { useState } from 'react';
import { TimelineScreen } from './TimelineScreen';
import { PostDetailScreen } from './PostDetailScreen';

type SocialTab = 'timeline' | 'recipes' | 'ranking' | 'notifications';
type View = 'main' | 'post-detail';

export const SocialScreen: React.FC = () => {
  const [currentTab] = useState<SocialTab>('timeline');
  const [currentView, setCurrentView] = useState<View>('main');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
    setCurrentView('post-detail');
  };

  const handleBackToTimeline = () => {
    setCurrentView('main');
    setSelectedPostId(null);
  };

  const handlePostDeleted = () => {
    setCurrentView('main');
    setSelectedPostId(null);
  };

  // 投稿詳細画面
  if (currentView === 'post-detail' && selectedPostId) {
    return (
      <PostDetailScreen
        postId={selectedPostId}
        onBack={handleBackToTimeline}
        onPostDeleted={handlePostDeleted}
      />
    );
  }

  // メイン画面（タブ構成）
  return (
    <div>
      {/* タブ（Phase 2ではタイムラインのみ） */}
      {currentTab === 'timeline' && <TimelineScreen onPostClick={handlePostClick} />}

      {/* Phase 3以降で実装予定 */}
      {/* {currentTab === 'recipes' && <RecipeSquareScreen />} */}
      {/* {currentTab === 'ranking' && <RankingScreen />} */}
      {/* {currentTab === 'notifications' && <NotificationsScreen />} */}
    </div>
  );
};
