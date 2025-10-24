/**
 * 食事記録ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Intake, IntakeFormData } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { intakeOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface IntakeStore {
  intakes: Intake[];
  loading: boolean;
  initialized: boolean;
  setIntakes: (intakes: Intake[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  addIntake: (data: IntakeFormData) => Promise<void>;
  updateIntake: (id: string, data: Partial<IntakeFormData>) => Promise<void>;
  deleteIntake: (id: string) => Promise<void>;
  getIntakesByDate: (date: string) => Intake[];
  getTotalCaloriesByDate: (date: string) => number;
  getTotalPriceByDate: (date: string) => number;
  syncWithFirestore: () => Promise<void>;
}

export const useIntakeStore = create<IntakeStore>((set, get) => ({
  intakes: getFromStorage<Intake[]>(STORAGE_KEYS.INTAKES, []),
  loading: false,
  initialized: false,

  setIntakes: (intakes) => set({ intakes }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  addIntake: async (data) => {
    const user = auth.currentUser;
    const newIntake: Intake = {
      id: generateUUID(),
      ...data,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // ローカル更新（即座にUI反映）
    set((state) => {
      const newIntakes = [...state.intakes, newIntake];
      saveToStorage(STORAGE_KEYS.INTAKES, newIntakes);
      return { intakes: newIntakes };
    });

    // Firestoreに保存（ログイン時のみ）
    if (user) {
      try {
        await intakeOperations.add(user.uid, newIntake);
      } catch (error) {
        console.error('Failed to add intake to Firestore:', error);
      }
    }
  },

  updateIntake: async (id, data) => {
    const user = auth.currentUser;
    const updatedData = { ...data, updatedAt: new Date().toISOString() };

    // ローカル更新
    set((state) => {
      const newIntakes = state.intakes.map((intake) =>
        intake.id === id ? { ...intake, ...updatedData } : intake
      );
      saveToStorage(STORAGE_KEYS.INTAKES, newIntakes);
      return { intakes: newIntakes };
    });

    // Firestoreに保存（ログイン時のみ）
    if (user) {
      try {
        await intakeOperations.update(user.uid, id, updatedData);
      } catch (error) {
        console.error('Failed to update intake in Firestore:', error);
      }
    }
  },

  deleteIntake: async (id) => {
    const user = auth.currentUser;

    // ローカル削除
    set((state) => {
      const newIntakes = state.intakes.filter((intake) => intake.id !== id);
      saveToStorage(STORAGE_KEYS.INTAKES, newIntakes);
      return { intakes: newIntakes };
    });

    // Firestoreから削除（ログイン時のみ）
    if (user) {
      try {
        await intakeOperations.delete(user.uid, id);
      } catch (error) {
        console.error('Failed to delete intake from Firestore:', error);
      }
    }
  },

  getIntakesByDate: (date) => {
    const intakes = get().intakes;
    return intakes.filter((intake) => intake.date.startsWith(date));
  },

  getTotalCaloriesByDate: (date) => {
    const intakes = get().getIntakesByDate(date);
    return intakes.reduce((sum, intake) => sum + intake.calories, 0);
  },

  getTotalPriceByDate: (date) => {
    const intakes = get().getIntakesByDate(date);
    return intakes.reduce((sum, intake) => sum + intake.price, 0);
  },

  // Firestoreと同期
  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      const firestoreIntakes = await intakeOperations.getAll(user.uid);
      set({ intakes: firestoreIntakes, loading: false, initialized: true });
      saveToStorage(STORAGE_KEYS.INTAKES, firestoreIntakes);
    } catch (error) {
      console.error('Failed to sync intakes with Firestore:', error);
      set({ loading: false });
    }
  },
}));
