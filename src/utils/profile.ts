/**
 * プロフィール操作関連のユーティリティ関数
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, getDocs, deleteDoc, increment } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import type { UserProfile, UserStats, Follow, Follower } from '../types/profile';

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
 * ユーザーをフォロー
 */
export const followUser = async (
  followerId: string,
  followerName: string,
  followerAvatar: string | undefined,
  followingId: string,
  followingName: string
): Promise<void> => {
  console.log(`[followUser] Starting: ${followerId} → ${followingId}`);

  try {
    // 固定IDでドキュメント作成（高速チェック用）
    const followRef = doc(db, `users/${followingId}/followers/${followerId}`);

    // 既にフォローしているかチェック（1回のgetDocで高速化）
    console.log(`[followUser] Checking if already following...`);
    const existingFollow = await getDoc(followRef);
    if (existingFollow.exists()) {
      console.log(`⚠️ Already following: ${followerId} → ${followingId}`);
      return;
    }

    const followData: Follow = {
      id: followerId,
      followerId,
      followerName,
      followerAvatar,
      followingId,
      followingName,
      createdAt: new Date().toISOString(),
    };

    console.log(`[followUser] Creating follow document...`);
    console.log(`[followUser] Follow data:`, followData);

    // ステップ1: フォロー関係を作成
    await setDoc(followRef, followData);
    console.log(`✅ [followUser] Follow document created`);

    // ステップ2: フォロワー側のfollowingCountを更新
    console.log(`[followUser] Updating follower's followingCount...`);
    const followerProfileRef = doc(db, `users/${followerId}/profile/data`);
    await updateDoc(followerProfileRef, {
      'stats.followingCount': increment(1),
    });
    console.log(`✅ [followUser] Follower's followingCount updated`);

    // ステップ3: フォロー対象のfollowerCountを更新
    console.log(`[followUser] Updating target's followerCount...`);
    const followingProfileRef = doc(db, `users/${followingId}/profile/data`);
    await updateDoc(followingProfileRef, {
      'stats.followerCount': increment(1),
    });
    console.log(`✅ [followUser] Target's followerCount updated`);

    console.log(`✅ [followUser] Complete: ${followerId} → ${followingId}`);
  } catch (error: any) {
    console.error(`❌ [followUser] Error:`, error);
    console.error(`❌ [followUser] Error code:`, error.code);
    console.error(`❌ [followUser] Error message:`, error.message);
    throw new Error(`フォローに失敗しました: ${error.message || error.code || '不明なエラー'}`);
  }
};

/**
 * ユーザーをアンフォロー
 */
export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  console.log(`[unfollowUser] Starting: ${followerId} X ${followingId}`);

  try {
    // 固定IDで直接削除（クエリ不要）
    const followRef = doc(db, `users/${followingId}/followers/${followerId}`);

    // ステップ1: フォロー関係を削除
    console.log(`[unfollowUser] Deleting follow document...`);
    await deleteDoc(followRef);
    console.log(`✅ [unfollowUser] Follow document deleted`);

    // ステップ2: フォロワー側のfollowingCountを更新
    console.log(`[unfollowUser] Updating follower's followingCount...`);
    const followerProfileRef = doc(db, `users/${followerId}/profile/data`);
    await updateDoc(followerProfileRef, {
      'stats.followingCount': increment(-1),
    });
    console.log(`✅ [unfollowUser] Follower's followingCount updated`);

    // ステップ3: フォロー対象のfollowerCountを更新
    console.log(`[unfollowUser] Updating target's followerCount...`);
    const followingProfileRef = doc(db, `users/${followingId}/profile/data`);
    await updateDoc(followingProfileRef, {
      'stats.followerCount': increment(-1),
    });
    console.log(`✅ [unfollowUser] Target's followerCount updated`);

    console.log(`✅ [unfollowUser] Complete: ${followerId} X ${followingId}`);
  } catch (error: any) {
    console.error(`❌ [unfollowUser] Error:`, error);
    console.error(`❌ [unfollowUser] Error code:`, error.code);
    console.error(`❌ [unfollowUser] Error message:`, error.message);
    throw new Error(`アンフォローに失敗しました: ${error.message || error.code || '不明なエラー'}`);
  }
};

/**
 * フォロー状態をチェック
 */
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    // 固定IDで直接チェック（1回のgetDocで超高速）
    const followRef = doc(db, `users/${followingId}/followers/${followerId}`);
    const followDoc = await getDoc(followRef);
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
      const followData = docSnap.data() as Follow;
      const followerProfile = await getUserProfile(followData.followerId);

      if (followerProfile) {
        // 現在のユーザーがこのフォロワーをフォローしているかチェック
        let isFollowingThisUser = false;
        if (currentUser && currentUser.uid !== userId) {
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
 * フォロー中のユーザー一覧を取得
 */
export const getFollowing = async (userId: string): Promise<Follower[]> => {
  try {
    const profilesRef = collection(db, 'users');
    const querySnapshot = await getDocs(profilesRef);

    const following: Follower[] = [];
    const currentUser = auth.currentUser;

    for (const docSnap of querySnapshot.docs) {
      const followerFollowersRef = collection(db, `users/${docSnap.id}/followers`);
      const followerSnapshot = await getDocs(followerFollowersRef);

      for (const followDoc of followerSnapshot.docs) {
        const followData = followDoc.data() as Follow;
        if (followData.followerId === userId) {
          const followingProfile = await getUserProfile(docSnap.id);

          if (followingProfile) {
            // 現在のユーザーがこのユーザーをフォローしているかチェック
            let isFollowingThisUser = false;
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
      }
    }

    return following.sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch (error) {
    console.error('Get following error:', error);
    return [];
  }
};
