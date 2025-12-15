/**
 * 装飾要素関連のユーティリティ関数
 */
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserCosmetic, Cosmetic } from '../types/cosmetic';
import { cosmetics } from '../data/cosmetics';
import { spendPoints } from './mission';

/**
 * ユーザーの装飾データを取得
 */
export const getUserCosmetics = async (userId: string): Promise<UserCosmetic | null> => {
  try {
    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const userDataSnap = await getDoc(userDataRef);

    if (userDataSnap.exists()) {
      const data = userDataSnap.data();
      return {
        userId,
        ownedCosmetics: data.ownedCosmetics || [],
        equippedFrame: data.equippedFrame,
        equippedNameColor: data.equippedNameColor,
        equippedSkin: data.equippedSkin,
        totalPoints: data.totalPoints || 0,
      };
    }

    // データが存在しない場合は初期化
    return {
      userId,
      ownedCosmetics: ['frame_default', 'namecolor_default', 'skin_default'],
      equippedFrame: 'frame_default',
      equippedNameColor: 'namecolor_default',
      equippedSkin: 'skin_default',
      totalPoints: 0,
    };
  } catch (error) {
    console.error('装飾データ取得エラー:', error);
    return null;
  }
};

/**
 * 装飾要素を購入
 */
export const purchaseCosmetic = async (userId: string, cosmeticId: string): Promise<boolean> => {
  try {
    const cosmetic = cosmetics.find(c => c.id === cosmeticId);
    if (!cosmetic) return false;

    // 既に所有しているかチェック
    const userCosmetics = await getUserCosmetics(userId);
    if (!userCosmetics) return false;

    if (userCosmetics.ownedCosmetics.includes(cosmeticId)) {
      return false; // 既に所有している
    }

    // ポイントを消費
    const success = await spendPoints(userId, cosmetic.price);
    if (!success) {
      return false; // ポイント不足
    }

    // 装飾を追加
    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const userDataSnap = await getDoc(userDataRef);

    if (userDataSnap.exists()) {
      const currentOwned = userDataSnap.data().ownedCosmetics || [];
      await updateDoc(userDataRef, {
        ownedCosmetics: [...currentOwned, cosmeticId],
      });
    } else {
      await setDoc(userDataRef, {
        ownedCosmetics: [cosmeticId],
        totalPoints: 0,
      });
    }

    console.log(`✅ 装飾「${cosmetic.name}」を購入しました`);
    return true;
  } catch (error) {
    console.error('装飾購入エラー:', error);
    return false;
  }
};

/**
 * 装飾要素を装備
 */
export const equipCosmetic = async (
  userId: string,
  cosmeticId: string,
  type: 'frame' | 'nameColor' | 'skin'
): Promise<void> => {
  try {
    const userCosmetics = await getUserCosmetics(userId);
    if (!userCosmetics) return;

    // 所有しているかチェック
    if (!userCosmetics.ownedCosmetics.includes(cosmeticId)) {
      throw new Error('この装飾を所有していません');
    }

    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const updateData: Record<string, string> = {};

    if (type === 'frame') {
      updateData.equippedFrame = cosmeticId;
    } else if (type === 'nameColor') {
      updateData.equippedNameColor = cosmeticId;
    } else if (type === 'skin') {
      updateData.equippedSkin = cosmeticId;
    }

    await updateDoc(userDataRef, updateData);
    console.log(`✅ 装飾「${cosmeticId}」を装備しました`);
  } catch (error) {
    console.error('装飾装備エラー:', error);
    throw error;
  }
};

/**
 * 装飾IDから装飾を取得
 */
export const getCosmeticById = (id: string): Cosmetic | undefined => {
  return cosmetics.find(c => c.id === id);
};

/**
 * フレーム系のCosmetic ID一覧を取得
 */
export const getAllFrameIds = (): string[] => {
  return cosmetics.filter(c => c.type === 'frame').map(c => c.id);
};

/**
 * ユーザーに全フレームを解放（テスト用）
 */
export const unlockAllFramesForUser = async (userId: string): Promise<void> => {
  const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
  const snap = await getDoc(userDataRef);

  const frameIds = getAllFrameIds();

  if (snap.exists()) {
    // 既存データに追記
    await updateDoc(userDataRef, {
      ownedCosmetics: arrayUnion(...frameIds),
    });
  } else {
    // 新規作成
    await setDoc(userDataRef, {
      ownedCosmetics: frameIds,
      totalPoints: 0,
    });
  }
};

/**
 * ユーザーの名前色を取得
 */
export const getUserNameColor = async (userId: string): Promise<string | undefined> => {
  try {
    const userCosmetics = await getUserCosmetics(userId);
    if (!userCosmetics || !userCosmetics.equippedNameColor) return undefined;

    const cosmetic = cosmetics.find(c => c.id === userCosmetics.equippedNameColor);
    if (!cosmetic || cosmetic.type !== 'nameColor') return undefined;

    return cosmetic.data.gradient || cosmetic.data.color;
  } catch (error) {
    console.error('名前色取得エラー:', error);
    return undefined;
  }
};

/**
 * 装飾をアンロック（報酬などで付与）
 */
export const unlockCosmetic = async (userId: string, cosmeticId: string): Promise<void> => {
  try {
    const userDataRef = doc(db, `users/${userId}/cosmetics`, 'data');
    const userDataSnap = await getDoc(userDataRef);

    if (userDataSnap.exists()) {
      await updateDoc(userDataRef, {
        ownedCosmetics: arrayUnion(cosmeticId)
      });
    } else {
      await setDoc(userDataRef, {
        ownedCosmetics: [cosmeticId],
        totalPoints: 0,
      });
    }
    console.log(`🎁 Unlocked cosmetic: ${cosmeticId}`);
  } catch (error) {
    console.error('装飾アンロックエラー:', error);
  }
};


