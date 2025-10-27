/**
 * バッジストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Badge, BadgeCheckData } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { BADGE_DEFINITIONS } from '../utils/badgeDefinitions';

interface BadgeStore {
  badges: Badge[];
  newBadges: string[]; // 新しく獲得したバッジのID（通知用）
  loading: boolean;
  checkAndUnlockBadges: (data: BadgeCheckData) => string[];
  clearNewBadges: () => void;
  getBadge: (id: string) => Badge | undefined;
  isUnlocked: (id: string) => boolean;
  getUnlockedCount: () => number;
  getTotalCount: () => number;
}

export const useBadgeStore = create<BadgeStore>((set, get) => ({
  badges: getFromStorage(STORAGE_KEYS.BADGES, []),
  newBadges: [],
  loading: false,

  /**
   * バッジの獲得条件をチェックして、新しく獲得したバッジをアンロック
   */
  checkAndUnlockBadges: (data: BadgeCheckData) => {
    const currentBadges = get().badges;
    const unlockedIds = currentBadges.map((b) => b.id);
    const newlyUnlocked: string[] = [];

    // すべてのバッジ定義をチェック
    BADGE_DEFINITIONS.forEach((def) => {
      // すでにアンロック済みならスキップ
      if (unlockedIds.includes(def.id)) {
        return;
      }

      // 条件を満たしているかチェック
      if (def.checkCondition(data)) {
        const newBadge: Badge = {
          id: def.id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          category: def.category,
          requirement: def.requirement,
          unlockedAt: new Date().toISOString(),
        };

        currentBadges.push(newBadge);
        newlyUnlocked.push(def.id);
      }
    });

    // 新しいバッジがあれば更新
    if (newlyUnlocked.length > 0) {
      set({
        badges: currentBadges,
        newBadges: newlyUnlocked,
      });
      saveToStorage(STORAGE_KEYS.BADGES, currentBadges);
    }

    return newlyUnlocked;
  },

  /**
   * 新しいバッジ通知をクリア
   */
  clearNewBadges: () => {
    set({ newBadges: [] });
  },

  /**
   * バッジIDからバッジを取得
   */
  getBadge: (id: string) => {
    return get().badges.find((b) => b.id === id);
  },

  /**
   * バッジがアンロック済みかチェック
   */
  isUnlocked: (id: string) => {
    return get().badges.some((b) => b.id === id);
  },

  /**
   * アンロック済みバッジ数を取得
   */
  getUnlockedCount: () => {
    return get().badges.length;
  },

  /**
   * 総バッジ数を取得
   */
  getTotalCount: () => {
    return BADGE_DEFINITIONS.length;
  },
}));
