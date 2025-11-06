import { useState, useEffect } from 'react';
import { MdAdd, MdRefresh, MdPublic, MdPeople } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from './PostCard';
import { PostCreateScreen } from './PostCreateScreen';
import { PostCardSkeleton } from '../common/PostCardSkeleton';
import { getTimelinePosts, getFollowingPosts } from '../../utils/post';
import type { Post } from '../../types/post';

interface TimelineScreenProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ onPostClick, onUserClick }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [quotedPostId, setQuotedPostId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

  const fetchPosts = async (tab: 'all' | 'following' = activeTab) => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'following' && user) {
        console.log('📡 Fetching following posts...');
        const fetchedPosts = await getFollowingPosts(user.uid, 20);
        console.log(`✅ Fetched ${fetchedPosts.length} following posts`);
        setPosts(fetchedPosts);
      } else {
        console.log('📡 Fetching timeline posts...');
        const fetchedPosts = await getTimelinePosts(20);
        console.log(`✅ Fetched ${fetchedPosts.length} posts`);
        setPosts(fetchedPosts);
      }
    } catch (error: any) {
      console.error('❌ 投稿の取得に失敗しました:', error);
      console.error('Error details:', error.message, error.code);
      setError(error.message || 'タイムラインの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab, user]);

  const handlePostCreated = () => {
    fetchPosts(); // 投稿後にタイムラインを更新
  };

  const handleQuoteRepost = (postId: string) => {
    setQuotedPostId(postId);
    setShowCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setQuotedPostId(undefined);
  };

  return (
    <div style={{ paddingBottom: '80px', background: 'var(--card)' }}>
      {/* ヘッダー */}
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
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          ホーム
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* 更新ボタン */}
          <button
            onClick={() => fetchPosts()}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'background-color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <MdRefresh size={20} />
          </button>
          {/* 投稿作成ボタン */}
          <button
            onClick={() => setShowCreatePost(true)}
            style={{
              background: 'var(--primary)',
              border: 'none',
              borderRadius: '24px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 700,
              fontSize: '15px',
              transition: 'background-color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            投稿
          </button>
        </div>
      </div>

      {/* タブ */}
      <div
        style={{
          display: 'flex',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: '57px', // ヘッダーの高さに合わせる
          zIndex: 9,
        }}
      >
        <button
          onClick={() => setActiveTab('all')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'all' ? '4px solid var(--primary)' : '4px solid transparent',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: activeTab === 'all' ? 700 : 500,
            color: activeTab === 'all' ? 'var(--text)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'all') {
              e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MdPublic size={20} />
        </button>
        <button
          onClick={() => setActiveTab('following')}
          style={{
            flex: 1,
            padding: '16px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'following' ? '4px solid var(--primary)' : '4px solid transparent',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: activeTab === 'following' ? 700 : 500,
            color: activeTab === 'following' ? 'var(--text)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'following') {
              e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MdPeople size={20} />
        </button>
      </div>

      {/* 本体 */}
      <div style={{ background: 'var(--card)' }}>
        {error ? (
          // エラー表示
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#ffebee',
              borderRadius: '12px',
              margin: '20px 0',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#c62828', marginBottom: '8px' }}>
              タイムラインの取得に失敗しました
            </div>
            <div style={{ fontSize: '14px', color: '#d32f2f', marginBottom: '16px' }}>
              {error}
            </div>
            <button
              onClick={() => fetchPosts()}
              style={{
                padding: '10px 20px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              再試行
            </button>
          </div>
        ) : loading ? (
          // スケルトンローディング表示（3枚表示）
          <div>
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        ) : posts.length === 0 ? (
          // 投稿がない場合
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {activeTab === 'following' ? '👥' : '📝'}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {activeTab === 'following' ? 'フォロー中のユーザーの投稿がありません' : 'まだ投稿がありません'}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>
              最初の投稿をしてみましょう！
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, var(--primary), #81c784)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MdAdd size={20} />
              投稿を作成
            </button>
          </div>
        ) : (
          // 投稿一覧
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostClick={onPostClick}
                onUserClick={onUserClick}
                onQuoteRepost={handleQuoteRepost}
              />
            ))}
          </div>
        )}
      </div>

      {/* 投稿作成モーダル */}
      {showCreatePost && (
        <PostCreateScreen
          onClose={handleCloseCreatePost}
          onPostCreated={handlePostCreated}
          quotedPostId={quotedPostId}
        />
      )}
    </div>
  );
};
