/**
 * メインアプリコンポーネント
 */
import { useEffect, useState } from 'react';
import { Layout } from './components/layout/Layout';
import { LoginScreen } from './components/auth/LoginScreen';
import {
  useSettingsStore,
  useIntakeStore,
  useExpenseStore,
  useStockStore,
  useShoppingStore,
  useRecipeStore,
} from './store';
import { useAuth } from './hooks/useAuth';

function App() {
  const { settings } = useSettingsStore();
  const { user, loading: authLoading } = useAuth();
  const [syncing, setSyncing] = useState(false);

  const intakeStore = useIntakeStore();
  const expenseStore = useExpenseStore();
  const stockStore = useStockStore();
  const shoppingStore = useShoppingStore();
  const recipeStore = useRecipeStore();
  const settingsStore = useSettingsStore();

  // ダークモードの初期化
  useEffect(() => {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }, [settings.darkMode]);

  // ログイン時にFirestoreと同期
  useEffect(() => {
    const syncStores = async () => {
      if (!user) return;

      // ユーザーが切り替わった場合は再同期
      setSyncing(true);
      try {
        console.log('Syncing data for user:', user.uid);
        await Promise.all([
          intakeStore.syncWithFirestore(),
          expenseStore.syncWithFirestore(),
          stockStore.syncWithFirestore(),
          shoppingStore.syncWithFirestore(),
          recipeStore.syncWithFirestore(),
          settingsStore.syncWithFirestore(),
        ]);
        console.log('Sync completed for user:', user.uid);
      } catch (error) {
        console.error('Failed to sync stores with Firestore:', error);
      } finally {
        setSyncing(false);
      }
    };

    syncStores();
  }, [user?.uid]); // user.uidが変わったら再同期

  // ローディング中
  if (authLoading || syncing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '24px', textAlign: 'center' }}>
          {authLoading ? 'ロード中...' : 'データを同期中...'}
        </div>
      </div>
    );
  }

  // 未ログインの場合はログイン画面を表示
  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  // ログイン済みの場合はメインアプリを表示
  return <Layout />;
}

export default App;
