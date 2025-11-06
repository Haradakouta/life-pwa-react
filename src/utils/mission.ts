/**
 * デイリーミッション関連のユーティリティ関数
 */
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { MissionProgress, UserMissionData } from '../types/mission';
import { dailyMissions } from '../data/missions';
import { getUserProfile, getFollowerCount } from './profile';

/**
 * 今日の日付を取得（YYYY-MM-DD形式）
 */
export const getTodayDate = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/**
 * ユーザーのミッションデータを取得
 */
export const getUserMissionData = async (userId: string): Promise<UserMissionData | null> => {
  try {
    const today = getTodayDate();
    const missionDataRef = doc(db, `users/${userId}/missionData`, today);
    const missionDataSnap = await getDoc(missionDataRef);
    
    if (missionDataSnap.exists()) {
      const data = missionDataSnap.data();
      return {
        userId,
        date: today,
        missions: data.missions || [],
        totalPoints: data.totalPoints || 0,
        lastResetDate: data.lastResetDate || today,
      };
    }
    
    // データが存在しない場合は初期化
    return {
      userId,
      date: today,
      missions: [],
      totalPoints: 0,
      lastResetDate: today,
    };
  } catch (error) {
    console.error('ミッションデータ取得エラー:', error);
    return null;
  }
};

/**
 * ユーザーの累計ポイントを取得
 */
export const getUserTotalPoints = async (userId: string): Promise<number> => {
  try {
    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const userDataSnap = await getDoc(userDataRef);
    
    if (userDataSnap.exists()) {
      return userDataSnap.data().totalPoints || 0;
    }
    
    return 0;
  } catch (error) {
    console.error('ポイント取得エラー:', error);
    return 0;
  }
};

/**
 * ミッションの進捗を更新
 */
export const updateMissionProgress = async (
  userId: string,
  missionId: string,
  progress: number
): Promise<void> => {
  try {
    const today = getTodayDate();
    const missionDataRef = doc(db, `users/${userId}/missionData`, today);
    const missionDataSnap = await getDoc(missionDataRef);
    
    let missionData: UserMissionData;
    if (missionDataSnap.exists()) {
      missionData = missionDataSnap.data() as UserMissionData;
    } else {
      missionData = {
        userId,
        date: today,
        missions: [],
        totalPoints: 0,
        lastResetDate: today,
      };
    }
    
    // ミッションの進捗を更新
    const mission = dailyMissions.find(m => m.id === missionId);
    if (!mission) return;
    
    let missionProgress = missionData.missions.find(m => m.missionId === missionId);
    if (!missionProgress) {
      missionProgress = {
        missionId,
        current: 0,
        target: mission.target,
        completed: false,
        date: today,
      };
      missionData.missions.push(missionProgress);
    }
    
    // 既に完了済みの場合はスキップ
    if (missionProgress.completed) return;
    
    missionProgress.current = Math.min(progress, mission.target);
    missionProgress.target = mission.target; // targetを更新
    missionProgress.completed = missionProgress.current >= mission.target;
    
    if (missionProgress.completed && !missionProgress.completedAt) {
      missionProgress.completedAt = new Date().toISOString();
      
      // ポイントを付与
      await addPoints(userId, mission.points);
      
      console.log(`✅ ミッション「${mission.name}」をクリア！${mission.points}ポイント獲得`);
    }
    
    await setDoc(missionDataRef, missionData);
  } catch (error) {
    console.error('ミッション進捗更新エラー:', error);
  }
};

/**
 * ポイントを追加
 */
export const addPoints = async (userId: string, points: number): Promise<void> => {
  try {
    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const userDataSnap = await getDoc(userDataRef);
    
    if (userDataSnap.exists()) {
      const currentPoints = userDataSnap.data().totalPoints || 0;
      await updateDoc(userDataRef, {
        totalPoints: currentPoints + points,
      });
    } else {
      await setDoc(userDataRef, {
        totalPoints: points,
        ownedCosmetics: [],
      });
    }
  } catch (error) {
    console.error('ポイント追加エラー:', error);
    throw error;
  }
};

/**
 * ポイントを消費
 */
export const spendPoints = async (userId: string, points: number): Promise<boolean> => {
  try {
    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const userDataSnap = await getDoc(userDataRef);
    
    const currentPoints = userDataSnap.exists() ? (userDataSnap.data().totalPoints || 0) : 0;
    
    if (currentPoints < points) {
      return false; // ポイント不足
    }
    
    await updateDoc(userDataRef, {
      totalPoints: currentPoints - points,
    });
    
    return true;
  } catch (error) {
    console.error('ポイント消費エラー:', error);
    return false;
  }
};

/**
 * ミッションの進捗を計算（ユーザーの行動に基づいて）
 * 注意: intakeとexpenseは外部から値を渡す必要がある
 */
export const calculateMissionProgress = async (
  userId: string,
  missionType: string,
  additionalData?: {
    intakeCount?: number;
    expenseCount?: number;
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
  }
): Promise<number> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return 0;
    
    switch (missionType) {
      case 'post':
        return profile.stats.postCount;
      case 'like':
        return additionalData?.likeCount || 0;
      case 'comment':
        return additionalData?.commentCount || (profile.stats as any).commentCount || 0;
      case 'recipe':
        return profile.stats.recipeCount;
      case 'follow':
        return await getFollowerCount(userId);
      case 'repost':
        return additionalData?.repostCount || (profile.stats as any).repostCount || 0;
      case 'login':
        return 1; // ログイン済みなので1
      case 'intake':
        return additionalData?.intakeCount || 0;
      case 'expense':
        return additionalData?.expenseCount || 0;
      default:
        return 0;
    }
  } catch (error) {
    console.error('ミッション進捗計算エラー:', error);
    return 0;
  }
};

/**
 * 今日のミッションをリセット（日付が変わったとき）
 */
export const resetDailyMissions = async (userId: string): Promise<void> => {
  try {
    const today = getTodayDate();
    const missionDataRef = doc(db, `users/${userId}/missionData`, today);
    const missionDataSnap = await getDoc(missionDataRef);
    
    // 今日の日付のデータが既に存在する場合はスキップ
    if (missionDataSnap.exists()) {
      const data = missionDataSnap.data();
      if (data.lastResetDate === today) {
        return; // 既にリセット済み
      }
    }
    
    // 新しいミッション進捗を作成
    const missions: MissionProgress[] = dailyMissions.map(mission => ({
      missionId: mission.id,
      current: 0,
      target: mission.target,
      completed: false,
      date: today,
    }));
    
    await setDoc(missionDataRef, {
      userId,
      date: today,
      missions,
      totalPoints: 0,
      lastResetDate: today,
    });
    
    console.log('✅ デイリーミッションをリセットしました');
  } catch (error) {
    console.error('ミッションリセットエラー:', error);
  }
};

/**
 * ミッション進捗をチェックして更新
 */
export const checkAndUpdateMissions = async (
  userId: string,
  additionalData?: {
    intakeCount?: number;
    expenseCount?: number;
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
  }
): Promise<void> => {
  try {
    // 今日のミッションをリセット（必要に応じて）
    await resetDailyMissions(userId);
    
    const missionData = await getUserMissionData(userId);
    if (!missionData) return;
    
    // 各ミッションの進捗を更新
    for (const missionProgress of missionData.missions) {
      if (missionProgress.completed) continue; // 既に完了済み
      
      const mission = dailyMissions.find(m => m.id === missionProgress.missionId);
      if (!mission) continue;
      
      const currentProgress = await calculateMissionProgress(userId, mission.type, additionalData);
      await updateMissionProgress(userId, missionProgress.missionId, currentProgress);
    }
  } catch (error) {
    console.error('ミッションチェックエラー:', error);
  }
};

