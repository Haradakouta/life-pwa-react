/**
 * 設定ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Settings } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { settingsOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  initialized: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setFirstTime: (value: boolean) => void;
  syncWithFirestore: () => Promise<void>;
}

const defaultSettings: Settings = {
  monthlyBudget: 30000,
  darkMode: false,
  firstTime: true,
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: { ...defaultSettings, ...getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings) },
  loading: false,
  initialized: false,

  updateSettings: async (updates) => {
    const user = auth.currentUser;

    // ローカル更新
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);

      // ダークモードの適用
      if ('darkMode' in updates) {
        document.body.classList.toggle('dark-mode', updates.darkMode);
      }

      return { settings: newSettings };
    });

    // Firestoreに保存
    if (user) {
      try {
        const currentSettings = get().settings;
        await settingsOperations.set(user.uid, currentSettings);
        
        // 体重目標の進捗を自動更新（体重が変更された場合）
        if ('weight' in updates) {
          try {
            const { useGoalStore } = await import('./useGoalStore');
            const goalStore = useGoalStore.getState();
            const activeGoals = goalStore.getActiveGoals();
            const weightGoals = activeGoals.filter((g) => g.type === 'weight');
            for (const goal of weightGoals) {
              await goalStore.updateGoalProgress(goal.id);
            }
          } catch (error) {
            console.debug('目標進捗更新エラー:', error);
          }
        }
      } catch (error) {
        console.error('Failed to update settings in Firestore:', error);
      }
    }
  },

  toggleDarkMode: async () => {
    const user = auth.currentUser;
    const newDarkMode = !get().settings.darkMode;

    // ローカル更新
    set((state) => {
      const newSettings = { ...state.settings, darkMode: newDarkMode };
      saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
      document.body.classList.toggle('dark-mode', newDarkMode);
      return { settings: newSettings };
    });

    // Firestoreに保存
    if (user) {
      try {
        const currentSettings = get().settings;
        await settingsOperations.set(user.uid, currentSettings);
      } catch (error) {
        console.error('Failed to toggle dark mode in Firestore:', error);
      }
    }
  },

  setFirstTime: (value) =>
    set((state) => {
      const newSettings = { ...state.settings, firstTime: value };
      saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
      return { settings: newSettings };
    }),

  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      console.log(`[SettingsStore] Syncing data for user: ${user.uid}`);
      const firestoreSettings = await settingsOperations.get(user.uid);

      if (firestoreSettings) {
        console.log(`[SettingsStore] Loaded settings from Firestore`);
        set({ settings: firestoreSettings, loading: false, initialized: true });
        saveToStorage(STORAGE_KEYS.SETTINGS, firestoreSettings);

        // ダークモードを適用
        document.body.classList.toggle('dark-mode', firestoreSettings.darkMode);
      } else {
        // Firestoreにデータがない場合はデフォルト設定を保存
        console.log(`[SettingsStore] No settings found, using defaults`);
        const currentSettings = get().settings;
        await settingsOperations.set(user.uid, currentSettings);
        set({ loading: false, initialized: true });
      }
    } catch (error) {
      console.error('Failed to sync settings with Firestore:', error);
      set({ loading: false });
    }
  },
}));
