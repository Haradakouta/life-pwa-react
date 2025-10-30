import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../utils/profile';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const functions = getFunctions();
  const callDeleteAllPosts = httpsCallable(functions, 'deleteAllPosts');
  const callDeleteAllFollows = httpsCallable(functions, 'deleteAllFollows');

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        if (profile && profile.username === 'haachan') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        console.error("Error checking admin status:", e);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [user]);

  const handleDeleteAllPosts = async () => {
    if (!window.confirm('本当にすべての投稿を削除しますか？この操作は元に戻せません。')) return;
    setMessage(null);
    setError(null);
    try {
      const result = await callDeleteAllPosts();
      setMessage(`すべての投稿が削除されました: ${JSON.stringify(result.data)}`);
    } catch (e: any) {
      console.error("Error deleting all posts:", e);
      setError(`投稿の削除に失敗しました: ${e.message || '不明なエラー'}`);
    }
  };

  const handleDeleteAllFollows = async () => {
    if (!window.confirm('本当にすべてのフォロー関係を削除しますか？この操作は元に戻せません。')) return;
    setMessage(null);
    setError(null);
    try {
      const result = await callDeleteAllFollows();
      setMessage(`すべてのフォロー関係が削除されました: ${JSON.stringify(result.data)}`);
    } catch (e: any) {
      console.error("Error deleting all follows:", e);
      setError(`フォロー関係の削除に失敗しました: ${e.message || '不明なエラー'}`);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading admin panel...</div>;
  }

  if (!isAdmin) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>管理者権限がありません。</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--text)' }}>管理者パネル</h2>
      {message && <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
      {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
      
      <button 
        onClick={handleDeleteAllPosts} 
        style={{ 
          width: '100%', 
          padding: '15px', 
          background: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          fontSize: '18px', 
          cursor: 'pointer', 
          marginBottom: '10px' 
        }}
      >
        すべての投稿を削除
      </button>
      <button 
        onClick={handleDeleteAllFollows} 
        style={{ 
          width: '100%', 
          padding: '15px', 
          background: '#dc3545', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          fontSize: '18px', 
          cursor: 'pointer' 
        }}
      >
        すべてのフォロー関係を削除
      </button>
      <button 
        onClick={onBack} 
        style={{ 
          width: '100%', 
          padding: '15px', 
          background: 'var(--background)', 
          color: 'var(--text)', 
          border: '1px solid var(--border)', 
          borderRadius: '5px', 
          fontSize: '18px', 
          cursor: 'pointer', 
          marginTop: '20px' 
        }}
      >
        戻る
      </button>
    </div>
  );
};
