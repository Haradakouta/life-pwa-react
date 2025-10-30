import React from 'react';
import type { Follower } from '../../types/profile';

interface UserListModalProps {
  title: string;
  users: Follower[];
  currentUserId: string;
  onClose: () => void;
  onFollowToggle: (targetUserId: string, isCurrentlyFollowing: boolean) => void;
  onNavigateToProfile: (userId: string) => void; // 仮のナビゲーション関数
}

export const UserListModal: React.FC<UserListModalProps> = ({ 
  title, 
  users, 
  currentUserId,
  onClose, 
  onFollowToggle,
  onNavigateToProfile
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body user-list">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.uid} className="user-list-item">
                <div className="user-info" onClick={() => onNavigateToProfile(user.uid)} style={{ cursor: 'pointer' }}>
                  <img src={user.avatarUrl || '/icon-192.png'} alt={user.displayName} className="avatar-small" />
                  <div className="user-details">
                    <span className="display-name">{user.displayName}</span>
                    <span className="username">@{user.username}</span>
                  </div>
                </div>
                {user.uid !== currentUserId && (
                  <button 
                    className={`follow-button ${user.isFollowing ? 'following' : 'not-following'}`}
                    onClick={() => onFollowToggle(user.uid, user.isFollowing || false)}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No users to display.</p>
          )}
        </div>
      </div>
    </div>
  );
};
