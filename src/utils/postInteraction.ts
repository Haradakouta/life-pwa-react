/**
 * 投稿インタラクション機能（いいね、コメント、ブックマーク、リポスト）
 */

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  increment,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Like, Comment, Bookmark, Repost } from '../types/post';

// ============================================
// いいね機能
// ============================================

/**
 * 投稿にいいねを追加
 */
export const addLike = async (postId: string, userId: string, userName: string, userAvatar?: string): Promise<string> => {
  try {
    const likeRef = doc(collection(db, `posts/${postId}/likes`));
    const likeData: Like = {
      id: likeRef.id,
      postId,
      userId,
      userName,
      userAvatar,
      createdAt: new Date().toISOString(),
    };

    await setDoc(likeRef, likeData);

    // 投稿のいいね数を増やす
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1),
    });

    console.log(`✅ ${userId} liked post ${postId}`);
    return likeRef.id;
  } catch (error) {
    console.error('Add like error:', error);
    throw error;
  }
};

/**
 * 投稿のいいねを削除
 */
export const removeLike = async (postId: string, likeId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `posts/${postId}/likes/${likeId}`));

    // 投稿のいいね数を減らす
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(-1),
    });

    console.log(`✅ Like ${likeId} removed from post ${postId}`);
  } catch (error) {
    console.error('Remove like error:', error);
    throw error;
  }
};

/**
 * ユーザーが投稿にいいねしているか確認
 */
export const isLiked = async (postId: string, userId: string): Promise<{ liked: boolean; likeId?: string }> => {
  try {
    const likesRef = collection(db, `posts/${postId}/likes`);
    const q = query(likesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { liked: false };
    }

    const likeDoc = querySnapshot.docs[0];
    return { liked: true, likeId: likeDoc.id };
  } catch (error) {
    console.error('Check like error:', error);
    return { liked: false };
  }
};

/**
 * 投稿のいいね一覧を取得
 */
export const getLikes = async (postId: string): Promise<Like[]> => {
  try {
    const likesRef = collection(db, `posts/${postId}/likes`);
    const querySnapshot = await getDocs(likesRef);

    const likes: Like[] = [];
    for (const docSnap of querySnapshot.docs) {
      likes.push(docSnap.data() as Like);
    }

    return likes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Get likes error:', error);
    return [];
  }
};

// ============================================
// コメント機能
// ============================================

/**
 * 投稿にコメントを追加
 */
export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  content: string,
  userAvatar?: string
): Promise<string> => {
  try {
    const commentRef = doc(collection(db, `posts/${postId}/comments`));
    const commentData: Comment = {
      id: commentRef.id,
      postId,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date().toISOString(),
    };

    await setDoc(commentRef, commentData);

    // 投稿のコメント数を増やす
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });

    console.log(`✅ Comment added to post ${postId}`);
    return commentRef.id;
  } catch (error) {
    console.error('Add comment error:', error);
    throw error;
  }
};

/**
 * コメントを削除
 */
export const deleteComment = async (postId: string, commentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `posts/${postId}/comments/${commentId}`));

    // 投稿のコメント数を減らす
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(-1),
    });

    console.log(`✅ Comment ${commentId} deleted from post ${postId}`);
  } catch (error) {
    console.error('Delete comment error:', error);
    throw error;
  }
};

/**
 * コメントを更新
 */
export const updateComment = async (postId: string, commentId: string, content: string): Promise<void> => {
  try {
    const commentRef = doc(db, `posts/${postId}/comments/${commentId}`);
    await updateDoc(commentRef, {
      content,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Comment ${commentId} updated`);
  } catch (error) {
    console.error('Update comment error:', error);
    throw error;
  }
};

/**
 * 投稿のコメント一覧を取得
 */
export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const querySnapshot = await getDocs(commentsRef);

    const comments: Comment[] = [];
    for (const docSnap of querySnapshot.docs) {
      comments.push(docSnap.data() as Comment);
    }

    return comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch (error) {
    console.error('Get comments error:', error);
    return [];
  }
};

// ============================================
// ブックマーク機能
// ============================================

/**
 * 投稿をブックマークに追加
 */
export const addBookmark = async (postId: string, userId: string): Promise<string> => {
  try {
    const bookmarkRef = doc(collection(db, `posts/${postId}/bookmarks`));
    const bookmarkData: Bookmark = {
      id: bookmarkRef.id,
      postId,
      userId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(bookmarkRef, bookmarkData);

    console.log(`✅ Post ${postId} bookmarked by ${userId}`);
    return bookmarkRef.id;
  } catch (error) {
    console.error('Add bookmark error:', error);
    throw error;
  }
};

/**
 * ブックマークを削除
 */
export const removeBookmark = async (postId: string, bookmarkId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `posts/${postId}/bookmarks/${bookmarkId}`));

    console.log(`✅ Bookmark ${bookmarkId} removed`);
  } catch (error) {
    console.error('Remove bookmark error:', error);
    throw error;
  }
};

/**
 * ユーザーが投稿をブックマークしているか確認
 */
export const isBookmarked = async (postId: string, userId: string): Promise<{ bookmarked: boolean; bookmarkId?: string }> => {
  try {
    const bookmarksRef = collection(db, `posts/${postId}/bookmarks`);
    const q = query(bookmarksRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { bookmarked: false };
    }

    const bookmarkDoc = querySnapshot.docs[0];
    return { bookmarked: true, bookmarkId: bookmarkDoc.id };
  } catch (error) {
    console.error('Check bookmark error:', error);
    return { bookmarked: false };
  }
};

/**
 * ユーザーのブックマーク一覧を取得
 */
export const getUserBookmarks = async (userId: string): Promise<Bookmark[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const postsSnapshot = await getDocs(postsRef);

    const bookmarks: Bookmark[] = [];

    for (const postDoc of postsSnapshot.docs) {
      const bookmarksRef = collection(db, `posts/${postDoc.id}/bookmarks`);
      const q = query(bookmarksRef, where('userId', '==', userId));
      const bookmarksSnapshot = await getDocs(q);

      for (const bookmarkDoc of bookmarksSnapshot.docs) {
        bookmarks.push(bookmarkDoc.data() as Bookmark);
      }
    }

    return bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Get user bookmarks error:', error);
    return [];
  }
};

// ============================================
// リポスト機能
// ============================================

/**
 * 投稿をリポスト
 */
export const addRepost = async (postId: string, userId: string, userName: string, userAvatar?: string): Promise<string> => {
  try {
    const repostRef = doc(collection(db, `posts/${postId}/reposts`));
    const repostData: Repost = {
      id: repostRef.id,
      postId,
      userId,
      userName,
      userAvatar,
      createdAt: new Date().toISOString(),
    };

    await setDoc(repostRef, repostData);

    // 投稿のリポスト数を増やす
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      repostCount: increment(1),
    });

    console.log(`✅ Post ${postId} reposted by ${userId}`);
    return repostRef.id;
  } catch (error) {
    console.error('Add repost error:', error);
    throw error;
  }
};

/**
 * リポストを削除
 */
export const removeRepost = async (postId: string, repostId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, `posts/${postId}/reposts/${repostId}`));

    // 投稿のリポスト数を減らす
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      repostCount: increment(-1),
    });

    console.log(`✅ Repost ${repostId} removed from post ${postId}`);
  } catch (error) {
    console.error('Remove repost error:', error);
    throw error;
  }
};

/**
 * ユーザーが投稿をリポストしているか確認
 */
export const isReposted = async (postId: string, userId: string): Promise<{ reposted: boolean; repostId?: string }> => {
  try {
    const repostsRef = collection(db, `posts/${postId}/reposts`);
    const q = query(repostsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { reposted: false };
    }

    const repostDoc = querySnapshot.docs[0];
    return { reposted: true, repostId: repostDoc.id };
  } catch (error) {
    console.error('Check repost error:', error);
    return { reposted: false };
  }
};

/**
 * 投稿のリポスト一覧を取得
 */
export const getReposts = async (postId: string): Promise<Repost[]> => {
  try {
    const repostsRef = collection(db, `posts/${postId}/reposts`);
    const querySnapshot = await getDocs(repostsRef);

    const reposts: Repost[] = [];
    for (const docSnap of querySnapshot.docs) {
      reposts.push(docSnap.data() as Repost);
    }

    return reposts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Get reposts error:', error);
    return [];
  }
};
