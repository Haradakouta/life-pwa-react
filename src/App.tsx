/**
 * メインアプリコンポーネント
 */
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { LoginScreen } from './components/auth/LoginScreen';
import { useSettingsStore } from './store';
import { useAuth } from './hooks/useAuth';

function App() {
  const { settings } = useSettingsStore();
  const { user, loading } = useAuth();

  // ダークモードの初期化
  useEffect(() => {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }, [settings.darkMode]);

  // ローディング中
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '24px' }}>
          ロード中...
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
