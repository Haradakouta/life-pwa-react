/**
 * 支出ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Expense, ExpenseFormData, ExpenseCategory } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { expenseOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  initialized: boolean;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (data: ExpenseFormData) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  getExpensesByMonth: (year: number, month: number) => Expense[];
  getTotalByMonth: (year: number, month: number) => number;
  getTotalByCategory: (category: ExpenseCategory, year: number, month: number) => number;
  syncWithFirestore: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []),
  loading: false,
  initialized: false,

  setExpenses: (expenses) => set({ expenses }),

  addExpense: async (data) => {
    const user = auth.currentUser;
    const newExpense: Expense = {
      id: generateUUID(),
      ...data,
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const newExpenses = [...state.expenses, newExpense];
      saveToStorage(STORAGE_KEYS.EXPENSES, newExpenses);
      return { expenses: newExpenses };
    });

    if (user) {
      try {
        await expenseOperations.add(user.uid, newExpense);
      } catch (error) {
        console.error('Failed to add expense to Firestore:', error);
      }
    }
  },

  deleteExpense: async (id) => {
    const user = auth.currentUser;

    set((state) => {
      const newExpenses = state.expenses.filter((expense) => expense.id !== id);
      saveToStorage(STORAGE_KEYS.EXPENSES, newExpenses);
      return { expenses: newExpenses };
    });

    if (user) {
      try {
        await expenseOperations.delete(user.uid, id);
      } catch (error) {
        console.error('Failed to delete expense from Firestore:', error);
      }
    }
  },

  getExpensesByMonth: (year, month) => {
    const expenses = get().expenses;
    return expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  },

  getTotalByMonth: (year, month) => {
    const expenses = get().getExpensesByMonth(year, month);
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  },

  getTotalByCategory: (category, year, month) => {
    const expenses = get().getExpensesByMonth(year, month);
    return expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  },

  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      const firestoreExpenses = await expenseOperations.getAll(user.uid);
      set({ expenses: firestoreExpenses, loading: false, initialized: true });
      saveToStorage(STORAGE_KEYS.EXPENSES, firestoreExpenses);
    } catch (error) {
      console.error('Failed to sync expenses with Firestore:', error);
      set({ loading: false });
    }
  },
}));
