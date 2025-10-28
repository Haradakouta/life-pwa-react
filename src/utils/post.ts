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
    const likeData: Like = {
      id: likeId,
      postId,
      userId,
      userName,
      userAvatar,
      createdAt: new Date().toISOString(),
    };

    // いいねを保存
    await setDoc(likeRef, likeData);

    // 投稿のいいね数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1),
    });

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

    const commentData: Comment = {
      id: commentId,
      postId,
      userId,
      userName,
      userAvatar,
      content,
      createdAt: new Date().toISOString(),
    };

    await setDoc(commentRef, commentData);

    // 投稿のコメント数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1),
    });

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

    const repostData: Repost = {
      id: repostId,
      postId,
      userId,
      userName,
      userAvatar,
      createdAt: new Date().toISOString(),
    };

    await setDoc(repostRef, repostData);

    // 投稿のリポスト数を更新
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      repostCount: increment(1),
    });

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
