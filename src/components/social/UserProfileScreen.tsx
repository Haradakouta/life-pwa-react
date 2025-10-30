import { useState, useEffect } from 'react';
import { MdArrowBack, MdEdit, MdPersonAdd, MdPersonRemove, MdLink, MdCalendarToday } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, followUser, unfollowUser, isFollowing } from '../../utils/profile';
import { getUserPosts, getUserMediaPosts, getUserLikedPosts, getUserReplies, getPost } from '../../utils/post';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from '../common/PostCardSkeleton';
import { FollowersListModal } from './FollowersListModal';
import { FollowingListModal } from './FollowingListModal';
import { formatCount, formatJoinDate } from '../../utils/formatNumber';
import type { UserProfile } from '../../types/profile';
import type { Post } from '../../types/post';

type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userId,
  onBack,
  onPostClick,
  onUserClick,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinnedPost, setPinnedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const isOwnProfile = user && user.uid === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProfile = await getUserProfile(userId);
        if (!fetchedProfile) {
          setError('プロフィールが見つかりません');
          return;
        }
        setProfile(fetchedProfile);

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

    fetchProfile();
  }, [userId, user]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!profile) return;

      setPostsLoading(true);
      try {
        let fetchedPosts: Post[] = [];
        switch (activeTab) {
          case 'posts':
            fetchedPosts = await getUserPosts(userId, 20);
            if (profile.pinnedPostId) {
              const pinned = await getPost(profile.pinnedPostId);
              setPinnedPost(pinned);
              fetchedPosts = fetchedPosts.filter(p => p.id !== profile.pinnedPostId);
            } else {
              setPinnedPost(null);
            }
            break;
          case 'media':
            fetchedPosts = await getUserMediaPosts(userId, 20);
            setPinnedPost(null);
            break;
          case 'likes':
            fetchedPosts = await getUserLikedPosts(userId, 20);
            setPinnedPost(null);
            break;
          case 'replies':
            fetchedPosts = await getUserReplies(userId, 20);
            setPinnedPost(null);
            break;
        }
        setPosts(fetchedPosts);
      } catch (error) {
        console.error(`[UserProfileScreen] ${activeTab}投稿の取得に失敗しました:`, error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [userId, activeTab, profile]);

  const handleFollow = async () => {
    if (!user || !profile) return;

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

    try {
      if (previousFollowState) {
        await unfollowUser(user.uid, userId);
      } else {
        await followUser(
          user.uid,
          user.displayName || 'Anonymous',
          user.photoURL || undefined,
          userId,
          profile.displayName,
          profile.avatarUrl || undefined
        );
      }
    } catch (error: any) {
      setIsFollowingUser(previousFollowState);
      setProfile(previousProfile);
      alert(`フォロー操作に失敗しました。\n\nエラー: ${error.message || '不明なエラー'}`);
    }
  };

  const handlePinToggle = async () => {
    try {
      const updatedProfile = await getUserProfile(userId);
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    } catch (error) {
      console.error('[UserProfileScreen] プロフィールの再取得に失敗:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '120px', height: '18px', background: 'var(--border)', borderRadius: '4px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '24px' }} />
        </div>
        <div style={{ width: '100%', height: '150px', background: 'var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ padding: '0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-40px', marginBottom: '12px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--border)', border: '4px solid var(--card)', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width: '100px', height: '32px', background: 'var(--border)', borderRadius: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
          <div style={{ width: '150px', height: '20px', background: 'var(--border)', borderRadius: '4px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ width: '100px', height: '14px', background: 'var(--border)', borderRadius: '4px', marginBottom: '16px', animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ marginTop: '20px' }}><PostCardSkeleton /><PostCardSkeleton /></div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
        <div style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '16px' }}>{error || 'プロフィールが見つかりません'}</div>
        <button onClick={onBack} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>戻る</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}><MdArrowBack size={24} /></button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>{profile.displayName}</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ width: '100%', height: '150px', background: profile.coverUrl ? `url(${profile.coverUrl}) center/cover` : 'linear-gradient(135deg, var(--primary), #81c784)' }} />

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-40px', marginBottom: '12px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: profile.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'linear-gradient(135deg, var(--primary), #81c784)', border: '4px solid var(--card)' }} />
          {isOwnProfile ? (
            <div style={{ padding: '8px 16px', background: 'var(--card)', border: '2px solid var(--border)', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MdEdit size={14} />
              設定画面から編集できます
            </div>
          ) : (
            <button onClick={handleFollow} style={{ padding: '8px 16px', background: isFollowingUser ? 'var(--card)' : 'var(--primary)', border: isFollowingUser ? '2px solid var(--border)' : 'none', borderRadius: '20px', color: isFollowingUser ? 'var(--text)' : 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              {isFollowingUser ? <><MdPersonRemove size={16} /> フォロー中</> : <><MdPersonAdd size={16} /> フォロー</>}
            </button>
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{profile.displayName}</div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>@{profile.username}</div>
        </div>

        {profile.bio && <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{profile.bio}</div>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}><MdLink size={16} />{profile.websiteUrl.startsWith('https://') ? profile.websiteUrl.substring(8) : profile.websiteUrl.startsWith('http://') ? profile.websiteUrl.substring(7) : profile.websiteUrl}</a>}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}><MdCalendarToday size={16} />{formatJoinDate(profile.createdAt)}</div>
        </div>

        <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
          <div><span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>{formatCount(profile.stats.postCount)}</span><span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>投稿</span></div>
          <div onClick={() => setShowFollowersModal(true)} style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}><span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>{formatCount(profile.stats.followerCount)}</span><span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>フォロワー</span></div>
          <div onClick={() => setShowFollowingModal(true)} style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}><span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>{formatCount(profile.stats.followingCount)}</span><span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>フォロー中</span></div>
        </div>
      </div>

      <div style={{ display: 'flex', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: '69px', zIndex: 9 }}>
        <button onClick={() => setActiveTab('posts')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'posts' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === 'posts' ? 600 : 400, color: activeTab === 'posts' ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>投稿</button>
        <button onClick={() => setActiveTab('replies')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'replies' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === 'replies' ? 600 : 400, color: activeTab === 'replies' ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>返信</button>
        <button onClick={() => setActiveTab('media')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'media' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === 'media' ? 600 : 400, color: activeTab === 'media' ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>メディア</button>
        <button onClick={() => setActiveTab('likes')} style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'likes' ? '3px solid var(--primary)' : '3px solid transparent', cursor: 'pointer', fontSize: '15px', fontWeight: activeTab === 'likes' ? 600 : 400, color: activeTab === 'likes' ? 'var(--primary)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>いいね</button>
      </div>

      <div style={{ marginTop: '0' }}>
        {postsLoading ? (<div><PostCardSkeleton /><PostCardSkeleton /></div>) : posts.length === 0 ? (<div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}><div style={{ fontSize: '48px', marginBottom: '16px' }}>{activeTab === 'media' ? '📷' : activeTab === 'likes' ? '❤️' : activeTab === 'replies' ? '💬' : '📝'}</div><div style={{ fontSize: '16px' }}>{activeTab === 'posts' && (isOwnProfile ? 'まだ投稿がありません' : 'このユーザーはまだ投稿していません')}{activeTab === 'replies' && (isOwnProfile ? '返信はまだありません' : 'このユーザーはまだ返信していません')}{activeTab === 'media' && (isOwnProfile ? '画像付き投稿はまだありません' : 'このユーザーはまだ画像を投稿していません')}{activeTab === 'likes' && (isOwnProfile ? 'まだいいねした投稿がありません' : 'このユーザーのいいねは非公開です')}</div></div>) : (<div>{activeTab === 'posts' && pinnedPost && (<PostCard key={pinnedPost.id} post={pinnedPost} onPostClick={onPostClick} onUserClick={onUserClick} showPinButton={!!isOwnProfile} onPinToggle={handlePinToggle} />)}{posts.map((post) => (<PostCard key={post.id} post={post} onPostClick={onPostClick} onUserClick={onUserClick} showPinButton={!!isOwnProfile && activeTab === 'posts'} onPinToggle={handlePinToggle} />))}</div>)}
      </div>

      {showFollowersModal && <FollowersListModal userId={userId} onClose={() => setShowFollowersModal(false)} onNavigateToProfile={onUserClick} />}
      {showFollowingModal && <FollowingListModal userId={userId} onClose={() => setShowFollowingModal(false)} onNavigateToProfile={onUserClick} />}
    </div>
  );
};