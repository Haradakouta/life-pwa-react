import { useState, useEffect } from 'react';
import { MdArrowBack, MdEdit, MdPersonAdd, MdLink, MdCalendarToday, MdCheck, MdClose, MdChat } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../utils/profile';
import { sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, getFriendStatus } from '../../utils/friend';
import { getOrCreateConversation } from '../../utils/chat';
import { getUserPosts, getUserMediaPosts, getUserLikedPosts, getUserReplies, getPost } from '../../utils/post';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from '../common/PostCardSkeleton';
import { FriendListModal } from './FriendListModal';
import { formatCount, formatJoinDate } from '../../utils/formatNumber';
import type { UserProfile, Friend } from '../../types/profile';
import type { Post } from '../../types/post';

type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onNavigateToDM: (conversationId: string, participantIds: string[]) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  userId,
  onBack,
  onPostClick,
  onUserClick,
  onNavigateToDM,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinnedPost, setPinnedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<Friend['status'] | 'not_friends'>('not_friends');
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showFriendListModal, setShowFriendListModal] = useState(false);
  const [friendListModalInitialTab, setFriendListModalInitialTab] = useState<'friends' | 'pending_sent' | 'pending_received'>('friends');

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
          const status = await getFriendStatus(user.uid, userId);
          setFriendStatus(status);
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

  const handleFriendAction = async (action: 'send' | 'accept' | 'decline' | 'remove') => {
    if (!user || !profile) return;

    const currentFriendStatus = friendStatus;
    const previousProfile = { ...profile };

    try {
      switch (action) {
        case 'send':
          setFriendStatus('pending_sent');
          await sendFriendRequest(
            user.uid,
            user.displayName || 'Anonymous',
            user.photoURL || undefined,
            userId,
            profile.displayName,
            profile.avatarUrl || undefined
          );
          break;
        case 'accept':
          setFriendStatus('accepted');
          setProfile({
            ...profile,
            stats: {
              ...profile.stats,
              friendCount: profile.stats.friendCount + 1,
            },
          });
          await acceptFriendRequest(
            user.uid,
            user.displayName || 'Anonymous',
            user.photoURL || undefined,
            userId,
            profile.displayName,
            profile.avatarUrl || undefined
          );
          break;
        case 'decline':
          setFriendStatus('not_friends');
          await declineFriendRequest(user.uid, userId);
          break;
        case 'remove':
          setFriendStatus('not_friends');
          setProfile({
            ...profile,
            stats: {
              ...profile.stats,
              friendCount: profile.stats.friendCount - 1,
            },
          });
          await removeFriend(user.uid, userId);
          break;
      }
    } catch (error: any) {
      console.error('DUMPING FULL FRIEND ACTION ERROR:', error);
      setFriendStatus(currentFriendStatus); // Revert UI on error
      setProfile(previousProfile);
      alert(`フレンド操作に失敗しました.\n\nエラー: ${error.message || '不明なエラー'}`);
    }
  };

  const handleSendMessageClick = async () => {
    if (!user || !profile) return;
    try {
      const conversationId = await getOrCreateConversation(user.uid, profile.uid);
      onNavigateToDM(conversationId, [user.uid, profile.uid]);
    } catch (error) {
      console.error('Failed to start DM:', error);
      alert('DMの開始に失敗しました。');
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
            <div style={{ display: 'flex', gap: '8px' }}>
              {friendStatus === 'not_friends' && (
                <button onClick={() => handleFriendAction('send')} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: '20px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                  <MdPersonAdd size={16} /> フレンド申請
                </button>
              )}
              {friendStatus === 'pending_sent' && (
                <button disabled style={{ padding: '8px 16px', background: 'var(--card)', border: '2px solid var(--border)', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  申請中
                </button>
              )}
              {friendStatus === 'pending_received' && (
                <>
                  <button onClick={() => handleFriendAction('accept')} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: '20px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    <MdCheck size={16} /> 承認
                  </button>
                  <button onClick={() => handleFriendAction('decline')} style={{ padding: '8px 16px', background: 'var(--card)', border: '2px solid var(--border)', borderRadius: '20px', color: 'var(--text)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    <MdClose size={16} /> 拒否
                  </button>
                </>
              )}
              {friendStatus === 'accepted' && (
                <>
                  <button onClick={handleSendMessageClick} style={{ padding: '8px 16px', background: 'var(--primary)', border: 'none', borderRadius: '20px', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    <MdChat size={16} /> メッセージ
                  </button>
                  <button onClick={() => handleFriendAction('remove')} style={{ padding: '8px 16px', background: 'var(--card)', border: '2px solid var(--border)', borderRadius: '20px', color: 'var(--text)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                    フレンド解除
                  </button>
                </>
              )}
            </div>
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
          <div onClick={() => { setShowFriendListModal(true); setFriendListModalInitialTab('friends'); }} style={{ cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}><span style={{ fontWeight: 700, color: 'var(--text)', marginRight: '4px' }}>{formatCount(profile.stats.friendCount)}</span><span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>フレンド</span></div>
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

      {showFriendListModal && (
        <FriendListModal
          userId={userId}
          onClose={() => setShowFriendListModal(false)}
          onNavigateToProfile={onUserClick}
          onNavigateToDM={() => {}}
          initialTab={friendListModalInitialTab}
        />
      )}
    </div>
  );
};