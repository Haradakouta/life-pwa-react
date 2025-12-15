/**
 * 称号（タイトル）システムのユーティリティ関数
 */

import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Title, TitleCondition, UserTitle } from '../types/title';
import { titles } from '../data/titles';
import { getUserProfile } from './profile';
import { getUserPosts } from './post';
import { getFollowerCount, getFollowingCount } from './profile';

/**
 * ユーザーの称号を取得
 */
export const getUserTitles = async (userId: string): Promise<UserTitle[]> => {
  try {
    const titlesRef = collection(db, `users/${userId}/titles`);
    const querySnapshot = await getDocs(titlesRef);

    const userTitles: UserTitle[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userTitles.push({
        userId,
        titleId: doc.id,
        earnedAt: data.earnedAt || new Date().toISOString(),
        isEquipped: data.isEquipped || false,
      });
    });

    return userTitles;
  } catch (error) {
    console.error('称号取得エラー:', error);
    return [];
  }
};

/**
 * 装備中の称号を取得
 */
export const getEquippedTitle = async (userId: string): Promise<Title | null> => {
  try {
    const userTitles = await getUserTitles(userId);
    const equipped = userTitles.find(t => t.isEquipped);

    if (!equipped) return null;

    const title = getTitleById(equipped.titleId);
    return title || null;
  } catch (error) {
    console.error('装備称号取得エラー:', error);
    return null;
  }
};

/**
 * 称号を付与
 */
export const grantTitle = async (userId: string, titleId: string): Promise<void> => {
  try {
    const titleRef = doc(db, `users/${userId}/titles`, titleId);
    const titleSnap = await getDoc(titleRef);

    // 既に獲得している場合はスキップ
    if (titleSnap.exists()) {
      return;
    }

    await setDoc(titleRef, {
      titleId,
      earnedAt: new Date().toISOString(),
      isEquipped: false,
    });

    console.log(`✅ 称号を付与しました: ${titleId} (ユーザー: ${userId})`);
  } catch (error) {
    console.error('称号付与エラー:', error);
    throw error;
  }
};

/**
 * 称号を装備/外す
 */
export const equipTitle = async (userId: string, titleId: string): Promise<void> => {
  try {
    // まず既に装備されている称号を外す
    const titlesRef = collection(db, `users/${userId}/titles`);
    const querySnapshot = await getDocs(query(titlesRef, where('isEquipped', '==', true)));

    for (const docSnap of querySnapshot.docs) {
      await updateDoc(doc(db, `users/${userId}/titles`, docSnap.id), {
        isEquipped: false,
      });
    }

    // 指定された称号を装備
    const titleRef = doc(db, `users/${userId}/titles`, titleId);
    await updateDoc(titleRef, {
      isEquipped: true,
    });

    console.log(`✅ 称号を装備しました: ${titleId}`);
  } catch (error) {
    console.error('称号装備エラー:', error);
    throw error;
  }
};

/**
 * 称号IDから称号を取得
 */
export function getTitleById(id: string): Title | undefined {
  return titles.find(title => title.id === id);
}

/**
 * 称号の獲得条件をチェック
 */
export const checkTitleCondition = async (
  userId: string,
  condition: TitleCondition
): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    switch (condition.type) {
      case 'first_post':
        return profile.stats.postCount >= 1;

      case 'post_count':
        return condition.threshold !== undefined && profile.stats.postCount >= condition.threshold;

      case 'like_count':
        // いいねをした回数（実装が必要な場合は別途実装）
        return false; // 暫定

      case 'follower_count': {
        const count = await getFollowerCount(userId);
        return condition.threshold !== undefined && count >= condition.threshold;
      }

      case 'following_count': {
        const count = await getFollowingCount(userId);
        return condition.threshold !== undefined && count >= condition.threshold;
      }

      case 'recipe_count':
        return condition.threshold !== undefined && profile.stats.recipeCount >= condition.threshold;

      case 'consecutive_days': {
        // 連続投稿日数を計算（実装が必要）
        const posts = await getUserPosts(userId, 100);
        const dates = posts.map(p => p.createdAt.split('T')[0]);
        const uniqueDates = [...new Set(dates)].sort().reverse();

        if (uniqueDates.length === 0) return false;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
          const date = new Date(uniqueDates[i]);
          date.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);
          expectedDate.setHours(0, 0, 0, 0);

          if (date.getTime() === expectedDate.getTime()) {
            streak++;
          } else {
            break;
          }
        }

        return condition.threshold !== undefined && streak >= condition.threshold;
      }

      case 'total_likes': {
        const posts = await getUserPosts(userId, 1000);
        const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
        return condition.threshold !== undefined && totalLikes >= condition.threshold;
      }

      case 'comment_count':
        // コメント数を取得（実装が必要な場合は別途実装）
        return false; // 暫定

      case 'repost_count':
        // リポスト数を取得（実装が必要な場合は別途実装）
        return false; // 暫定

      case 'hashtag_trend':
        // トレンドハッシュタグを作成したか（実装が必要な場合は別途実装）
        return false; // 暫定

      case 'profile_complete':
        return !!(profile.bio && profile.avatarUrl);

      case 'veteran': {
        const createdAt = new Date(profile.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        return condition.threshold !== undefined && daysDiff >= condition.threshold;
      }

      case 'popular':
        // トレンド入りしたか（実装が必要な場合は別途実装）
        return false; // 暫定

      case 'prefecture':
        // 都道府県が設定されているか、かつ指定された都道府県コードと一致するか
        if (!condition.prefectureCode) return false;
        return profile.prefecture === condition.prefectureCode;

      case 'prefecture_post': {
        // 都道府県が一致し、かつ投稿数が閾値を超えているか
        if (!condition.prefectureCode || !condition.threshold) return false;
        if (profile.prefecture !== condition.prefectureCode) return false;
        const posts = await getUserPosts(userId, 1000);
        // ユーザーの都道府県で投稿されたもののみカウント（現時点では全投稿をカウント）
        return posts.length >= condition.threshold;
      }

      case 'prefecture_recipe': {
        // 都道府県が一致し、かつレシピ数が閾値を超えているか
        if (!condition.prefectureCode || !condition.threshold) return false;
        if (profile.prefecture !== condition.prefectureCode) return false;
        return profile.stats.recipeCount >= condition.threshold;
      }

      case 'prefecture_like': {
        // 都道府県が一致し、かつ総いいね数が閾値を超えているか
        if (!condition.prefectureCode || !condition.threshold) return false;
        if (profile.prefecture !== condition.prefectureCode) return false;
        const posts = await getUserPosts(userId, 1000);
        const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
        return totalLikes >= condition.threshold;
      }

      case 'prefecture_comment': {
        // 都道府県が一致し、かつコメント数が閾値を超えているか
        if (!condition.prefectureCode || !condition.threshold) return false;
        if (profile.prefecture !== condition.prefectureCode) return false;
        // コメント数はprofile.statsから取得
        return profile.stats.commentCount >= condition.threshold;
      }

      case 'prefecture_follower': {
        // 都道府県が一致し、かつフォロワー数が閾値を超えているか
        if (!condition.prefectureCode || !condition.threshold) return false;
        if (profile.prefecture !== condition.prefectureCode) return false;
        const count = await getFollowerCount(userId);
        return count >= condition.threshold;
      }

      case 'special':
        return false; // 手動付与のみ

      default:
        return false;
    }
  } catch (error) {
    console.error('称号条件チェックエラー:', error);
    return false;
  }
};

/**
 * 都道府県別称号を削除（都道府県変更時に呼び出す）
 */
export const removePrefectureTitles = async (userId: string, prefectureCode: string): Promise<void> => {
  try {
    const userTitles = await getUserTitles(userId);

    // 都道府県別称号を削除
    for (const userTitle of userTitles) {
      const title = getTitleById(userTitle.titleId);
      if (title && title.condition.prefectureCode === prefectureCode) {
        const titleRef = doc(db, `users/${userId}/titles`, userTitle.titleId);
        await deleteDoc(titleRef);
        console.log(`✅ 都道府県別称号を削除しました: ${userTitle.titleId}`);
      }
    }
  } catch (error) {
    console.error('都道府県別称号削除エラー:', error);
    throw error;
  }
};

/**
 * ユーザーの称号をチェックして、獲得可能な称号を付与
 */
export const checkAndGrantTitles = async (userId: string): Promise<string[]> => {
  try {
    const userTitles = await getUserTitles(userId);
    const earnedTitleIds = new Set(userTitles.map(t => t.titleId));

    // ユーザーの都道府県を取得
    const profile = await getUserProfile(userId);
    const userPrefecture = profile?.prefecture;

    const newlyGranted: string[] = [];

    for (const title of titles) {
      // 既に獲得している場合はスキップ
      if (earnedTitleIds.has(title.id)) {
        continue;
      }

      // 都道府県別称号は、ユーザーの都道府県が一致するもののみチェック
      if (title.condition.prefectureCode) {
        if (title.condition.prefectureCode !== userPrefecture) {
          continue; // 自分の都道府県以外の称号はスキップ
        }
      }

      // 条件をチェック
      const conditionMet = await checkTitleCondition(userId, title.condition);

      if (conditionMet) {
        await grantTitle(userId, title.id);
        newlyGranted.push(title.id);
      }
    }

    return newlyGranted;
  } catch (error) {
    console.error('称号チェックエラー:', error);
    return [];
  }
};

