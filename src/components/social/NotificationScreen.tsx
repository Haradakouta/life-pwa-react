/**
 * 通知画面
 */

import React, { useState, useEffect } from 'react';
import { MdNotifications, MdCheckCircle, MdDelete, MdMoreVert } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import {
  groupNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
  subscribeToNotifications,
  getNotificationIcon,
  getNotificationMessage,
} from '../../utils/notification';
import { getRelativeTime } from '../../utils/post';
import type { NotificationGroup } from '../../types/notification';

interface NotificationScreenProps {
  onNavigateToPost?: (postId: string) => void;
  onNavigateToProfile?: (userId: string) => void;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  onNavigateToPost,
  onNavigateToProfile,
}) => {
  const { user } = useAuth();
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!user) return;

    // リアルタイムで通知を監視
    const unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
      setGroupedNotifications(groupNotifications(newNotifications));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationClick = async (group: NotificationGroup) => {
    if (!user) return;

    // 未読の場合、既読にする
    if (!group.isRead) {
      try {
        await markNotificationAsRead(user.uid, group.latestNotification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // 通知の種類に応じて適切な画面に遷移
    if (group.type === 'follow') {
      // フォロー通知の場合、フォローしたユーザーのプロフィールへ
      if (group.actors.length === 1 && onNavigateToProfile) {
        onNavigateToProfile(group.actors[0].id);
      }
    } else if (group.postId && onNavigateToPost) {
      // 投稿関連の通知の場合、その投稿へ
      onNavigateToPost(group.postId);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setShowMenu(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('エラーが発生しました');
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;

    if (!confirm('全ての通知を削除しますか？')) return;

    try {
      await deleteAllNotifications(user.uid);
      setShowMenu(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      alert('エラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>読み込み中...</p>
      </div>
    );
  }

  if (groupedNotifications.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
      }}>
        <MdNotifications size={64} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
        <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>通知はありません</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          いいねやコメント、フォローなどの通知がここに表示されます
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ヘッダー */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>通知</h2>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MdMoreVert size={24} />
          </button>

          {showMenu && (
            <>
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                }}
                onClick={() => setShowMenu(false)}
              />
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '200px',
                zIndex: 1000,
                overflow: 'hidden',
              }}>
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <MdCheckCircle size={20} />
                  すべて既読にする
                </button>
                <button
                  onClick={handleDeleteAll}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <MdDelete size={20} />
                  すべて削除
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 通知リスト */}
      <div>
        {groupedNotifications.map((group) => (
          <div
            key={`${group.type}_${group.postId || group.actors[0].id}_${group.latestNotification.id}`}
            onClick={() => handleNotificationClick(group)}
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              background: group.isRead ? 'transparent' : 'rgba(29, 155, 240, 0.05)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = group.isRead
                ? 'var(--hover)'
                : 'rgba(29, 155, 240, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = group.isRead
                ? 'transparent'
                : 'rgba(29, 155, 240, 0.05)';
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
              {/* アイコン */}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0,
              }}>
                {getNotificationIcon(group.type)}
              </div>

              {/* 内容 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* アクター（複数の場合はアバターを並べる） */}
                {group.actors.length <= 3 ? (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {group.actors.map((actor) => (
                      <div
                        key={actor.id}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: actor.avatar ? `url(${actor.avatar})` : 'var(--primary)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: '2px solid var(--background)',
                        }}
                      >
                        {!actor.avatar && actor.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                    {group.actors.slice(0, 3).map((actor) => (
                      <div
                        key={actor.id}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: actor.avatar ? `url(${actor.avatar})` : 'var(--primary)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          border: '2px solid var(--background)',
                        }}
                      >
                        {!actor.avatar && actor.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {group.count > 3 && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        +{group.count - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* メッセージ */}
                <p style={{
                  margin: '0 0 8px 0',
                  color: 'var(--text)',
                  fontSize: '15px',
                }}>
                  {getNotificationMessage(group)}
                </p>

                {/* 投稿のプレビュー */}
                {group.latestNotification.postContent && (
                  <p style={{
                    margin: '0 0 8px 0',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {group.latestNotification.postContent}
                  </p>
                )}

                {/* コメントのプレビュー */}
                {group.latestNotification.commentContent && (
                  <p style={{
                    margin: '0 0 8px 0',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    💬 {group.latestNotification.commentContent}
                  </p>
                )}

                {/* 時間 */}
                <p style={{
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                }}>
                  {getRelativeTime(group.latestNotification.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationScreen;
