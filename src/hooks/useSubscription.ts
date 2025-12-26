import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './useAuth';
import type { UserSubscription, SubscriptionStatus } from '../types/subscription';

export const useSubscription = () => {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        // ユーザープロファイル直下の subscription フィールド、またはサブコレクションなどを監視
        // ここではルートの user ドキュメントに subscriptionStatus があるか、
        // または `subscriptions` サブコレクションを見るか。
        // Stripe Extension標準だと `customers/{uid}/subscriptions` だが、
        // 今回はシンプルに `users/{uid}` のカスタムフィールドを想定（自前実装の場合）
        // もしくは、Stripe Extensionを使うなら `users/{uid}/subscriptions` をリッスンすべき。

        // 今回の実装計画では "Manual or Stripe Webhook updates Firestore" としている。
        // シンプル化のため `users/{uid}/profile/subscription` などを想定するか、
        // `users/{uid}` 自体のフィールドを見る実装にする。

        // 既存のUser型にはないので、今回は `users/{uid}` ドキュメントをリッスンし、
        // subscriptionStatus フィールドがあればそれを使う形にする。

        const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // データのマッピング
                const status = (data.subscriptionStatus as SubscriptionStatus) || 'free';
                setSubscription({
                    status: status,
                    // expiryDate etc...
                });
            } else {
                setSubscription({ status: 'free' });
            }
            setLoading(false);
        }, (error) => {
            console.error("Subscription fetch error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // const isPro = subscription?.status === 'pro' || subscription?.status === 'test_admin';
    const isPro = true; // TEMPORARY: ユーザーの要望により一時的に全機能を解放 (2025-12-10)

    return {
        subscription,
        isPro,
        loading
    };
};
