/**
 * 固定費（Fixed Cost）の型定義
 */
import type { ExpenseCategory } from './expense';

export interface FixedCost {
    id: string;
    title: string;
    amount: number;
    category: ExpenseCategory;
    paymentDate: number; // 毎月の支払日 (1-31)
    cycle: 'monthly' | 'yearly';
    autoCreate: boolean; // 自動計上するかどうか
    lastCreatedMonth?: string; // 最後に自動計上された年月 (YYYY-MM)
    createdAt: string;
    updatedAt?: string;
}

export interface FixedCostFormData {
    title: string;
    amount: number;
    category: ExpenseCategory;
    paymentDate: number;
    cycle: 'monthly' | 'yearly';
    autoCreate: boolean;
}
