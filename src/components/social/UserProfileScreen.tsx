import React, { useState, useEffect, useTransition, Suspense, useMemo, useDeferredValue } from 'react';
import { MdArrowBack, MdEdit, MdLink, MdCalendarToday } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../utils/profile';
import { getUserPosts, getUserMediaPosts, getUserLikedPosts, getUserReplies, getPost } from '../../utils/post';
import { getEquippedTitle } from '../../utils/title';
import type { Title } from '../../types/title';
import { TitleBadge } from '../common/TitleBadge';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from '../common/PostCardSkeleton';
import { ProfileEditScreen } from '../profile/ProfileEditScreen';
import { formatCount, formatJoinDate } from '../../utils/formatNumber';
import type { UserProfile } from '../../types/profile';
import type { Post } from '../../types/post';
import { AvatarWithFrame } from '../common/AvatarWithFrame';
import { NameWithColor } from '../common/NameWithColor';

type ProfileTab = 'posts' | 'replies' | 'media' | 'likes';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onPostClick: (postId: string) => void;
  onUserClick: (userId: string) => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = React.memo(({
  userId,
  onBack,
  onPostClick,
  onUserClick,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pinnedPost, setPinnedPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [equippedTitle, setEquippedTitle] = useState<Title | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOwnProfile = user && user.uid === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // 称号を取得
        const title = await getEquippedTitle(userId);
        setEquippedTitle(title);

        const fetchedProfile = await getUserProfile(userId);
        if (!fetchedProfile) {
          setError('プロフィールが見つかりません');
          return;
        }
        setProfile(fetchedProfile);
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
            fetchedPosts = await getUserPosts(userId, 20, user?.uid);
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
  }, [userId, activeTab, profile, user?.uid]);

  const handlePinToggle = async () => {
    startTransition(async () => {
      try {
        const updatedProfile = await getUserProfile(userId);
        if (updatedProfile) {
          setProfile(updatedProfile);
        }
      } catch (error) {
        console.error('[UserProfileScreen] プロフィールの再取得に失敗:', error);
      }
    });
  };

  // React 19のuseDeferredValueで重いリストを遅延
  const deferredPosts = useDeferredValue(posts);
  const memoizedPosts = useMemo(() => deferredPosts, [deferredPosts]);

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
        <div style={{ fontSize: '16px', color: 'var(--text)', marginBottom: '16px' }}>{error || t('social.profile.notFound')}</div>
        <button onClick={onBack} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>{t('common.back')}</button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px', background: 'var(--card)' }}>
      <div
        className="profile-header-modern"
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
          zIndex: 10
        }}
      >
        <button
          onClick={onBack}
          className="back-button-modern"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <MdArrowBack size={24} />
        </button>
        <NameWithColor
          userId={profile.uid}
          name={profile.displayName}
          style={{
            fontSize: '20px',
            fontWeight: 700,
            margin: 0
          }}
        />
        <div style={{ width: '40px' }} />
      </div>

      <div
        className="profile-cover-modern"
        style={{
          width: '100%',
          height: '180px',
          background: profile.coverUrl
            ? `url(${profile.coverUrl}) center/cover`
            : 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.1) 100%)',
        }} />
      </div>

      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '-40px', marginBottom: '12px' }}>
          <AvatarWithFrame userId={profile.uid} avatarUrl={profile.avatarUrl} size="medium" />
          {isOwnProfile && (
            <button
              onClick={() => {
                startTransition(() => {
                  setShowProfileEdit(true);
                });
              }}
              className="edit-profile-button-modern"
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, #60a5fa 100%)',
                border: 'none',
                borderRadius: '24px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
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
              <MdEdit size={18} />
              {t('social.profile.edit')}
            </button>
          )}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <NameWithColor
              userId={profile.uid}
              name={profile.displayName}
              style={{ fontSize: '20px', fontWeight: 700 }}
            />
            {equippedTitle && <TitleBadge title={equippedTitle} size="medium" showName={true} />}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>@{profile.username}</div>
        </div>

        {profile.bio && <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.5', marginBottom: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{profile.bio}</div>}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          {profile.websiteUrl && <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--primary)', textDecoration: 'none' }}><MdLink size={16} />{profile.websiteUrl.startsWith('https://') ? profile.websiteUrl.substring(8) : profile.websiteUrl.startsWith('http://') ? profile.websiteUrl.substring(7) : profile.websiteUrl}</a>}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}><MdCalendarToday size={16} />{formatJoinDate(profile.createdAt)}</div>
        </div>

        <div
          className="profile-stats-modern"
          style={{
            display: 'flex',
            gap: '24px',
            padding: '20px 0',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text)' }}>
              {formatCount(profile.stats.postCount)}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {t('social.profile.posts')}
            </span>
          </div>
        </div>
      </div>

      <div
        className="profile-tabs-modern"
        style={{
          display: 'flex',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: '69px',
          zIndex: 9
        }}
      >
        {(['posts', 'replies', 'media', 'likes'] as ProfileTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => startTransition(() => setActiveTab(tab))}
            className={`profile-tab-modern ${activeTab === tab ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.color = 'var(--primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {tab === 'posts' && t('social.profile.posts')}
            {tab === 'replies' && t('social.profile.replies')}
            {tab === 'media' && t('social.profile.media')}
            {tab === 'likes' && t('social.profile.likes')}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '0', opacity: isPending ? 0.7 : 1, transition: 'opacity 0.3s ease' }}>
        {postsLoading ? (
          <Suspense fallback={<div>Loading...</div>}>
            <div>
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          </Suspense>
        ) : memoizedPosts.length === 0 ? (
          <div
            className="empty-posts-modern"
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}
          >
            <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'fadeInUp 0.5s ease' }}>
              {activeTab === 'media' ? '📷' : activeTab === 'likes' ? '❤️' : activeTab === 'replies' ? '💬' : '📝'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              {activeTab === 'posts' && (isOwnProfile ? t('social.profile.noPosts') : t('social.profile.userNoPosts'))}
              {activeTab === 'replies' && (isOwnProfile ? t('social.profile.noReplies') : t('social.profile.userNoReplies'))}
              {activeTab === 'media' && (isOwnProfile ? '画像付き投稿はまだありません' : 'このユーザーはまだ画像を投稿していません')}
              {activeTab === 'likes' && (isOwnProfile ? 'まだいいねした投稿がありません' : 'このユーザーのいいねは非公開です')}
            </div>
          </div>
        ) : (
          <Suspense fallback={<PostCardSkeleton />}>
            <div>
              {activeTab === 'posts' && pinnedPost && (
                <div style={{ animation: 'fadeInUp 0.5s ease' }}>
                  <PostCard
                    key={pinnedPost.id}
                    post={pinnedPost}
                    onPostClick={onPostClick}
                    onUserClick={onUserClick}
                    showPinButton={!!isOwnProfile}
                    onPinToggle={handlePinToggle}
                  />
                </div>
              )}
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
                    showPinButton={!!isOwnProfile && activeTab === 'posts'}
                    onPinToggle={handlePinToggle}
                  />
                </div>
              ))}
            </div>
          </Suspense>
        )}
      </div>

      {showProfileEdit && (
        <ProfileEditScreen
          onBack={() => {
            setShowProfileEdit(false);
            // プロフィールを再取得
            const refreshProfile = async () => {
              try {
                const updatedProfile = await getUserProfile(userId);
                if (updatedProfile) {
                  setProfile(updatedProfile);
                }
              } catch (error) {
                console.error('[UserProfileScreen] プロフィールの再取得に失敗:', error);
              }
            };
            refreshProfile();
          }}
        />
      )}
    </div>
  );
});
