/**
 * 在庫ストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { Stock, StockFormData } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { stockOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface StockStore {
  stocks: Stock[];
  loading: boolean;
  initialized: boolean;
  setStocks: (stocks: Stock[]) => void;
  addStock: (data: StockFormData) => Promise<void>;
  updateStock: (id: string, data: Partial<StockFormData>) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;
  getExpiringStocks: (daysThreshold: number) => Stock[];
  getStockIngredients: () => string[];
  syncWithFirestore: () => Promise<void>;
}

export const useStockStore = create<StockStore>((set, get) => ({
  stocks: getFromStorage<Stock[]>(STORAGE_KEYS.STOCKS, []),
  loading: false,
  initialized: false,

  setStocks: (stocks) => set({ stocks }),

  addStock: async (data) => {
    const user = auth.currentUser;
    const newStock: Stock = {
      id: generateUUID(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const newStocks = [...state.stocks, newStock];
      saveToStorage(STORAGE_KEYS.STOCKS, newStocks);
      return { stocks: newStocks };
    });

    if (user) {
      try {
        await stockOperations.add(user.uid, newStock);
      } catch (error) {
        console.error('Failed to add stock to Firestore:', error);
      }
    }
  },

  updateStock: async (id, data) => {
    const user = auth.currentUser;
    const updatedData = { ...data, updatedAt: new Date().toISOString() };

    set((state) => {
      const newStocks = state.stocks.map((stock) =>
        stock.id === id ? { ...stock, ...updatedData } : stock
      );
      saveToStorage(STORAGE_KEYS.STOCKS, newStocks);
      return { stocks: newStocks };
    });

    if (user) {
      try {
        await stockOperations.update(user.uid, id, updatedData);
      } catch (error) {
        console.error('Failed to update stock in Firestore:', error);
      }
    }
  },

  deleteStock: async (id) => {
    const user = auth.currentUser;

    set((state) => {
      const newStocks = state.stocks.filter((stock) => stock.id !== id);
      saveToStorage(STORAGE_KEYS.STOCKS, newStocks);
      return { stocks: newStocks };
    });

    if (user) {
      try {
        await stockOperations.delete(user.uid, id);
      } catch (error) {
        console.error('Failed to delete stock from Firestore:', error);
      }
    }
  },

  getExpiringStocks: (daysThreshold) => {
    const stocks = get().stocks;
    return stocks.filter((stock) => stock.daysRemaining <= daysThreshold);
  },

  getStockIngredients: () => {
    const stocks = get().stocks;
    return stocks.map((stock) => stock.name);
  },

  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      const firestoreStocks = await stockOperations.getAll(user.uid);
      set({ stocks: firestoreStocks, loading: false, initialized: true });
      saveToStorage(STORAGE_KEYS.STOCKS, firestoreStocks);
    } catch (error) {
      console.error('Failed to sync stocks with Firestore:', error);
      set({ loading: false });
    }
  },
}));
