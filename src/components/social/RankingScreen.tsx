/**
 * ランキング画面コンポーネント（Phase 7）
 */
import React, { useState, useEffect } from 'react';
import { MdTrendingUp, MdFavorite, MdRestaurant, MdLocalFireDepartment } from 'react-icons/md';
import { getTopPostsByLikes } from '../../utils/post';
import { getTopRecipesByLikes } from '../../utils/post';
import { getTrendingHashtags } from '../../utils/search';
import type { Post } from '../../types/post';
import type { Recipe } from '../../types/post';

type RankingTab = 'posts' | 'recipes' | 'hashtags';

interface RankingScreenProps {
  onPostClick: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export const RankingScreen: React.FC<RankingScreenProps> = ({ onPostClick }) => {
  const [currentTab, setCurrentTab] = useState<RankingTab>('posts');
  const [topPosts, setTopPosts] = useState<Post[]>([]);
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ランキングデータを取得
  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`[RankingScreen] Fetching rankings for tab: ${currentTab}`);
        if (currentTab === 'posts') {
          const posts = await getTopPostsByLikes(10);
          console.log(`[RankingScreen] Got ${posts.length} posts`);
          setTopPosts(posts);
        } else if (currentTab === 'recipes') {
          const recipes = await getTopRecipesByLikes(10);
          console.log(`[RankingScreen] Got ${recipes.length} recipes`);
          setTopRecipes(recipes);
        } else if (currentTab === 'hashtags') {
          const hashtags = await getTrendingHashtags(20);
          console.log(`[RankingScreen] Got ${hashtags.length} hashtags`);
          setTrendingHashtags(hashtags);
        }
      } catch (err) {
        console.error('ランキング取得エラー:', err);
        const errorMessage = err instanceof Error ? err.message : 'ランキングの取得に失敗しました';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [currentTab]);

  // ランキングアイテムのレンダリング
  const renderRankingItem = (rank: number, item: { name?: string; title?: string; tag?: string; count?: number; likes?: number }, type: 'post' | 'recipe' | 'hashtag') => {
    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // 金、銀、銅
    const medalColor = rank <= 3 ? medalColors[rank - 1] : undefined;

    return (
      <div
        key={`${type}-${rank}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          background: 'var(--card)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '8px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: type !== 'hashtag' ? 'pointer' : 'default',
        }}
        onMouseEnter={(e) => {
          if (type !== 'hashtag') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (type !== 'hashtag') {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {/* 順位 */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: medalColor || 'var(--background)',
            color: medalColor ? 'white' : 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {rank}
        </div>

        {/* コンテンツ */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
            {item.name || item.title || item.tag}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {type === 'hashtag' && (
              <span>
                <MdLocalFireDepartment size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {item.count}回使用
              </span>
            )}
            {(type === 'post' || type === 'recipe') && (
              <span>
                <MdFavorite size={14} style={{ marginRight: '4px', verticalAlign: 'middle', color: '#ef4444' }} />
                {item.likes || 0}いいね
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      {/* タブナビゲーション */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid var(--border)',
        }}
      >
        <button
          onClick={() => setCurrentTab('posts')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'posts' ? '3px solid var(--primary)' : '3px solid transparent',
            color: currentTab === 'posts' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontWeight: currentTab === 'posts' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MdFavorite size={18} />
          人気投稿
        </button>
        <button
          onClick={() => setCurrentTab('recipes')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'recipes' ? '3px solid var(--primary)' : '3px solid transparent',
            color: currentTab === 'recipes' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontWeight: currentTab === 'recipes' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MdRestaurant size={18} />
          人気レシピ
        </button>
        <button
          onClick={() => setCurrentTab('hashtags')}
          style={{
            flex: 1,
            padding: '12px',
            background: 'none',
            border: 'none',
            borderBottom: currentTab === 'hashtags' ? '3px solid var(--primary)' : '3px solid transparent',
            color: currentTab === 'hashtags' ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '14px',
            fontWeight: currentTab === 'hashtags' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MdTrendingUp size={18} />
          トレンド
        </button>
      </div>

      {/* ローディング状態 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 12px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          読み込み中...
        </div>
      )}

      {/* エラー状態 */}
      {error && (
        <div style={{
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#ef4444',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* ランキングコンテンツ */}
      {!loading && !error && (
        <>
          {currentTab === 'posts' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
                <MdFavorite size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#ef4444' }} />
                いいね数ランキング
              </h3>
              {topPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  投稿がまだありません
                </div>
              ) : (
                <div>
                  {topPosts.map((post, index) => (
                    <div key={post.id} onClick={() => onPostClick(post.id)}>
                      {renderRankingItem(index + 1, { name: post.content.substring(0, 50), likes: post.likes }, 'post')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'recipes' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
                <MdRestaurant size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                人気レシピランキング
              </h3>
              {topRecipes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  レシピがまだありません
                </div>
              ) : (
                <div>
                  {topRecipes.map((recipe, index) => (
                    <div key={recipe.id}>
                      {renderRankingItem(index + 1, { title: recipe.title, likes: recipe.likes }, 'recipe')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentTab === 'hashtags' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
                <MdTrendingUp size={20} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#f59e0b' }} />
                トレンドハッシュタグ
              </h3>
              {trendingHashtags.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                  ハッシュタグがまだありません
                </div>
              ) : (
                <div>
                  {trendingHashtags.map((item, index) => (
                    <div key={item.tag}>
                      {renderRankingItem(index + 1, { tag: item.tag, count: item.count }, 'hashtag')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

