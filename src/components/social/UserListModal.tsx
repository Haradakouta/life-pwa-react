import React from 'react';
import type { Follower } from '../../types/profile';
import { MdPersonAdd, MdPersonRemove } from 'react-icons/md';

interface UserListModalProps {
  title: string;
  users: Follower[];
  currentUserId: string;
  onClose: () => void;
  onFollowToggle: (targetUserId: string, isCurrentlyFollowing: boolean) => void;
  onNavigateToProfile: (userId: string) => void;
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
    <div className="modal active" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close">&times;</button>
        </div>
        <div className="modal-body user-list" style={{ padding: '0' }}>
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.uid} className="list-item" style={{ padding: '12px 20px' }}>
                <div style={{ cursor: 'pointer' }} onClick={() => onNavigateToProfile(user.uid)}>
                  <img 
                    src={user.avatarUrl || '/icon-192.png'} 
                    alt={user.displayName} 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                </div>
                <div className="list-content" style={{ cursor: 'pointer' }} onClick={() => onNavigateToProfile(user.uid)}>
                  <div className="list-title" style={{ fontWeight: 600 }}>{user.displayName}</div>
                  <div className="list-subtitle">@{user.username}</div>
                </div>
                {user.uid !== currentUserId && (
                  <button 
                    className={`follow-button ${user.isFollowing ? 'following' : 'not-following'}`}
                    onClick={() => onFollowToggle(user.uid, user.isFollowing || false)}
                    style={{
                      padding: '6px 12px',
                      background: user.isFollowing ? 'var(--card)' : 'var(--primary)',
                      border: user.isFollowing ? '1px solid var(--border)' : 'none',
                      borderRadius: '20px',
                      color: user.isFollowing ? 'var(--text)' : 'white',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      marginLeft: 'auto',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {user.isFollowing ? <MdPersonRemove /> : <MdPersonAdd />}
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p className="empty-text">No users to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};