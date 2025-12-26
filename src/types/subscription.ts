export type SubscriptionStatus = 'free' | 'pro' | 'test_admin';

export interface UserSubscription {
    status: SubscriptionStatus;
    expiryDate?: string; // ISO String
    stripeCustomerId?: string;
    updatedAt?: string;
}

// UserProfileを拡張する場合のUtility型
export interface WithSubscription {
    subscription?: UserSubscription;
}
