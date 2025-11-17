import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../utils/profile';
import { adminOperations } from '../../utils/firestore';
import { clearOperatorApiKeyCache } from '../../api/gemini';
import { MdKey, MdVisibility, MdVisibilityOff, MdSave } from 'react-icons/md';
import app from '../../config/firebase';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(false);

  // deleteAllPostsとdeleteAllFollowsはus-central1リージョンにデプロイされている
  const functions = getFunctions(app, 'us-central1');
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
          // 管理者の場合、現在のAPIキーを取得
          const config = await adminOperations.getConfig();
          if (config?.geminiApiKey) {
            setApiKey(config.geminiApiKey);
          }
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

  const handleSaveApiKey = async () => {
    if (!user) return;

    setLoadingApiKey(true);
    setMessage(null);
    setError(null);

    try {
      await adminOperations.updateConfig(
        { geminiApiKey: apiKey.trim() || undefined },
        user.uid
      );

      // キャッシュをクリア
      clearOperatorApiKeyCache();

      setMessage('運営者APIキーを保存しました。キャッシュをクリアしました。');
    } catch (e) {
      console.error("Error saving API key:", e);
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      setError(`APIキーの保存に失敗しました: ${errorMessage}`);
    } finally {
      setLoadingApiKey(false);
    }
  };

  const handleDeleteAllPosts = async () => {
    if (!window.confirm('本当にすべての投稿を削除しますか？この操作は元に戻せません。')) return;
    setMessage(null);
    setError(null);
    try {
      const result = await callDeleteAllPosts();
      setMessage(`すべての投稿が削除されました: ${JSON.stringify(result.data)}`);
    } catch (e: unknown) {
      console.error("Error deleting all posts:", e);
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      setError(`投稿の削除に失敗しました: ${errorMessage}`);
    }
  };

  const handleDeleteAllFollows = async () => {
    if (!window.confirm('本当にすべてのフォロー関係を削除しますか？この操作は元に戻せません。')) return;
    setMessage(null);
    setError(null);
    try {
      const result = await callDeleteAllFollows();
      setMessage(`すべてのフォロー関係が削除されました: ${JSON.stringify(result.data)}`);
    } catch (e: unknown) {
      console.error("Error deleting all follows:", e);
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      setError(`フォロー関係の削除に失敗しました: ${errorMessage}`);
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

      <div style={{
        background: 'var(--card-background)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid var(--border)'
      }}>
        <h3 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '15px',
          color: 'var(--text)'
        }}>
          <MdKey size={24} color="var(--primary)" />
          運営者Gemini APIキー設定
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          全ユーザーが使用する運営者APIキーを設定します。
          <br />
          このAPIキーはFirestoreの`admin/config`コレクションに保存されます。
        </p>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            style={{
              width: '100%',
              padding: '12px 40px 12px 12px',
              fontSize: '14px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showApiKey ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
          </button>
        </div>
        <button
          onClick={handleSaveApiKey}
          disabled={loadingApiKey}
          style={{
            width: '100%',
            padding: '12px',
            background: loadingApiKey ? 'var(--border)' : 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loadingApiKey ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <MdSave size={18} />
          {loadingApiKey ? '保存中...' : 'APIキーを保存'}
        </button>
      </div>

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
