/**
 * 設定画面コンポーネント
 */
import React, { useState } from 'react';
import { useSettingsStore, useIntakeStore, useExpenseStore, useStockStore } from '../../store';
import { MdDarkMode, MdDescription, MdCode, MdSave, MdLogout } from 'react-icons/md';
import { logout } from '../../utils/auth';
import { useAuth } from '../../hooks/useAuth';
import { NotificationSettings } from './NotificationSettings';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, toggleDarkMode } = useSettingsStore();
  const { intakes } = useIntakeStore();
  const { expenses } = useExpenseStore();
  const { stocks } = useStockStore();
  const { user } = useAuth();

  const [budget, setBudget] = useState((settings.monthlyBudget ?? 30000).toString());

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

  return (
    <section className="screen active">
      <h2>設定</h2>

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
        <NotificationSettings />
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
