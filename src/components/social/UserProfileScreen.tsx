import { useState, useEffect } from 'react';
import { MdArrowBack, MdEdit, MdPersonAdd, MdPersonRemove, MdLink, MdCalendarToday } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, followUser, unfollowUser, isFollowing } from '../../utils/profile';
import { getUserPosts } from '../../utils/post';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from '../common/PostCardSkeleton';
import { FollowersListModal } from './FollowersListModal';
import { FollowingListModal } from './FollowingListModal';
import { formatCount, formatJoinDate } from '../../utils/formatNumber';
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
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

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
        console.log(`[UserProfileScreen] Profile stats show postCount: ${fetchedProfile.stats.postCount}`);
        const fetchedPosts = await getUserPosts(userId);
        console.log(`[UserProfileScreen] Received ${fetchedPosts.length} posts from getUserPosts`);
        console.log(`[UserProfileScreen] Posts:`, fetchedPosts.map(p => ({ id: p.id, authorId: p.authorId, content: p.content.substring(0, 50) })));
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

    // 楽観的更新: 即座にUIを更新
    const previousFollowState = isFollowingUser;
    const previousProfile = { ...profile };

    setIsFollowingUser(!isFollowingUser);
    setProfile({
      ...profile,
      stats: {
        ...profile.stats,
        followerCount: isFollowingUser
          ? profile.stats.followerCount - 1
          : profile.stats.followerCount + 1,
      },
    });

    // バックグラウンドでFirestoreを更新
    try {
      if (previousFollowState) {
        console.log(`[UserProfile] Unfollowing: ${user.uid} X ${userId}`);
        await unfollowUser(user.uid, userId);
      } else {
        console.log(`[UserProfile] Following: ${user.uid} → ${userId}`);
        await followUser(
          user.uid,
          user.displayName || 'Anonymous',
          user.photoURL || undefined,
          userId,
          profile.displayName
        );
      }
      console.log('✅ [UserProfile] Follow operation completed successfully');
    } catch (error: any) {
      console.error('❌ [UserProfile] Follow operation failed:', error);
      console.error('❌ [UserProfile] Error details:', error.message, error.code);

      // 失敗時は元に戻す（rollback）
      setIsFollowingUser(previousFollowState);
      setProfile(previousProfile);

      // 詳細なエラーメッセージを表示
      const errorMsg = error.message || error.code || '不明なエラー';
      alert(`フォロー操作に失敗しました。\n\nエラー: ${errorMsg}\n\nもう一度お試しください。`);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingBottom: '80px' }}>
        {/* ヘッダー スケルトン */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--border)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '120px',
              height: '18px',
              background: 'var(--border)',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div style={{ width: '24px' }} />
        </div>

        {/* カバー画像 スケルトン */}
        <div
          style={{
            width: '100%',
            height: '150px',
            background: 'var(--border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* プロフィール情報 スケルトン */}
        <div style={{ padding: '0 20px' }}>
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
                background: 'var(--border)',
                border: '4px solid var(--card)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '100px',
                height: '32px',
                background: 'var(--border)',
                borderRadius: '20px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          </div>

          <div
            style={{
              width: '150px',
              height: '20px',
              background: 'var(--border)',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              width: '100px',
              height: '14px',
              background: 'var(--border)',
              borderRadius: '4px',
              marginBottom: '16px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        {/* 投稿スケルトン */}
        <div style={{ marginTop: '20px' }}>
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
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
              style={{
                padding: '8px 16px',
                background: isFollowingUser ? 'var(--card)' : 'var(--primary)',
                border: isFollowingUser ? '2px solid var(--border)' : 'none',
                borderRadius: '20px',
                color: isFollowingUser ? 'var(--text)' : 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
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

        {/* ウェブサイトと参加日 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
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
              }}
            >
              <MdLink size={16} />
              {profile.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          )}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}
          >
            <MdCalendarToday size={16} />
            {formatJoinDate(profile.createdAt)}
          </div>
        </div>

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
              {formatCount(profile.stats.postCount)}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>投稿</span>
          </div>
          <div
            onClick={() => setShowFollowersModal(true)}
            style={{
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>
              {formatCount(profile.stats.followerCount)}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>フォロワー</span>
          </div>
          <div
            onClick={() => setShowFollowingModal(true)}
            style={{
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>
              {formatCount(profile.stats.followingCount)}
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

      {/* フォロワーモーダル */}
      {showFollowersModal && (
        <FollowersListModal
          userId={userId}
          onClose={() => setShowFollowersModal(false)}
          onUserClick={(clickedUserId) => {
            // プロフィール画面を再読み込みする場合はここで処理
            console.log('Navigate to user:', clickedUserId);
          }}
        />
      )}

      {/* フォロー中モーダル */}
      {showFollowingModal && (
        <FollowingListModal
          userId={userId}
          onClose={() => setShowFollowingModal(false)}
          onUserClick={(clickedUserId) => {
            // プロフィール画面を再読み込みする場合はここで処理
            console.log('Navigate to user:', clickedUserId);
          }}
        />
      )}
    </div>
  );
};
