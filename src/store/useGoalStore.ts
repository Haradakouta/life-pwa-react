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
  getGoalProgress: (goalId: string) => Promise<GoalProgress | null>;
  updateGoalProgress: (goalId: string) => Promise<void>;
  syncWithFirestore: () => Promise<void>;
  subscribeToFirestore: () => void;
  unsubscribeFromFirestore: () => void;
}

// 目標タイプに応じた達成条件を判定する関数
const isGoalAchieved = (goal: Goal, currentValue: number): boolean => {
  switch (goal.type) {
    case 'calorie':
      // カロリー目標: 目標値以上摂取で達成
      return currentValue >= goal.targetValue;
    
    case 'budget':
      // 予算目標: 予算内に収める（目標値以下）で達成
      return currentValue <= goal.targetValue;
    
    case 'weight':
      // 体重目標: 目標設定時の現在体重と目標体重を比較
      // 目標体重が現在体重より小さい → 減量目標 → currentValue <= targetValue で達成
      // 目標体重が現在体重より大きい → 増量目標 → currentValue >= targetValue で達成
      // 目標設定時の現在体重は、goalの初期currentValueから推測
      // または、目標設定時に保存した初期体重を使用
      const initialWeight = goal.progressHistory?.[0]?.value || goal.currentValue;
      if (goal.targetValue < initialWeight) {
        // 減量目標
        return currentValue <= goal.targetValue;
      } else {
        // 増量目標
        return currentValue >= goal.targetValue;
      }
    
    case 'exercise':
      // 運動目標: 目標時間以上運動で達成
      return currentValue >= goal.targetValue;
    
    default:
      return false;
  }
};

// 目標タイプに応じた進捗率を計算する関数
const calculatePercentage = (goal: Goal, currentValue: number): number => {
  switch (goal.type) {
    case 'calorie':
      // カロリー目標: 現在値 / 目標値 * 100（100%以上で達成）
      return goal.targetValue > 0 ? Math.min((currentValue / goal.targetValue) * 100, 100) : 0;
    
    case 'budget':
      // 予算目標: 現在値 / 目標値 * 100（100%以下で達成、超過時は100%を超える）
      return goal.targetValue > 0 ? (currentValue / goal.targetValue) * 100 : 0;
    
    case 'weight':
      // 体重目標: 目標設定時の現在体重と目標体重を比較
      const initialWeight = goal.progressHistory?.[0]?.value || goal.currentValue;
      if (goal.targetValue < initialWeight) {
        // 減量目標: (初期体重 - 現在体重) / (初期体重 - 目標体重) * 100
        const totalToLose = initialWeight - goal.targetValue;
        const lost = initialWeight - currentValue;
        if (totalToLose <= 0) return 100;
        return Math.min((lost / totalToLose) * 100, 100);
      } else {
        // 増量目標: (現在体重 - 初期体重) / (目標体重 - 初期体重) * 100
        const totalToGain = goal.targetValue - initialWeight;
        const gained = currentValue - initialWeight;
        if (totalToGain <= 0) return 100;
        return Math.min((gained / totalToGain) * 100, 100);
      }
    
    case 'exercise':
      // 運動目標: 現在値 / 目標値 * 100（100%以上で達成）
      return goal.targetValue > 0 ? Math.min((currentValue / goal.targetValue) * 100, 100) : 0;
    
    default:
      return 0;
  }
};

// 目標タイプに応じた残り値を計算する関数
const calculateRemaining = (goal: Goal, currentValue: number): number => {
  switch (goal.type) {
    case 'calorie':
      // カロリー目標: 目標値 - 現在値（負の値は0）
      return Math.max(goal.targetValue - currentValue, 0);
    
    case 'budget':
      // 予算目標: 目標値 - 現在値（負の値は超過）
      return goal.targetValue - currentValue;
    
    case 'weight':
      // 体重目標: 目標設定時の現在体重と目標体重を比較
      const initialWeight = goal.progressHistory?.[0]?.value || goal.currentValue;
      if (goal.targetValue < initialWeight) {
        // 減量目標: 現在体重 - 目標体重（まだ減らす必要がある量）
        return Math.max(currentValue - goal.targetValue, 0);
      } else {
        // 増量目標: 目標体重 - 現在体重（まだ増やす必要がある量）
        return Math.max(goal.targetValue - currentValue, 0);
      }
    
    case 'exercise':
      // 運動目標: 目標値 - 現在値（負の値は0）
      return Math.max(goal.targetValue - currentValue, 0);
    
    default:
      return 0;
  }
};

// 目標の進捗を計算する関数
const calculateGoalProgress = async (goal: Goal): Promise<GoalProgress> => {
  const updatedGoal = await updateGoalCurrentValue(goal);
  const percentage = calculatePercentage(updatedGoal, updatedGoal.currentValue);
  const remaining = calculateRemaining(updatedGoal, updatedGoal.currentValue);
  
  let daysRemaining: number | undefined;
  let averageDailyProgress: number | undefined;
  let estimatedCompletionDate: string | undefined;
  let isOnTrack = true;

  if (updatedGoal.period === 'daily') {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(updatedGoal.startDate);
    const todayDate = new Date(today);
    const daysElapsed = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysElapsed > 0) {
      averageDailyProgress = updatedGoal.currentValue / daysElapsed;
      // 目標タイプに応じた必要進捗を計算
      let requiredDailyProgress: number;
      if (updatedGoal.type === 'budget') {
        // 予算目標は目標値以下で達成
        requiredDailyProgress = updatedGoal.targetValue / 1;
        isOnTrack = averageDailyProgress <= requiredDailyProgress * 1.2; // 120%以下で順調
      } else if (updatedGoal.type === 'weight') {
        // 体重目標は目標設定時の現在体重と目標体重を比較
        const initialWeight = updatedGoal.progressHistory?.[0]?.value || updatedGoal.currentValue;
        if (updatedGoal.targetValue < initialWeight) {
          // 減量目標
          const totalToLose = initialWeight - updatedGoal.targetValue;
          const lost = initialWeight - updatedGoal.currentValue;
          isOnTrack = lost >= totalToLose * 0.8;
        } else {
          // 増量目標
          const totalToGain = updatedGoal.targetValue - initialWeight;
          const gained = updatedGoal.currentValue - initialWeight;
          isOnTrack = gained >= totalToGain * 0.8;
        }
      } else {
        // カロリー・運動目標は目標値以上で達成
        requiredDailyProgress = updatedGoal.targetValue / 1;
        isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8; // 80%以上で順調
      }
    }
  } else if (goal.period === 'weekly') {
    const startDate = new Date(goal.startDate);
    const today = new Date();
    const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    daysRemaining = Math.max(0, 7 - daysElapsed);
    
    if (daysElapsed > 0) {
      averageDailyProgress = goal.currentValue / daysElapsed;
      // 目標タイプに応じた必要進捗を計算
      let requiredDailyProgress: number;
      if (goal.type === 'budget') {
        requiredDailyProgress = goal.targetValue / 7;
        isOnTrack = averageDailyProgress <= requiredDailyProgress * 1.2;
      } else if (goal.type === 'weight') {
        const initialWeight = goal.progressHistory?.[0]?.value || goal.currentValue;
        if (goal.targetValue < initialWeight) {
          // 減量目標
          const totalToLose = initialWeight - goal.targetValue;
          const lost = initialWeight - goal.currentValue;
          isOnTrack = lost >= totalToLose * 0.8;
        } else {
          // 増量目標
          const totalToGain = goal.targetValue - initialWeight;
          const gained = goal.currentValue - initialWeight;
          isOnTrack = gained >= totalToGain * 0.8;
        }
      } else {
        requiredDailyProgress = goal.targetValue / 7;
        isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8;
      }
      
      if (averageDailyProgress > 0 && isOnTrack && goal.type !== 'weight') {
        let estimatedDays: number;
        if (goal.type === 'budget') {
          estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        } else {
          estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        }
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
      // 目標タイプに応じた必要進捗を計算
      let requiredDailyProgress: number;
      if (goal.type === 'budget') {
        requiredDailyProgress = goal.targetValue / daysInMonth;
        isOnTrack = averageDailyProgress <= requiredDailyProgress * 1.2;
      } else if (goal.type === 'weight') {
        const initialWeight = goal.progressHistory?.[0]?.value || goal.currentValue;
        if (goal.targetValue < initialWeight) {
          // 減量目標
          const totalToLose = initialWeight - goal.targetValue;
          const lost = initialWeight - goal.currentValue;
          isOnTrack = lost >= totalToLose * 0.8;
        } else {
          // 増量目標
          const totalToGain = goal.targetValue - initialWeight;
          const gained = goal.currentValue - initialWeight;
          isOnTrack = gained >= totalToGain * 0.8;
        }
      } else {
        requiredDailyProgress = goal.targetValue / daysInMonth;
        isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8;
      }
      
      if (averageDailyProgress > 0 && isOnTrack && goal.type !== 'weight') {
        let estimatedDays: number;
        if (goal.type === 'budget') {
          estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        } else {
          estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        }
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
      // 目標タイプに応じた必要進捗を計算
      let requiredDailyProgress: number;
      if (goal.type === 'budget') {
        requiredDailyProgress = goal.targetValue / totalDays;
        isOnTrack = averageDailyProgress <= requiredDailyProgress * 1.2;
      } else if (goal.type === 'weight') {
        const initialWeight = goal.progressHistory?.[0]?.value || goal.currentValue;
        if (goal.targetValue < initialWeight) {
          // 減量目標
          const totalToLose = initialWeight - goal.targetValue;
          const lost = initialWeight - goal.currentValue;
          isOnTrack = lost >= totalToLose * 0.8;
        } else {
          // 増量目標
          const totalToGain = goal.targetValue - initialWeight;
          const gained = goal.currentValue - initialWeight;
          isOnTrack = gained >= totalToGain * 0.8;
        }
      } else {
        requiredDailyProgress = goal.targetValue / totalDays;
        isOnTrack = averageDailyProgress >= requiredDailyProgress * 0.8;
      }
      
      if (averageDailyProgress > 0 && isOnTrack && goal.type !== 'weight') {
        let estimatedDays: number;
        if (goal.type === 'budget') {
          estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        } else {
          estimatedDays = Math.ceil(goal.targetValue / averageDailyProgress);
        }
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
const updateGoalCurrentValue = async (goal: Goal): Promise<Goal> => {
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
    
    // 体重目標の場合、進捗履歴に初期体重を保存（初回のみ）
    if (!goal.progressHistory || goal.progressHistory.length === 0) {
      const initialWeight = settingsStore.settings.weight || 0;
      return {
        ...goal,
        currentValue,
        progressHistory: [{
          date: goal.startDate,
          value: initialWeight,
        }],
      };
    }
  } else if (goal.type === 'exercise') {
    // 運動記録から今日の運動時間を取得
    const { useExerciseStore } = await import('./useExerciseStore');
    const exerciseStore = useExerciseStore.getState();
    currentValue = exerciseStore.getTotalDurationByDate(today);
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

    // 目標タイプに応じた初期値を設定
    let initialValue = 0;
    let progressHistory: { date: string; value: number }[] | undefined = undefined;
    
    if (data.type === 'calorie') {
      // カロリー目標: 今日のカロリーを初期値に
      const today = new Date().toISOString().split('T')[0];
      const intakeStore = useIntakeStore.getState();
      initialValue = intakeStore.getTotalCaloriesByDate(today);
    } else if (data.type === 'budget') {
      // 予算目標: 今月の支出を初期値に
      const now = new Date();
      const expenseStore = useExpenseStore.getState();
      initialValue = expenseStore.getTotalByMonth(now.getFullYear(), now.getMonth() + 1);
    } else if (data.type === 'weight') {
      // 体重目標: 現在の体重を初期値に、進捗履歴にも保存
      const settingsStore = useSettingsStore.getState();
      initialValue = settingsStore.settings.weight || 0;
      progressHistory = [{
        date: data.startDate,
        value: initialValue,
      }];
    } else if (data.type === 'exercise') {
      // 運動目標: 0から開始
      initialValue = 0;
    }

    // undefinedのフィールドを削除（Firestoreはundefinedをサポートしない）
    const goalData: Omit<Goal, 'id'> = {
      userId: user.uid,
      currentValue: initialValue,
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
      ...(progressHistory && { progressHistory }),
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

    // Firestoreに保存（IDを指定して保存）
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
    } catch (error: any) {
      console.error('目標の更新に失敗しました:', error);
      
      // ドキュメントが存在しない場合は、目標全体を再作成
      if (error?.code === 'not-found' || error?.message?.includes('No document to update')) {
        const goal = get().goals.find((g) => g.id === id);
        if (goal) {
          try {
            // 目標全体を再作成（更新内容を含む）
            const updatedGoal = { ...goal, ...cleanUpdates };
            await goalOperations.add(user.uid, updatedGoal);
            console.log('目標を再作成しました:', id);
          } catch (recreateError) {
            console.error('目標の再作成に失敗しました:', recreateError);
            // Firestoreから再取得してロールバック
            await get().syncWithFirestore();
            throw recreateError;
          }
        } else {
          // ローカルにも存在しない場合は削除
          set((state) => {
            const newGoals = state.goals.filter((g) => g.id !== id);
            saveToStorage(STORAGE_KEYS.GOALS, newGoals);
            return { goals: newGoals };
          });
          throw new Error('目標が見つかりません');
        }
      } else {
        // その他のエラーの場合はFirestoreから再取得してロールバック
        await get().syncWithFirestore();
        throw error;
      }
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

  getGoalProgress: async (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return null;
    
    return await calculateGoalProgress(goal);
  },

  updateGoalProgress: async (goalId) => {
    const goal = get().goals.find((g) => g.id === goalId);
    if (!goal) return;

    const updatedGoal = await updateGoalCurrentValue(goal);

    // 目標達成チェック（目標タイプに応じた達成条件を使用）
    const isAchieved = isGoalAchieved(updatedGoal, updatedGoal.currentValue);
    if (isAchieved && goal.status === 'active') {
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
      const updatedGoals = await Promise.all(goals.map(updateGoalCurrentValue));
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

    const unsubscribe = goalOperations.subscribe(user.uid, async (goals) => {
      // 各目標の現在値を自動更新
      const updatedGoals = await Promise.all(goals.map(updateGoalCurrentValue));
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

