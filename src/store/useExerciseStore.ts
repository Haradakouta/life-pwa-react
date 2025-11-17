/**
 * 運動記録ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Exercise, ExerciseFormData } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { exerciseOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface ExerciseStore {
  exercises: Exercise[];
  loading: boolean;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  setExercises: (exercises: Exercise[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  addExercise: (data: ExerciseFormData) => Promise<void>;
  updateExercise: (id: string, data: Partial<ExerciseFormData>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  getExercisesByDate: (date: string) => Exercise[];
  getTotalDurationByDate: (date: string) => number;
  syncWithFirestore: () => Promise<void>;
  subscribeToFirestore: () => void;
  unsubscribeFromFirestore: () => void;
}

export const useExerciseStore = create<ExerciseStore>((set, get) => ({
  exercises: getFromStorage<Exercise[]>(STORAGE_KEYS.EXERCISES, []),
  loading: false,
  initialized: false,
  unsubscribe: null,

  setExercises: (exercises) => set({ exercises }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  addExercise: async (data) => {
    const user = auth.currentUser;
    const newExercise: Exercise = {
      id: generateUUID(),
      name: data.name,
      duration: data.duration,
      calories: data.calories,
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // ローカル更新（即座にUI反映）
    set((state) => {
      const newExercises = [...state.exercises, newExercise];
      saveToStorage(STORAGE_KEYS.EXERCISES, newExercises);
      return { exercises: newExercises };
    });

    // Firestoreに保存（ログイン時のみ）
    if (user) {
      try {
        await exerciseOperations.add(user.uid, newExercise);
        
        // 運動目標の進捗を自動更新
        try {
          const { useGoalStore } = await import('./useGoalStore');
          const goalStore = useGoalStore.getState();
          const activeGoals = goalStore.getActiveGoals();
          const exerciseGoals = activeGoals.filter((g) => g.type === 'exercise');
          for (const goal of exerciseGoals) {
            await goalStore.updateGoalProgress(goal.id);
          }
        } catch (error) {
          console.debug('目標進捗更新エラー:', error);
        }
      } catch (error) {
        console.error('Failed to add exercise to Firestore:', error);
      }
    }
  },

  updateExercise: async (id, data) => {
    const user = auth.currentUser;
    const updatedData = { ...data, updatedAt: new Date().toISOString() };

    // ローカル更新
    set((state) => {
      const newExercises = state.exercises.map((exercise) =>
        exercise.id === id ? { ...exercise, ...updatedData } : exercise
      );
      saveToStorage(STORAGE_KEYS.EXERCISES, newExercises);
      return { exercises: newExercises };
    });

    // Firestoreに保存（ログイン時のみ）
    if (user) {
      try {
        await exerciseOperations.update(user.uid, id, updatedData);
        
        // 運動目標の進捗を自動更新
        try {
          const { useGoalStore } = await import('./useGoalStore');
          const goalStore = useGoalStore.getState();
          const activeGoals = goalStore.getActiveGoals();
          const exerciseGoals = activeGoals.filter((g) => g.type === 'exercise');
          for (const goal of exerciseGoals) {
            await goalStore.updateGoalProgress(goal.id);
          }
        } catch (error) {
          console.debug('目標進捗更新エラー:', error);
        }
      } catch (error) {
        console.error('Failed to update exercise in Firestore:', error);
      }
    }
  },

  deleteExercise: async (id) => {
    const user = auth.currentUser;

    // ローカル削除
    set((state) => {
      const newExercises = state.exercises.filter((exercise) => exercise.id !== id);
      saveToStorage(STORAGE_KEYS.EXERCISES, newExercises);
      return { exercises: newExercises };
    });

    // Firestoreから削除
    if (user) {
      try {
        await exerciseOperations.delete(user.uid, id);
        
        // 運動目標の進捗を自動更新
        try {
          const { useGoalStore } = await import('./useGoalStore');
          const goalStore = useGoalStore.getState();
          const activeGoals = goalStore.getActiveGoals();
          const exerciseGoals = activeGoals.filter((g) => g.type === 'exercise');
          for (const goal of exerciseGoals) {
            await goalStore.updateGoalProgress(goal.id);
          }
        } catch (error) {
          console.debug('目標進捗更新エラー:', error);
        }
      } catch (error) {
        console.error('Failed to delete exercise from Firestore:', error);
      }
    }
  },

  getExercisesByDate: (date) => {
    const exercises = get().exercises;
    return exercises.filter((exercise) => exercise.date.startsWith(date));
  },

  getTotalDurationByDate: (date) => {
    const exercises = get().getExercisesByDate(date);
    return exercises.reduce((sum, exercise) => sum + exercise.duration, 0);
  },

  // Firestoreと同期
  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      console.log(`[ExerciseStore] Syncing data for user: ${user.uid}`);
      const firestoreExercises = await exerciseOperations.getAll(user.uid);
      console.log(`[ExerciseStore] Loaded ${firestoreExercises.length} exercises from Firestore`);
      set({ exercises: firestoreExercises, loading: false, initialized: true });
      saveToStorage(STORAGE_KEYS.EXERCISES, firestoreExercises);
    } catch (error) {
      console.error('Failed to sync exercises with Firestore:', error);
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

    console.log(`[ExerciseStore] Starting realtime sync for user: ${user.uid}`);
    const unsubscribeFn = exerciseOperations.subscribe(user.uid, async (exercises) => {
      console.log(`[ExerciseStore] Realtime update: ${exercises.length} exercises`);
      set({ exercises });
      saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
      
      // 運動目標の進捗を自動更新
      try {
        const { useGoalStore } = await import('./useGoalStore');
        const goalStore = useGoalStore.getState();
        const activeGoals = goalStore.getActiveGoals();
        const exerciseGoals = activeGoals.filter((g) => g.type === 'exercise');
        for (const goal of exerciseGoals) {
          await goalStore.updateGoalProgress(goal.id);
        }
      } catch (error) {
        console.debug('目標進捗更新エラー:', error);
      }
    });

    set({ unsubscribe: unsubscribeFn });
  },

  // Firestoreの監視を停止
  unsubscribeFromFirestore: () => {
    const unsubscribeFn = get().unsubscribe;
    if (unsubscribeFn) {
      console.log('[ExerciseStore] Stopping realtime sync');
      unsubscribeFn();
      set({ unsubscribe: null });
    }
  },
}));

