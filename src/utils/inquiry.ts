import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Inquiry } from '../types/inquiry';

const COLLECTION_NAME = 'inquiries';

/**
 * お問い合わせを送信する
 */
export const submitInquiry = async (
    userId: string,
    userEmail: string,
    subject: string,
    body: string
): Promise<string> => {
    const now = new Date().toISOString();
    const inquiryData: Omit<Inquiry, 'id'> = {
        userId,
        userEmail,
        subject,
        body,
        createdAt: now,
        status: 'open',
        isRead: true, // 返信がない状態なので既読とする
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), inquiryData);
    return docRef.id;
};

/**
 * ユーザーのお問い合わせ一覧を取得する
 */
export const getUserInquiries = async (userId: string): Promise<Inquiry[]> => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId)
        // orderBy('createdAt', 'desc') // インデックスエラーを避けるためクライアントサイドでソート
    );

    const snapshot = await getDocs(q);
    const inquiries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Inquiry));

    return inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * 未読（返信あり）のお問い合わせの数を取得する
 */
export const getUnreadInquiryCount = async (userId: string): Promise<number> => {
    const q = query(
        collection(db, COLLECTION_NAME),
        where('userId', '==', userId),
        where('isRead', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
};

/**
 * お問い合わせを既読にする
 */
export const markInquiryAsRead = async (inquiryId: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, inquiryId);
    await updateDoc(docRef, { isRead: true });
};

/**
 * 全てのお問い合わせを取得する（管理者用）
 */
export const getAllInquiries = async (): Promise<Inquiry[]> => {
    const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Inquiry));
};

/**
 * お問い合わせに返信する（管理者用）
 */
export const replyToInquiry = async (inquiryId: string, reply: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, inquiryId);
    const now = new Date().toISOString();

    await updateDoc(docRef, {
        reply,
        replyAt: now,
        status: 'replied',
        isRead: false // ユーザーにとっては未読になる
    });
};
