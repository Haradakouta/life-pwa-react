"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCheckoutSession = void 0;
const functions = require("firebase-functions");
const stripe_1 = require("stripe");
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// Lazy initialization or safe check
let stripe;
if (STRIPE_SECRET_KEY) {
    stripe = new stripe_1.default(STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia',
    });
}
// Checkout Session作成関数
exports.createCheckoutSession = functions.https.onCall({ region: 'us-central1', secrets: ['STRIPE_SECRET_KEY'] }, async (request) => {
    // 認証チェック
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    const { priceId, successUrl, cancelUrl } = request.data;
    const userId = request.auth.uid;
    const userEmail = request.auth.token.email;
    if (!STRIPE_SECRET_KEY) {
        throw new functions.https.HttpsError('failed-precondition', 'Stripe API key not configured');
    }
    // Runtime check/init to be sure
    if (!stripe) {
        stripe = new stripe_1.default(STRIPE_SECRET_KEY, {
            apiVersion: '2024-12-18.acacia',
        });
    }
    try {
        // 1円テスト用または指定されたPrice ID
        let lineItems;
        if (priceId) {
            lineItems = [{ price: priceId, quantity: 1 }];
        }
        else {
            // テスト用: 1円のサブスクリプション
            lineItems = [{
                    price_data: {
                        currency: 'jpy',
                        product_data: {
                            name: 'Premium Subscription (Test)',
                            description: 'Unlock AI features',
                        },
                        unit_amount: 1, // 1 JPY
                        recurring: {
                            interval: 'month',
                        },
                    },
                    quantity: 1,
                }];
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: lineItems,
            success_url: successUrl || 'https://oshi-para.web.app/settings?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: cancelUrl || 'https://oshi-para.web.app/settings',
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: {
                userId: userId,
            },
            subscription_data: {
                metadata: {
                    userId: userId
                }
            }
        });
        return { sessionId: session.id, url: session.url };
    }
    catch (error) {
        console.error('Stripe error:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=stripe.js.map