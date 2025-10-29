import { useState, useEffect } from 'react';
import { MdClose, MdPersonAdd, MdPersonRemove } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getFollowers, followUser, unfollowUser, getUserProfile } from '../../utils/profile';
import type { Follower } from '../../types/profile';

interface FollowersListModalProps {
  userId: string;
  onClose: () => void;
  onUserClick: (userId: string) => void;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({
  userId,
  onClose,
  onUserClick,
}) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      try {
        const data = await getFollowers(userId);
        setFollowers(data);
      } catch (error) {
        console.error('Failed to fetch followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  const handleFollow = async (targetUserId: string, targetUserName: string, index: number) => {
    if (!user) return;

    setFollowLoading(targetUserId);
    try {
      const currentUserProfile = await getUserProfile(user.uid);
      if (!currentUserProfile) return;

      await followUser(
        user.uid,
        currentUserProfile.displayName,
        currentUserProfile.avatarUrl,
        targetUserId,
        targetUserName
      );

      // 状態を更新
      setFollowers((prev) =>
        prev.map((f, i) => (i === index ? { ...f, isFollowing: true } : f))
      );
    } catch (error) {
      console.error('Follow failed:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  const handleUnfollow = async (targetUserId: string, index: number) => {
    if (!user) return;

    setFollowLoading(targetUserId);
    try {
      await unfollowUser(user.uid, targetUserId);

      // 状態を更新
      setFollowers((prev) =>
        prev.map((f, i) => (i === index ? { ...f, isFollowing: false } : f))
      );
    } catch (error) {
      console.error('Unfollow failed:', error);
    } finally {
      setFollowLoading(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            フォロワー
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* コンテンツ */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
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
              <div>読み込み中...</div>
            </div>
          ) : followers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <div>フォロワーはまだいません</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {followers.map((follower, index) => (
                <div
                  key={follower.uid}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--border)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  onClick={() => {
                    onUserClick(follower.uid);
                    onClose();
                  }}
                >
                  {/* アバター */}
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: follower.avatarUrl
                        ? `url(${follower.avatarUrl}) center/cover`
                        : 'linear-gradient(135deg, var(--primary), #81c784)',
                      flexShrink: 0,
                    }}
                  />

                  {/* ユーザー情報 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                      {follower.displayName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      @{follower.username}
                    </div>
                    {follower.bio && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {follower.bio}
                      </div>
                    )}
                  </div>

                  {/* フォローボタン */}
                  {user && user.uid !== follower.uid && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (follower.isFollowing) {
                          handleUnfollow(follower.uid, index);
                        } else {
                          handleFollow(follower.uid, follower.displayName, index);
                        }
                      }}
                      disabled={followLoading === follower.uid}
                      style={{
                        padding: '6px 16px',
                        background: follower.isFollowing ? 'var(--card)' : 'var(--primary)',
                        border: follower.isFollowing ? '2px solid var(--border)' : 'none',
                        borderRadius: '20px',
                        color: follower.isFollowing ? 'var(--text)' : 'white',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: followLoading === follower.uid ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: followLoading === follower.uid ? 0.6 : 1,
                        transition: 'all 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      {follower.isFollowing ? (
                        <>
                          <MdPersonRemove size={14} />
                          フォロー中
                        </>
                      ) : (
                        <>
                          <MdPersonAdd size={14} />
                          フォロー
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
