import { useState, useEffect, useCallback } from 'react';
import { UserListModal } from './UserListModal';
import { getFollowing, followUser, unfollowUser } from '../../utils/profile';
import { useAuth } from '../../hooks/useAuth';
import type { Follower } from '../../types/profile';

interface FollowingListModalProps {
  userId: string;
  onClose: () => void;
  onNavigateToProfile: (userId: string) => void;
}

export const FollowingListModal: React.FC<FollowingListModalProps> = ({ userId, onClose, onNavigateToProfile }) => {
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowing = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedFollowing = await getFollowing(userId);
      setFollowing(fetchedFollowing);
    } catch (error) {
      console.error("Failed to fetch following list:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  const handleFollowToggle = async (targetUserId: string, isCurrentlyFollowing: boolean) => {
    if (!currentUser) return;

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(currentUser.uid, targetUserId);
      } else {
        await followUser(
          currentUser.uid,
          currentUser.displayName || 'Anonymous',
          currentUser.photoURL || undefined,
          targetUserId,
          following.find(f => f.uid === targetUserId)?.displayName || 'User',
          following.find(f => f.uid === targetUserId)?.avatarUrl || undefined
        );
      }
      await fetchFollowing();
    } catch (error) {
      console.error('Follow/unfollow operation failed:', error);
      alert('操作に失敗しました。もう一度お試しください。');
    }
  };

  const handleNavigate = (userId: string) => {
    onClose();
    onNavigateToProfile(userId);
  }

  if (loading) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Following</h3>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">Loading...</div>
            </div>
        </div>
    );
  }

  return (
    <UserListModal 
      title="Following"
      users={following}
      currentUserId={currentUser?.uid || ''}
      onClose={onClose}
      onFollowToggle={handleFollowToggle}
      onNavigateToProfile={handleNavigate}
    />
  );
};