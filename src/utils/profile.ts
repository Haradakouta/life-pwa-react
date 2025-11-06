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
  try {
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
        friendCount: 0,
        recipeCount: 0,
        likeCount: 0,
      },
    };

    console.log('📝 Creating user profile for:', uid);
    console.log('📝 Profile data:', userProfile);

    const profileRef = doc(db, 'users', uid, 'profile', 'data');
    console.log('📝 Profile document path:', profileRef.path);

    await setDoc(profileRef, userProfile);
    console.log('✅ User profile created successfully:', uid);
  } catch (error: any) {
    console.error('❌ Failed to create user profile:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw new Error(`プロフィール作成に失敗しました: ${error.message || error.code || '不明なエラー'}`);
  }
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

    // 称号チェック（プロフィール更新後 - プロフィール完成チェック）
    try {
      const { checkAndGrantTitles } = await import('./title');
      await checkAndGrantTitles(uid);
    } catch (error) {
      console.error('称号チェックエラー:', error);
      // 称号チェックに失敗してもプロフィール更新は成功させる
    }
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
      // 自分のuid以外をチェック
      if (docSnap.id === currentUid) continue;

      const profileDocRef = doc(db, 'users', docSnap.id, 'profile', 'data');
      try {
        const profileDoc = await getDoc(profileDocRef);

        if (profileDoc.exists()) {
          const profile = profileDoc.data() as UserProfile;
          // 同じusernameが存在する場合はfalse
          if (profile.username === username) {
            return false;
          }
        }
      } catch (err) {
        // プロフィールがない場合はスキップ
        console.log(`No profile for user ${docSnap.id}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Username check error:', error);
    // エラー時は true を返す（ユーザーが登録できるように）
    return true;
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

/**
 * ユーザー名からユーザーIDを取得
 */
export const getUserIdByUsername = async (username: string): Promise<string | null> => {
  try {
    const profilesRef = collection(db, 'users');
    const querySnapshot = await getDocs(profilesRef);

    for (const docSnap of querySnapshot.docs) {
      const profileDocRef = doc(db, 'users', docSnap.id, 'profile', 'data');
      const profileDoc = await getDoc(profileDocRef);

      if (profileDoc.exists()) {
        const profile = profileDoc.data() as UserProfile;

        // usernameが完全一致
        if (profile.username.toLowerCase() === username.toLowerCase()) {
          return profile.uid;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Get user ID by username error:', error);
    return null;
  }
};

/**
 * フォロワー数を取得
 */
export const getFollowerCount = async (userId: string): Promise<number> => {
  try {
    const followersRef = collection(db, `users/${userId}/followers`);
    const snapshot = await getDocs(followersRef);
    return snapshot.size;
  } catch (error) {
    console.error('フォロワー数取得エラー:', error);
    return 0;
  }
};

/**
 * フォロー数を取得
 */
export const getFollowingCount = async (userId: string): Promise<number> => {
  try {
    const followingRef = collection(db, `users/${userId}/following`);
    const snapshot = await getDocs(followingRef);
    return snapshot.size;
  } catch (error) {
    console.error('フォロー数取得エラー:', error);
    return 0;
  }
};


