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
 * テキストから単語を抽出（簡易形態素解析）
 */
const extractWords = (text: string): string[] => {
  // ストップワード（助詞、助動詞、接続詞など）
  const stopWords = [
    'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ', 'ある', 'いる', 'も', 'する', 'から', 'な', 'こと', 'として', 'い', 'や', 'れる', 'など', 'なっ', 'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また', 'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ', 'か', 'だ', 'これ', 'によって', 'により', 'おり', 'より', 'による', 'ず', 'なり', 'られる', 'において', 'ば', 'なかっ', 'なく', 'しかし', 'について', 'せ', 'だっ', 'その後', 'できる', 'それ', 'う', 'ので', 'なお', 'のみ', 'でき', 'き', 'つ', 'における', 'および', 'いう', 'さらに', 'でも', 'ら', 'たり', 'その他', 'に関する', 'たち', 'ます', 'ん', 'なら', 'に対して', '特に', 'せる', '及び', 'これら', 'とき', 'では', 'にて', 'ほか', 'ながら', 'うち', 'そして', 'とも', 'として', 'のか', 'のに', 'ほど', 'ものの', 'という', 'ところ', 'による', 'もん', 'です', 'ました', 'でした', 'ある', 'いる', 'する', 'なる', 'くる', 'やる', 'いく', 'できる', 'なら', 'だろ', 'でしょ', 'です', 'ます', 'ません', 'ましょ', 'なり', 'たい', 'たら', 'なくて', 'なけれ',
  ];

  // URLとメンション、ハッシュタグを除去
  let cleanedText = text.replace(/https?:\/\/[^\s]+/g, '');
  cleanedText = cleanedText.replace(/@[a-zA-Z0-9_]+/g, '');
  cleanedText = cleanedText.replace(/#[^\s]+/g, '');

  // 記号を除去
  cleanedText = cleanedText.replace(/[!-/:-@[-`{-~、。！？「」『』（）]/g, ' ');

  // スペースで分割
  const words = cleanedText.split(/\s+/).filter(word => word.length > 0);

  // 日本語の場合は連続する文字を単語として抽出（簡易版）
  const japaneseWords: string[] = [];
  const japaneseRegex = /[ぁ-んァ-ヶー一-龠々]+/g;
  const matches = cleanedText.match(japaneseRegex);
  if (matches) {
    matches.forEach(match => {
      // 2文字以上の単語のみ
      if (match.length >= 2) {
        // ストップワードでない場合のみ追加
        if (!stopWords.includes(match)) {
          japaneseWords.push(match);
        }
      }
    });
  }

  // 英数字の単語（3文字以上）
  const englishWords = words.filter(word => {
    return word.match(/^[a-zA-Z0-9]+$/) && word.length >= 3;
  });

  return [...japaneseWords, ...englishWords];
};

/**
 * トレンドキーワードを取得（人気順）
 * ハッシュタグだけでなく投稿の全文から頻出単語を抽出
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
    const wordCounts: Record<string, number> = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // ハッシュタグをカウント
      const hashtags = data.hashtags || [];
      hashtags.forEach((tag: string) => {
        wordCounts[`#${tag}`] = (wordCounts[`#${tag}`] || 0) + 2; // ハッシュタグは2倍の重み
      });

      // 投稿本文から単語を抽出してカウント
      const content = data.content || '';
      const words = extractWords(content);
      words.forEach((word: string) => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
    });

    // カウント順にソート
    const trending = Object.entries(wordCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return trending;
  } catch (error) {
    console.error('トレンドキーワード取得エラー:', error);
    return [];
  }
};
