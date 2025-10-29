/**
 * 検索機能（ユーザー、投稿、ハッシュタグ）
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Post } from '../types/post';
import type { UserProfile } from '../types/profile';

/**
 * ユーザーを検索
 */
export const searchUsers = async (searchQuery: string, limit: number = 20): Promise<UserProfile[]> => {
  try {
    if (!searchQuery.trim()) return [];

    const usersRef = collection(db, 'users');
    const results: UserProfile[] = [];

    // username検索（完全一致 + 前方一致）
    const usernameQuery = query(
      usersRef,
      where('username', '>=', searchQuery.toLowerCase()),
      where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'),
      firestoreLimit(limit)
    );

    const usernameSnapshot = await getDocs(usernameQuery);
    for (const doc of usernameSnapshot.docs) {
      const profileDoc = await getDocs(collection(doc.ref, 'profile'));
      if (!profileDoc.empty) {
        const profileData = profileDoc.docs[0].data() as UserProfile;
        results.push(profileData);
      }
    }

    // displayName検索（前方一致）
    const displayNameQuery = query(
      usersRef,
      where('displayName', '>=', searchQuery),
      where('displayName', '<=', searchQuery + '\uf8ff'),
      firestoreLimit(limit)
    );

    const displayNameSnapshot = await getDocs(displayNameQuery);
    for (const doc of displayNameSnapshot.docs) {
      const profileDoc = await getDocs(collection(doc.ref, 'profile'));
      if (!profileDoc.empty) {
        const profileData = profileDoc.docs[0].data() as UserProfile;
        // 重複を避ける
        if (!results.find(r => r.uid === profileData.uid)) {
          results.push(profileData);
        }
      }
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('ユーザー検索エラー:', error);
    return [];
  }
};

/**
 * 投稿を検索（キーワード検索）
 */
export const searchPosts = async (searchQuery: string, limit: number = 20): Promise<Post[]> => {
  try {
    if (!searchQuery.trim()) return [];

    const postsRef = collection(db, 'posts');

    // Firestoreには全文検索がないため、全投稿を取得してクライアント側でフィルタリング
    // 本番環境ではAlgoliaなどの検索サービスを使用することを推奨
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(100)
    );

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const post: Post = {
        id: doc.id,
        content: data.content,
        images: data.images || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        repostCount: data.repostCount || 0,
        hashtags: data.hashtags || [],
        visibility: data.visibility,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };

      // クライアント側でキーワードフィルタリング
      const keyword = searchQuery.toLowerCase();
      if (
        post.content.toLowerCase().includes(keyword) ||
        post.authorName.toLowerCase().includes(keyword)
      ) {
        posts.push(post);
      }
    });

    return posts.slice(0, limit);
  } catch (error) {
    console.error('投稿検索エラー:', error);
    return [];
  }
};

/**
 * ハッシュタグで投稿を検索
 */
export const searchByHashtag = async (hashtag: string, limit: number = 20): Promise<Post[]> => {
  try {
    if (!hashtag.trim()) return [];

    // #を除去
    const tag = hashtag.startsWith('#') ? hashtag.slice(1) : hashtag;

    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      where('hashtags', 'array-contains', tag),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      posts.push({
        id: doc.id,
        content: data.content,
        images: data.images || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        repostCount: data.repostCount || 0,
        hashtags: data.hashtags || [],
        visibility: data.visibility,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    return posts;
  } catch (error) {
    console.error('ハッシュタグ検索エラー:', error);
    return [];
  }
};

/**
 * トレンドハッシュタグを取得（人気順）
 */
export const getTrendingHashtags = async (limit: number = 10): Promise<{ tag: string; count: number }[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(200)
    );

    const querySnapshot = await getDocs(q);
    const hashtagCounts: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const hashtags = data.hashtags || [];
      hashtags.forEach((tag: string) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    // カウント順にソート
    const trending = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return trending;
  } catch (error) {
    console.error('トレンドハッシュタグ取得エラー:', error);
    return [];
  }
};
