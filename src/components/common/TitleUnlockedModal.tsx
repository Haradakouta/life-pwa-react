/**
 * 称号獲得時のモーダル
 */
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserTitles, getTitleById } from '../../utils/title';
import { TitleBadge } from './TitleBadge';
import { MdClose } from 'react-icons/md';

export const TitleUnlockedModal: React.FC = () => {
  const { user } = useAuth();
  const [newlyGranted, setNewlyGranted] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    // 前回チェック時の称号IDを取得
    const lastCheckedKey = `lastTitleCheck_${user.uid}`;
    const lastCheckedTitleIds = JSON.parse(localStorage.getItem(lastCheckedKey) || '[]');

    // 現在の称号を取得
    const checkForNewTitles = async () => {
      try {
        const userTitles = await getUserTitles(user.uid);
        const currentTitleIds = userTitles.map(t => t.titleId);
        
        // 新しく獲得した称号を検出
        const newlyEarned = currentTitleIds.filter(id => !lastCheckedTitleIds.includes(id));
        
        if (newlyEarned.length > 0) {
          setNewlyGranted(newlyEarned);
          setShowModal(true);
          // ローカルストレージを更新
          localStorage.setItem(lastCheckedKey, JSON.stringify(currentTitleIds));
        }
      } catch (error) {
        console.error('称号チェックエラー:', error);
      }
    };

    // 初回チェック
    checkForNewTitles();

    // 定期的にチェック（30秒ごと）
    const interval = setInterval(checkForNewTitles, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  if (!showModal || newlyGranted.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={() => setShowModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          position: 'relative',
        }}
      >
        <button
          onClick={() => setShowModal(false)}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--background)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <MdClose size={24} color="var(--text)" />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
            称号を獲得しました！
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {newlyGranted.length}個の新しい称号を獲得しました
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {newlyGranted.map(titleId => {
            const title = getTitleById(titleId);
            if (!title) return null;
            return (
              <div
                key={titleId}
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  borderRadius: '12px',
                  border: '2px solid #fcd34d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TitleBadge title={title} size="medium" showName={true} />
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowModal(false)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--primary-dark)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--primary)';
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

