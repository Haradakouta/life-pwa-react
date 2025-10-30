/**
 * チャット（DM）機能関連のユーティリティ関数
 */

import { collection, doc, getDoc, setDoc, updateDoc, query, where, getDocs, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Unsubscribe } from 'firebase/firestore';

// ============================================
// 型定義
// ============================================

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string; // ISO 8601 string
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // [uid1, uid2]
  participantProfiles?: { uid: string; displayName: string; avatarUrl?: string }[]; // UI表示用
  lastMessage?: string;
  lastMessageTimestamp?: string; // ISO 8601 string
  createdAt: string; // ISO 8601 string
}

// ============================================
// 会話操作
// ============================================

/**
 * 1対1の会話を作成または取得
 * @returns conversationId
 */
export const getOrCreateConversation = async (user1Id: string, user2Id: string): Promise<string> => {
  const participants = [user1Id, user2Id].sort(); // 参加者をソートして一意のIDを生成
  const conversationId = participants.join('_');
  const conversationRef = doc(db, 'conversations', conversationId);

  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {
    // 会話が存在しない場合、新しく作成
    const newConversation: Conversation = {
      id: conversationId,
      participants,
      createdAt: new Date().toISOString(),
    };
    await setDoc(conversationRef, newConversation);
    console.log('✅ New conversation created:', conversationId);
  } else {
    console.log('ℹ️ Existing conversation found:', conversationId);
  }

  return conversationId;
};

/**
 * ユーザーの会話リストを取得
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    for (const docSnap of querySnapshot.docs) {
      const conversation = docSnap.data() as Conversation;
      // 参加者のプロフィール情報を取得して会話オブジェクトに追加
      const participantProfiles = await Promise.all(
        conversation.participants.map(async (uid) => {
          // ここでgetUserProfileをインポートして使用
          // import { getUserProfile } from './profile';
          // const profile = await getUserProfile(uid);
          // return { uid, displayName: profile?.displayName || 'Unknown', avatarUrl: profile?.avatarUrl };
          return { uid, displayName: 'Unknown', avatarUrl: undefined }; // 仮実装
        })
      );
      conversations.push({ ...conversation, participantProfiles });
    }
    return conversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
};

/**
 * 会話のリアルタイム更新を購読
 */
export const subscribeToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTimestamp', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations: Conversation[] = [];
    for (const docSnap of snapshot.docs) {
      const conversation = docSnap.data() as Conversation;
      const participantProfiles = await Promise.all(
        conversation.participants.map(async (uid) => {
          // import { getUserProfile } from './profile';
          // const profile = await getUserProfile(uid);
          // return { uid, displayName: profile?.displayName || 'Unknown', avatarUrl: profile?.avatarUrl };
          return { uid, displayName: 'Unknown', avatarUrl: undefined }; // 仮実装
        })
      );
      conversations.push({ ...conversation, participantProfiles });
    }
    callback(conversations);
  }, (error) => {
    console.error('Error subscribing to conversations:', error);
    callback([]);
  });
};

// ============================================
// メッセージ操作
// ============================================

/**
 * メッセージを送信
 */
export const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<void> => {
  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const newMessageRef = doc(messagesRef);
    const timestamp = new Date().toISOString();

    const message: Message = {
      id: newMessageRef.id,
      senderId,
      content,
      timestamp,
      read: false,
    };

    await setDoc(newMessageRef, message);

    // 会話の最終メッセージを更新
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: content,
      lastMessageTimestamp: timestamp,
    });

    console.log('✅ Message sent:', conversationId, message.id);
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * 会話のメッセージを取得
 */
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(100) // 最新100件を取得
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Message);
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

/**
 * メッセージのリアルタイム更新を購読
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data() as Message);
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
    callback([]);
  });
};

/**
 * メッセージを既読にする
 */
export const markMessageAsRead = async (conversationId: string, messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
    await updateDoc(messageRef, { read: true });
    console.log('✅ Message marked as read:', messageId);
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};
