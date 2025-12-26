import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../../hooks/useAuth';
import { MdStar } from 'react-icons/md';
import { functions as firebaseFunctions } from '../../config/firebase';

// Test Key fallback if env is missing (for easier dev, but ideally should be in env)
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...';
const stripePromise = loadStripe(STRIPE_KEY);

interface CreateCheckoutResponse {
    sessionId: string;
    url: string;
}

export const UpgradeButton: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const createSession = httpsCallable<any, CreateCheckoutResponse>(firebaseFunctions, 'createCheckoutSession');

            // 1円テスト (Backendでデフォルト動作するが、念のため)
            const { data } = await createSession({});

            if (data.url) {
                window.location.href = data.url;
            } else if (data.sessionId) {
                // Fallback (though url should always be present in newer API versions)
                const stripe = await stripePromise;
                if (stripe) {
                    // Try/Catch for safety if this method is strictly removed
                    try {
                        const { error } = await (stripe as any).redirectToCheckout({ sessionId: data.sessionId });
                        if (error) {
                            console.error('Stripe redirect error:', error);
                            alert('決済画面への遷移に失敗しました。');
                        }
                    } catch (e) {
                        console.error('Redirect method failed, likely deprecated:', e);
                        alert('決済画面への遷移に失敗しました。ブラウザを更新して再試行してください。');
                    }
                }
            }

        } catch (error) {
            console.error('Upgrade failed:', error);
            alert('アップグレードの開始に失敗しました。しばらく待ってから再試行してください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleUpgrade}
            disabled={loading}
            style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
                color: '#5a3e0b',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'wait' : 'pointer',
                width: '100%',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.2s',
            }}
        >
            <MdStar size={24} />
            {loading ? '準備中...' : 'プレミアムプランにアップグレード (¥1)'}
        </button>
    );
};
