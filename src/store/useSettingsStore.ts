/**
 * 設定ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Settings } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { settingsOperations } from '../utils/firestore';
import { auth } from '../config/firebase';
import i18n from '../i18n/config';

interface SettingsStore {
  settings: Settings;
  loading: boolean;
  initialized: boolean;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setFirstTime: (value: boolean) => void;
  syncWithFirestore: () => Promise<void>;
  // Google Fit
  isGoogleFitConnected: boolean;
  lastSyncTime: number | null;
  connectGoogleFit: () => Promise<void>;
  syncGoogleFitData: () => Promise<void>;
}

const defaultSettings: Settings = {
  monthlyBudget: 30000,
  darkMode: false,
  firstTime: true,
  isGoogleFitConnected: false,
  lastSyncTime: null,
};

// 初期設定を取得
const initialSettings = { ...defaultSettings, ...getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings) };

// 初期言語の適用は i18n/config.ts の LanguageDetector に任せる
// ここでの強制適用は削除し、競合を防ぐ

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: initialSettings,
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

      // 言語の適用（確実に適用する）
      if ('language' in updates) {
        const language = updates.language || 'ja';
        if (i18n.language !== language) {
          i18n.changeLanguage(language).then(() => {
            // 言語変更後に強制的に再レンダリングをトリガー
            window.dispatchEvent(new Event('languagechange'));
            // すべてのコンポーネントを強制的に再レンダリング
            if (window.dispatchEvent) {
              window.dispatchEvent(new Event('i18n:languageChanged'));
            }
          }).catch((error) => {
            console.error('Failed to change language:', error);
          });
        }
        // HTMLのlang属性も更新
        document.documentElement.lang = language;
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

        // 言語を適用（確実に適用する）
        const language = firestoreSettings.language || 'ja';
        if (i18n.language !== language) {
          i18n.changeLanguage(language).then(() => {
            // 言語変更後に強制的に再レンダリングをトリガー
            window.dispatchEvent(new Event('languagechange'));
            window.dispatchEvent(new Event('i18n:languageChanged'));
          }).catch((error) => {
            console.error('Failed to change language:', error);
          });
        }
        document.documentElement.lang = language;
      } else {
        // Firestoreにデータがない場合はデフォルト設定を保存
        console.log(`[SettingsStore] No settings found, using defaults`);
        const currentSettings = get().settings;
        await settingsOperations.set(user.uid, currentSettings);

        // 言語を適用（確実に適用する）
        const language = currentSettings.language || 'ja';
        if (i18n.language !== language) {
          i18n.changeLanguage(language).then(() => {
            // 言語変更後に強制的に再レンダリングをトリガー
            window.dispatchEvent(new Event('languagechange'));
            window.dispatchEvent(new Event('i18n:languageChanged'));
          }).catch((error) => {
            console.error('Failed to change language:', error);
          });
        }
        document.documentElement.lang = language;

        set({ loading: false, initialized: true });
      }
    } catch (error) {
      console.error('Failed to sync settings with Firestore:', error);
      set({ loading: false });
    }
  },

  // Google Fit
  isGoogleFitConnected: false,
  lastSyncTime: null,

  connectGoogleFit: async () => {
    try {
      const { initializeGoogleFit } = await import('../api/googleFit');
      const token = await initializeGoogleFit();
      if (token) {
        set((state) => {
          const newSettings = { ...state.settings, isGoogleFitConnected: true };
          saveToStorage(STORAGE_KEYS.SETTINGS, newSettings);
          return { settings: newSettings, isGoogleFitConnected: true };
        });
        await get().updateSettings({ isGoogleFitConnected: true });
        await get().syncGoogleFitData();
      }
    } catch (error) {
      console.error('Google Fit connection failed:', error);
      throw error;
    }
  },

  syncGoogleFitData: async () => {
    try {
      const { initializeGoogleFit, fetchWeightData } = await import('../api/googleFit');
      // トークン取得（サイレントログイン的な挙動を期待、または再ポップアップ）
      const token = await initializeGoogleFit();

      if (!token) throw new Error('No access token');

      // 過去30日分のデータを取得
      const endTime = Date.now();
      const startTime = endTime - (30 * 24 * 60 * 60 * 1000);

      const weightData = await fetchWeightData(token, startTime, endTime);

      if (weightData.length > 0) {
        // 最新の体重データを適用
        const latest = weightData[weightData.length - 1];

        // 体重履歴をマージ
        const currentHistory = get().settings.weightHistory || [];
        const newHistory = [...currentHistory];

        weightData.forEach(point => {
          const dateStr = point.date.split('T')[0];
          const existingIndex = newHistory.findIndex(h => h.date.startsWith(dateStr));

          if (existingIndex >= 0) {
            // Google Fitのデータを優先して上書き
            newHistory[existingIndex] = { date: point.date, weight: point.weight };
          } else {
            newHistory.push({ date: point.date, weight: point.weight });
          }
        });

        // 日付順にソート
        newHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        await get().updateSettings({
          weight: latest.weight,
          weightHistory: newHistory,
          lastWeightInputDate: latest.date,
          lastSyncTime: Date.now(),
        });

        set({ lastSyncTime: Date.now() });
      }
    } catch (error) {
      console.error('Google Fit sync failed:', error);
    }
  },
}));
