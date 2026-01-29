/**
 * 固定費ストア
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { FixedCost, FixedCostFormData } from '../types/fixedCost';
import { generateUUID } from '../utils/uuid';
import { useExpenseStore } from './useExpenseStore';

interface FixedCostStore {
    fixedCosts: FixedCost[];
    addFixedCost: (data: FixedCostFormData) => void;
    updateFixedCost: (id: string, data: Partial<FixedCostFormData>) => void;
    deleteFixedCost: (id: string) => void;
    checkAndCreateExpenses: () => void; // 自動計上チェック
}

const STORAGE_KEY = 'life-pwa-fixed-costs';

export const useFixedCostStore = create<FixedCostStore>()(
    persist(
        (set, get) => ({
            fixedCosts: [],

            addFixedCost: (data) => {
                const newCost: FixedCost = {
                    id: generateUUID(),
                    ...data,
                    createdAt: new Date().toISOString(),
                    // 新規作成時は、今月分はまだ計上されていないものとして扱う（自動計上で判断）
                    // ただし、もし今日が支払日を過ぎているなら、来月からにするか？
                    // ここでは一旦nullにしておき、checkAndCreateExpensesに任せる
                };
                set((state) => ({ fixedCosts: [...state.fixedCosts, newCost] }));
            },

            updateFixedCost: (id, data) => {
                set((state) => ({
                    fixedCosts: state.fixedCosts.map((cost) =>
                        cost.id === id ? { ...cost, ...data, updatedAt: new Date().toISOString() } : cost
                    ),
                }));
            },

            deleteFixedCost: (id) => {
                set((state) => ({
                    fixedCosts: state.fixedCosts.filter((cost) => cost.id !== id),
                }));
            },

            checkAndCreateExpenses: () => {
                const { fixedCosts } = get();
                const { addExpense } = useExpenseStore.getState();
                const today = new Date();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth() + 1;
                const currentDay = today.getDate();
                const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

                const updatedFixedCosts = fixedCosts.map((cost) => {
                    // 自動計上OFFならスキップ
                    if (!cost.autoCreate) return cost;

                    // 既に今月分計上済みならスキップ (monthlyの場合)
                    // yearlyの場合は...実装簡略化のため一旦monthlyのみ対応推奨だが、型定義にあるので考慮
                    if (cost.lastCreatedMonth === currentMonthStr) return cost;

                    // 支払日チェック
                    // 今日が支払日、または支払日を過ぎていて、かつ今月分がまだなら計上
                    if (currentDay >= cost.paymentDate) {
                        // 支出を作成
                        addExpense({
                            amount: cost.amount,
                            category: cost.category,
                            type: 'expense',
                            memo: `[固定費] ${cost.title}`,
                            date: new Date().toISOString(), // 今日計上
                        });

                        return { ...cost, lastCreatedMonth: currentMonthStr };
                    }

                    return cost;
                });

                // 変更差分があれば更新
                if (JSON.stringify(updatedFixedCosts) !== JSON.stringify(fixedCosts)) {
                    set({ fixedCosts: updatedFixedCosts });
                }
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
        }
    )
);
