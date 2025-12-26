import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { UserCollection, UserCollectionItem } from '../types/collection';
import { collectionItems } from '../data/collection';
import { spendPoints } from './mission';

const GACHA_COST = 100;

/**
 * ユーザーのコレクションを取得
 */
export const getUserCollection = async (userId: string): Promise<UserCollection | null> => {
    try {
        const collectionRef = doc(db, `users/${userId}/collection`, 'data');
        const collectionSnap = await getDoc(collectionRef);

        if (collectionSnap.exists()) {
            return collectionSnap.data() as UserCollection;
        }

        // 初期化
        const initialCollection: UserCollection = {
            userId,
            items: [],
        };
        await setDoc(collectionRef, initialCollection);
        return initialCollection;
    } catch (error) {
        console.error('コレクション取得エラー:', error);
        return null;
    }
};

/**
 * ガチャを回す
 */
export const spinGacha = async (userId: string): Promise<{ success: boolean; item?: UserCollectionItem; error?: string }> => {
    try {
        // ポイント消費
        const success = await spendPoints(userId, GACHA_COST);
        if (!success) {
            return { success: false, error: 'ポイントが不足しています' };
        }

        // アイテム抽選
        const rand = Math.random() * 100;
        let rarity: 'common' | 'rare' | 'super_rare';

        if (rand < 60) rarity = 'common';
        else if (rand < 90) rarity = 'rare';
        else rarity = 'super_rare';

        const candidates = collectionItems.filter(item => item.rarity === rarity);
        const selectedItem = candidates[Math.floor(Math.random() * candidates.length)];

        // コレクション更新
        const collectionRef = doc(db, `users/${userId}/collection`, 'data');
        const collectionSnap = await getDoc(collectionRef);

        let collection: UserCollection;
        if (collectionSnap.exists()) {
            collection = collectionSnap.data() as UserCollection;
        } else {
            collection = { userId, items: [] };
        }

        const existingItemIndex = collection.items.findIndex(i => i.itemId === selectedItem.id);
        let newItem: UserCollectionItem;

        if (existingItemIndex >= 0) {
            // 既に持っている場合はカウントアップ
            collection.items[existingItemIndex].count += 1;
            newItem = collection.items[existingItemIndex];
        } else {
            // 新規獲得
            newItem = {
                itemId: selectedItem.id,
                count: 1,
                obtainedAt: new Date().toISOString(),
            };
            collection.items.push(newItem);
        }

        await setDoc(collectionRef, collection);

        return { success: true, item: newItem };
    } catch (error) {
        console.error('ガチャ実行エラー:', error);
        return { success: false, error: 'エラーが発生しました' };
    }
};

/**
 * パートナーを設定
 */
export const setPartner = async (userId: string, itemId: string): Promise<void> => {
    try {
        const collectionRef = doc(db, `users/${userId}/collection`, 'data');
        await updateDoc(collectionRef, {
            partnerItemId: itemId,
        });
    } catch (error) {
        console.error('パートナー設定エラー:', error);
        throw error;
    }
};

/**
 * アイコンを設定（プロフィール用）
 * ※実際にはUserProfileのiconUrlなどを更新する処理も必要かもしれないが、
 * ここではCollectionデータのiconItemIdを更新する。
 * UserProfile側でこのIDを参照して画像を表示するようにするか、
 * ここでUserProfileも更新するか。
 * 今回はUserProfileも更新する方針でいく。
 */
export const setProfileIcon = async (userId: string, itemId: string): Promise<void> => {
    try {
        const collectionRef = doc(db, `users/${userId}/collection`, 'data');
        await updateDoc(collectionRef, {
            iconItemId: itemId,
        });

        // プロフィールのアイコンURLも更新（互換性のため）
        // ただし、画像URLがまだプレースホルダー（絵文字）なので、
        // 実際の画像生成までは保留するか、絵文字をそのまま使うか。
        // ここではコレクション側の設定のみ行い、UI側で優先して表示するようにする。
    } catch (error) {
        console.error('アイコン設定エラー:', error);
        throw error;
    }
};
