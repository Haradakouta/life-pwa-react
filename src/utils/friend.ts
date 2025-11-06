/**
 * フレンド機能関連のユーティリティ関数
 */

import { doc, getDoc, collection, query, where, getDocs, increment, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Friend } from '../types/profile';
import { createNotification } from './notification';
import { getUserProfile } from './profile'; // プロフィール取得関数を再利用

// ============================================
// フレンド機能
// ============================================

/**
 * フレンドリクエストを送信
 */
export const sendFriendRequest = async (
  senderId: string,
  senderName: string,
  senderAvatar: string | undefined,
  receiverId: string,
  receiverName: string,
  receiverAvatar: string | undefined
): Promise<void> => {
  console.log(`[sendFriendRequest] Sending request: ${senderId} -> ${receiverId}`);
  try {
    const batch = writeBatch(db);
    const timestamp = new Date().toISOString();

    // 送信者のフレンドリストに 'pending_sent' を追加
    const senderFriendRef = doc(db, `users/${senderId}/friends/${receiverId}`);
    batch.set(senderFriendRef, {
      uid: receiverId,
      displayName: receiverName,
      avatarUrl: receiverAvatar || '',
      status: 'pending_sent',
      initiatedBy: senderId,
      createdAt: timestamp,
    });

    // 受信者のフレンドリストに 'pending_received' を追加
    const receiverFriendRef = doc(db, `users/${receiverId}/friends/${senderId}`);
    batch.set(receiverFriendRef, {
      uid: senderId,
      displayName: senderName,
      avatarUrl: senderAvatar || '',
      status: 'pending_received',
      initiatedBy: senderId,
      createdAt: timestamp,
    });

    await batch.commit();

    // 受信者に通知を送信
    await createNotification(receiverId, senderId, senderName, 'friend_request', { actorAvatar: senderAvatar });

    console.log(`✅ [sendFriendRequest] Request sent: ${senderId} -> ${receiverId}`);
  } catch (error: any) {
    console.error(`❌ [sendFriendRequest] Failed to send request:`, error);
    throw new Error(`フレンドリクエストの送信に失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * フレンドリクエストを承認
 */
export const acceptFriendRequest = async (
  accepterId: string,
  accepterName: string,
  accepterAvatar: string | undefined,
  requesterId: string,
  _requesterName: string,
  _requesterAvatar: string | undefined
): Promise<void> => {
  console.log(`[acceptFriendRequest] Accepting request: ${accepterId} accepts ${requesterId}`);
  try {
    const batch = writeBatch(db);
    const timestamp = new Date().toISOString();

    // 承認者のフレンドリストのステータスを 'accepted' に更新
    const accepterFriendRef = doc(db, `users/${accepterId}/friends/${requesterId}`);
    batch.update(accepterFriendRef, {
      status: 'accepted',
      acceptedAt: timestamp,
    });

    // リクエスト送信者のフレンドリストのステータスを 'accepted' に更新
    const requesterFriendRef = doc(db, `users/${requesterId}/friends/${accepterId}`);
    batch.update(requesterFriendRef, {
      status: 'accepted',
      acceptedAt: timestamp,
    });

    // 両ユーザーのfriendCountをインクリメント
    const accepterProfileRef = doc(db, `users/${accepterId}/profile/data`);
    const requesterProfileRef = doc(db, `users/${requesterId}/profile/data`);
    batch.update(accepterProfileRef, { 'stats.friendCount': increment(1) });
    batch.update(requesterProfileRef, { 'stats.friendCount': increment(1) });

    await batch.commit();

    // リクエスト送信者に通知を送信
    await createNotification(requesterId, accepterId, accepterName, 'friend_accept', { actorAvatar: accepterAvatar });

    // 称号チェック（フレンド承認後 - 両方のユーザー）
    try {
      const { checkAndGrantTitles } = await import('./title');
      await Promise.all([
        checkAndGrantTitles(accepterId),
        checkAndGrantTitles(requesterId),
      ]);
    } catch (error) {
      console.error('称号チェックエラー:', error);
      // 称号チェックに失敗してもフレンド承認は成功させる
    }

    console.log(`✅ [acceptFriendRequest] Request accepted: ${accepterId} accepts ${requesterId}`);
  } catch (error: any) {
    console.error(`❌ [acceptFriendRequest] Failed to accept request:`, error);
    throw new Error(`フレンドリクエストの承認に失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * フレンドリクエストを拒否
 */
export const declineFriendRequest = async (
  declinerId: string,
  requesterId: string
): Promise<void> => {
  console.log(`[declineFriendRequest] Declining request: ${declinerId} declines ${requesterId}`);
  try {
    const batch = writeBatch(db);

    // 拒否者のフレンドリストからリクエストを削除
    const declinerFriendRef = doc(db, `users/${declinerId}/friends/${requesterId}`);
    batch.delete(declinerFriendRef);

    // リクエスト送信者のフレンドリストからリクエストを削除
    const requesterFriendRef = doc(db, `users/${requesterId}/friends/${declinerId}`);
    batch.delete(requesterFriendRef);

    await batch.commit();

    // 通知は送信しない（拒否されたことを相手に知らせる必要はない場合が多い）

    console.log(`✅ [declineFriendRequest] Request declined: ${declinerId} declines ${requesterId}`);
  } catch (error: any) {
    console.error(`❌ [declineFriendRequest] Failed to decline request:`, error);
    throw new Error(`フレンドリクエストの拒否に失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * フレンドを解除
 */
export const removeFriend = async (
  userId: string,
  friendId: string
): Promise<void> => {
  console.log(`[removeFriend] Removing friend: ${userId} removes ${friendId}`);
  try {
    const batch = writeBatch(db);

    // ユーザーのフレンドリストからフレンドを削除
    const userFriendRef = doc(db, `users/${userId}/friends/${friendId}`);
    batch.delete(userFriendRef);

    // フレンドのフレンドリストからユーザーを削除
    const friendUserRef = doc(db, `users/${friendId}/friends/${userId}`);
    batch.delete(friendUserRef);

    // 両ユーザーのfriendCountをデクリメント
    const userProfileRef = doc(db, `users/${userId}/profile/data`);
    const friendProfileRef = doc(db, `users/${friendId}/profile/data`);
    batch.update(userProfileRef, { 'stats.friendCount': increment(-1) });
    batch.update(friendProfileRef, { 'stats.friendCount': increment(-1) });

    await batch.commit();

    console.log(`✅ [removeFriend] Friend removed: ${userId} removes ${friendId}`);
  } catch (error: any) {
    console.error(`❌ [removeFriend] Failed to remove friend:`, error);
    throw new Error(`フレンドの解除に失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * フレンド状態をチェック
 * @returns 'not_friends' | 'pending_sent' | 'pending_received' | 'accepted'
 */
export const getFriendStatus = async (currentUserId: string, targetUserId: string): Promise<Friend['status'] | 'not_friends'> => {
  try {
    if (currentUserId === targetUserId) return 'not_friends'; // 自分自身はフレンドではない

    const friendDocRef = doc(db, `users/${currentUserId}/friends/${targetUserId}`);
    const friendDoc = await getDoc(friendDocRef);

    if (friendDoc.exists()) {
      const friendData = friendDoc.data() as Friend;
      return friendData.status;
    }
    return 'not_friends';
  } catch (error) {
    console.error('Check friend status error:', error);
    return 'not_friends';
  }
};

/**
 * ユーザーのフレンドリストを取得
 * @param userId フレンドリストを取得するユーザーのID
 * @param status フィルタリングするステータス ('pending_sent', 'pending_received', 'accepted')
 */
export const getFriends = async (userId: string, status?: Friend['status']): Promise<Friend[]> => {
  try {
    const friendsRef = collection(db, `users/${userId}/friends`);
    const q = status ? query(friendsRef, where('status', '==', status)) : friendsRef;
    const querySnapshot = await getDocs(q);

    const friends: Friend[] = [];
    for (const docSnap of querySnapshot.docs) {
      const friendData = docSnap.data() as Friend;
      // プロフィール情報を取得して結合
      const profile = await getUserProfile(friendData.uid);
      if (profile) {
        friends.push({ ...friendData, ...profile }); // Friend型にUserProfileの情報をマージ
      } else {
        friends.push(friendData); // プロフィールが取得できない場合はFriendデータのみ
      }
    }
    return friends.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Get friends error:', error);
    return [];
  }
};
