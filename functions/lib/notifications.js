"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleInactivityReminder = exports.scheduleWeeklyWeightReminder = exports.sendCommentNotification = exports.sendLikeNotification = void 0;
const admin = require("firebase-admin");
const core_1 = require("firebase-functions/v2/core");
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
// onInitで初期化
let db;
let messaging;
(0, core_1.onInit)(async () => {
    // admin.initializeApp() is called in index.ts
    db = admin.firestore();
    messaging = admin.messaging();
});
function getDb() {
    return db;
}
function getMessaging() {
    return messaging;
}
// 通知を送信するヘルパー関数
const sendPushNotification = async (userId, title, body, data = {}) => {
    try {
        const tokensSnapshot = await getDb().collection('users').doc(userId).collection('fcmTokens').get();
        if (tokensSnapshot.empty) {
            console.log(`No FCM tokens found for user ${userId}`);
            return;
        }
        const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);
        const uniqueTokens = [...new Set(tokens)];
        const message = {
            tokens: uniqueTokens,
            notification: { title, body },
            data: Object.assign(Object.assign({}, data), { click_action: '/' }),
            webpush: { fcmOptions: { link: '/' } },
        };
        const response = await getMessaging().sendMulticast(message);
        console.log(`Notifications sent to user ${userId}: ${response.successCount} success, ${response.failureCount} failure`);
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(uniqueTokens[idx]);
                }
            });
            const batch = getDb().batch();
            for (const token of failedTokens) {
                const tokenRef = getDb().collection('users').doc(userId).collection('fcmTokens').doc(token);
                batch.delete(tokenRef);
            }
            await batch.commit();
            console.log(`Deleted ${failedTokens.length} invalid tokens`);
        }
    }
    catch (error) {
        console.error(`Error sending push notification to user ${userId}:`, error);
    }
};
exports.sendLikeNotification = (0, firestore_1.onDocumentCreated)('posts/{postId}/likes/{userId}', async (event) => {
    var _a;
    const { postId, userId } = event.params;
    try {
        const postDoc = await getDb().collection('posts').doc(postId).get();
        if (!postDoc.exists)
            return;
        const postData = postDoc.data();
        const postOwnerId = postData === null || postData === void 0 ? void 0 : postData.userId;
        if (postOwnerId === userId)
            return;
        const userDoc = await getDb().collection('users').doc(userId).get();
        const userData = userDoc.data();
        const userName = ((_a = userData === null || userData === void 0 ? void 0 : userData.profile) === null || _a === void 0 ? void 0 : _a.displayName) || '誰か';
        await sendPushNotification(postOwnerId, 'いいねされました！', `${userName}さんがあなたの投稿にいいねしました`, { type: 'like', postId });
    }
    catch (error) {
        console.error('Error in sendLikeNotification:', error);
    }
});
exports.sendCommentNotification = (0, firestore_1.onDocumentCreated)('posts/{postId}/comments/{commentId}', async (event) => {
    var _a, _b;
    const { postId } = event.params;
    const commentData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!commentData)
        return;
    const commentUserId = commentData.userId;
    try {
        const postDoc = await getDb().collection('posts').doc(postId).get();
        if (!postDoc.exists)
            return;
        const postData = postDoc.data();
        const postOwnerId = postData === null || postData === void 0 ? void 0 : postData.userId;
        if (postOwnerId === commentUserId)
            return;
        const userDoc = await getDb().collection('users').doc(commentUserId).get();
        const userData = userDoc.data();
        const userName = ((_b = userData === null || userData === void 0 ? void 0 : userData.profile) === null || _b === void 0 ? void 0 : _b.displayName) || '誰か';
        await sendPushNotification(postOwnerId, 'コメントが届きました！', `${userName}さんがあなたの投稿にコメントしました: "${commentData.content}"`, { type: 'comment', postId });
    }
    catch (error) {
        console.error('Error in sendCommentNotification:', error);
    }
});
exports.scheduleWeeklyWeightReminder = (0, scheduler_1.onSchedule)({
    schedule: '0 6 * * 1',
    timeZone: 'Asia/Tokyo',
    region: 'us-central1',
}, async (event) => {
    console.log('Running weekly weight reminder');
    try {
        const usersSnapshot = await getDb().collection('users').get();
        for (const doc of usersSnapshot.docs) {
            await sendPushNotification(doc.id, '週初めの体重チェック！', 'おはようございます！今週のスタートに体重を記録して、健康管理を始めましょう。', { type: 'weight_reminder' });
        }
    }
    catch (error) {
        console.error('Error in scheduleWeeklyWeightReminder:', error);
    }
});
exports.scheduleInactivityReminder = (0, scheduler_1.onSchedule)({
    schedule: '0 10 * * *',
    timeZone: 'Asia/Tokyo',
    region: 'us-central1',
}, async (event) => {
    console.log('Running inactivity reminder');
    try {
        const now = new Date();
        const usersSnapshot = await getDb().collection('users').get();
        for (const doc of usersSnapshot.docs) {
            const userId = doc.id;
            const userData = doc.data();
            const lastLoginAt = userData.lastLoginAt ? userData.lastLoginAt.toDate() : null;
            if (!lastLoginAt)
                continue;
            const diffTime = Math.abs(now.getTime() - lastLoginAt.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let title = '', body = '';
            if (diffDays === 1) {
                title = '昨日の記録は？';
                body = '昨日はアプリを開きませんでしたね。今日の記録をしましょう！';
            }
            else if (diffDays === 2) {
                title = '継続は力なり';
                body = '2日間記録がありません。継続は力なりですよ！';
            }
            else if (diffDays === 3) {
                title = 'お久しぶりです';
                body = '3日目です。そろそろ戻ってきませんか？';
            }
            else if (diffDays === 4) {
                title = '目標を思い出して';
                body = '4日空いています。目標を思い出して！';
            }
            else if (diffDays === 5) {
                title = '警告';
                body = '5日経過。このままだと習慣が途切れてしまいます！';
            }
            else if (diffDays === 6) {
                title = '最終警告';
                body = '6日目。本当に諦めるんですか？まだ間に合います！';
            }
            else if (diffDays === 7) {
                title = '激怒😡';
                body = '1週間放置されています！今すぐアプリを開いてください！😡';
            }
            if (title && body) {
                await sendPushNotification(userId, title, body, { type: 'inactivity_reminder', diffDays });
            }
        }
    }
    catch (error) {
        console.error('Error in scheduleInactivityReminder:', error);
    }
});
//# sourceMappingURL=notifications.js.map