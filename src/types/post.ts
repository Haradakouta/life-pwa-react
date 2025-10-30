export interface Post {
  id: string;
  content: string;
  images?: string[]; // 画像URL配列
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  commentCount: number;
  repostCount: number;
  replyCount?: number; // 返信数（オプショナル）
  hashtags?: string[];
  mentions?: string[]; // メンションされたユーザーID配列
  quotedPostId?: string; // 引用元の投稿ID
  quotedPost?: Post; // 引用元の投稿（取得時に埋め込み）
  replyToPostId?: string; // 返信先の投稿ID
  replyToUserId?: string; // 返信先のユーザーID
  replyToUserName?: string; // 返信先のユーザー名
  recipeData?: RecipeData; // レシピデータ（投稿に含まれる場合）
  visibility: 'public' | 'followers' | 'private';
  isPinned?: boolean; // プロフィールに固定されているか（Twitter機能）
  createdAt: string;
  updatedAt?: string;
}

// 投稿に含まれるレシピデータ（簡略版）
export interface RecipeData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  preparationTime: number; // 分単位
  cookingTime: number; // 分単位
}

export interface PostFormData {
  content: string;
  images: File[];
  visibility: 'public' | 'followers' | 'private';
  quotedPostId?: string; // 引用元の投稿ID
  replyToPostId?: string; // 返信先の投稿ID
  replyToUserId?: string; // 返信先のユーザーID
  replyToUserName?: string; // 返信先のユーザー名
  recipeData?: RecipeData; // レシピデータ
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface Repost {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  preparationTime: number; // 分単位
  cookingTime: number; // 分単位
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  likes: number;
  commentCount: number;
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  updatedAt?: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  preparationTime: number;
  cookingTime: number;
  image?: File;
  visibility: 'public' | 'followers' | 'private';
}
