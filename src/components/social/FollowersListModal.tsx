import { useState, useEffect, useCallback } from 'react';
import { UserListModal } from './UserListModal';
import { getFollowers, followUser, unfollowUser } from '../../utils/profile';
import { useAuth } from '../../hooks/useAuth';
import type { Follower } from '../../types/profile';

interface FollowersListModalProps {
  userId: string;
  onClose: () => void;
  onNavigateToProfile: (userId: string) => void;
}

export const FollowersListModal: React.FC<FollowersListModalProps> = ({ userId, onClose, onNavigateToProfile }) => {
  const { user: currentUser } = useAuth();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowers = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedFollowers = await getFollowers(userId);
      setFollowers(fetchedFollowers);
    } catch (error) {
      console.error("Failed to fetch followers:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

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
          followers.find(f => f.uid === targetUserId)?.displayName || 'User',
          followers.find(f => f.uid === targetUserId)?.avatarUrl || undefined
        );
      }
      // After action, refresh the list to show the new follow status
      await fetchFollowers();
    } catch (error) {
      console.error('Follow/unfollow operation failed:', error);
      alert('操作に失敗しました。もう一度お試しください。');
    }
  };

  const handleNavigate = (userId: string) => {
    onClose(); // Close the current modal before navigating
    onNavigateToProfile(userId);
  }

  if (loading) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Followers</h3>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <div className="modal-body">Loading...</div>
            </div>
        </div>
    );
  }

  return (
    <UserListModal 
      title="Followers"
      users={followers}
      currentUserId={currentUser?.uid || ''}
      onClose={onClose}
      onFollowToggle={handleFollowToggle}
      onNavigateToProfile={handleNavigate}
    />
  );
};