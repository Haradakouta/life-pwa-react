/**
 * メインアプリコンポーネント
 */
import { useEffect, useState } from 'react';
import { Layout } from './components/layout/Layout';
import { LoginScreen } from './components/auth/LoginScreen';
import { BadgeUnlockedModal } from './components/badges/BadgeUnlockedModal';
import { TitleUnlockedModal } from './components/common/TitleUnlockedModal';
import { PrefectureSettingScreen } from './components/settings/PrefectureSettingScreen';
import { WeightInputModal } from './components/settings/WeightInputModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { checkAndGrantTitles } from './utils/title';
import { shouldShowWeightReminder, markWeightReminderShown } from './utils/weightReminder';
import { checkAndUpdateMissions } from './utils/mission';
import {
  useSettingsStore,
  useIntakeStore,
  useExpenseStore,
  useStockStore,
  useShoppingStore,
  useRecipeStore,
  useBadgeStore,
} from './store';
import { useAuth } from './hooks/useAuth';
import { getUserProfile, createUserProfile } from './utils/profile';
import type { BadgeCheckData } from './types';

/**
 * 連続記録日数を計算
 */
function calculateConsecutiveDays(dates: string[]): number {
  if (dates.length === 0) return 0;

  const uniqueDates = [...new Set(dates.map(d => d.split('T')[0]))].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDates.length; i++) {
    const date = new Date(uniqueDates[i]);
    date.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (date.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function App() {
  const { settings } = useSettingsStore();
  const { user, loading: authLoading } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [showPrefectureSetting, setShowPrefectureSetting] = useState(false);
  const [showWeightInputModal, setShowWeightInputModal] = useState(false);
  const [, forceUpdate] = useState({});

  const intakeStore = useIntakeStore();
  const expenseStore = useExpenseStore();
  const stockStore = useStockStore();
  const shoppingStore = useShoppingStore();
  const recipeStore = useRecipeStore();
  const settingsStore = useSettingsStore();
  const badgeStore = useBadgeStore();

  // ミッションの定期チェック（日付変更時のリセット用）
  useEffect(() => {
    if (!user) return;

    // 初回チェック
    checkAndUpdateMissions(user.uid);

    // 1分ごとにチェック
    const intervalId = setInterval(() => {
      checkAndUpdateMissions(user.uid);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [user]);

  // ダークモードの初期化
  useEffect(() => {
    document.body.classList.toggle('dark-mode', settings.darkMode);
  }, [settings.darkMode]);

  // 言語の初期化と更新
  useEffect(() => {
    import('./i18n/config').then(({ default: i18n }) => {
      const language = settings.language || 'ja';
      if (i18n.language !== language) {
        i18n.changeLanguage(language).then(() => {
          // 言語変更後に強制的に再レンダリングをトリガー
          window.dispatchEvent(new Event('languagechange'));
          window.dispatchEvent(new Event('i18n:languageChanged'));
          // 強制的に再レンダリング
          forceUpdate({});
        }).catch((error) => {
          console.error('Failed to change language:', error);
        });
      }
      document.documentElement.lang = language;
    });
  }, [settings.language]);

  // スキンの適用
  useEffect(() => {
    if (!user) {
      // ログアウト時にスキンクラスを削除
      const skinClasses = document.body.className.match(/skin-\w+/g);
      if (skinClasses) {
        skinClasses.forEach(cls => document.body.classList.remove(cls));
      }
      return;
    }

    const applySkin = async () => {
      try {
        const { getUserCosmetics, getCosmeticById } = await import('./utils/cosmetic');
        const userCosmetics = await getUserCosmetics(user.uid);

        if (!userCosmetics?.equippedSkin) {
          // 装備中のスキンがない場合は既存のスキンクラスを削除
          const skinClasses = document.body.className.match(/skin-\w+/g);
          if (skinClasses) {
            skinClasses.forEach(cls => document.body.classList.remove(cls));
          }
          return;
        }

        const cosmetic = getCosmeticById(userCosmetics.equippedSkin);
        if (!cosmetic?.data.skinConfig?.cssClass) {
          // スキンクラスがない場合は既存のスキンクラスを削除
          const skinClasses = document.body.className.match(/skin-\w+/g);
          if (skinClasses) {
            skinClasses.forEach(cls => document.body.classList.remove(cls));
          }
          return;
        }

        // 既存のスキンクラスを削除
        const skinClasses = document.body.className.match(/skin-\w+/g);
        if (skinClasses) {
          skinClasses.forEach(cls => document.body.classList.remove(cls));
        }

        // 新しいスキンクラスを適用
        document.body.classList.add(cosmetic.data.skinConfig.cssClass);
      } catch (error) {
        console.error('スキン適用エラー:', error);
      }
    };

    applySkin();
  }, [user]);

  // バッジチェック（データが更新されたときに実行）- 最適化版
  useEffect(() => {
    if (!user) return;

    // タイマーを使って頻繁な実行を防ぐ（デバウンス）
    const timerId = setTimeout(() => {
      const { intakes } = intakeStore;
      const { expenses } = expenseStore;
      const { stocks } = stockStore;
      const { recipeHistory } = recipeStore;

      // バーコードスキャン回数を取得（プロフィールから）
      let barcodesScanned = 0;
      if (user) {
        import('./utils/profile').then(({ getUserProfile }) => {
          getUserProfile(user.uid).then((profile) => {
            if (profile) {
              barcodesScanned = profile.stats.barcodeScanCount || 0;

              // 連続記録日数を計算
              const consecutiveDays = calculateConsecutiveDays(intakes.map(i => i.date));

              // 総カロリーを計算
              const totalCalories = intakes.reduce((sum, i) => sum + i.calories, 0);

              // 月次予算達成を確認（毎月1日に先月分を判定）
              const now = new Date();
              const currentDay = now.getDate();

              // 先月の年月を計算
              let lastMonth = now.getMonth(); // 0-11
              let lastYear = now.getFullYear();
              if (lastMonth === 0) {
                lastMonth = 11; // 12月
                lastYear -= 1;
              } else {
                lastMonth -= 1;
              }

              // 先月の支出を集計
              const lastMonthExpenses = expenses.filter(e => {
                const date = new Date(e.date);
                return date.getMonth() === lastMonth && date.getFullYear() === lastYear;
              });
              const totalLastMonthExpenses = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

              // 1日のみバッジ判定を実行（先月の実績が予算内ならバッジ付与）
              const budgetAchieved = currentDay === 1 && totalLastMonthExpenses <= settings.monthlyBudget && totalLastMonthExpenses > 0;

              const badgeData: BadgeCheckData = {
                intakesCount: intakes.length,
                expensesCount: expenses.length,
                stocksCount: stocks.length,
                consecutiveDays,
                totalCalories,
                budgetAchieved,
                recipesGenerated: recipeHistory.length,
                barcodesScanned,
              };

              // バッジをチェック
              badgeStore.checkAndUnlockBadges(badgeData);

              // 称号チェック（定期的に実行）
              checkAndGrantTitles(user.uid).catch((error) => {
                console.debug('称号チェックエラー:', error);
              });
            }
          });
        });
      }
    }, 500); // 500msのデバウンス

    return () => clearTimeout(timerId);
  }, [
    intakeStore.intakes.length,
    expenseStore.expenses.length,
    stockStore.stocks.length,
    recipeStore.recipeHistory.length,
    user?.uid,
  ]);

  // ログイン時にFirestoreと同期
  useEffect(() => {
    const syncStores = async () => {
      if (!user) {
        // ログアウト時はリアルタイム同期を停止
        intakeStore.unsubscribeFromFirestore();
        import('./store/useGoalStore').then(({ useGoalStore }) => {
          useGoalStore.getState().unsubscribeFromFirestore();
        });
        import('./store/useExerciseStore').then(({ useExerciseStore }) => {
          useExerciseStore.getState().unsubscribeFromFirestore();
        });
        return;
      }

      // ユーザーが切り替わった場合は再同期
      setSyncing(true);
      try {
        console.log('Syncing data for user:', user.uid);

        // プロフィールが存在するかチェック（ソーシャル機能に必要）
        console.log('📝 Checking user profile...');
        const profile = await getUserProfile(user.uid);
        if (!profile) {
          console.log('⚠️ プロフィールが存在しません。自動作成します...');
          try {
            await createUserProfile(
              user.uid,
              user.email || '',
              user.displayName || `User${user.uid.slice(0, 8)}`
            );
            console.log('✅ プロフィールを作成しました');
          } catch (profileError) {
            console.error('❌ プロフィール作成に失敗しました:', profileError);
            // プロフィール作成失敗しても続行（他の機能は使える）
          }
        } else {
          console.log('✅ プロフィールが存在します');
        }

        const { useGoalStore } = await import('./store/useGoalStore');
        const { useExerciseStore } = await import('./store/useExerciseStore');
        const goalStore = useGoalStore.getState();
        const exerciseStore = useExerciseStore.getState();

        await Promise.all([
          intakeStore.syncWithFirestore(),
          expenseStore.syncWithFirestore(),
          stockStore.syncWithFirestore(),
          shoppingStore.syncWithFirestore(),
          recipeStore.syncWithFirestore(),
          settingsStore.syncWithFirestore(),
          goalStore.syncWithFirestore(),
          exerciseStore.syncWithFirestore(),
        ]);

        // 目標ストアと運動ストアのリアルタイム同期を開始
        goalStore.subscribeToFirestore();
        exerciseStore.subscribeToFirestore();
        console.log('Realtime sync started');
        console.log('Sync completed for user:', user.uid);

        // プッシュ通知を初期化（設定で有効になっている場合のみ）
        const { settings } = useSettingsStore.getState();
        if (settings.pushNotificationsEnabled !== false) {
          try {
            const { initializePushNotifications, onForegroundMessage } = await import('./utils/pushNotification');
            await initializePushNotifications();

            // フォアグラウンドでの通知受信をリッスン
            onForegroundMessage((payload) => {
              // ブラウザ通知を表示
              if ('Notification' in window && Notification.permission === 'granted') {
                const notification = payload.notification || payload.data;
                new Notification(notification?.title || '健康家計アプリ', {
                  body: notification?.body || '新しい通知があります',
                  icon: notification?.icon || '/icon-192.png',
                  badge: '/icon-192.png',
                  tag: payload.data?.tag || 'notification',
                  data: payload.data || {},
                });
              }
            });
            console.log('Push notifications initialized');
          } catch (error) {
            console.error('Error initializing push notifications:', error);
          }
        }

        // ミッション進捗をチェック（ログイン時）
        try {
          const { checkAndUpdateMissions } = await import('./utils/mission');
          await checkAndUpdateMissions(user.uid, {
            intakeCount: intakeStore.intakes.length,
            expenseCount: expenseStore.expenses.length,
          });
        } catch (error) {
          console.error('ミッション進捗チェックエラー:', error);
        }

        // テスト用: 全フレーム解放（既存/ログインユーザー対象）
        try {
          const { unlockAllFramesForUser } = await import('./utils/cosmetic');
          await unlockAllFramesForUser(user.uid);
        } catch (error) {
          console.error('全フレーム解放エラー:', error);
        }

        // 初期同期完了後、リアルタイム同期を開始
        console.log('Starting realtime sync...');
        intakeStore.subscribeToFirestore();
        console.log('Realtime sync started');
      } catch (error) {
        console.error('Failed to sync stores with Firestore:', error);
      } finally {
        setSyncing(false);
      }
    };

    syncStores();

    // クリーンアップ: コンポーネントのアンマウント時に購読解除
    return () => {
      if (user) {
        intakeStore.unsubscribeFromFirestore();
        import('./store/useGoalStore').then(({ useGoalStore }) => {
          useGoalStore.getState().unsubscribeFromFirestore();
        });
        import('./store/useExerciseStore').then(({ useExerciseStore }) => {
          useExerciseStore.getState().unsubscribeFromFirestore();
        });
      }
    };
  }, [user?.uid]); // user.uidが変わったら再同期

  // 週次体重入力リマインダー（月曜日に表示）
  useEffect(() => {
    if (!user) {
      // ユーザーがログインしていない場合は表示しない
      return;
    }

    if (shouldShowWeightReminder()) {
      setShowWeightInputModal(true);
      markWeightReminderShown();
    }
  }, [user, settings.height]);

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
    return <LoginScreen onLoginSuccess={() => { }} />;
  }

  // 都道府県設定画面を表示中
  if (showPrefectureSetting && user) {
    return (
      <ErrorBoundary>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--background)',
          zIndex: 1000,
        }}>
          <PrefectureSettingScreen
            onComplete={() => {
              setShowPrefectureSetting(false);
              // プロフィールを再取得して称号チェック
              import('./utils/profile').then(({ getUserProfile }) => {
                getUserProfile(user.uid).then((profile) => {
                  if (profile?.prefecture) {
                    // 都道府県別称号をチェック
                    checkAndGrantTitles(user.uid).catch((error) => {
                      console.debug('称号チェックエラー:', error);
                    });
                  }
                });
              });
            }}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // ログイン済みの場合はメインアプリを表示
  return (
    <ErrorBoundary>
      <Layout />
      <BadgeUnlockedModal />
      <TitleUnlockedModal />
      {showWeightInputModal && (
        <WeightInputModal
          onClose={() => {
            setShowWeightInputModal(false);
          }}
        />
      )}
    </ErrorBoundary>
  );
}

export default App;
