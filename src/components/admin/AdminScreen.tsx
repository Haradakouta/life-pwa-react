import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../hooks/useAuth';
import { adminOperations } from '../../utils/firestore';
import { clearOperatorApiKeyCache } from '../../api/gemini';
import { getAllInquiries, replyToInquiry } from '../../utils/inquiry';
import type { Inquiry } from '../../types/inquiry';
import { MdKey, MdVisibility, MdVisibilityOff, MdSave, MdMessage, MdSend } from 'react-icons/md';
import app from '../../config/firebase';
import { useTranslation } from 'react-i18next';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'system' | 'inquiry'>('inquiry');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loadingApiKey, setLoadingApiKey] = useState(false);

  // Inquiry State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);

  const functions = getFunctions(app, 'us-central1');
  const callDeleteAllPosts = httpsCallable(functions, 'deleteAllPosts');
  const callDeleteAllFollows = httpsCallable(functions, 'deleteAllFollows');

  useEffect(() => {
    // Load API Key config
    const loadConfig = async () => {
      if (!user) return;
      try {
        const config = await adminOperations.getConfig();
        if (config?.geminiApiKey) {
          setApiKey(config.geminiApiKey);
        }
      } catch (e) {
        console.error("Error loading config:", e);
      }
    };
    loadConfig();
    loadInquiries();
  }, [user]);

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const data = await getAllInquiries();
      setInquiries(data);
    } catch (e) {
      console.error("Failed to load inquiries", e);
    } finally {
      setLoadingInquiries(false);
    }
  };

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
      clearOperatorApiKeyCache();
      setMessage(t('adminPanel.apiKey.success'));
    } catch (e) {
      console.error("Error saving API key:", e);
      const errorMessage = e instanceof Error ? e.message : t('adminPanel.unknownError');
      setError(t('adminPanel.apiKey.error', { error: errorMessage }));
    } finally {
      setLoadingApiKey(false);
    }
  };

  const handleDeleteAllPosts = async () => {
    if (!window.confirm(t('adminPanel.deletePosts.confirm'))) return;
    setMessage(null);
    setError(null);
    try {
      const result = await callDeleteAllPosts();
      setMessage(t('adminPanel.deletePosts.success', { result: JSON.stringify(result.data) }));
    } catch (e: unknown) {
      console.error("Error deleting all posts:", e);
      setError(t('adminPanel.deletePosts.error', { error: String(e) }));
    }
  };

  const handleDeleteAllFollows = async () => {
    if (!window.confirm(t('adminPanel.deleteFollows.confirm'))) return;
    setMessage(null);
    setError(null);
    try {
      const result = await callDeleteAllFollows();
      setMessage(t('adminPanel.deleteFollows.success', { result: JSON.stringify(result.data) }));
    } catch (e: unknown) {
      console.error("Error deleting all follows:", e);
      setError(t('adminPanel.deleteFollows.error', { error: String(e) }));
    }
  };

  const handleReply = async (inquiryId: string) => {
    if (!replyText.trim()) return;
    try {
      await replyToInquiry(inquiryId, replyText);
      alert('返信を送信しました');
      setReplyText('');
      setSelectedInquiryId(null);
      loadInquiries();
    } catch (e) {
      console.error(e);
      alert('返信の送信に失敗しました');
    }
  };

  if (!user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>{t('adminPanel.noPermission')}</div>;
  }

  return (
    <div className="screen active" style={{ paddingBottom: '80px' }}>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--text)' }}>
          {t('adminPanel.title')}
        </h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('inquiry')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: activeTab === 'inquiry' ? 'var(--primary)' : 'var(--card)',
              color: activeTab === 'inquiry' ? 'white' : 'var(--text)',
              border: activeTab === 'inquiry' ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MdMessage /> お問い合わせ管理
          </button>
          <button
            onClick={() => setActiveTab('system')}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              background: activeTab === 'system' ? 'var(--primary)' : 'var(--card)',
              color: activeTab === 'system' ? 'white' : 'var(--text)',
              border: activeTab === 'system' ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <MdKey /> システム設定
          </button>
        </div>

        {message && <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{message}</div>}
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

        {activeTab === 'inquiry' && (
          <div>
            <h3 style={{ marginBottom: '16px' }}>お問い合わせ一覧</h3>
            {loadingInquiries ? (
              <p>読み込み中...</p>
            ) : inquiries.length === 0 ? (
              <p>お問い合わせはありません</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(inquiry.createdAt).toLocaleString()}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: inquiry.status === 'replied' ? '#10b981' : '#f59e0b'
                      }}>
                        {inquiry.status === 'replied' ? '返信済み' : '未返信'}
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>User:</strong> {inquiry.userEmail} ({inquiry.userId})
                    </div>
                    <h4 style={{ margin: '0 0 8px' }}>{inquiry.subject}</h4>
                    <p style={{ background: 'var(--background)', padding: '12px', borderRadius: '8px', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
                      {inquiry.body}
                    </p>

                    {inquiry.reply && (
                      <div style={{
                        marginLeft: '20px',
                        borderLeft: '4px solid #10b981',
                        paddingLeft: '12px',
                        marginBottom: '16px'
                      }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>返信内容:</p>
                        <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{inquiry.reply}</p>
                      </div>
                    )}

                    {selectedInquiryId === inquiry.id ? (
                      <div>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="返信内容を入力..."
                          style={{
                            width: '100%',
                            minHeight: '100px',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--background)',
                            color: 'var(--text)',
                            marginBottom: '8px',
                            boxSizing: 'border-box'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedInquiryId(null)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              background: 'transparent',
                              border: '1px solid var(--border)',
                              color: 'var(--text)',
                              cursor: 'pointer'
                            }}
                          >
                            キャンセル
                          </button>
                          <button
                            onClick={() => handleReply(inquiry.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '8px',
                              background: 'var(--primary)',
                              border: 'none',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <MdSend /> 返信送信
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedInquiryId(inquiry.id);
                          setReplyText(inquiry.reply || ''); // 既存の返信があればセット
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                          background: 'var(--background)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <MdMessage /> {inquiry.status === 'replied' ? '返信を編集' : '返信する'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <div style={{
              background: 'var(--card-background)',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '2px solid var(--border)'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                <MdKey size={24} color="var(--primary)" />
                {t('adminPanel.apiKey.title')}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {t('adminPanel.apiKey.description')}
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
                {loadingApiKey ? t('adminPanel.apiKey.saving') : t('adminPanel.apiKey.save')}
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
                fontSize: '16px',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
            >
              {t('adminPanel.deletePosts.button')}
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
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {t('adminPanel.deleteFollows.button')}
            </button>
            <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #8b5cf6', borderRadius: '8px', background: '#f5f3ff' }}>
              <h4 style={{ color: '#6d28d9', margin: '0 0 10px' }}>⚡ ハーちゃん憑依モード</h4>
              <p style={{ fontSize: '0.9rem', color: '#5b21b6', marginBottom: '15px' }}>
                現在のアカウントのデータを全て消去し、ハイスペック社会人「haachan」のデータ（2025/10/01〜2026/01/26の全記録）で上書きします。<br />
                <strong>※この操作は取り消せません。</strong>
              </p>
              <button
                onClick={async () => {
                  if (!window.confirm('本当に憑依しますか？\n現在のデータは永久に削除されます。')) return;
                  if (!window.confirm('本当に本当によろしいですか？')) return;

                  setMessage('憑依準備中...画面を閉じないでください');
                  setError(null);
                  try {
                    const { seedHaachanData } = await import('../../utils/seeder');
                    await seedHaachanData(user.uid, (msg) => setMessage(msg));
                    alert('憑依完了。世界線が移動しました。(リロードします)');
                    window.location.reload();
                  } catch (e: any) {
                    setError('憑依失敗: ' + e.message);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)'
                }}
              >
                haachanに憑依する
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '15px',
            background: 'var(--background)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  );
};
