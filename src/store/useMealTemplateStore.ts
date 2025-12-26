/**
 * 食事テンプレートストア（Zustand + Firestore）
 */
import { create } from 'zustand';
import type { MealTemplate, MealTemplateFormData } from '../types';
import { generateUUID } from '../utils/uuid';
import { mealTemplateOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface MealTemplateStore {
  templates: MealTemplate[];
  loading: boolean;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  setTemplates: (templates: MealTemplate[]) => void;
  setLoading: (loading: boolean) => void;
  addTemplate: (data: MealTemplateFormData) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  syncWithFirestore: () => Promise<void>;
  subscribeToFirestore: () => void;
  unsubscribeFromFirestore: () => void;
}

export const useMealTemplateStore = create<MealTemplateStore>((set, get) => ({
  templates: [],
  loading: false,
  initialized: false,
  unsubscribe: null,

  setTemplates: (templates) => set({ templates }),
  setLoading: (loading) => set({ loading }),

  addTemplate: async (data) => {
    const user = auth.currentUser;
    if (!user) return;

    const newTemplate: MealTemplate = {
      id: generateUUID(), // 一時的なID（Firestoreで上書きされる）
      ...data,
      createdAt: new Date().toISOString(),
    };

    // Firestoreに保存
    try {
      await mealTemplateOperations.add(user.uid, newTemplate);
    } catch (error) {
      console.error('Failed to add meal template to Firestore:', error);
    }
  },

  deleteTemplate: async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await mealTemplateOperations.delete(user.uid, id);
    } catch (error) {
      console.error('Failed to delete meal template from Firestore:', error);
    }
  },

  // Firestoreと同期（初回ロード用）
  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      const firestoreTemplates = await mealTemplateOperations.getAll(user.uid);
      set({ templates: firestoreTemplates, loading: false, initialized: true });
    } catch (error) {
      console.error('Failed to sync meal templates with Firestore:', error);
      set({ loading: false });
    }
  },

  // Firestoreのリアルタイム監視を開始
  subscribeToFirestore: () => {
    const user = auth.currentUser;
    if (!user) return;

    // 既存の監視を解除
    const currentUnsubscribe = get().unsubscribe;
    if (currentUnsubscribe) {
      currentUnsubscribe();
    }

    const unsubscribeFn = mealTemplateOperations.subscribe(user.uid, (templates) => {
      set({ templates });
    });

    set({ unsubscribe: unsubscribeFn });
  },

  // Firestoreの監視を停止
  unsubscribeFromFirestore: () => {
    const unsubscribeFn = get().unsubscribe;
    if (unsubscribeFn) {
      unsubscribeFn();
      set({ unsubscribe: null });
    }
  },
}));

