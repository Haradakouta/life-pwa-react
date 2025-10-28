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

    await setDoc(doc(db, 'users', uid, 'profile', 'data'), userProfile);
    console.log('✅ User profile created:', uid);
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw new Error('プロフィール作成に失敗しました');
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
  try {
    // follows コレクションに追加
    const followRef = doc(collection(db, `users/${followingId}/followers`));
    const followData: Follow = {
      id: followRef.id,
      followerId,
      followerName,
      followerAvatar,
      followingId,
      followingName,
      createdAt: new Date().toISOString(),
    };

    await setDoc(followRef, followData);

    // フォローしている側の followingCount を更新
    const followerProfileRef = doc(db, `users/${followerId}/profile/data`);
    const followerProfile = await getDoc(followerProfileRef);
    if (followerProfile.exists()) {
      await updateDoc(followerProfileRef, {
        'stats.followingCount': increment(1),
      });
    }

    // フォローされている側の followerCount を更新
    const followingProfileRef = doc(db, `users/${followingId}/profile/data`);
    const followingProfile = await getDoc(followingProfileRef);
    if (followingProfile.exists()) {
      await updateDoc(followingProfileRef, {
        'stats.followerCount': increment(1),
      });
    }

    console.log(`✅ ${followerId} followed ${followingId}`);
  } catch (error) {
    console.error('Follow error:', error);
    throw error;
  }
};

/**
 * ユーザーをアンフォロー
 */
export const unfollowUser = async (followerId: string, followingId: string): Promise<void> => {
  try {
    // followers コレクションから削除
    const followersRef = collection(db, `users/${followingId}/followers`);
    const querySnapshot = await getDocs(followersRef);

    for (const docSnap of querySnapshot.docs) {
      const followData = docSnap.data() as Follow;
      if (followData.followerId === followerId) {
        await deleteDoc(docSnap.ref);
      }
    }

    // フォローしている側の followingCount を更新
    const followerProfileRef = doc(db, `users/${followerId}/profile/data`);
    const followerProfile = await getDoc(followerProfileRef);
    if (followerProfile.exists()) {
      await updateDoc(followerProfileRef, {
        'stats.followingCount': increment(-1),
      });
    }

    // フォローされている側の followerCount を更新
    const followingProfileRef = doc(db, `users/${followingId}/profile/data`);
    const followingProfile = await getDoc(followingProfileRef);
    if (followingProfile.exists()) {
      await updateDoc(followingProfileRef, {
        'stats.followerCount': increment(-1),
      });
    }

    console.log(`✅ ${followerId} unfollowed ${followingId}`);
  } catch (error) {
    console.error('Unfollow error:', error);
    throw error;
  }
};

/**
 * フォロー状態をチェック
 */
export const isFollowing = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    const followersRef = collection(db, `users/${followingId}/followers`);
    const querySnapshot = await getDocs(followersRef);

    for (const docSnap of querySnapshot.docs) {
      const followData = docSnap.data() as Follow;
      if (followData.followerId === followerId) {
        return true;
      }
    }

    return false;
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
