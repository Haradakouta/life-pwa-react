/**
 * プロフィール操作関連のユーティリティ関数
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import type { UserProfile, UserStats } from '../types/profile';

/**
 * 初期プロフィールを作成
 */
export const createUserProfile = async (uid: string, email: string, displayName: string): Promise<void> => {
  const userProfile: UserProfile = {
    uid,
    displayName,
    username: `user${uid.slice(0, 8)}`, // 仮のusername
    email,
    bio: '',
    avatarUrl: '',
    coverUrl: '',
    websiteUrl: '',
    isPublic: true,
    createdAt: new Date().toISOString(),
    stats: {
      postCount: 0,
      followerCount: 0,
      followingCount: 0,
      recipeCount: 0,
      likeCount: 0,
    },
  };

  await setDoc(doc(db, 'users', uid, 'profile', 'data'), userProfile);
  console.log('✅ User profile created:', uid);
};

/**
 * プロフィールを取得
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const profileDoc = await getDoc(doc(db, 'users', uid, 'profile', 'data'));
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Get profile error:', error);
    throw new Error('プロフィールの取得に失敗しました');
  }
};

/**
 * プロフィールを更新
 */
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', uid, 'profile', 'data'), data);

    // Firebase Authのdisplay nameも更新
    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.avatarUrl || auth.currentUser.photoURL,
      });
    }

    console.log('✅ Profile updated:', uid);
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error('プロフィールの更新に失敗しました');
  }
};

/**
 * usernameが利用可能かチェック
 */
export const isUsernameAvailable = async (username: string, currentUid: string): Promise<boolean> => {
  try {
    // usernameでユーザーを検索
    const profilesRef = collection(db, 'users');
    const q = query(profilesRef);
    const querySnapshot = await getDocs(q);

    for (const docSnap of querySnapshot.docs) {
      const profileDocRef = doc(db, 'users', docSnap.id, 'profile', 'data');
      const profileDoc = await getDoc(profileDocRef);

      if (profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile;
        // 同じusernameが存在し、かつ自分以外のユーザーの場合はfalse
        if (profile.username === username && profile.uid !== currentUid) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Username check error:', error);
    return false;
  }
};

/**
 * usernameのバリデーション
 */
export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  // 3〜20文字
  if (username.length < 3 || username.length > 20) {
    return { valid: false, error: 'ユーザー名は3〜20文字で入力してください' };
  }

  // 英数字とアンダースコアのみ
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: 'ユーザー名は英数字とアンダースコア(_)のみ使用できます' };
  }

  // 先頭は文字のみ
  if (!/^[a-zA-Z]/.test(username)) {
    return { valid: false, error: 'ユーザー名は英字で始める必要があります' };
  }

  return { valid: true };
};

/**
 * 統計情報を更新
 */
export const updateUserStats = async (uid: string, stats: Partial<UserStats>): Promise<void> => {
  try {
    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    const profileDoc = await getDoc(profileRef);

    if (profileDoc.exists()) {
      const currentProfile = profileDoc.data() as UserProfile;
      const updatedStats = { ...currentProfile.stats, ...stats };

      await updateDoc(profileRef, { stats: updatedStats });
      console.log('✅ Stats updated:', uid, stats);
    }
  } catch (error) {
    console.error('Update stats error:', error);
    throw new Error('統計情報の更新に失敗しました');
  }
};

/**
 * プロフィールを検索（usernameまたはdisplayName）
 */
export const searchProfiles = async (searchTerm: string): Promise<UserProfile[]> => {
  try {
    const profilesRef = collection(db, 'users');
    const querySnapshot = await getDocs(profilesRef);

    const profiles: UserProfile[] = [];

    for (const docSnap of querySnapshot.docs) {
      const profileDocRef = doc(db, 'users', docSnap.id, 'profile', 'data');
      const profileDoc = await getDoc(profileDocRef);

      if (profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile;

        // 公開プロフィールのみ、かつ検索条件に一致
        if (
          profile.isPublic &&
          (profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
        ) {
          profiles.push(profile);
        }
      }
    }

    return profiles;
  } catch (error) {
    console.error('Search profiles error:', error);
    return [];
  }
};
