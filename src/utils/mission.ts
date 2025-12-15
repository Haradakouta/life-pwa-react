/**
 * デイリーミッション関連のユーティリティ関数
 */
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserMissionData } from '../types/mission';
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
/**
 * ユーザーのミッションデータを取得
 */
export const getUserMissionData = async (userId: string): Promise<UserMissionData | null> => {
  try {
    // 日付ごとのドキュメントではなく、ユーザーごとの固定ドキュメントを使用するように変更
    // ただし、既存データとの互換性のため、まずは固定ドキュメントを確認し、なければ今日の日付のドキュメントを確認
    const missionDataRef = doc(db, `users/${userId}/missionData`, 'current');
    const missionDataSnap = await getDoc(missionDataRef);

    if (missionDataSnap.exists()) {
      const data = missionDataSnap.data();
      return {
        userId,
        date: data.date || getTodayDate(),
        missions: data.missions || [],
        totalPoints: data.totalPoints || 0,
        lastResetDate: data.lastResetDate || getTodayDate(),
        missionLevel: data.missionLevel || 1,
        currentExp: data.currentExp || 0,
      };
    }

    // 移行措置: 今日の日付のドキュメントがあればそれを移行
    const today = getTodayDate();
    const oldMissionDataRef = doc(db, `users/${userId}/missionData`, today);
    const oldMissionDataSnap = await getDoc(oldMissionDataRef);

    if (oldMissionDataSnap.exists()) {
      const data = oldMissionDataSnap.data();
      const migratedData: UserMissionData = {
        userId,
        date: today,
        missions: data.missions || [],
        totalPoints: data.totalPoints || 0,
        lastResetDate: data.lastResetDate || today,
        missionLevel: 1,
      };
      // 新しい場所に保存
      await setDoc(missionDataRef, migratedData);
      return migratedData;
    }

    // データが存在しない場合は初期化
    const initialData: UserMissionData = {
      userId,
      date: today,
      missions: dailyMissions.map(mission => ({
        missionId: mission.id,
        current: 0,
        target: mission.target,
        completed: false,
        date: today,
      })),
      totalPoints: 0,
      lastResetDate: today,
      missionLevel: 1,
    };
    await setDoc(missionDataRef, initialData);
    return initialData;
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
    const missionDataRef = doc(db, `users/${userId}/missionData`, 'current');
    const missionDataSnap = await getDoc(missionDataRef);

    if (!missionDataSnap.exists()) return;

    const missionData = missionDataSnap.data() as UserMissionData;

    // ミッションの進捗を更新
    const mission = dailyMissions.find(m => m.id === missionId);
    if (!mission) return;

    let missionProgress = missionData.missions.find(m => m.missionId === missionId);
    if (!missionProgress) {
      // ミッションが存在しない場合は追加（レベルに応じた目標値で）
      const level = missionData.missionLevel || 1;
      const target = Math.ceil(mission.target * (1 + (level - 1) * 0.1));

      // 新規作成時は、現在のカウントを基準値として設定
      // これにより、今日既に3回食べていても、新規ミッションはここから+1回でクリアとなる
      missionProgress = {
        missionId,
        current: 0,
        target: target,
        completed: false,
        date: getTodayDate(),
        baseCount: progress, // 現在の累積値をセット
      };
      missionData.missions.push(missionProgress);
    }

    // リセットが必要な場合は、現在のカウントを基準値に再設定
    if (missionProgress.needsBaseCountReset) {
      missionProgress.baseCount = progress;
      missionProgress.needsBaseCountReset = false;
      missionProgress.current = 0; // 進捗もリセット
    }

    // 既に完了済みの場合はスキップ
    if (missionProgress.completed) return;

    // 進捗計算: 現在の累積値 - 基準値
    // progressは「今日の合計回数」などが渡ってくる前提
    const currentProgress = progress - (missionProgress.baseCount || 0);

    // 進捗が負になる場合は0にする（念のため）
    missionProgress.current = Math.max(0, Math.min(currentProgress, missionProgress.target));
    missionProgress.completed = missionProgress.current >= missionProgress.target;

    if (missionProgress.completed && !missionProgress.completedAt) {
      missionProgress.completedAt = new Date().toISOString();

      // ポイントを付与（レベルに応じて増加）
      const level = missionData.missionLevel || 1;
      const points = Math.ceil(mission.points * (1 + (level - 1) * 0.2));

      // ポイントと経験値を付与
      await Promise.all([
        addPoints(userId, points),
        addExperience(userId, points)
      ]);

      console.log(`✅ ミッション「${mission.name}」をクリア！${points}ポイント & 経験値獲得`);
    }

    await setDoc(missionDataRef, missionData);

    // 全ミッションクリアチェック
    await checkAndLevelUpMissions(userId);

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

    if (userDataSnap.exists()) {
      const currentPoints = userDataSnap.data().totalPoints || 0;

      if (currentPoints < points) {
        return false; // ポイント不足
      }

      await updateDoc(userDataRef, {
        totalPoints: currentPoints - points,
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error('ポイント消費エラー:', error);
    return false;
  }
};

/**
 * ミッションの進捗を計算（ユーザーの行動に基づいて）
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
        return additionalData?.commentCount || profile.stats.commentCount || 0;
      case 'recipe':
        return profile.stats.recipeCount;
      case 'follow':
        return await getFollowerCount(userId);
      case 'repost': {
        if (!additionalData && (!profile.stats.repostCount)) return 0;
        return additionalData?.repostCount || profile.stats.repostCount || 0;
      }
      case 'login':
        return 1; // ログイン済みなので1
      case 'intake':
        return additionalData?.intakeCount || 0;
      default:
        return 0;
    }
  } catch (error) {
    console.error('ミッション進捗計算エラー:', error);
    return 0;
  }
};

/**
 * 全ミッションクリアチェックとレベルアップ
 */
export const checkAndLevelUpMissions = async (userId: string): Promise<void> => {
  try {
    const missionDataRef = doc(db, `users/${userId}/missionData`, 'current');
    const missionDataSnap = await getDoc(missionDataRef);

    if (!missionDataSnap.exists()) return;

    const missionData = missionDataSnap.data() as UserMissionData;

    // 現在のミッションリスト
    const currentMissions = missionData.missions;

    // すべてのデイリーミッションが現在のリストに含まれ、かつ完了しているかチェック
    const allDailyMissionsCompleted = dailyMissions.every(dm => {
      const progress = currentMissions.find(m => m.missionId === dm.id);
      return progress && progress.completed;
    });

    if (allDailyMissionsCompleted) {
      // レベルアップ！
      const newLevel = (missionData.missionLevel || 1) + 1;
      console.log(`🎉 Mission Level Up! ${missionData.missionLevel} -> ${newLevel}`);

      // レベルアップ報酬
      await checkLevelUpRewards(userId, newLevel);

      // ミッションのリセット
      // レベルアップしたため、新しい目標値でミッションを再生成する準備を行う
      const newMissions = currentMissions.map(m => {
        const dailyMission = dailyMissions.find(dm => dm.id === m.missionId);
        const baseTarget = dailyMission ? dailyMission.target : 1;

        // 新しい目標値: レベルに応じて増加
        const newTarget = Math.ceil(baseTarget * (1 + (newLevel - 1) * 0.1));

        return {
          ...m,
          current: 0,
          target: newTarget,
          completed: false,
          completedAt: undefined,
          // 次回更新時にbaseCountをリセットするフラグを立てる
          // updateMissionProgressが呼ばれたときに、その時点の累積値をbaseCountに設定する
          needsBaseCountReset: true
        };
      });

      await updateDoc(missionDataRef, {
        missionLevel: newLevel,
        missions: newMissions
      });

      // トースト通知などはUI側で行いたいが、ここではログのみ
    }

  } catch (error) {
    console.error('ミッションレベルアップチェックエラー:', error);
  }
};

/**
 * ミッション進捗をチェックして更新
 */
export const checkAndUpdateMissions = async (userId: string, additionalData?: any): Promise<void> => {
  try {
    // ログインミッションを更新
    await updateMissionProgress(userId, 'mission_login', 1);

    // その他のミッション進捗も必要に応じて更新（App.tsxから渡されたデータを使用）
    if (additionalData) {
      if (typeof additionalData.intakeCount === 'number') {
        const mission = dailyMissions.find(m => m.type === 'intake');
        if (mission) {
          await updateMissionProgress(userId, mission.id, additionalData.intakeCount);
        }
      }
      if (typeof additionalData.expenseCount === 'number') {
        const mission = dailyMissions.find(m => m.type === 'expense');
        if (mission) {
          await updateMissionProgress(userId, mission.id, additionalData.expenseCount);
        }
      }
    }
  } catch (error) {
    console.error('ミッション更新エラー:', error);
  }
};

/**
 * 経験値を付与してレベルアップチェック
 */
export const addExperience = async (userId: string, amount: number): Promise<void> => {
  try {
    const missionDataRef = doc(db, `users/${userId}/missionData`, 'current');
    const missionDataSnap = await getDoc(missionDataRef);

    if (!missionDataSnap.exists()) {
      // データがない場合は作成
      await getUserMissionData(userId);
      // 再帰的に呼び出し（無限ループ防止のため1回のみなどの制御が必要だが、ここでは簡易的に）
      const newDataSnap = await getDoc(missionDataRef);
      if (!newDataSnap.exists()) return;
    }

    const data = missionDataSnap.data() as UserMissionData;
    const currentLevel = data.missionLevel || 1;
    const currentExp = (data.currentExp || 0) + amount;

    // 次のレベルに必要な経験値: Base * Level^1.5 (調整可能)
    let nextLevelExp = Math.floor(100 * Math.pow(currentLevel, 1.5));

    let newLevel = currentLevel;
    let remainingExp = currentExp;

    // レベルアップループ (一度に複数レベルアップする可能性も考慮)
    while (remainingExp >= nextLevelExp && newLevel < 100) {
      remainingExp -= nextLevelExp;
      newLevel++;
      nextLevelExp = Math.floor(100 * Math.pow(newLevel, 1.5));

      // レベルアップ報酬のチェック
      await checkLevelUpRewards(userId, newLevel);
    }

    await updateDoc(missionDataRef, {
      missionLevel: newLevel,
      currentExp: remainingExp,
      totalPoints: (data.totalPoints || 0) + amount, // ポイントも経験値と同量付与（または別途計算）
    });

    // ポイントも増やす（経験値とは別に通貨として）
    await addPoints(userId, amount);

    if (newLevel > currentLevel) {
      console.log(`🎉 Level Up! ${currentLevel} -> ${newLevel}`);
      // ここでトースト通知などを出せると良い
    }

  } catch (error) {
    console.error('経験値付与エラー:', error);
  }
};

/**
 * レベルアップ報酬のチェック
 */
export const checkLevelUpRewards = async (userId: string, level: number): Promise<void> => {
  // 10レベルごとにフレーム報酬
  if (level % 10 === 0) {
    const frameId = `frame_level_${level}`;
    // unlockCosmetic は循環参照になる可能性があるため、ここで直接Firestoreを操作するか、
    // cosmetic.ts の関数を使う場合はインポートに注意。
    // ここでは直接Firestore操作で実装するか、cosmetic.tsからインポートする。
    // cosmetic.ts が mission.ts をインポートしていないならOK。
    // cosmetic.ts は mission.ts をインポートしていないようなので、インポートして使う。

    // しかし、循環参照を避けるため、ここでは動的インポートまたはロジックの複製を行うのが安全。
    // 簡易的にロジックを記述。
    try {
      const userCosmeticRef = doc(db, `users/${userId}/cosmetics`, 'data');
      const userCosmeticSnap = await getDoc(userCosmeticRef);

      if (userCosmeticSnap.exists()) {
        const data = userCosmeticSnap.data();
        const ownedCosmetics = data.ownedCosmetics || [];
        if (!ownedCosmetics.includes(frameId)) {
          await updateDoc(userCosmeticRef, {
            ownedCosmetics: [...ownedCosmetics, frameId]
          });
          console.log(`🎁 Reward Unlocked: ${frameId}`);
        }
      }
    } catch (e) {
      console.error('報酬付与エラー:', e);
    }
  }
};
