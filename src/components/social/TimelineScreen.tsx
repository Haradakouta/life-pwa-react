import { useState, useEffect } from 'react';
import { MdAdd, MdRefresh } from 'react-icons/md';
import { PostCard } from './PostCard';
import { PostCreateScreen } from './PostCreateScreen';
import { getTimelinePosts } from '../../utils/post';
import type { Post } from '../../types/post';

interface TimelineScreenProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ onPostClick, onUserClick }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [quotedPostId, setQuotedPostId] = useState<string | undefined>(undefined);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('📡 Fetching timeline posts...');
      const fetchedPosts = await getTimelinePosts(20);
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
  }, []);

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
    <div style={{ paddingBottom: '80px' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          タイムライン
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {/* 更新ボタン */}
          <button
            onClick={fetchPosts}
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
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'var(--border)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <MdRefresh size={24} />
          </button>
          {/* 投稿作成ボタン */}
          <button
            onClick={() => setShowCreatePost(true)}
            style={{
              background: 'linear-gradient(135deg, var(--primary), #81c784)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MdAdd size={24} />
          </button>
        </div>
      </div>

      {/* 本体 */}
      <div style={{ padding: '16px' }}>
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
              onClick={fetchPosts}
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
          // ローディング表示
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border)',
                borderTop: '4px solid var(--primary)',
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite',
              }}
            />
            <div>投稿を読み込んでいます...</div>
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
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              まだ投稿がありません
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
