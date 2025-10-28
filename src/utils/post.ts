import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Post, PostFormData } from '../types/post';
import { uploadPostImage } from './imageUpload';
import { getUserProfile } from './profile';

/**
 * ハッシュタグを抽出する
 */
export const extractHashtags = (content: string): string[] => {
  const regex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  const matches = content.match(regex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};

/**
 * Timestampを日付文字列に変換
 */
const timestampToString = (timestamp: Timestamp | string | undefined): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  return timestamp.toDate().toISOString();
};

/**
 * 投稿を作成
 */
export const createPost = async (
  userId: string,
  data: PostFormData
): Promise<string> => {
  try {
    // プロフィール情報を取得
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('プロフィールが見つかりません');
    }

    // 画像をアップロード
    const imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      for (const file of data.images) {
        const url = await uploadPostImage(userId, file);
        imageUrls.push(url);
      }
    }

    // ハッシュタグを抽出
    const hashtags = extractHashtags(data.content);

    // 新しい投稿IDを生成
    const postRef = doc(collection(db, 'posts'));
    const postId = postRef.id;

    // 投稿データを作成
    const postData = {
      id: postId,
      content: data.content,
      images: imageUrls,
      authorId: userId,
      authorName: profile.displayName,
      authorAvatar: profile.avatarUrl || '',
      likes: 0,
      commentCount: 0,
      repostCount: 0,
      hashtags,
      visibility: data.visibility,
      createdAt: serverTimestamp(),
    };

    // Firestoreに保存
    await setDoc(postRef, postData);

    console.log('投稿を作成しました:', postId);
    return postId;
  } catch (error) {
    console.error('投稿の作成に失敗しました:', error);
    throw error;
  }
};

/**
 * 投稿を取得
 */
export const getPost = async (postId: string): Promise<Post | null> => {
  try {
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return null;
    }

    const data = postSnap.data();
    return {
      id: postSnap.id,
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
      createdAt: timestampToString(data.createdAt),
      updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
    };
  } catch (error) {
    console.error('投稿の取得に失敗しました:', error);
    return null;
  }
};

/**
 * ユーザーの投稿一覧を取得
 */
export const getUserPosts = async (
  userId: string,
  limit: number = 20
): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('authorId', '==', userId),
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
        createdAt: timestampToString(data.createdAt),
        updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
      });
    });

    return posts;
  } catch (error) {
    console.error('ユーザーの投稿取得に失敗しました:', error);
    return [];
  }
};

/**
 * タイムライン取得（全体公開の投稿）
 */
export const getTimelinePosts = async (limit: number = 20): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
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
        createdAt: timestampToString(data.createdAt),
        updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
      });
    });

    return posts;
  } catch (error) {
    console.error('タイムラインの取得に失敗しました:', error);
    return [];
  }
};

/**
 * 投稿を削除
 */
export const deletePost = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    // 投稿が存在するか確認
    const post = await getPost(postId);
    if (!post) {
      throw new Error('投稿が見つかりません');
    }

    // 自分の投稿かチェック
    if (post.authorId !== userId) {
      throw new Error('自分の投稿のみ削除できます');
    }

    // 投稿を削除
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);

    console.log('投稿を削除しました:', postId);
  } catch (error) {
    console.error('投稿の削除に失敗しました:', error);
    throw error;
  }
};

/**
 * 投稿を更新
 */
export const updatePost = async (
  postId: string,
  userId: string,
  data: Partial<Post>
): Promise<void> => {
  try {
    // 投稿が存在するか確認
    const post = await getPost(postId);
    if (!post) {
      throw new Error('投稿が見つかりません');
    }

    // 自分の投稿かチェック
    if (post.authorId !== userId) {
      throw new Error('自分の投稿のみ編集できます');
    }

    // 更新データを作成
    const updateData: any = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    // contentが変更された場合、ハッシュタグを再抽出
    if (data.content) {
      updateData.hashtags = extractHashtags(data.content);
    }

    // 投稿を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, updateData);

    console.log('投稿を更新しました:', postId);
  } catch (error) {
    console.error('投稿の更新に失敗しました:', error);
    throw error;
  }
};

/**
 * 相対時間を取得
 */
export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'たった今';
  if (diffMins < 60) return `${diffMins}分前`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}時間前`;
  if (diffMins < 43200) return `${Math.floor(diffMins / 1440)}日前`;

  // 30日以上前は日付を表示
  return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
};
