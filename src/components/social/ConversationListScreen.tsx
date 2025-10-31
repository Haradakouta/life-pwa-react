import { useState, useEffect } from 'react';
import { MdChatBubbleOutline, MdArrowBack } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { subscribeToConversations } from '../../utils/chat';
import type { Conversation } from '../../utils/chat';
import { getUserProfile } from '../../utils/profile';
import { ChatScreen } from './ChatScreen';

interface ConversationListScreenProps {
  onBack: () => void;
  onNavigateToProfile: (userId: string) => void;
}

export const ConversationListScreen: React.FC<ConversationListScreenProps> = ({
  onBack,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversationParticipants, setSelectedConversationParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setError('ログインしていません。');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToConversations(user.uid, async (fetchedConversations) => {
      const conversationsWithProfiles = await Promise.all(
        fetchedConversations.map(async (conv) => {
          const participantProfiles = await Promise.all(
            conv.participants.map(async (uid) => {
              const profile = await getUserProfile(uid);
              return { uid, displayName: profile?.displayName || 'Unknown', avatarUrl: profile?.avatarUrl };
            })
          );
          return { ...conv, participantProfiles };
        })
      );
      setConversations(conversationsWithProfiles);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleConversationClick = (conversationId: string, participants: string[]) => {
    setSelectedConversationId(conversationId);
    setSelectedConversationParticipants(participants);
  };

  const handleBackToConversations = () => {
    setSelectedConversationId(null);
    setSelectedConversationParticipants([]);
  };

  if (selectedConversationId && selectedConversationParticipants.length > 0) {
    return (
      <ChatScreen
        conversationId={selectedConversationId}
        participants={selectedConversationParticipants}
        onBack={handleBackToConversations}
        onNavigateToProfile={onNavigateToProfile}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        会話を読み込み中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--error)' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}><MdArrowBack size={24} /></button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '0 0 0 16px' }}>DM</h2>
      </div>

      {conversations.length === 0 ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <MdChatBubbleOutline size={60} style={{ marginBottom: '16px' }} />
          <p>まだ会話がありません。</p>
          <p>フレンドとDMを開始しましょう！</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const otherParticipant = conv.participantProfiles?.find(p => p.uid !== user?.uid);
          return (
            <div
              key={conv.id}
              style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => handleConversationClick(conv.id, conv.participants)}
            >
              <img
                src={otherParticipant?.avatarUrl || 'https://via.placeholder.com/40'}
                alt={otherParticipant?.displayName}
                style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '12px' }}
              />
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text)' }}>{otherParticipant?.displayName || 'Unknown User'}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{conv.lastMessage || '会話を開始'}</div>
              </div>
              {conv.lastMessageTimestamp && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};
