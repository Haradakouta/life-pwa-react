import { useState, useEffect } from 'react';
import { MdArrowBack, MdEdit, MdPersonAdd, MdPersonRemove, MdLink } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, followUser, unfollowUser, isFollowing } from '../../utils/profile';
import { getUserPosts } from '../../utils/post';
import { PostCard } from './PostCard';
import type { UserProfile } from '../../types/profile';
import type { Post } from '../../types/post';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userId,
  onBack,
  onPostClick,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = user && user.uid === userId;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // プロフィール取得
        const fetchedProfile = await getUserProfile(userId);
        if (!fetchedProfile) {
          setError('プロフィールが見つかりません');
          return;
        }
        setProfile(fetchedProfile);

        // 投稿一覧取得
        console.log(`[UserProfileScreen] Fetching posts for user: ${userId}`);
        const fetchedPosts = await getUserPosts(userId);
        console.log(`[UserProfileScreen] Received ${fetchedPosts.length} posts`);
        setPosts(fetchedPosts);

        // フォロー状態をチェック
        if (user && user.uid !== userId) {
          const following = await isFollowing(user.uid, userId);
          setIsFollowingUser(following);
        }
      } catch (error) {
        console.error('[UserProfileScreen] プロフィールの取得に失敗しました:', error);
        setError(error instanceof Error ? error.message : 'プロフィールの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, user, onBack]);

  const handleFollow = async () => {
    if (!user || !profile) return;

    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await unfollowUser(user.uid, userId);
        setIsFollowingUser(false);
        // フォロワー数を更新
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followerCount: Math.max(0, profile.stats.followerCount - 1),
          },
        });
      } else {
        await followUser(
          user.uid,
          user.displayName || 'Anonymous',
          user.photoURL || undefined,
          userId,
          profile.displayName
        );
        setIsFollowingUser(true);
        // フォロワー数を更新
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            followerCount: profile.stats.followerCount + 1,
          },
        });
      }
    } catch (error) {
      console.error('フォロー操作に失敗しました:', error);
      alert('フォロー操作に失敗しました');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
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
        <div>プロフィールを読み込んでいます...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '16px' }}>
          {error || 'プロフィールが見つかりません'}
        </div>
        <button
          onClick={onBack}
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
          戻る
        </button>
      </div>
    );
  }

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
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <MdArrowBack size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          {profile.displayName}
        </h2>
        <div style={{ width: '40px' }} /> {/* スペーサー */}
      </div>

      {/* カバー画像 */}
      <div
        style={{
          width: '100%',
          height: '150px',
          background: profile.coverUrl
            ? `url(${profile.coverUrl}) center/cover`
            : 'linear-gradient(135deg, var(--primary), #81c784)',
        }}
      />

      {/* プロフィール情報 */}
      <div style={{ padding: '0 20px' }}>
        {/* アバターとボタン */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: '-40px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: profile.avatarUrl
                ? `url(${profile.avatarUrl}) center/cover`
                : 'linear-gradient(135deg, var(--primary), #81c784)',
              border: '4px solid var(--card)',
            }}
          />
          {isOwnProfile ? (
            <div
              style={{
                padding: '8px 16px',
                background: 'var(--card)',
                border: '2px solid var(--border)',
                borderRadius: '20px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <MdEdit size={14} />
              設定画面から編集できます
            </div>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              style={{
                padding: '8px 16px',
                background: isFollowingUser ? 'var(--card)' : 'var(--primary)',
                border: isFollowingUser ? '2px solid var(--border)' : 'none',
                borderRadius: '20px',
                color: isFollowingUser ? 'var(--text)' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: followLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: followLoading ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isFollowingUser ? (
                <>
                  <MdPersonRemove size={16} />
                  フォロー中
                </>
              ) : (
                <>
                  <MdPersonAdd size={16} />
                  フォロー
                </>
              )}
            </button>
          )}
        </div>

        {/* 名前とユーザー名 */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
            {profile.displayName}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>@{profile.username}</div>
        </div>

        {/* 自己紹介 */}
        {profile.bio && (
          <div
            style={{
              fontSize: '14px',
              color: 'var(--text)',
              lineHeight: '1.5',
              marginBottom: '12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {profile.bio}
          </div>
        )}

        {/* ウェブサイト */}
        {profile.websiteUrl && (
          <a
            href={profile.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'var(--primary)',
              textDecoration: 'none',
              marginBottom: '12px',
            }}
          >
            <MdLink size={16} />
            {profile.websiteUrl.replace(/^https?:\/\//, '')}
          </a>
        )}

        {/* 統計情報 */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px 0',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>
              {profile.stats.postCount}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>投稿</span>
          </div>
          <div style={{ cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>
              {profile.stats.followerCount}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>フォロワー</span>
          </div>
          <div style={{ cursor: 'pointer' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>
              {profile.stats.followingCount}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>フォロー中</span>
          </div>
        </div>
      </div>

      {/* 投稿一覧 */}
      <div style={{ marginTop: '20px' }}>
        {posts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <div style={{ fontSize: '16px' }}>
              {isOwnProfile ? 'まだ投稿がありません' : 'このユーザーはまだ投稿していません'}
            </div>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostClick={onPostClick}
                onUserClick={(clickedUserId) => {
                  // 他のユーザーのプロフィールをクリックした場合のみ遷移
                  // （既に表示中のプロフィールの場合は何もしない）
                  console.log('User clicked:', clickedUserId, 'Current userId:', userId);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
