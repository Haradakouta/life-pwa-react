import { useState, useEffect } from 'react';
import { MdSearch, MdTrendingUp, MdPerson, MdArticle } from 'react-icons/md';
import { searchUsers, searchPosts, searchByHashtag, getTrendingHashtags } from '../../utils/search';
import type { Post } from '../../types/post';
import type { UserProfile } from '../../types/profile';
import { PostCard } from './PostCard';

interface SearchScreenProps {
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

type SearchTab = 'all' | 'users' | 'posts' | 'hashtags';

export const SearchScreen: React.FC<SearchScreenProps> = ({ onPostClick, onUserClick }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  // トレンドハッシュタグを取得
  useEffect(() => {
    const fetchTrending = async () => {
      const trending = await getTrendingHashtags(10);
      setTrendingHashtags(trending);
    };
    fetchTrending();
  }, []);

  // 検索実行
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      if (query.startsWith('#')) {
        // ハッシュタグ検索
        const hashtagPosts = await searchByHashtag(query, 20);
        setPosts(hashtagPosts);
        setUsers([]);
        setActiveTab('hashtags');
      } else {
        // 全体検索
        const [searchedUsers, searchedPosts] = await Promise.all([
          searchUsers(query, 10),
          searchPosts(query, 20),
        ]);
        setUsers(searchedUsers);
        setPosts(searchedPosts);
        setActiveTab('all');
      }
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // ハッシュタグクリック
  const handleHashtagClick = async (tag: string) => {
    setQuery(`#${tag}`);
    setLoading(true);
    try {
      const hashtagPosts = await searchByHashtag(tag, 20);
      setPosts(hashtagPosts);
      setUsers([]);
      setActiveTab('hashtags');
    } catch (error) {
      console.error('ハッシュタグ検索エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* 検索バー */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--background)',
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid var(--border)',
          }}
        >
          <MdSearch size={24} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="ユーザー、投稿、#ハッシュタグを検索"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              color: 'var(--text)',
              fontSize: '15px',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            検索
          </button>
        </div>
      </div>

      {/* タブ */}
      {query && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          {(['all', 'users', 'posts', 'hashtags'] as SearchTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '15px',
              }}
            >
              {tab === 'all' && 'すべて'}
              {tab === 'users' && 'ユーザー'}
              {tab === 'posts' && '投稿'}
              {tab === 'hashtags' && 'ハッシュタグ'}
            </button>
          ))}
        </div>
      )}

      {/* ローディング */}
      {loading && (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
          <div>検索中...</div>
        </div>
      )}

      {/* 検索結果 */}
      {!loading && query && (
        <div style={{ padding: '20px' }}>
          {/* ユーザー結果 */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MdPerson size={24} />
                ユーザー ({users.length})
              </h3>
              {users.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => onUserClick(user.uid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--card)',
                    borderRadius: '12px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: user.avatarUrl
                        ? `url(${user.avatarUrl}) center/cover`
                        : 'linear-gradient(135deg, var(--primary), #81c784)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '15px' }}>
                      {user.displayName}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      @{user.username}
                    </div>
                    {user.bio && (
                      <div
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                          marginTop: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {user.bio}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 投稿結果 */}
          {(activeTab === 'all' || activeTab === 'posts' || activeTab === 'hashtags') && posts.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MdArticle size={24} />
                投稿 ({posts.length})
              </h3>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onPostClick={onPostClick} onUserClick={onUserClick} />
              ))}
            </div>
          )}

          {/* 結果なし */}
          {users.length === 0 && posts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>検索結果が見つかりません</div>
              <div style={{ fontSize: '14px' }}>別のキーワードで試してみてください</div>
            </div>
          )}
        </div>
      )}

      {/* トレンド（検索前） */}
      {!query && !loading && (
        <div style={{ padding: '20px' }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MdTrendingUp size={24} />
            トレンド
          </h3>
          {trendingHashtags.map((item, index) => (
            <div
              key={item.tag}
              onClick={() => handleHashtagClick(item.tag)}
              style={{
                padding: '16px',
                background: 'var(--card)',
                borderRadius: '12px',
                marginBottom: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                {index + 1}位・トレンド
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                #{item.tag}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {item.count}件の投稿
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
