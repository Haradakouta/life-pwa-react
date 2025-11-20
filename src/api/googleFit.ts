import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const GOOGLE_FIT_SCOPES = [
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.body.write',
];

/**
 * Google Fit APIとの連携を初期化（OAuth認証）
 */
export const initializeGoogleFit = async (): Promise<string | null> => {
    try {
        const provider = new GoogleAuthProvider();
        GOOGLE_FIT_SCOPES.forEach(scope => provider.addScope(scope));

        // 既存のユーザーがいる場合は、そのユーザーで再認証（スコープ追加）
        if (auth.currentUser) {
            // Note: reauthenticateWithPopup might be better if we want to keep the same user
            // But linkWithPopup is for linking accounts.
            // For adding scopes, we often just sign in again or use specific flow.
            // Here we use signInWithPopup which handles both login and scope addition.
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            return credential?.accessToken || null;
        } else {
            // ユーザーがいない場合は新規ログイン
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            return credential?.accessToken || null;
        }
    } catch (error) {
        console.error('Google Fit認証エラー:', error);
        throw error;
    }
};

/**
 * Google Fitから体重データを取得
 */
export const fetchWeightData = async (accessToken: string, startTime: number, endTime: number) => {
    const url = 'https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            aggregateBy: [{
                dataTypeName: 'com.google.weight',
                dataSourceId: 'derived:com.google.weight:com.google.android.gms:merge_weight'
            }],
            bucketByTime: { durationMillis: 86400000 }, // 1日単位
            startTimeMillis: startTime,
            endTimeMillis: endTime,
        }),
    });

    if (!response.ok) {
        throw new Error(`Google Fit API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return parseWeightData(data);
};

/**
 * レスポンスデータを解析して使いやすい形式に変換
 */
const parseWeightData = (data: any) => {
    const weightPoints: { date: string; weight: number }[] = [];

    if (data.bucket) {
        data.bucket.forEach((bucket: any) => {
            if (bucket.dataset && bucket.dataset[0].point && bucket.dataset[0].point.length > 0) {
                const point = bucket.dataset[0].point[0];
                const weight = point.value[0].fpVal;
                const date = new Date(parseInt(bucket.startTimeMillis)).toISOString();
                weightPoints.push({ date, weight });
            }
        });
    }

    return weightPoints;
};
