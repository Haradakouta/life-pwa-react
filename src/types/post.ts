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
  hashtags?: string[];
  visibility: 'public' | 'followers' | 'private';
  createdAt: string;
  updatedAt?: string;
}

export interface PostFormData {
  content: string;
  images: File[];
  visibility: 'public' | 'followers' | 'private';
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
