import { doc, getDoc, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface RaidBoss {
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    imageUrl?: string;
    status: 'active' | 'defeated';
    level: number;
    createdAt: string;
    defeatedAt?: string;
}

export interface UserRaidData {
    totalDamage: number;
    lastAttackAt?: string;
    dailyDamage: Record<string, number>; // YYYY-MM-DD -> damage
}

const DAILY_DAMAGE_CAP = 3000;

/**
 * 現在のレイドボスを取得（なければ作成）
 */
export const getCurrentRaidBoss = async (): Promise<RaidBoss> => {
    const raidRef = doc(db, 'raids', 'current');
    const raidSnap = await getDoc(raidRef);

    if (raidSnap.exists()) {
        const data = raidSnap.data() as RaidBoss;
        if (data.status === 'active') {
            return data;
        }
        // 討伐済みで、まだ次が生成されていない場合やロジック拡張用
        return data;
    }

    // 初期ボスの作成
    const newBoss: RaidBoss = {
        id: 'boss_001',
        name: 'ジャンクフード・ゴーレム',
        hp: 50000,
        maxHp: 50000,
        imageUrl: '/assets/monsters/junk_golem_placeholder.png', // プレースホルダー
        status: 'active',
        level: 1,
        createdAt: new Date().toISOString(),
    };

    await setDoc(raidRef, newBoss);
    return newBoss;
};

/**
 * ユーザーの貢献データを取得
 */
export const getUserRaidData = async (userId: string): Promise<UserRaidData> => {
    const userRef = doc(db, 'raids', 'current', 'contributions', userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        return snap.data() as UserRaidData;
    }

    return {
        totalDamage: 0,
        dailyDamage: {},
    };
};

/**
 * ボスに攻撃（ダメージを与える）
 * @param damage 算出されたダメージ量
 * @param source ダメージ源（meal, exercise等）
 */
export const attackRaidBoss = async (userId: string, damage: number): Promise<{ success: boolean; dealt: number; message: string }> => {
    try {
        const dateKey = new Date().toISOString().split('T')[0];
        const raidRef = doc(db, 'raids', 'current');
        const userRef = doc(db, 'raids', 'current', 'contributions', userId);

        let dealtDamage = 0;

        await runTransaction(db, async (transaction) => {
            const raidSnap = await transaction.get(raidRef);
            if (!raidSnap.exists()) throw new Error('No active raid');

            const boss = raidSnap.data() as RaidBoss;
            if (boss.status !== 'active') throw new Error('Boss already defeated');

            const userSnap = await transaction.get(userRef);
            let userData = userSnap.exists() ? (userSnap.data() as UserRaidData) : { totalDamage: 0, dailyDamage: {} };

            // 日次キャップチェック
            const currentDaily = userData.dailyDamage[dateKey] || 0;
            const remainingDaily = Math.max(0, DAILY_DAMAGE_CAP - currentDaily);

            if (remainingDaily <= 0) {
                throw new Error('Daily damage limit reached');
            }

            // ダメージをキャップに合わせる
            dealtDamage = Math.min(damage, remainingDaily);

            // ボスHP更新
            const newHp = Math.max(0, boss.hp - dealtDamage);
            const isDefeated = newHp === 0;

            const updateData: any = {
                hp: newHp,
                status: isDefeated ? 'defeated' : 'active',
            };
            if (isDefeated) {
                updateData.defeatedAt = new Date().toISOString();
            }

            transaction.update(raidRef, updateData);

            // ユーザーデータ更新
            userData.dailyDamage[dateKey] = currentDaily + dealtDamage;
            userData.totalDamage += dealtDamage;
            userData.lastAttackAt = new Date().toISOString();

            transaction.set(userRef, userData, { merge: true });
        });

        return {
            success: true,
            dealt: dealtDamage,
            message: `ボスに ${dealtDamage} ダメージを与えました！`
        };

    } catch (error: any) {
        if (error.message === 'Daily damage limit reached') {
            return { success: false, dealt: 0, message: '本日の攻撃上限に達しています（ゆっくり休んでください！）' };
        }
        if (error.message === 'Boss already defeated') {
            return { success: false, dealt: 0, message: 'ボスは既に倒されています！' };
        }
        console.error('Raid attack error:', error);
        return { success: false, dealt: 0, message: '攻撃に失敗しました' };
    }
};
