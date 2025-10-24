import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Intake, Expense, Stock, ShoppingItem, Recipe, Settings } from '../types';

// コレクション名の定義
const COLLECTIONS = {
  INTAKES: 'intakes',
  EXPENSES: 'expenses',
  STOCKS: 'stocks',
  SHOPPING: 'shopping',
  RECIPES: 'recipes',
  SETTINGS: 'settings',
};

// ユーザーIDベースのコレクションパスを取得
const getUserCollectionPath = (userId: string, collectionName: string) => {
  return `users/${userId}/${collectionName}`;
};

// 食事記録（Intake）の操作
export const intakeOperations = {
  // 全件取得
  getAll: async (userId: string): Promise<Intake[]> => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.INTAKES)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Intake));
  },

  // 追加
  add: async (userId: string, intake: Omit<Intake, 'id'>) => {
    const docRef = await addDoc(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.INTAKES)),
      intake
    );
    return docRef.id;
  },

  // 更新
  update: async (userId: string, id: string, intake: Partial<Intake>) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.INTAKES), id);
    await updateDoc(docRef, intake);
  },

  // 削除
  delete: async (userId: string, id: string) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.INTAKES), id);
    await deleteDoc(docRef);
  },

  // リアルタイム監視
  subscribe: (userId: string, callback: (intakes: Intake[]) => void) => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.INTAKES)),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const intakes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Intake));
      callback(intakes);
    });
  },
};

// 支出（Expense）の操作
export const expenseOperations = {
  getAll: async (userId: string): Promise<Expense[]> => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.EXPENSES)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
  },

  add: async (userId: string, expense: Omit<Expense, 'id'>) => {
    const docRef = await addDoc(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.EXPENSES)),
      expense
    );
    return docRef.id;
  },

  update: async (userId: string, id: string, expense: Partial<Expense>) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.EXPENSES), id);
    await updateDoc(docRef, expense);
  },

  delete: async (userId: string, id: string) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.EXPENSES), id);
    await deleteDoc(docRef);
  },

  subscribe: (userId: string, callback: (expenses: Expense[]) => void) => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.EXPENSES)),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Expense));
      callback(expenses);
    });
  },
};

// 在庫（Stock）の操作
export const stockOperations = {
  getAll: async (userId: string): Promise<Stock[]> => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.STOCKS)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Stock));
  },

  add: async (userId: string, stock: Omit<Stock, 'id'>) => {
    const docRef = await addDoc(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.STOCKS)),
      stock
    );
    return docRef.id;
  },

  update: async (userId: string, id: string, stock: Partial<Stock>) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.STOCKS), id);
    await updateDoc(docRef, stock);
  },

  delete: async (userId: string, id: string) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.STOCKS), id);
    await deleteDoc(docRef);
  },

  subscribe: (userId: string, callback: (stocks: Stock[]) => void) => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.STOCKS)),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const stocks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Stock));
      callback(stocks);
    });
  },
};

// 買い物リスト（Shopping）の操作
export const shoppingOperations = {
  getAll: async (userId: string): Promise<ShoppingItem[]> => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.SHOPPING)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShoppingItem));
  },

  add: async (userId: string, item: Omit<ShoppingItem, 'id'>) => {
    const docRef = await addDoc(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.SHOPPING)),
      item
    );
    return docRef.id;
  },

  update: async (userId: string, id: string, item: Partial<ShoppingItem>) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.SHOPPING), id);
    await updateDoc(docRef, item);
  },

  delete: async (userId: string, id: string) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.SHOPPING), id);
    await deleteDoc(docRef);
  },

  subscribe: (userId: string, callback: (items: ShoppingItem[]) => void) => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.SHOPPING)),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShoppingItem));
      callback(items);
    });
  },
};

// レシピ（Recipe）の操作
export const recipeOperations = {
  getAll: async (userId: string): Promise<Recipe[]> => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.RECIPES)),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Recipe));
  },

  add: async (userId: string, recipe: Omit<Recipe, 'id'>) => {
    const docRef = await addDoc(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.RECIPES)),
      recipe
    );
    return docRef.id;
  },

  update: async (userId: string, id: string, recipe: Partial<Recipe>) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.RECIPES), id);
    await updateDoc(docRef, recipe);
  },

  delete: async (userId: string, id: string) => {
    const docRef = doc(db, getUserCollectionPath(userId, COLLECTIONS.RECIPES), id);
    await deleteDoc(docRef);
  },

  subscribe: (userId: string, callback: (recipes: Recipe[]) => void) => {
    const q = query(
      collection(db, getUserCollectionPath(userId, COLLECTIONS.RECIPES)),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const recipes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Recipe));
      callback(recipes);
    });
  },
};

// 設定（Settings）の操作
export const settingsOperations = {
  get: async (userId: string): Promise<Settings | null> => {
    const q = query(collection(db, getUserCollectionPath(userId, COLLECTIONS.SETTINGS)));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return snapshot.docs[0].data() as Settings;
  },

  set: async (userId: string, settings: Omit<Settings, 'id'>) => {
    const q = query(collection(db, getUserCollectionPath(userId, COLLECTIONS.SETTINGS)));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // 新規作成
      const docRef = await addDoc(
        collection(db, getUserCollectionPath(userId, COLLECTIONS.SETTINGS)),
        settings
      );
      return docRef.id;
    } else {
      // 更新
      const docRef = doc(
        db,
        getUserCollectionPath(userId, COLLECTIONS.SETTINGS),
        snapshot.docs[0].id
      );
      await updateDoc(docRef, settings);
      return snapshot.docs[0].id;
    }
  },

  subscribe: (userId: string, callback: (settings: Settings | null) => void) => {
    const q = query(collection(db, getUserCollectionPath(userId, COLLECTIONS.SETTINGS)));
    return onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        callback(null);
      } else {
        const settings = snapshot.docs[0].data() as Settings;
        callback(settings);
      }
    });
  },
};
