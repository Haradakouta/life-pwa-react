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
