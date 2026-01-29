/**
 * 資産管理ストア
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Asset, AssetFormData } from '../types/asset';
import { generateUUID } from '../utils/uuid';

interface AssetStore {
    assets: Asset[];
    addAsset: (data: AssetFormData) => void;
    updateAsset: (id: string, data: Partial<AssetFormData>) => void;
    deleteAsset: (id: string) => void;
    // TODO: 市場価格自動更新機能などを将来的に追加可能
}

const STORAGE_KEY = 'life-pwa-assets';

export const useAssetStore = create<AssetStore>()(
    persist(
        (set) => ({
            assets: [],

            addAsset: (data) => {
                // amountが未入力で、quantity/currentPriceがある場合は計算する
                let amount = data.amount || 0;
                if (data.quantity && data.currentPrice) {
                    amount = data.quantity * data.currentPrice;
                }

                const newAsset: Asset = {
                    id: generateUUID(),
                    ...data,
                    amount,
                    updatedAt: new Date().toISOString(),
                };
                set((state) => ({ assets: [...state.assets, newAsset] }));
            },

            updateAsset: (id, data) => {
                set((state) => {
                    const currentAssets = state.assets;
                    const target = currentAssets.find(a => a.id === id);
                    if (!target) return { assets: currentAssets };

                    // amountの再計算
                    let amount = data.amount !== undefined ? data.amount : target.amount;
                    const quantity = data.quantity !== undefined ? data.quantity : target.quantity;
                    const currentPrice = data.currentPrice !== undefined ? data.currentPrice : target.currentPrice;

                    if (quantity && currentPrice) {
                        // 単価×数量優先
                        amount = quantity * currentPrice;
                    }

                    const updatedAsset = {
                        ...target,
                        ...data,
                        amount,
                        updatedAt: new Date().toISOString()
                    };

                    return {
                        assets: currentAssets.map((asset) => asset.id === id ? updatedAsset : asset),
                    };
                });
            },

            deleteAsset: (id) => {
                set((state) => ({
                    assets: state.assets.filter((asset) => asset.id !== id),
                }));
            },
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
        }
    )
);
