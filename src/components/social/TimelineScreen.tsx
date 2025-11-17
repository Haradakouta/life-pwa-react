import React, { useState, useEffect, useTransition, Suspense, useMemo, useDeferredValue } from 'react';
import { MdAdd, MdRefresh } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { PostCard } from './PostCard';
import { PostCreateScreen } from './PostCreateScreen';
import { PostCardSkeleton } from '../common/PostCardSkeleton';
import { getTimelinePosts } from '../../utils/post';
import type { Post } from '../../types/post';

interface TimelineScreenProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = React.memo(({ onPostClick, onUserClick }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [quotedPostId, setQuotedPostId] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📡 Fetching timeline posts...');
      const fetchedPosts = await getTimelinePosts(20, user?.uid);
      console.log(`✅ Fetched ${fetchedPosts.length} posts`);
      setPosts(fetchedPosts);
    } catch (error: any) {
      console.error('❌ 投稿の取得に失敗しました:', error);
      console.error('Error details:', error.message, error.code);
      setError(error.message || 'タイムラインの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handlePostCreated = () => {
    startTransition(() => {
      fetchPosts(); // 投稿後にタイムラインを更新
    });
  };

  const handleQuoteRepost = (postId: string) => {
    startTransition(() => {
      setQuotedPostId(postId);
      setShowCreatePost(true);
    });
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setQuotedPostId(undefined);
  };

  const handleRefresh = () => {
    startTransition(() => {
      fetchPosts();
    });
  };

  // React 19のuseDeferredValueで重いリストを遅延
  const deferredPosts = useDeferredValue(posts);
  const memoizedPosts = useMemo(() => deferredPosts, [deferredPosts]);

  return (
    <div style={{ paddingBottom: '80px', background: 'var(--card)' }}>
      {/* ヘッダー */}
      <div
        className="timeline-header-modern"
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
          zIndex: 10,
        }}
      >
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: 700, 
          background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          margin: 0 
        }}>
          ホーム
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 更新ボタン */}
          <button
            onClick={handleRefresh}
            disabled={loading || isPending}
            className="refresh-button-modern"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: 'none',
              cursor: loading || isPending ? 'not-allowed' : 'pointer',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: loading || isPending ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loading && !isPending) {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.transform = 'rotate(180deg)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <MdRefresh size={20} />
          </button>
          {/* 投稿作成ボタン */}
          <button
            onClick={() => setShowCreatePost(true)}
            className="create-post-button-modern"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
              border: 'none',
              borderRadius: '24px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
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
            <MdAdd size={20} style={{ marginRight: '6px' }} />
            投稿
          </button>
        </div>
      </div>

      {/* 本体 */}
      <div style={{ background: 'var(--card)' }}>
        {error ? (
          // エラー表示
          <div
            className="error-container-modern"
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
              borderRadius: '16px',
              margin: '20px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444', marginBottom: '8px' }}>
              タイムラインの取得に失敗しました
            </div>
            <div style={{ fontSize: '14px', color: '#dc2626', marginBottom: '16px' }}>
              {error}
            </div>
            <button
              onClick={handleRefresh}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
            >
              再試行
            </button>
          </div>
        ) : loading ? (
          // スケルトンローディング表示（3枚表示）
          <Suspense fallback={<div>Loading...</div>}>
            <div>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          </Suspense>
        ) : memoizedPosts.length === 0 ? (
          // 投稿がない場合
          <div
            className="empty-state-modern"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'fadeInUp 0.5s ease' }}>📝</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
              まだ投稿がありません
            </div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>
              最初の投稿をしてみましょう！
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="create-first-post-button-modern"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
              }}
            >
              <MdAdd size={20} />
              投稿を作成
            </button>
          </div>
        ) : (
          // 投稿一覧
          <Suspense fallback={<PostCardSkeleton />}>
            <div style={{ opacity: isPending ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
              {memoizedPosts.map((post, index) => (
                <div
                  key={post.id}
                  style={{
                    animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                  }}
                >
                  <PostCard
                    post={post}
                    onPostClick={onPostClick}
                    onUserClick={onUserClick}
                    onQuoteRepost={handleQuoteRepost}
                  />
                </div>
              ))}
            </div>
          </Suspense>
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
});
