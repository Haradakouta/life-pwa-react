/**
 * 通知機能のユーティリティ関数
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Notification, NotificationType, NotificationGroup } from '../types/notification';

/**
 * 通知を作成
 */
export const createNotification = async (
  recipientId: string,
  actorId: string,
  actorName: string,
  type: NotificationType,
  options?: {
    actorAvatar?: string;
    postId?: string;
    postContent?: string;
    commentId?: string;
    commentContent?: string;
  }
): Promise<void> => {
  try {
    // 自分自身への通知は作成しない
    if (recipientId === actorId) {
      return;
    }

    const notificationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const notificationRef = doc(db, 'users', recipientId, 'notifications', notificationId);

    const notificationData: any = {
      id: notificationId,
      type,
      recipientId,
      actorId,
      actorName,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // オプショナルフィールドは存在する場合のみ追加
    if (options?.actorAvatar) {
      notificationData.actorAvatar = options.actorAvatar;
    }
    if (options?.postId) {
      notificationData.postId = options.postId;
    }
    if (options?.postContent) {
      notificationData.postContent = options.postContent;
    }
    if (options?.commentId) {
      notificationData.commentId = options.commentId;
    }
    if (options?.commentContent) {
      notificationData.commentContent = options.commentContent;
    }

    await setDoc(notificationRef, {
      ...notificationData,
      createdAt: Timestamp.now(),
    });

    console.log('Notification created:', notificationId);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * ユーザーの通知一覧を取得
 */
export const getUserNotifications = async (
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        type: data.type,
        recipientId: data.recipientId,
        actorId: data.actorId,
        actorName: data.actorName,
        actorAvatar: data.actorAvatar,
        postId: data.postId,
        postContent: data.postContent,
        commentId: data.commentId,
        commentContent: data.commentContent,
        isRead: data.isRead || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });

    return notifications;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

/**
 * 通知をグルーピング（同じ投稿への複数のいいねなどをまとめる）
 */
export const groupNotifications = (notifications: Notification[]): NotificationGroup[] => {
  const groups = new Map<string, NotificationGroup>();

  notifications.forEach((notification) => {
    // グループキー: type + postId（投稿関連の場合）
    const groupKey = notification.postId
      ? `${notification.type}_${notification.postId}`
      : `${notification.type}_${notification.actorId}`; // フォロー通知など

    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!;

      // 重複するactorを追加しない
      if (!group.actors.find(a => a.id === notification.actorId)) {
        group.actors.push({
          id: notification.actorId,
          name: notification.actorName,
          avatar: notification.actorAvatar,
        });
        group.count++;

        // 最新の通知で更新
        if (new Date(notification.createdAt) > new Date(group.latestNotification.createdAt)) {
          group.latestNotification = notification;
        }

        // 未読が1つでもあれば未読扱い
        if (!notification.isRead) {
          group.isRead = false;
        }
      }
    } else {
      groups.set(groupKey, {
        type: notification.type,
        postId: notification.postId,
        actors: [{
          id: notification.actorId,
          name: notification.actorName,
          avatar: notification.actorAvatar,
        }],
        latestNotification: notification,
        count: 1,
        isRead: notification.isRead,
      });
    }
  });

  // 最新の通知順にソート
  return Array.from(groups.values()).sort((a, b) => {
    return new Date(b.latestNotification.createdAt).getTime() -
      new Date(a.latestNotification.createdAt).getTime();
  });
};

/**
 * 通知を既読にする
 */
export const markNotificationAsRead = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * 全ての通知を既読にする
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('isRead', '==', false));
    const querySnapshot = await getDocs(q);

    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isRead: true })
    );

    await Promise.all(updatePromises);
    console.log('All notifications marked as read');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * 通知を削除
 */
export const deleteNotification = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    console.log('Notification deleted:', notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * 全ての通知を削除
 */
export const deleteAllNotifications = async (userId: string): Promise<void> => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const querySnapshot = await getDocs(notificationsRef);

    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    console.log('All notifications deleted');
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * 未読通知数を取得
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('isRead', '==', false));
    const querySnapshot = await getDocs(q);

    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};

/**
 * リアルタイムで未読通知数を監視
 */
export const subscribeToUnreadCount = (
  userId: string,
  callback: (count: number) => void
): Unsubscribe => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(notificationsRef, where('isRead', '==', false));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error('Error subscribing to unread count:', error);
    callback(0);
  });
};

/**
 * リアルタイムで通知を監視
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe => {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push({
        id: doc.id,
        type: data.type,
        recipientId: data.recipientId,
        actorId: data.actorId,
        actorName: data.actorName,
        actorAvatar: data.actorAvatar,
        postId: data.postId,
        postContent: data.postContent,
        commentId: data.commentId,
        commentContent: data.commentContent,
        isRead: data.isRead || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      });
    });

    callback(notifications);
  }, (error) => {
    console.error('Error subscribing to notifications:', error);
    callback([]);
  });
};

/**
 * 通知のアイコンを取得
 */
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'repost':
      return '🔁';
    case 'quote':
      return '💭';
    case 'reply':
      return '↩️';
    case 'friend_request':
      return '🤝'; // 友達リクエストのアイコン
    case 'friend_accept':
      return '✅'; // 友達承認のアイコン
    case 'mention':
      return '@';
    case 'message':
      return '💬';
    default:
      return '🔔';
  }
};

/**
 * 通知のメッセージを生成
 */
export const getNotificationMessage = (notification: NotificationGroup): string => {
  const { type, actors, count } = notification;

  if (count === 1) {
    const actor = actors[0];
    switch (type) {
      case 'like':
        return `${actor.name}さんがあなたの投稿にいいねしました`;
      case 'comment':
        return `${actor.name}さんがあなたの投稿にコメントしました`;
      case 'repost':
        return `${actor.name}さんがあなたの投稿をリポストしました`;
      case 'quote':
        return `${actor.name}さんがあなたの投稿を引用しました`;
      case 'reply':
        return `${actor.name}さんがあなたの投稿に返信しました`;
      case 'friend_request':
        return `${actor.name}さんからフレンドリクエストが届きました`;
      case 'friend_accept':
        return `${actor.name}さんがフレンドリクエストを承認しました`;
      case 'mention':
        return `${actor.name}さんがあなたをメンションしました`;
      case 'message':
        return `${actor.name}さんからメッセージが届きました`;
      default:
        return `${actor.name}さんから通知があります`;
    }
  } else {
    const firstActor = actors[0];
    const othersCount = count - 1;

    switch (type) {
      case 'like':
        return `${firstActor.name}さんと他${othersCount}人があなたの投稿にいいねしました`;
      case 'comment':
        return `${firstActor.name}さんと他${othersCount}人があなたの投稿にコメントしました`;
      case 'repost':
        return `${firstActor.name}さんと他${othersCount}人があなたの投稿をリポストしました`;
      case 'quote':
        return `${firstActor.name}さんと他${othersCount}人があなたの投稿を引用しました`;
      case 'reply':
        return `${firstActor.name}さんと他${othersCount}人があなたの投稿に返信しました`;
      case 'friend_request':
        return `${firstActor.name}さんと他${othersCount}人からフレンドリクエストが届きました`;
      case 'friend_accept':
        return `${firstActor.name}さんと他${othersCount}人がフレンドリクエストを承認しました`;
      case 'mention':
        return `${firstActor.name}さんと他${othersCount}人があなたをメンションしました`;
      case 'message':
        return `${firstActor.name}さんと他${othersCount}人からメッセージが届きました`;
      default:
        return `${firstActor.name}さんと他${othersCount}人から通知があります`;
    }
  }
};
