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
  increment,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Post, PostFormData, Like, Comment, Bookmark, Repost, Recipe, RecipeFormData } from '../types/post';
import { uploadPostImage } from './imageUpload';
import { getUserProfile, getFollowing } from './profile';
import { createNotification } from './notification';

/**
 * ハッシュタグを抽出する
 */
export const extractHashtags = (content: string): string[] => {
  const regex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g;
  const matches = content.match(regex);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};

/**
 * メンションを抽出（@usernameの形式）
 */
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;
  const matches = content.match(mentionRegex);
  if (!matches) return [];

  // "@"を除去してユニークな配列を返す
  return [...new Set(matches.map((mention) => mention.substring(1)))];
};

/**
 * usernameからuserIdを取得するヘルパー関数
 */
const getUserIdFromUsername = async (username: string): Promise<string | null> => {
  try {
    // usersコレクション全体をスキャンして、一致するusernameを持つプロフィールを探す
    // Note: 本番環境では、usernameをキーとした別のコレクションを作成する方が効率的
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);

    for (const userDoc of usersSnapshot.docs) {
      const profileRef = doc(db, 'users', userDoc.id, 'profile', 'data');
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        if (profileData.username === username) {
          return userDoc.id;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting userId from username:', error);
    return null;
  }
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

    // ハッシュタグとメンションを抽出
    const hashtags = extractHashtags(data.content);
    const mentions = extractMentions(data.content);

    // 新しい投稿IDを生成
    const postRef = doc(collection(db, 'posts'));
    const postId = postRef.id;

    // 投稿データを作成
    const postData: any = {
      id: postId,
      content: data.content,
      images: imageUrls,
      authorId: userId,
      authorName: profile.displayName,
      authorAvatar: profile.avatarUrl || '',
      likes: 0,
      commentCount: 0,
      repostCount: 0,
      replyCount: 0,
      hashtags,
      visibility: data.visibility,
      createdAt: serverTimestamp(),
    };

    // メンションがあれば追加
    if (mentions.length > 0) {
      postData.mentions = mentions;
    }

    // 引用リポストの場合
    if (data.quotedPostId) {
      postData.quotedPostId = data.quotedPostId;
    }

    // 返信の場合
    if (data.replyToPostId) {
      postData.replyToPostId = data.replyToPostId;
      postData.replyToUserId = data.replyToUserId;
      postData.replyToUserName = data.replyToUserName;
    }

    // レシピデータがあれば追加
    if (data.recipeData) {
      postData.recipeData = data.recipeData;
    }

    // Firestoreに保存
    await setDoc(postRef, postData);

    // 返信の場合、親投稿のreplyCountを増やす
    if (data.replyToPostId) {
      const parentPostRef = doc(db, 'posts', data.replyToPostId);
      await updateDoc(parentPostRef, {
        replyCount: increment(1),
      });
    }

    // ユーザーの投稿数を更新
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    await updateDoc(profileRef, {
      'stats.postCount': increment(1),
    });

    // メンションされたユーザーに通知を送信
    if (mentions.length > 0) {
      for (const username of mentions) {
        const mentionedUserId = await getUserIdFromUsername(username);
        if (mentionedUserId && mentionedUserId !== userId) {
          await createNotification(
            mentionedUserId,
            userId,
            profile.displayName,
            'mention',
            {
              actorAvatar: profile.avatarUrl,
              postId,
              postContent: data.content,
            }
          );
        }
      }
    }

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

    // 引用元の投稿を取得
    let quotedPost: Post | undefined = undefined;
    if (data.quotedPostId) {
      const quotedPostData = await getPost(data.quotedPostId);
      if (quotedPostData) {
        quotedPost = quotedPostData;
      }
    }

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
      replyCount: data.replyCount || 0,
      hashtags: data.hashtags || [],
      mentions: data.mentions || [],
      quotedPostId: data.quotedPostId,
      quotedPost,
      replyToPostId: data.replyToPostId,
      replyToUserId: data.replyToUserId,
      replyToUserName: data.replyToUserName,
      recipeData: data.recipeData,
      visibility: data.visibility,
      isPinned: data.isPinned || false,
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
    console.log(`[getUserPosts] Fetching posts for user: ${userId}`);
    const postsRef = collection(db, 'posts');

    // まずインデックスが必要なクエリを試す
    let querySnapshot;
    try {
      const q = query(
        postsRef,
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );
      console.log('[getUserPosts] Executing query with index...');
      querySnapshot = await getDocs(q);
    } catch (indexError) {
      // インデックスエラーの場合はフォールバック
      console.warn('[getUserPosts] Index not found, using fallback query...');
      const q = query(
        postsRef,
        where('authorId', '==', userId)
      );
      const snapshot = await getDocs(q);

      // クライアント側でソート
      const sortedDocs = snapshot.docs.sort((a, b) => {
        const aTime = a.data().createdAt;
        const bTime = b.data().createdAt;
        if (!aTime || !bTime) return 0;
        return bTime.seconds - aTime.seconds;
      });

      // limitを適用
      querySnapshot = {
        docs: sortedDocs.slice(0, limit),
        empty: sortedDocs.length === 0,
        size: Math.min(sortedDocs.length, limit)
      } as any;
    }

    console.log(`[getUserPosts] Query returned ${querySnapshot.docs.length} documents`);
    const posts: Post[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();

      // 引用元の投稿を取得（1階層のみ）
      let quotedPost: Post | undefined = undefined;
      if (data.quotedPostId) {
        const quotedPostData = await getPost(data.quotedPostId);
        if (quotedPostData) {
          // 引用元の投稿の引用元は取得しない（無限ループ防止）
          quotedPost = { ...quotedPostData, quotedPost: undefined };
        }
      }

      posts.push({
        id: docSnap.id,
        content: data.content,
        images: data.images || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        repostCount: data.repostCount || 0,
        replyCount: data.replyCount || 0,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        quotedPostId: data.quotedPostId,
        quotedPost,
        replyToPostId: data.replyToPostId,
        replyToUserId: data.replyToUserId,
        replyToUserName: data.replyToUserName,
        recipeData: data.recipeData,
        visibility: data.visibility,
        isPinned: data.isPinned || false,
        createdAt: timestampToString(data.createdAt),
        updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
      });
    }

    console.log(`[getUserPosts] Successfully processed ${posts.length} posts`);
    return posts;
  } catch (error) {
    console.error('[getUserPosts] ユーザーの投稿取得に失敗しました:', error);
    return [];
  }
};

/**
 * タイムライン取得（全体公開の投稿）
 *
 * 注意: このクエリはFirestoreのコンポジットインデックスが必要です。
 * 初回実行時にエラーが出た場合、Firebaseコンソールで以下のインデックスを作成してください：
 * - Collection: posts
 * - Fields: visibility (Ascending), createdAt (Descending)
 */
export const getTimelinePosts = async (limit: number = 20): Promise<Post[]> => {
  console.log('🔍 getTimelinePosts: Starting to fetch timeline posts...');

  try {
    const postsRef = collection(db, 'posts');
    console.log('📁 getTimelinePosts: Creating query with visibility=public, orderBy createdAt desc');

    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    console.log('⚡ getTimelinePosts: Executing query...');
    const querySnapshot = await getDocs(q);
    console.log(`📊 getTimelinePosts: Query returned ${querySnapshot.size} documents`);

    const posts: Post[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      console.log(`📄 Processing post ${docSnap.id}:`, {
        authorId: data.authorId,
        authorName: data.authorName,
        visibility: data.visibility,
        createdAt: data.createdAt,
      });

      // 引用元の投稿を取得（1階層のみ）
      let quotedPost: Post | undefined = undefined;
      if (data.quotedPostId) {
        const quotedPostData = await getPost(data.quotedPostId);
        if (quotedPostData) {
          quotedPost = { ...quotedPostData, quotedPost: undefined };
        }
      }

      posts.push({
        id: docSnap.id,
        content: data.content,
        images: data.images || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        repostCount: data.repostCount || 0,
        replyCount: data.replyCount || 0,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        quotedPostId: data.quotedPostId,
        quotedPost,
        replyToPostId: data.replyToPostId,
        replyToUserId: data.replyToUserId,
        replyToUserName: data.replyToUserName,
        recipeData: data.recipeData,
        visibility: data.visibility,
        isPinned: data.isPinned || false,
        createdAt: timestampToString(data.createdAt),
        updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
      });
    }

    console.log(`✅ getTimelinePosts: Successfully processed ${posts.length} posts`);
    return posts;
  } catch (error: any) {
    console.error('❌ getTimelinePosts: Error occurred:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Firestoreインデックスエラーの場合、フォールバッククエリを実行
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
      console.warn('⚠️ Firestoreインデックスが未作成です。フォールバッククエリを使用します。');
      console.warn('インデックス作成URL:', error.message);

      // フォールバック: createdAtのみでソート（効率は落ちるが動作する）
      try {
        console.log('🔄 getTimelinePosts: Trying fallback query (orderBy createdAt only)...');
        const fallbackPostsRef = collection(db, 'posts');
        const fallbackQuery = query(
          fallbackPostsRef,
          orderBy('createdAt', 'desc'),
          firestoreLimit(limit * 3) // 余裕を持って取得
        );

        const fallbackSnapshot = await getDocs(fallbackQuery);
        console.log(`📊 Fallback query returned ${fallbackSnapshot.size} documents`);

        const allPosts: Post[] = [];

        for (const docSnap of fallbackSnapshot.docs) {
          const data = docSnap.data() as any;

          // 引用元の投稿を取得（1階層のみ）
          let quotedPost: Post | undefined = undefined;
          if (data.quotedPostId) {
            const quotedPostData = await getPost(data.quotedPostId);
            if (quotedPostData) {
              quotedPost = { ...quotedPostData, quotedPost: undefined };
            }
          }

          allPosts.push({
            id: docSnap.id,
            content: data.content,
            images: data.images || [],
            authorId: data.authorId,
            authorName: data.authorName,
            authorAvatar: data.authorAvatar || '',
            likes: data.likes || 0,
            commentCount: data.commentCount || 0,
            repostCount: data.repostCount || 0,
            hashtags: data.hashtags || [],
            mentions: data.mentions || [],
            quotedPostId: data.quotedPostId,
            quotedPost,
            recipeData: data.recipeData,
            visibility: data.visibility,
            createdAt: timestampToString(data.createdAt),
            updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
          });
        }

        // クライアント側でフィルタリング
        const publicPosts = allPosts.filter((post) => post.visibility === 'public').slice(0, limit);
        console.log(`✅ Fallback: Filtered to ${publicPosts.length} public posts`);
        return publicPosts;
      } catch (fallbackError: any) {
        console.error('❌ フォールバッククエリもエラー:', fallbackError);
        console.error('Fallback error code:', fallbackError.code);
        console.error('Fallback error message:', fallbackError.message);
        return [];
      }
    }

    console.error('❌ タイムラインの取得に失敗しました（詳細）:', error);
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

    // ユーザーの投稿数を更新
    const profileRef = doc(db, 'users', userId, 'profile', 'data');
    await updateDoc(profileRef, {
      'stats.postCount': increment(-1),
    });

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
// ============================================
// 時間フォーマット（再エクスポート）
// ============================================
export { formatRelativeTime as getRelativeTime } from './formatNumber';

// ============================================
// いいね機能
// ============================================

/**
 * いいねを追加
 */
export const addLike = async (
  postId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<void> => {
  try {
    // いいねIDを生成
    const likeRef = doc(collection(db, `posts/${postId}/likes`));
    const likeId = likeRef.id;

    // いいねデータを作成
    const likeData: any = {
      id: likeId,
      postId,
      userId,
      userName,
      createdAt: new Date().toISOString(),
    };

    // userAvatarが存在する場合のみ追加
    if (userAvatar) {
      likeData.userAvatar = userAvatar;
    }

    // いいねを保存
    await setDoc(likeRef, likeData);

    // 投稿のいいね数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1),
    });

    // 投稿の作成者に通知を送信（自分自身へのいいねは除く）
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      await createNotification(
        postData.authorId,
        userId,
        userName,
        'like',
        {
          actorAvatar: userAvatar,
          postId,
          postContent: postData.content,
        }
      );
    }

    console.log('いいねを追加しました');
  } catch (error) {
    console.error('いいねの追加に失敗しました:', error);
    throw error;
  }
};

/**
 * いいねを削除
 */
export const removeLike = async (postId: string, userId: string): Promise<void> => {
  try {
    // ユーザーのいいねを取得
    const likesRef = collection(db, `posts/${postId}/likes`);
    const q = query(likesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    // いいねを削除
    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // 投稿のいいね数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(-1),
    });

    console.log('いいねを削除しました');
  } catch (error) {
    console.error('いいねの削除に失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザーがいいねしているかチェック
 */
export const hasUserLiked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const likesRef = collection(db, `posts/${postId}/likes`);
    const q = query(likesRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('いいね確認に失敗しました:', error);
    return false;
  }
};

/**
 * 投稿のいいん一覧を取得
 */
export const getPostLikes = async (postId: string): Promise<Like[]> => {
  try {
    const likesRef = collection(db, `posts/${postId}/likes`);
    const q = query(likesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const likes: Like[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      likes.push({
        id: doc.id,
        postId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        createdAt: data.createdAt,
      });
    });

    return likes;
  } catch (error) {
    console.error('いいね一覧の取得に失敗しました:', error);
    return [];
  }
};

// ============================================
// コメント機能
// ============================================

/**
 * コメントを追加
 */
export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  content: string,
  userAvatar?: string
): Promise<void> => {
  try {
    const commentRef = doc(collection(db, `posts/${postId}/comments`));
    const commentId = commentRef.id;

    const commentData: any = {
      id: commentId,
      postId,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    };

    // userAvatarが存在する場合のみ追加
    if (userAvatar) {
      commentData.userAvatar = userAvatar;
    }

    await setDoc(commentRef, commentData);

    // 投稿のコメント数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });

    // 投稿の作成者に通知を送信（自分自身へのコメントは除く）
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      await createNotification(
        postData.authorId,
        userId,
        userName,
        'comment',
        {
          actorAvatar: userAvatar,
          postId,
          postContent: postData.content,
          commentContent: content,
        }
      );
    }

    console.log('コメントを追加しました');
  } catch (error) {
    console.error('コメントの追加に失敗しました:', error);
    throw error;
  }
};

/**
 * コメントを削除
 */
export const deleteComment = async (
  postId: string,
  commentId: string,
  userId: string
): Promise<void> => {
  try {
    // コメントを取得
    const commentRef = doc(db, `posts/${postId}/comments/${commentId}`);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      throw new Error('コメントが見つかりません');
    }

    // 自分のコメントかチェック
    if (commentSnap.data().userId !== userId) {
      throw new Error('自分のコメントのみ削除できます');
    }

    // コメントを削除
    await deleteDoc(commentRef);

    // 投稿のコメント数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(-1),
    });

    console.log('コメントを削除しました');
  } catch (error) {
    console.error('コメントの削除に失敗しました:', error);
    throw error;
  }
};

/**
 * 投稿のコメント一覧を取得
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, `posts/${postId}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);

    const comments: Comment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        postId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return comments;
  } catch (error) {
    console.error('コメント一覧の取得に失敗しました:', error);
    return [];
  }
};

// ============================================
// ブックマーク機能
// ============================================

/**
 * ブックマークを追加
 */
export const addBookmark = async (postId: string, userId: string): Promise<void> => {
  try {
    const bookmarkRef = doc(db, `users/${userId}/bookmarks/${postId}`);

    const bookmarkData: Bookmark = {
      id: postId,
      postId,
      userId,
      createdAt: new Date().toISOString(),
    };

    await setDoc(bookmarkRef, bookmarkData);
    console.log('ブックマークを追加しました');
  } catch (error) {
    console.error('ブックマークの追加に失敗しました:', error);
    throw error;
  }
};

/**
 * ブックマークを削除
 */
export const removeBookmark = async (postId: string, userId: string): Promise<void> => {
  try {
    const bookmarkRef = doc(db, `users/${userId}/bookmarks/${postId}`);
    await deleteDoc(bookmarkRef);
    console.log('ブックマークを削除しました');
  } catch (error) {
    console.error('ブックマークの削除に失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザーがブックマークしているかチェック
 */
export const hasUserBookmarked = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const bookmarkRef = doc(db, `users/${userId}/bookmarks/${postId}`);
    const bookmarkSnap = await getDoc(bookmarkRef);
    return bookmarkSnap.exists();
  } catch (error) {
    console.error('ブックマーク確認に失敗しました:', error);
    return false;
  }
};

/**
 * ユーザーのブックマーク一覧を取得
 */
export const getUserBookmarks = async (userId: string): Promise<Post[]> => {
  try {
    const bookmarksRef = collection(db, `users/${userId}/bookmarks`);
    const querySnapshot = await getDocs(bookmarksRef);

    const posts: Post[] = [];
    for (const bookmarkDoc of querySnapshot.docs) {
      const post = await getPost(bookmarkDoc.id);
      if (post) {
        posts.push(post);
      }
    }

    return posts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('ブックマーク一覧の取得に失敗しました:', error);
    return [];
  }
};

// ============================================
// リポスト機能
// ============================================

/**
 * リポストを追加
 */
export const addRepost = async (
  postId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<void> => {
  try {
    const repostRef = doc(collection(db, `posts/${postId}/reposts`));
    const repostId = repostRef.id;

    const repostData: any = {
      id: repostId,
      postId,
      userId,
      userName,
      createdAt: new Date().toISOString(),
    };

    // userAvatarが存在する場合のみ追加
    if (userAvatar) {
      repostData.userAvatar = userAvatar;
    }

    await setDoc(repostRef, repostData);

    // 投稿のリポスト数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      repostCount: increment(1),
    });

    // 投稿の作成者に通知を送信（自分自身へのリポストは除く）
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data();
      await createNotification(
        postData.authorId,
        userId,
        userName,
        'repost',
        {
          actorAvatar: userAvatar,
          postId,
          postContent: postData.content,
        }
      );
    }

    console.log('リポストを追加しました');
  } catch (error) {
    console.error('リポストの追加に失敗しました:', error);
    throw error;
  }
};

/**
 * リポストを削除
 */
export const removeRepost = async (postId: string, userId: string): Promise<void> => {
  try {
    // ユーザーのリポストを取得
    const repostsRef = collection(db, `posts/${postId}/reposts`);
    const q = query(repostsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    // リポストを削除
    for (const doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
    }

    // 投稿のリポスト数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      repostCount: increment(-1),
    });

    console.log('リポストを削除しました');
  } catch (error) {
    console.error('リポストの削除に失敗しました:', error);
    throw error;
  }
};

/**
 * ユーザーがリポストしているかチェック
 */
export const hasUserReposted = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const repostsRef = collection(db, `posts/${postId}/reposts`);
    const q = query(repostsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  } catch (error) {
    console.error('リポスト確認に失敗しました:', error);
    return false;
  }
};

/**
 * 投稿のリポスト一覧を取得
 */
export const getPostReposts = async (postId: string): Promise<Repost[]> => {
  try {
    const repostsRef = collection(db, `posts/${postId}/reposts`);
    const q = query(repostsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const reposts: Repost[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reposts.push({
        id: doc.id,
        postId,
        userId: data.userId,
        userName: data.userName,
        userAvatar: data.userAvatar,
        createdAt: data.createdAt,
      });
    });

    return reposts;
  } catch (error) {
    console.error('リポスト一覧の取得に失敗しました:', error);
    return [];
  }
};

// ============================================
// レシピ共有機能（Phase 5）
// ============================================

/**
 * レシピを投稿
 */
export const publishRecipe = async (
  userId: string,
  data: RecipeFormData
): Promise<string> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) {
      throw new Error('プロフィールが見つかりません');
    }

    // 画像をアップロード
    let imageUrl = '';
    if (data.image) {
      imageUrl = await uploadPostImage(userId, data.image);
    }

    const recipeRef = doc(collection(db, 'recipes'));
    const recipeId = recipeRef.id;

    const recipeData: Recipe = {
      id: recipeId,
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      instructions: data.instructions,
      difficulty: data.difficulty,
      servings: data.servings,
      preparationTime: data.preparationTime,
      cookingTime: data.cookingTime,
      imageUrl,
      authorId: userId,
      authorName: profile.displayName,
      authorAvatar: profile.avatarUrl,
      likes: 0,
      commentCount: 0,
      visibility: data.visibility,
      createdAt: new Date().toISOString(),
    };

    await setDoc(recipeRef, recipeData);
    console.log('レシピを投稿しました:', recipeId);
    return recipeId;
  } catch (error) {
    console.error('レシピの投稿に失敗しました:', error);
    throw error;
  }
};

/**
 * レシピを取得
 */
export const getRecipe = async (recipeId: string): Promise<Recipe | null> => {
  try {
    const recipeRef = doc(db, 'recipes', recipeId);
    const recipeSnap = await getDoc(recipeRef);

    if (!recipeSnap.exists()) {
      return null;
    }

    const data = recipeSnap.data();
    return {
      id: recipeSnap.id,
      title: data.title,
      description: data.description,
      ingredients: data.ingredients,
      instructions: data.instructions,
      difficulty: data.difficulty,
      servings: data.servings,
      preparationTime: data.preparationTime,
      cookingTime: data.cookingTime,
      imageUrl: data.imageUrl,
      authorId: data.authorId,
      authorName: data.authorName,
      authorAvatar: data.authorAvatar,
      likes: data.likes || 0,
      commentCount: data.commentCount || 0,
      visibility: data.visibility,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('レシピの取得に失敗しました:', error);
    return null;
  }
};

/**
 * 公開レシピ一覧を取得
 */
export const getPublicRecipes = async (limit: number = 20): Promise<Recipe[]> => {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(
      recipesRef,
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipes.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        difficulty: data.difficulty,
        servings: data.servings,
        preparationTime: data.preparationTime,
        cookingTime: data.cookingTime,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        visibility: data.visibility,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return recipes;
  } catch (error) {
    console.error('レシピ一覧の取得に失敗しました:', error);
    return [];
  }
};

/**
 * ユーザーのレシピ一覧を取得
 */
export const getUserRecipes = async (userId: string, limit: number = 20): Promise<Recipe[]> => {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(
      recipesRef,
      where('authorId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipes.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        difficulty: data.difficulty,
        servings: data.servings,
        preparationTime: data.preparationTime,
        cookingTime: data.cookingTime,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        visibility: data.visibility,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return recipes;
  } catch (error) {
    console.error('ユーザーのレシピ取得に失敗しました:', error);
    return [];
  }
};

// ============================================
// ランキング機能（Phase 7）
// ============================================

/**
 * いいねの多い投稿ランキング
 */
export const getTopPostsByLikes = async (limit: number = 10): Promise<Post[]> => {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(
      postsRef,
      where('visibility', '==', 'public'),
      orderBy('likes', 'desc'),
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
    console.error('ランキング取得に失敗しました:', error);
    return [];
  }
};

/**
 * いいねの多いレシピランキング
 */
export const getTopRecipesByLikes = async (limit: number = 10): Promise<Recipe[]> => {
  try {
    const recipesRef = collection(db, 'recipes');
    const q = query(
      recipesRef,
      where('visibility', '==', 'public'),
      orderBy('likes', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipes.push({
        id: doc.id,
        title: data.title,
        description: data.description,
        ingredients: data.ingredients,
        instructions: data.instructions,
        difficulty: data.difficulty,
        servings: data.servings,
        preparationTime: data.preparationTime,
        cookingTime: data.cookingTime,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar,
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        visibility: data.visibility,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });

    return recipes;
  } catch (error) {
    console.error('レシピランキング取得に失敗しました:', error);
    return [];
  }
};

/**
 * フォロー中のユーザーの投稿を取得
 */
export const getFollowingPosts = async (userId: string, limit: number = 20): Promise<Post[]> => {
  try {
    console.log(`[getFollowingPosts] Fetching following posts for user: ${userId}`);

    // フォロー中のユーザーリストを取得
    const followingUsers = await getFollowing(userId);
    console.log(`[getFollowingPosts] Found ${followingUsers.length} following users`);

    if (followingUsers.length === 0) {
      return [];
    }

    // フォロー中のユーザーのIDリスト
    const followingUserIds = followingUsers.map(user => user.uid);

    // すべての投稿を取得（authorIdでフィルタ）
    const postsRef = collection(db, 'posts');
    const allPosts: Post[] = [];

    // Firestoreの'in'クエリは最大10件までなので、10件ずつ分割して取得
    for (let i = 0; i < followingUserIds.length; i += 10) {
      const batch = followingUserIds.slice(i, i + 10);
      const q = query(
        postsRef,
        where('authorId', 'in', batch),
        where('visibility', 'in', ['public', 'followers'])
      );

      const querySnapshot = await getDocs(q);
      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();

        // 引用元の投稿を取得（1階層のみ）
        let quotedPost: Post | undefined = undefined;
        if (data.quotedPostId) {
          const quotedPostData = await getPost(data.quotedPostId);
          if (quotedPostData) {
            quotedPost = { ...quotedPostData, quotedPost: undefined };
          }
        }

        allPosts.push({
          id: docSnap.id,
          content: data.content,
          images: data.images || [],
          authorId: data.authorId,
          authorName: data.authorName,
          authorAvatar: data.authorAvatar || '',
          likes: data.likes || 0,
          commentCount: data.commentCount || 0,
          repostCount: data.repostCount || 0,
          replyCount: data.replyCount || 0,
          hashtags: data.hashtags || [],
          mentions: data.mentions || [],
          quotedPostId: data.quotedPostId,
          quotedPost,
          replyToPostId: data.replyToPostId,
          replyToUserId: data.replyToUserId,
          replyToUserName: data.replyToUserName,
          recipeData: data.recipeData,
          visibility: data.visibility,
          isPinned: data.isPinned || false,
          createdAt: timestampToString(data.createdAt),
          updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
        });
      }
    }

    // 時系列順にソート
    allPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // limit適用
    const result = allPosts.slice(0, limit);
    console.log(`[getFollowingPosts] Returning ${result.length} posts`);

    return result;
  } catch (error) {
    console.error('[getFollowingPosts] フォロー中の投稿取得に失敗しました:', error);
    return [];
  }
};

/**
 * ユーザーの画像付き投稿を取得（Twitterスタイル）
 */
export const getUserMediaPosts = async (
  userId: string,
  limit: number = 20
): Promise<Post[]> => {
  try {
    console.log(`[getUserMediaPosts] Fetching media posts for user: ${userId}`);

    // まずユーザーの全投稿を取得
    const allPosts = await getUserPosts(userId, 100); // 多めに取得

    // 画像付き投稿のみフィルタ
    const mediaPosts = allPosts.filter(post => post.images && post.images.length > 0);

    console.log(`[getUserMediaPosts] Found ${mediaPosts.length} media posts`);
    return mediaPosts.slice(0, limit);
  } catch (error) {
    console.error('[getUserMediaPosts] メディア投稿の取得に失敗しました:', error);
    return [];
  }
};

/**
 * ユーザーがいいねした投稿を取得（Twitterスタイル）
 */
export const getUserLikedPosts = async (
  userId: string,
  limit: number = 20
): Promise<Post[]> => {
  try {
    console.log(`[getUserLikedPosts] Fetching liked posts for user: ${userId}`);

    // 全投稿を取得（効率は悪いが、Firestoreの構造上仕方ない）
    const postsRef = collection(db, 'posts');
    const allPostsSnapshot = await getDocs(postsRef);

    const likedPosts: Post[] = [];

    // 各投稿のいいねをチェック
    for (const postDoc of allPostsSnapshot.docs) {
      const postData = postDoc.data();

      // このユーザーがいいねしているかチェック
      const likesRef = collection(db, `posts/${postDoc.id}/likes`);
      const likesSnapshot = await getDocs(likesRef);

      let userLiked = false;
      for (const likeDoc of likesSnapshot.docs) {
        const likeData = likeDoc.data();
        if (likeData.userId === userId) {
          userLiked = true;
          break;
        }
      }

      if (userLiked) {
        // 引用元の投稿を取得
        let quotedPost: Post | undefined = undefined;
        if (postData.quotedPostId) {
          const quotedPostData = await getPost(postData.quotedPostId);
          if (quotedPostData) {
            quotedPost = { ...quotedPostData, quotedPost: undefined };
          }
        }

        likedPosts.push({
          id: postDoc.id,
          content: postData.content,
          images: postData.images || [],
          authorId: postData.authorId,
          authorName: postData.authorName,
          authorAvatar: postData.authorAvatar || '',
          likes: postData.likes || 0,
          commentCount: postData.commentCount || 0,
          repostCount: postData.repostCount || 0,
          replyCount: postData.replyCount || 0,
          hashtags: postData.hashtags || [],
          mentions: postData.mentions || [],
          quotedPostId: postData.quotedPostId,
          quotedPost,
          replyToPostId: postData.replyToPostId,
          replyToUserId: postData.replyToUserId,
          replyToUserName: postData.replyToUserName,
          recipeData: postData.recipeData,
          visibility: postData.visibility,
          isPinned: postData.isPinned || false,
          createdAt: timestampToString(postData.createdAt),
          updatedAt: postData.updatedAt ? timestampToString(postData.updatedAt) : undefined,
        });
      }

      // limit達成したら終了
      if (likedPosts.length >= limit) {
        break;
      }
    }

    // 時系列順にソート（いいねした順ではなく、投稿作成順）
    likedPosts.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`[getUserLikedPosts] Found ${likedPosts.length} liked posts`);
    return likedPosts.slice(0, limit);
  } catch (error) {
    console.error('[getUserLikedPosts] いいねした投稿の取得に失敗しました:', error);
    return [];
  }
};

// ============================================
// ピン留め機能（Twitter機能）
// ============================================

/**
 * 投稿をプロフィールにピン留めする
 */
export const pinPost = async (userId: string, postId: string): Promise<void> => {
  try {
    console.log(`[pinPost] Pinning post ${postId} for user ${userId}`);

    // 投稿の存在確認
    const post = await getPost(postId);
    if (!post) {
      throw new Error('投稿が見つかりません');
    }

    // 自分の投稿のみピン留め可能
    if (post.authorId !== userId) {
      throw new Error('自分の投稿のみピン留めできます');
    }

    // 古いピン留めを解除（存在する場合）
    const profileRef = doc(db, `users/${userId}/profile/data`);
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      const oldPinnedPostId = profileData.pinnedPostId;

      // 古いピン留め投稿のisPinnedをfalseに
      if (oldPinnedPostId) {
        const oldPostRef = doc(db, 'posts', oldPinnedPostId);
        await updateDoc(oldPostRef, {
          isPinned: false,
        });
      }
    }

    // プロフィールのpinnedPostIdを更新
    await updateDoc(profileRef, {
      pinnedPostId: postId,
    });

    // 投稿のisPinnedをtrueに
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      isPinned: true,
    });

    console.log(`✅ [pinPost] Post ${postId} pinned successfully`);
  } catch (error: any) {
    console.error(`❌ [pinPost] Error:`, error);
    throw new Error(`ピン留めに失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * 投稿のピン留めを解除する
 */
export const unpinPost = async (userId: string, postId: string): Promise<void> => {
  try {
    console.log(`[unpinPost] Unpinning post ${postId} for user ${userId}`);

    // プロフィールのpinnedPostIdをクリア
    const profileRef = doc(db, `users/${userId}/profile/data`);
    await updateDoc(profileRef, {
      pinnedPostId: null,
    });

    // 投稿のisPinnedをfalseに
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      isPinned: false,
    });

    console.log(`✅ [unpinPost] Post ${postId} unpinned successfully`);
  } catch (error: any) {
    console.error(`❌ [unpinPost] Error:`, error);
    throw new Error(`ピン留め解除に失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * 投稿への返信一覧を取得
 */
export const getPostReplies = async (
  postId: string,
  limit: number = 50
): Promise<Post[]> => {
  try {
    console.log(`[getPostReplies] Fetching replies for post: ${postId}`);
    const postsRef = collection(db, 'posts');

    const q = query(
      postsRef,
      where('replyToPostId', '==', postId),
      orderBy('createdAt', 'asc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const replies: Post[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const post: Post = {
        id: docSnap.id,
        content: data.content,
        images: data.images || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        repostCount: data.repostCount || 0,
        replyCount: data.replyCount || 0,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        quotedPostId: data.quotedPostId,
        replyToPostId: data.replyToPostId,
        replyToUserId: data.replyToUserId,
        replyToUserName: data.replyToUserName,
        recipeData: data.recipeData,
        visibility: data.visibility,
        isPinned: data.isPinned || false,
        createdAt: timestampToString(data.createdAt),
        updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
      };
      replies.push(post);
    }

    console.log(`[getPostReplies] Found ${replies.length} replies`);
    return replies;
  } catch (error) {
    console.error('[getPostReplies] Error:', error);
    return [];
  }
};

/**
 * ユーザーの返信一覧を取得
 */
export const getUserReplies = async (
  userId: string,
  limit: number = 20
): Promise<Post[]> => {
  try {
    console.log(`[getUserReplies] Fetching replies for user: ${userId}`);
    const postsRef = collection(db, 'posts');

    const q = query(
      postsRef,
      where('authorId', '==', userId),
      where('replyToPostId', '!=', null),
      orderBy('replyToPostId'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);
    const replies: Post[] = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      const post: Post = {
        id: docSnap.id,
        content: data.content,
        images: data.images || [],
        authorId: data.authorId,
        authorName: data.authorName,
        authorAvatar: data.authorAvatar || '',
        likes: data.likes || 0,
        commentCount: data.commentCount || 0,
        repostCount: data.repostCount || 0,
        replyCount: data.replyCount || 0,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        quotedPostId: data.quotedPostId,
        replyToPostId: data.replyToPostId,
        replyToUserId: data.replyToUserId,
        replyToUserName: data.replyToUserName,
        recipeData: data.recipeData,
        visibility: data.visibility,
        isPinned: data.isPinned || false,
        createdAt: timestampToString(data.createdAt),
        updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
      };
      replies.push(post);
    }

    console.log(`[getUserReplies] Found ${replies.length} replies`);
    return replies;
  } catch (error) {
    console.error('[getUserReplies] Error:', error);
    // フォールバック: authorIdのみでフィルタリング
    try {
      const postsRefFallback = collection(db, 'posts');
      const q = query(
        postsRefFallback,
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );
      const querySnapshot = await getDocs(q);
      const allPosts: Post[] = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        // replyToPostIdが存在するもののみ
        if (data.replyToPostId) {
          const post: Post = {
            id: docSnap.id,
            content: data.content,
            images: data.images || [],
            authorId: data.authorId,
            authorName: data.authorName,
            authorAvatar: data.authorAvatar || '',
            likes: data.likes || 0,
            commentCount: data.commentCount || 0,
            repostCount: data.repostCount || 0,
            replyCount: data.replyCount || 0,
            hashtags: data.hashtags || [],
            mentions: data.mentions || [],
            quotedPostId: data.quotedPostId,
            replyToPostId: data.replyToPostId,
            replyToUserId: data.replyToUserId,
            replyToUserName: data.replyToUserName,
            recipeData: data.recipeData,
            visibility: data.visibility,
            isPinned: data.isPinned || false,
            createdAt: timestampToString(data.createdAt),
            updatedAt: data.updatedAt ? timestampToString(data.updatedAt) : undefined,
          };
          allPosts.push(post);
        }
      }

      console.log(`[getUserReplies] Fallback: Found ${allPosts.length} replies`);
      return allPosts.slice(0, limit);
    } catch (fallbackError) {
      console.error('[getUserReplies] Fallback also failed:', fallbackError);
      return [];
    }
  }
};

/**
 * 投稿のスレッド（親投稿 + すべての返信）を取得
 */
export const getPostThread = async (postId: string): Promise<{
  mainPost: Post | null;
  replies: Post[];
}> => {
  try {
    console.log(`[getPostThread] Fetching thread for post: ${postId}`);

    // メイン投稿を取得
    const mainPost = await getPost(postId);
    if (!mainPost) {
      return { mainPost: null, replies: [] };
    }

    // 返信を取得
    const replies = await getPostReplies(postId, 100);

    console.log(`[getPostThread] Found thread with ${replies.length} replies`);
    return { mainPost, replies };
  } catch (error) {
    console.error('[getPostThread] Error:', error);
    return { mainPost: null, replies: [] };
  }
};
