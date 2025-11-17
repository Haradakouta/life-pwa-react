/**
 * 目標ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Goal, GoalFormData, GoalProgress } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { goalOperations } from '../utils/firestore';
import { auth } from '../config/firebase';
import { useIntakeStore } from './useIntakeStore';
import { useExpenseStore } from './useExpenseStore';
import { useSettingsStore } from './useSettingsStore';

interface GoalStore {
  goals: Goal[];
  loading: boolean;
  initialized: boolean;
  unsubscribe: (() => void) | null;
  setGoals: (goals: Goal[]) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  addGoal: (data: GoalFormData) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getActiveGoals: () => Goal[];
  getGoalProgress: (goalId: string) => GoalProgress | null;
  updateGoalProgress: (goalId: string) => Promise<void>;
  syncWithFirestore: () => Promise<void>;
  subscribeToFirestore: () => void;
  unsubscribeFromFirestore: () => void;
}

// 目標の進捗を計算する関数
const calculateGoalProgress = (goal: Goal): GoalProgress => {
  const percentage = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
  const remaining = goal.targetValue - goal.currentValue;
  
  let daysRemaining: number | undefined;
  let averageDailyProgress: number | undefined;
  let estimatedCompletionDate: string | undefined;
  let isOnTrack = true;

  if (goal.period === 'daily') {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(goal.startDate);
    const todayDate = new Date(today);
    const daysElapsed = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysElapsed > 0) {
      averageDailyProgress = goal.currentValue / daysElapsed;
      const requiredDailyProgress = goal.targetValue / 1; // 1日で達成
      isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8; // 80%以上で順調
    }
  } else if (goal.period === 'weekly') {
    const startDate = new Date(goal.startDate);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    daysRemaining = Math.max(0, 7 - daysElapsed);
    
    if (daysElapsed > 0) {
      averageDailyProgress = goal.currentValue / daysElapsed;
      const requiredDailyProgress = goal.targetValue / 7;
      isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8;
      
      if (averageDailyProgress > 0 && isOnTrack) {
        const estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        const estimatedDate = new Date(startDate);
        estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
        estimatedCompletionDate = estimatedDate.toISOString();
      }
    }
  } else if (goal.period === 'monthly') {
    const startDate = new Date(goal.startDate);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    daysRemaining = Math.max(0, daysInMonth - daysElapsed);
    
    if (daysElapsed > 0) {
      averageDailyProgress = goal.currentValue / daysElapsed;
      const requiredDailyProgress = goal.targetValue / daysInMonth;
      isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8;
      
      if (averageDailyProgress > 0 && isOnTrack) {
        const estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        const estimatedDate = new Date(startDate);
        estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
        estimatedCompletionDate = estimatedDate.toISOString();
      }
    }
  } else if (goal.period === 'custom' && goal.endDate) {
    const startDate = new Date(goal.startDate);
    const endDate = new Date(goal.endDate);
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    daysRemaining = Math.max(0, totalDays - daysElapsed);
    
    if (daysElapsed > 0) {
      averageDailyProgress = goal.currentValue / daysElapsed;
      const requiredDailyProgress = goal.targetValue / totalDays;
      isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8;
      
      if (averageDailyProgress > 0 && isOnTrack) {
        const estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        const estimatedDate = new Date(startDate);
        estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
        estimatedCompletionDate = estimatedDate.toISOString();
      }
    }
  }

  return {
    goal,
    percentage: Math.min(percentage, 100),
    remaining: Math.max(remaining, 0),
    daysRemaining,
    averageDailyProgress,
    isOnTrack,
    estimatedCompletionDate,
  };
};

// 目標の現在値を自動更新する関数
const updateGoalCurrentValue = (goal: Goal): Goal => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  let currentValue = 0;

  if (goal.type === 'calorie') {
    // 食事記録から今日のカロリーを取得
    const intakeStore = useIntakeStore.getState();
    currentValue = intakeStore.getTotalCaloriesByDate(today);
  } else if (goal.type === 'budget') {
    // 家計簿から今月の支出を取得
    const expenseStore = useExpenseStore.getState();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    currentValue = expenseStore.getTotalByMonth(year, month);
  } else if (goal.type === 'weight') {
    // 設定から現在の体重を取得
    const settingsStore = useSettingsStore.getState();
    currentValue = settingsStore.settings.weight || 0;
  } else if (goal.type === 'exercise') {
    // 運動記録はまだ実装されていないので、現在値はそのまま
    currentValue = goal.currentValue;
  }

  return {
    ...goal,
    currentValue,
  };
};

export const useGoalStore = create<GoalStore>((set, get) => ({
  goals: getFromStorage<Goal[]>(STORAGE_KEYS.GOALS, []),
  loading: false,
  initialized: false,
  unsubscribe: null,

  setGoals: (goals) => set({ goals }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),

  addGoal: async (data) => {
    const user = auth.currentUser;
    if (!user) throw new Error('ユーザーがログインしていません');

    // undefinedのフィールドを削除（Firestoreはundefinedをサポートしない）
    const goalData: Omit<Goal, 'id'> = {
      userId: user.uid,
      currentValue: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: data.type,
      title: data.title,
      targetValue: data.targetValue,
      unit: data.unit,
      period: data.period,
      startDate: data.startDate,
      ...(data.description && { description: data.description }),
      ...(data.endDate && { endDate: data.endDate }),
    };

    const newGoal: Goal = {
      id: generateUUID(),
      ...goalData,
    };

    // ローカル更新
    set((state) => {
      const newGoals = [...state.goals, newGoal];
      saveToStorage(STORAGE_KEYS.GOALS, newGoals);
      return { goals: newGoals };
    });

    // Firestoreに保存
    try {
      await goalOperations.add(user.uid, newGoal);
    } catch (error) {
      console.error('目標の追加に失敗しました:', error);
      // ローカルから削除（ロールバック）
      set((state) => {
        const newGoals = state.goals.filter((g) => g.id !== newGoal.id);
        saveToStorage(STORAGE_KEYS.GOALS, newGoals);
        return { goals: newGoals };
      });
      throw error;
    }
  },

  updateGoal: async (id, updates) => {
    const user = auth.currentUser;
    if (!user) throw new Error('ユーザーがログインしていません');

    // undefinedのフィールドを削除（Firestoreはundefinedをサポートしない）
    const cleanUpdates: Record<string, unknown> = {};
    Object.keys(updates).forEach((key) => {
      const value = updates[key as keyof Goal];
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    });
    cleanUpdates.updatedAt = new Date().toISOString();

    // ローカル更新
    set((state) => {
      const newGoals = state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...cleanUpdates } : goal
      );
      saveToStorage(STORAGE_KEYS.GOALS, newGoals);
      return { goals: newGoals };
    });

    // Firestoreに保存
    try {
      await goalOperations.update(user.uid, id, cleanUpdates);
    } catch (error) {
      console.error('目標の更新に失敗しました:', error);
      // Firestoreから再取得してロールバック
      await get().syncWithFirestore();
      throw error;
    }
  },

  deleteGoal: async (id) => {
    const user = auth.currentUser;
    if (!user) throw new Error('ユーザーがログインしていません');

    // ローカル削除
    set((state) => {
      const newGoals = state.goals.filter((goal) => goal.id !== id);
      saveToStorage(STORAGE_KEYS.GOALS, newGoals);
      return { goals: newGoals };
    });

    // Firestoreから削除
    try {
      await goalOperations.delete(user.uid, id);
    } catch (error) {
      console.error('目標の削除に失敗しました:', error);
      // Firestoreから再取得してロールバック
      await get().syncWithFirestore();
      throw error;
    }
  },

  getActiveGoals: () => {
    return get().goals.filter((goal) => goal.status === 'active');
  },

  getGoalProgress: (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return null;
    
    const updatedGoal = updateGoalCurrentValue(goal);
    return calculateGoalProgress(updatedGoal);
  },

  updateGoalProgress: async (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedGoal = updateGoalCurrentValue(goal);
    const progress = calculateGoalProgress(updatedGoal);

    // 目標達成チェック
    if (progress.percentage >= 100 && goal.status === 'active') {
      await get().updateGoal(goalId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        currentValue: updatedGoal.currentValue,
      });

      // バッジチェック（目標達成時）
      try {
        const { useBadgeStore } = await import('./useBadgeStore');
        const badgeStore = useBadgeStore.getState();
        const completedGoals = get().goals.filter((g) => g.status === 'completed');
        const calorieGoalAchieved = completedGoals.some((g) => g.type === 'calorie');
        const monthlyBudgetGoalAchieved = completedGoals.some((g) => g.type === 'budget' && g.period === 'monthly');
        const weightGoalAchieved = completedGoals.some((g) => g.type === 'weight');

        badgeStore.checkAndUnlockBadges({
          intakesCount: 0,
          expensesCount: 0,
          stocksCount: 0,
          consecutiveDays: 0,
          totalCalories: 0,
          recipesGenerated: 0,
          barcodesScanned: 0,
          budgetAchieved: false,
          goalsCompleted: completedGoals.length,
          calorieGoalAchieved,
          monthlyBudgetGoalAchieved,
          weightGoalAchieved,
        });
      } catch (error) {
        console.error('バッジチェックエラー:', error);
      }
    } else {
      await get().updateGoal(goalId, {
        currentValue: updatedGoal.currentValue,
      });
    }
  },

  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) {
      set({ initialized: true });
      return;
    }

    set({ loading: true });
    try {
      const goals = await goalOperations.getAll(user.uid);
      // 各目標の現在値を自動更新
      const updatedGoals = goals.map(updateGoalCurrentValue);
      set({ goals: updatedGoals, initialized: true });
      saveToStorage(STORAGE_KEYS.GOALS || 'goals', updatedGoals);
    } catch (error) {
      console.error('目標の同期に失敗しました:', error);
      set({ initialized: true });
    } finally {
      set({ loading: false });
    }
  },

  subscribeToFirestore: () => {
    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = goalOperations.subscribe(user.uid, (goals) => {
      // 各目標の現在値を自動更新
      const updatedGoals = goals.map(updateGoalCurrentValue);
      set({ goals: updatedGoals });
      saveToStorage(STORAGE_KEYS.GOALS || 'goals', updatedGoals);
    });

    set({ unsubscribe });
  },

  unsubscribeFromFirestore: () => {
    const unsubscribe = get().unsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },
}));

