/**
 * 設定画面コンポーネント
 */
import React, { useState } from 'react';
import { useSettingsStore, useIntakeStore, useExpenseStore, useStockStore } from '../../store';
import { MdDarkMode, MdDescription, MdCode, MdSave, MdLogout, MdPerson, MdChevronRight, MdEmojiEvents, MdLocationOn, MdAssignment, MdShoppingBag } from 'react-icons/md';
import { logout } from '../../utils/auth';
import { useAuth } from '../../hooks/useAuth';
import { ProfileEditScreen } from '../profile/ProfileEditScreen';
import { TitleScreen } from './TitleScreen';
import { PrefectureSettingScreen } from './PrefectureSettingScreen';
import { DailyMissionScreen } from '../mission/DailyMissionScreen';
import { CosmeticShopScreen } from '../cosmetic/CosmeticShopScreen';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, toggleDarkMode } = useSettingsStore();
  const { intakes } = useIntakeStore();
  const { expenses } = useExpenseStore();
  const { stocks } = useStockStore();
  const { user } = useAuth();

  const [budget, setBudget] = useState((settings.monthlyBudget ?? 30000).toString());
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showTitleScreen, setShowTitleScreen] = useState(false);
  const [showPrefectureSetting, setShowPrefectureSetting] = useState(false);
  const [showDailyMission, setShowDailyMission] = useState(false);
  const [showCosmeticShop, setShowCosmeticShop] = useState(false);

  const handleSaveSettings = () => {
    updateSettings({
      monthlyBudget: Number(budget),
    });
    alert('設定を保存しました！');
  };

  const handleExportCSV = () => {
    const csvData = [
      '種類,名前,カロリー,金額,日付',
      ...intakes.map(
        (intake) =>
          `食事記録,${intake.name},${intake.calories},${intake.price},${intake.date}`
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `健康家計アプリ_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportJSON = () => {
    const jsonData = {
      intakes,
      expenses,
      stocks,
      settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `健康家計アプリ_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleLogout = async () => {
    if (window.confirm('ログアウトしますか？')) {
      const result = await logout();
      if (result.error) {
        alert('ログアウトに失敗しました: ' + result.error);
      }
    }
  };

  // プロフィール編集画面を表示中
  if (showProfileEdit) {
    return <ProfileEditScreen onBack={() => setShowProfileEdit(false)} />;
  }

  // 称号画面を表示中
  if (showTitleScreen) {
    return <TitleScreen onBack={() => setShowTitleScreen(false)} />;
  }

  // 都道府県設定画面を表示中
  if (showPrefectureSetting) {
    return <PrefectureSettingScreen onBack={() => setShowPrefectureSetting(false)} />;
  }

  // デイリーミッション画面を表示中
  if (showDailyMission) {
    return <DailyMissionScreen onBack={() => setShowDailyMission(false)} />;
  }

  // 装飾ショップ画面を表示中
  if (showCosmeticShop) {
    return <CosmeticShopScreen onBack={() => setShowCosmeticShop(false)} />;
  }

  return (
    <section className="screen active">
      <h2>設定</h2>

      <div className="card">
        <h3>プロフィール</h3>
        <button
          className="profile-edit-button"
          onClick={() => setShowProfileEdit(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdPerson size={24} color="var(--primary)" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              プロフィールを編集
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <button
          onClick={() => setShowTitleScreen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdEmojiEvents size={24} color="#f59e0b" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              称号
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <button
          onClick={() => setShowPrefectureSetting(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdLocationOn size={24} color="#3b82f6" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              都道府県
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0' }}>
          アイコン、名前、自己紹介などを編集
        </p>
      </div>

      <div className="card">
        <h3>ミッション・報酬</h3>
        <button
          onClick={() => setShowDailyMission(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdAssignment size={24} color="#667eea" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              デイリーミッション
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <button
          onClick={() => setShowCosmeticShop(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            background: 'var(--background)',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MdShoppingBag size={24} color="#f59e0b" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              装飾ショップ
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0' }}>
          ミッションをクリアしてポイントを獲得し、装飾を購入
        </p>
      </div>

      <div className="card">
        <h3>月間予算</h3>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="30000"
        />
        <button className="submit" onClick={handleSaveSettings}>
          <MdSave size={18} style={{ marginRight: '8px' }} />
          保存
        </button>
      </div>

      <div className="card">
        <h3>外観</h3>
        <div className="setting-item">
          <div className="setting-item-left">
            <div className="setting-icon">
              <MdDarkMode size={24} />
            </div>
            <span className="setting-label">ダークモード</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={toggleDarkMode}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="card">
        <h3>データエクスポート</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="submit" onClick={handleExportCSV} style={{ flex: 1 }}>
            <MdDescription size={18} style={{ marginRight: '8px' }} />
            CSV
          </button>
          <button className="submit" onClick={handleExportJSON} style={{ flex: 1 }}>
            <MdCode size={18} style={{ marginRight: '8px' }} />
            JSON
          </button>
        </div>
      </div>

      <div className="card">
        <h3>データ統計</h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
          <p>食事記録: {intakes.length}件</p>
          <p>支出記録: {expenses.length}件</p>
          <p>在庫アイテム: {stocks.length}件</p>
        </div>
      </div>

      <div className="card">
        <h3>アカウント</h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)', marginBottom: '12px' }}>
          <p>ログイン: {user?.email}</p>
        </div>
        <button
          className="submit"
          onClick={handleLogout}
          style={{
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            width: '100%'
          }}
        >
          <MdLogout size={18} style={{ marginRight: '8px' }} />
          ログアウト
        </button>
      </div>
    </section>
  );
};
