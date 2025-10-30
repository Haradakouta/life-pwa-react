/**
 * プロフィール操作関連のユーティリティ関数
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, increment, writeBatch } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import type { UserProfile, UserStats, Follower } from '../types/profile';
import { createNotification } from './notification';

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
        followerCount: 0,
        followingCount: 0,
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

// ============================================
// フォロー機能
// ============================================



/**
 * ユーザーをフォロー (バッチ書き込み使用)
 */
export const followUser = async (
  followerId: string,
  followerName: string,
  followerAvatar: string | undefined,
  followingId: string,
  followingName: string,
  followingAvatar: string | undefined
): Promise<void> => {
  console.log(`[followUser] Starting atomic follow: ${followerId} → ${followingId}`);
  try {
    const batch = writeBatch(db);

    // Paths
    const followerDocRef = doc(db, `users/${followingId}/followers/${followerId}`);
    const followingDocRef = doc(db, `users/${followerId}/following/${followingId}`);
    const followerProfileRef = doc(db, `users/${followerId}/profile/data`);
    const followingProfileRef = doc(db, `users/${followingId}/profile/data`);

    // Check if already following to prevent re-following, but still allow the batch to fix inconsistencies if needed.
    const alreadyFollowingSnap = await getDoc(followingDocRef);
    if (alreadyFollowingSnap.exists()) {
      console.log(`⚠️ Already following: ${followerId} → ${followingId}`);
      // Optionally, you could run a consistency check here, but for now, we just exit.
      return;
    }

    const timestamp = new Date().toISOString();

    // 1. Add to the target user's followers list
    const followerData = { followerId, followerName, followerAvatar: followerAvatar || '', createdAt: timestamp };
    batch.set(followerDocRef, followerData);

    // 2. Add to the current user's following list
    const followingData = { followingId, followingName, followingAvatar: followingAvatar || '', createdAt: timestamp };
    batch.set(followingDocRef, followingData);

    // 3. Increment the current user's following count
    batch.update(followerProfileRef, { 'stats.followingCount': increment(1) });

    // 4. Increment the target user's follower count
    batch.update(followingProfileRef, { 'stats.followerCount': increment(1) });

    // Commit the batch
    await batch.commit();

    // Send notification after the follow is successfully committed
    await createNotification(followingId, followerId, followerName, 'follow', { actorAvatar: followerAvatar });

    console.log(`✅ [followUser] Atomic follow complete: ${followerId} → ${followingId}`);
  } catch (error: any) {
    console.error(`❌ [followUser] Atomic follow failed:`, error);
    throw new Error(`フォローに失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * ユーザーをアンフォロー (バッチ書き込み使用)
 */
export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  console.log(`[unfollowUser] Starting atomic unfollow: ${followerId} X ${followingId}`);
  try {
    const batch = writeBatch(db);

    // Paths
    const followerDocRef = doc(db, `users/${followingId}/followers/${followerId}`);
    const followingDocRef = doc(db, `users/${followerId}/following/${followingId}`);
    const followerProfileRef = doc(db, `users/${followerId}/profile/data`);
    const followingProfileRef = doc(db, `users/${followingId}/profile/data`);

    // 1. Delete from the target user's followers list
    batch.delete(followerDocRef);

    // 2. Delete from the current user's following list
    batch.delete(followingDocRef);

    // 3. Decrement the current user's following count
    batch.update(followerProfileRef, { 'stats.followingCount': increment(-1) });

    // 4. Decrement the target user's follower count
    batch.update(followingProfileRef, { 'stats.followerCount': increment(-1) });

    // Commit the batch
    await batch.commit();

    console.log(`✅ [unfollowUser] Atomic unfollow complete: ${followerId} X ${followingId}`);
  } catch (error: any) {
    console.error(`❌ [unfollowUser] Atomic unfollow failed:`, error);
    throw new Error(`アンフォローに失敗しました: ${error.message || '不明なエラー'}`);
  }
};

/**
 * フォロー状態をチェック
 */
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followingRef = doc(db, `users/${followerId}/following/${followingId}`);
    const followDoc = await getDoc(followingRef);
    return followDoc.exists();
  } catch (error) {
    console.error('Check follow error:', error);
    return false;
  }
};

/**
 * ユーザーのフォロワー一覧を取得
 */
export const getFollowers = async (userId: string): Promise<Follower[]> => {
  try {
    const followersRef = collection(db, `users/${userId}/followers`);
    const querySnapshot = await getDocs(followersRef);

    const followers: Follower[] = [];
    const currentUser = auth.currentUser;

    for (const docSnap of querySnapshot.docs) {
      const followData = docSnap.data();
      const followerProfile = await getUserProfile(followData.followerId);

      if (followerProfile) {
        let isFollowingThisUser = false;
        if (currentUser) {
          isFollowingThisUser = await isFollowing(currentUser.uid, followData.followerId);
        }

        followers.push({
          uid: followerProfile.uid,
          displayName: followerProfile.displayName,
          username: followerProfile.username,
          avatarUrl: followerProfile.avatarUrl,
          bio: followerProfile.bio,
          isFollowing: isFollowingThisUser,
        });
      }
    }

    return followers.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Get followers error:', error);
    return [];
  }
};

/**
 * フォロー中のユーザー一覧を取得 (効率化版)
 */
export const getFollowing = async (userId: string): Promise<Follower[]> => {
  try {
    const followingRef = collection(db, `users/${userId}/following`);
    const querySnapshot = await getDocs(followingRef);

    const following: Follower[] = [];
    const currentUser = auth.currentUser;

    for (const docSnap of querySnapshot.docs) {
      const followData = docSnap.data();
      const followingProfile = await getUserProfile(followData.followingId);

      if (followingProfile) {
        let isFollowingThisUser = true;
        if (currentUser && currentUser.uid !== userId) {
            isFollowingThisUser = await isFollowing(currentUser.uid, followingProfile.uid);
        }

        following.push({
          uid: followingProfile.uid,
          displayName: followingProfile.displayName,
          username: followingProfile.username,
          avatarUrl: followingProfile.avatarUrl,
          bio: followingProfile.bio,
          isFollowing: isFollowingThisUser,
        });
      }
    }

    return following.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Get following error:', error);
    return [];
  }
};
