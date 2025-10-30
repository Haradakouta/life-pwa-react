import { useState, useEffect } from 'react';
import { MdClose, MdPersonAdd, MdCheck, MdClose as MdDecline, MdChatBubbleOutline } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getFriends, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend } from '../../utils/friend';
import { getOrCreateConversation } from '../../utils/chat';
import type { Friend } from '../../types/profile';

interface FriendListModalProps {
  userId: string;
  onClose: () => void;
  onNavigateToProfile: (userId: string) => void;
  onNavigateToDM: (conversationId: string, participantIds: string[]) => void; // DM機能追加
  initialTab?: 'friends' | 'pending_sent' | 'pending_received';
}

export const FriendListModal: React.FC<FriendListModalProps> = ({
  userId,
  onClose,
  onNavigateToProfile,
  initialTab = 'friends',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingSent, setPendingSent] = useState<Friend[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = user && user.uid === userId;

  useEffect(() => {
    const fetchFriendLists = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedFriends = await getFriends(userId, 'accepted');
        setFriends(fetchedFriends);

        if (isOwnProfile) {
          const fetchedPendingSent = await getFriends(userId, 'pending_sent');
          setPendingSent(fetchedPendingSent);

          const fetchedPendingReceived = await getFriends(userId, 'pending_received');
          setPendingReceived(fetchedPendingReceived);
        }
      } catch (err) {
        console.error('Failed to fetch friend lists:', err);
        setError('フレンドリストの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendLists();
  }, [userId, isOwnProfile]);

  const handleFriendAction = async (action: 'send' | 'accept' | 'decline' | 'remove', targetFriend: Friend) => {
    if (!user) return;

    try {
      switch (action) {
        case 'send':
          await sendFriendRequest(
            user.uid,
            user.displayName || 'Anonymous',
            user.photoURL || undefined,
            targetFriend.uid,
            targetFriend.displayName,
            targetFriend.avatarUrl || undefined
          );
          break;
        case 'accept':
          await acceptFriendRequest(
            user.uid,
            user.displayName || 'Anonymous',
            user.photoURL || undefined,
            targetFriend.uid,
            targetFriend.displayName,
            targetFriend.avatarUrl || undefined
          );
          break;
        case 'decline':
          await declineFriendRequest(user.uid, targetFriend.uid);
          break;
        case 'remove':
          await removeFriend(user.uid, targetFriend.uid);
          break;
      }
      // Re-fetch lists to update UI
      const fetchedFriends = await getFriends(userId, 'accepted');
      setFriends(fetchedFriends);
      if (isOwnProfile) {
        const fetchedPendingSent = await getFriends(userId, 'pending_sent');
        setPendingSent(fetchedPendingSent);
        const fetchedPendingReceived = await getFriends(userId, 'pending_received');
        setPendingReceived(fetchedPendingReceived);
      }
    } catch (err) {
      console.error(`Failed to perform friend action ${action}:`, err);
      alert(`フレンド操作に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    }
  };

  const handleDMClick = async (friendUid: string) => {
    if (!user) return;
    try {
      const conversationId = await getOrCreateConversation(user.uid, friendUid);
      onNavigateToDM(conversationId, [user.uid, friendUid]);
      onClose();
    } catch (error) {
      console.error('Failed to start DM:', error);
      alert('DMを開始できませんでした。');
    }
  };

  const renderFriendItem = (friend: Friend) => (
    <div key={friend.uid} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => {
      onNavigateToProfile(friend.uid);
      onClose();
    }}>
      <img src={friend.avatarUrl || 'https://via.placeholder.com/40'} alt={friend.displayName} style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '12px' }} />
      <div style={{ flexGrow: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--text)' }}>{friend.displayName}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>@{friend.username}</div>
      </div>
      {isOwnProfile && friend.status === 'pending_received' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); handleFriendAction('accept', friend); }} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}><MdCheck size={16} /></button>
          <button onClick={(e) => { e.stopPropagation(); handleFriendAction('decline', friend); }} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}><MdDecline size={16} /></button>
        </div>
      )}
      {isOwnProfile && friend.status === 'accepted' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); handleFriendAction('remove', friend); }} style={{ background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}>解除</button>
          <button onClick={(e) => { e.stopPropagation(); handleDMClick(friend.uid); }} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}><MdChatBubbleOutline size={16} /> DM</button>
        </div>
      )}
      {!isOwnProfile && friend.status === 'accepted' && (
        <button onClick={(e) => { e.stopPropagation(); handleDMClick(friend.uid); }} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer' }}><MdChatBubbleOutline size={16} /> DM</button>
      )}
      {isOwnProfile && friend.status === 'pending_sent' && (
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>申請中</span>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'var(--card)', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>読み込み中...</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}><MdClose /></button>
          </div>
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            フレンドリストを読み込み中...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: 'var(--card)', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--text)' }}>エラー</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}><MdClose /></button>
          </div>
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--card)', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '80%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--text)' }}>フレンド</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}><MdClose /></button>
        </div>

        {isOwnProfile && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('friends')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'friends' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'friends' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              フレンド ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('pending_received')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'pending_received' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'pending_received' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              リクエスト ({pendingReceived.length})
            </button>
            <button
              onClick={() => setActiveTab('pending_sent')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'pending_sent' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'pending_sent' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              送信済み ({pendingSent.length})
            </button>
          </div>
        )}

        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
          {activeTab === 'friends' && (
            friends.length > 0 ? (
              friends.map(renderFriendItem)
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                フレンドはいません。
              </div>
            )
          )}
          {activeTab === 'pending_received' && (
            pendingReceived.length > 0 ? (
              pendingReceived.map(renderFriendItem)
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                受信したリクエストはありません。
              </div>
            )
          )}
          {activeTab === 'pending_sent' && (
            pendingSent.length > 0 ? (
              pendingSent.map(renderFriendItem)
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                送信済みのリクエストはありません。
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
