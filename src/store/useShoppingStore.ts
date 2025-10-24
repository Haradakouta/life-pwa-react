/**
 * 買い物リストストア（Zustand + Firebase）
 */
import { create } from 'zustand';
import type { ShoppingItem, ShoppingFormData, ShoppingCategory } from '../types';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/localStorage';
import { generateUUID } from '../utils/uuid';
import { shoppingOperations } from '../utils/firestore';
import { auth } from '../config/firebase';

interface ShoppingStore {
  items: ShoppingItem[];
  loading: boolean;
  initialized: boolean;
  setItems: (items: ShoppingItem[]) => void;
  addItem: (data: ShoppingFormData) => Promise<void>;
  toggleItem: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearCompleted: () => Promise<void>;
  addWeeklyEssentials: () => void;
  addLowStockItems: (stockItems: Array<{ name: string; category?: ShoppingCategory }>) => void;
  syncWithFirestore: () => Promise<void>;
}

const WEEKLY_ESSENTIALS: Array<{ name: string; quantity: number; category: ShoppingCategory }> = [
  { name: '米', quantity: 1, category: 'staple' },
  { name: '卵', quantity: 10, category: 'protein' },
  { name: '牛乳', quantity: 1, category: 'dairy' },
  { name: 'パン', quantity: 1, category: 'staple' },
  { name: '鶏肉', quantity: 1, category: 'protein' },
  { name: '豚肉', quantity: 1, category: 'protein' },
  { name: '玉ねぎ', quantity: 3, category: 'vegetable' },
  { name: 'にんじん', quantity: 3, category: 'vegetable' },
  { name: 'じゃがいも', quantity: 3, category: 'vegetable' },
  { name: 'トマト', quantity: 3, category: 'vegetable' },
  { name: 'バナナ', quantity: 1, category: 'fruit' },
  { name: 'ヨーグルト', quantity: 1, category: 'dairy' },
  { name: '醤油', quantity: 1, category: 'seasoning' },
  { name: '塩', quantity: 1, category: 'seasoning' },
];

export const useShoppingStore = create<ShoppingStore>((set, get) => ({
  items: getFromStorage<ShoppingItem[]>(STORAGE_KEYS.SHOPPING, []),
  loading: false,
  initialized: false,

  setItems: (items) => set({ items }),

  addItem: async (data) => {
    const user = auth.currentUser;

    // 重複チェック
    const exists = get().items.find((item) => item.name === data.name && !item.checked);
    if (exists) return;

    const newItem: ShoppingItem = {
      id: generateUUID(),
      ...data,
      checked: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const newItems = [...state.items, newItem];
      saveToStorage(STORAGE_KEYS.SHOPPING, newItems);
      return { items: newItems };
    });

    if (user) {
      try {
        await shoppingOperations.add(user.uid, newItem);
      } catch (error) {
        console.error('Failed to add shopping item to Firestore:', error);
      }
    }
  },

  toggleItem: async (id) => {
    const user = auth.currentUser;

    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id
          ? { ...item, checked: !item.checked, updatedAt: new Date().toISOString() }
          : item
      );
      saveToStorage(STORAGE_KEYS.SHOPPING, newItems);
      return { items: newItems };
    });

    if (user) {
      try {
        const item = get().items.find((i) => i.id === id);
        if (item) {
          await shoppingOperations.update(user.uid, id, {
            checked: item.checked,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to toggle shopping item in Firestore:', error);
      }
    }
  },

  deleteItem: async (id) => {
    const user = auth.currentUser;

    set((state) => {
      const newItems = state.items.filter((item) => item.id !== id);
      saveToStorage(STORAGE_KEYS.SHOPPING, newItems);
      return { items: newItems };
    });

    if (user) {
      try {
        await shoppingOperations.delete(user.uid, id);
      } catch (error) {
        console.error('Failed to delete shopping item from Firestore:', error);
      }
    }
  },

  clearCompleted: async () => {
    const user = auth.currentUser;
    const completedIds = get().items.filter((item) => item.checked).map((item) => item.id);

    set((state) => {
      const newItems = state.items.filter((item) => !item.checked);
      saveToStorage(STORAGE_KEYS.SHOPPING, newItems);
      return { items: newItems };
    });

    if (user) {
      try {
        await Promise.all(completedIds.map((id) => shoppingOperations.delete(user.uid, id)));
      } catch (error) {
        console.error('Failed to clear completed items from Firestore:', error);
      }
    }
  },

  addWeeklyEssentials: () => {
    set((state) => {
      const currentItems = state.items;
      const newItems = [...currentItems];

      WEEKLY_ESSENTIALS.forEach((essential) => {
        const exists = currentItems.find(
          (item) => item.name === essential.name && !item.checked
        );
        if (!exists) {
          newItems.push({
            id: generateUUID(),
            name: essential.name,
            quantity: essential.quantity,
            category: essential.category,
            checked: false,
            createdAt: new Date().toISOString(),
          });
        }
      });

      saveToStorage(STORAGE_KEYS.SHOPPING, newItems);
      return { items: newItems };
    });
  },

  addLowStockItems: (stockItems) => {
    set((state) => {
      const currentItems = state.items;
      const newItems = [...currentItems];

      stockItems.forEach((stock) => {
        const exists = currentItems.find((item) => item.name === stock.name && !item.checked);
        if (!exists) {
          newItems.push({
            id: generateUUID(),
            name: stock.name,
            quantity: 1,
            category: stock.category,
            checked: false,
            createdAt: new Date().toISOString(),
          });
        }
      });

      saveToStorage(STORAGE_KEYS.SHOPPING, newItems);
      return { items: newItems };
    });
  },

  syncWithFirestore: async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      set({ loading: true });
      const firestoreItems = await shoppingOperations.getAll(user.uid);
      set({ items: firestoreItems, loading: false, initialized: true });
      saveToStorage(STORAGE_KEYS.SHOPPING, firestoreItems);
    } catch (error) {
      console.error('Failed to sync shopping items with Firestore:', error);
      set({ loading: false });
    }
  },
}));
