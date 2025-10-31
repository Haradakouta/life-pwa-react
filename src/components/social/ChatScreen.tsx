import { useState, useEffect, useRef } from 'react';
import { MdArrowBack, MdSend } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { sendMessage, subscribeToMessages } from '../../utils/chat';
import type { Message } from '../../utils/chat';
import { getUserProfile } from '../../utils/profile';

interface ChatScreenProps {
  conversationId: string;
  participants: string[];
  onBack: () => void;
  onNavigateToProfile: (userId: string) => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  conversationId,
  participants,
  onBack,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherParticipantProfile, setOtherParticipantProfile] = useState<{ displayName: string; avatarUrl?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipantId = participants.find(p => p !== user?.uid);

  useEffect(() => {
    if (!otherParticipantId) return;

    const fetchOtherProfile = async () => {
      const profile = await getUserProfile(otherParticipantId);
      if (profile) {
        setOtherParticipantProfile({ displayName: profile.displayName, avatarUrl: profile.avatarUrl });
      }
    };
    fetchOtherProfile();
  }, [otherParticipantId]);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(conversationId, (fetchedMessages) => {
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !user) return;

    try {
      await sendMessage(conversationId, user.uid, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('メッセージの送信に失敗しました。');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', background: 'var(--card)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', transition: 'background 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--border)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}><MdArrowBack size={24} /></button>
        <img
          src={otherParticipantProfile?.avatarUrl || 'https://via.placeholder.com/40'}
          alt={otherParticipantProfile?.displayName}
          style={{ width: '40px', height: '40px', borderRadius: '50%', marginLeft: '12px', cursor: 'pointer' }}
          onClick={() => onNavigateToProfile(otherParticipantId!)}
        />
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: '0 0 0 12px', flexGrow: 1 }}>{otherParticipantProfile?.displayName || 'Unknown User'}</h2>
      </div>

      <div style={{ flexGrow: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.senderId === user?.uid ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '10px 15px',
                borderRadius: '18px',
                backgroundColor: msg.senderId === user?.uid ? 'var(--primary)' : 'var(--card)',
                color: msg.senderId === user?.uid ? 'white' : 'var(--text)',
                wordBreak: 'break-word',
                fontSize: '15px',
                position: 'relative',
              }}
            >
              {msg.content}
              <span style={{ fontSize: '10px', color: msg.senderId === user?.uid ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', position: 'absolute', bottom: '5px', right: msg.senderId === user?.uid ? '10px' : 'auto', left: msg.senderId === user?.uid ? 'auto' : '10px' }}>
                {formatMessageTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: 'flex', padding: '10px 16px', borderTop: '1px solid var(--border)', background: 'var(--card)', alignItems: 'center' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="メッセージを入力..."
          style={{
            flexGrow: 1,
            padding: '10px 15px',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            marginRight: '10px',
            fontSize: '15px',
            backgroundColor: 'var(--background)',
            color: 'var(--text)',
          }}
        />
        <button
          onClick={handleSendMessage}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <MdSend size={24} />
        </button>
      </div>
    </div>
  );
};
