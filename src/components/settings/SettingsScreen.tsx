/**
 * 設定画面コンポーネント
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, useIntakeStore, useExpenseStore, useStockStore } from '../../store';
import { MdDarkMode, MdDescription, MdCode, MdSave, MdLogout, MdPerson, MdChevronRight, MdEmojiEvents, MdLocationOn, MdAssignment, MdShoppingBag, MdHealthAndSafety, MdKey, MdVisibility, MdVisibilityOff, MdNotifications, MdNotificationsOff, MdLanguage } from 'react-icons/md';
import { logout } from '../../utils/auth';
import { useAuth } from '../../hooks/useAuth';
import { ProfileEditScreen } from '../profile/ProfileEditScreen';
import { TitleScreen } from './TitleScreen';
import { PrefectureSettingScreen } from './PrefectureSettingScreen';
import { DailyMissionScreen } from '../mission/DailyMissionScreen';
import { CosmeticShopScreen } from '../cosmetic/CosmeticShopScreen';
import { HealthSettingScreen } from './HealthSettingScreen';

/**
 * BMIを計算する関数
 * @param height 身長（cm）
 * @param weight 体重（kg）
 * @returns BMI値
 */
const calculateBMI = (height: number, weight: number): number => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * BMIカテゴリを取得する関数
 * @param bmi BMI値
 * @returns BMIカテゴリの文字列
 */
const getBMICategory = (bmi: number): string => {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'obese1';
  if (bmi < 35) return 'obese2';
  if (bmi < 40) return 'obese3';
  return 'obese4';
};

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
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
  const [showHealthSetting, setShowHealthSetting] = useState(false);
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  // 設定が変更されたらAPIキー入力欄を更新
  useEffect(() => {
    setApiKey(settings.geminiApiKey || '');
  }, [settings.geminiApiKey]);

  const handleSaveSettings = () => {
    updateSettings({
      monthlyBudget: Number(budget),
    });
    alert(t('common.success'));
  };

  const handleSaveApiKey = () => {
    updateSettings({
      geminiApiKey: apiKey.trim() || undefined,
    });
    alert(t('common.success'));
  };

  const handleExportCSV = () => {
    const csvData = [
      t('settings.export.csvHeader'),
      ...intakes.map(
        (intake) =>
          `${t('settings.export.mealRecord')},${intake.name},${intake.calories},${intake.price},${intake.date}`
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${t('settings.export.csvFilename')}${new Date().toISOString().split('T')[0]}.csv`;
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
    link.download = `${t('settings.export.jsonFilename')}${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleLogout = async () => {
    if (window.confirm(t('settings.account.logoutConfirm'))) {
      const result = await logout();
      if (result.error) {
        alert(t('settings.account.logoutError') + ': ' + result.error);
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

  // 健康情報設定画面を表示中
  if (showHealthSetting) {
    return <HealthSettingScreen onBack={() => setShowHealthSetting(false)} />;
  }

  return (
    <section className="screen active">
      <h2>{t('settings.title')}</h2>

      <div className="card">
        <h3>{t('settings.profile.title')}</h3>
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
              {t('settings.profile.edit')}
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
              {t('settings.title.title')}
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
              {t('settings.prefecture.title')}
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0' }}>
          {t('settings.profile.description')}
        </p>
      </div>

      <div className="card">
        <h3>{t('settings.cosmetic.title')}</h3>
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
              {t('settings.cosmetic.change')}
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0' }}>
          {t('settings.cosmetic.description')}
        </p>
      </div>

      <div className="card">
        <h3>{t('settings.mission.title')}</h3>
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
              {t('settings.mission.daily')}
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0' }}>
          {t('settings.mission.description')}
        </p>
      </div>

      <div className="card">
        <h3>{t('settings.budget.title')}</h3>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={t('settings.budget.placeholder')}
        />
        <button className="submit" onClick={handleSaveSettings}>
          <MdSave size={18} style={{ marginRight: '8px' }} />
          {t('common.save')}
        </button>
      </div>

      <div className="card">
        <h3>{t('settings.appearance.title')}</h3>
        <div className="setting-item">
          <div className="setting-item-left">
            <div className="setting-icon">
              <MdDarkMode size={24} />
            </div>
            <span className="setting-label">{t('settings.appearance.darkMode')}</span>
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
        <h3>{t('settings.notifications.title')}</h3>
        <div className="setting-item">
          <div className="setting-item-left">
            <div className="setting-icon">
              {settings.pushNotificationsEnabled !== false ? (
                <MdNotifications size={24} />
              ) : (
                <MdNotificationsOff size={24} />
              )}
            </div>
            <div>
              <span className="setting-label">{t('settings.notifications.push')}</span>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                {settings.pushNotificationsEnabled !== false
                  ? t('settings.notifications.enabled')
                  : t('settings.notifications.disabled')}
              </p>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.pushNotificationsEnabled !== false}
              onChange={async (e) => {
                const enabled = e.target.checked;
                await updateSettings({ pushNotificationsEnabled: enabled });
                
                if (enabled) {
                  // プッシュ通知を有効化
                  try {
                    const { initializePushNotifications } = await import('../../utils/pushNotification');
                    await initializePushNotifications();
                    alert(t('common.success'));
                  } catch (error) {
                    console.error('Error enabling push notifications:', error);
                    alert(t('common.error'));
                  }
                } else {
                  alert(t('common.success'));
                }
              }}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="card">
        <h3>{t('settings.language.title', '言語')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {t('settings.language.description', 'アプリの表示言語を選択')}
        </p>
        <div className="setting-item">
          <div className="setting-item-left">
            <div className="setting-icon">
              <MdLanguage size={24} />
            </div>
            <span className="setting-label">{t('settings.language.title', '言語')}</span>
          </div>
          <select
            value={settings.language || i18n.language || 'ja'}
            onChange={(e) => {
              const newLanguage = e.target.value as string;
              updateSettings({ language: newLanguage });
            }}
            style={{
              padding: '8px 12px',
              fontSize: '14px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            <option value="ja">{t('settings.language.japanese', '日本語')}</option>
            <option value="en">{t('settings.language.english', 'English')}</option>
            <option value="zh-CN">{t('settings.language.chineseSimplified', '简体中文')}</option>
            <option value="zh-TW">{t('settings.language.chineseTraditional', '繁體中文')}</option>
            <option value="ko">{t('settings.language.korean', '한국어')}</option>
            <option value="vi">{t('settings.language.vietnamese', 'Tiếng Việt')}</option>
            <option value="ru">{t('settings.language.russian', 'Русский')}</option>
            <option value="id">{t('settings.language.indonesian', 'Bahasa Indonesia')}</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3>{t('settings.export.title')}</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="submit" onClick={handleExportCSV} style={{ flex: 1 }}>
            <MdDescription size={18} style={{ marginRight: '8px' }} />
            {t('settings.export.csv')}
          </button>
          <button className="submit" onClick={handleExportJSON} style={{ flex: 1 }}>
            <MdCode size={18} style={{ marginRight: '8px' }} />
            {t('settings.export.json')}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdHealthAndSafety size={24} color="var(--primary)" />
          {t('settings.health.title')}
        </h3>
        <button
          onClick={() => setShowHealthSetting(true)}
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
            <MdHealthAndSafety size={24} color="var(--primary)" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              {t('settings.health.set')}
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
          {settings.age && (
            <p style={{ marginBottom: '8px' }}>
              <strong>{t('settings.health.age')}:</strong> {settings.age}{t('settings.health.years')}
            </p>
          )}
          {settings.height && (
            <p style={{ marginBottom: '8px' }}>
              <strong>{t('settings.health.height')}:</strong> {settings.height}{t('settings.health.cm')}
            </p>
          )}
          {settings.weight && (
            <p style={{ marginBottom: '8px' }}>
              <strong>{t('settings.health.weight')}:</strong> {settings.weight}{t('settings.health.kg')}
            </p>
          )}
          {settings.height && settings.weight && (
            <p style={{ marginBottom: '8px', color: 'var(--primary)', fontWeight: '600' }}>
              <strong>{t('settings.health.bmi')}:</strong> {calculateBMI(settings.height, settings.weight).toFixed(1)} ({t(`bmi.${getBMICategory(calculateBMI(settings.height, settings.weight))}`)})
            </p>
          )}
          {settings.savings !== undefined && settings.savings !== null && (
            <p style={{ marginBottom: '8px', marginTop: '12px' }}>
              <strong>{t('settings.health.savings')}:</strong> ¥{settings.savings.toLocaleString()}
            </p>
          )}
          {(!settings.age && !settings.height && !settings.weight && settings.savings === undefined) && (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
              {t('settings.health.notSet')}
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdKey size={24} color="var(--primary)" />
          {t('settings.ai.title')}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {t('settings.ai.description')}
          <br />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary)', textDecoration: 'underline' }}
          >
            {t('settings.ai.getKey')}
          </a>
        </p>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t('settings.ai.placeholder')}
            style={{
              width: '100%',
              padding: '12px 40px 12px 12px',
              fontSize: '14px',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              background: 'var(--background)',
              color: 'var(--text)',
            }}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showApiKey ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
          </button>
        </div>
        <button className="submit" onClick={handleSaveApiKey}>
          <MdSave size={18} style={{ marginRight: '8px' }} />
          {t('settings.ai.save')}
        </button>
        {settings.geminiApiKey && (
          <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '8px', marginBottom: '0' }}>
            {t('settings.ai.saved')}
          </p>
        )}
      </div>

      <div className="card">
        <h3>{t('settings.stats.title')}</h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
          <p>{t('settings.stats.intakes')}: {intakes.length}{t('settings.stats.items')}</p>
          <p>{t('settings.stats.expenses')}: {expenses.length}{t('settings.stats.items')}</p>
          <p>{t('settings.stats.stocks')}: {stocks.length}{t('settings.stats.items')}</p>
        </div>
      </div>

      <div className="card">
        <h3>{t('settings.account.title')}</h3>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)', marginBottom: '12px' }}>
          <p>{t('settings.account.login')}: {user?.email}</p>
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
          {t('settings.account.logout')}
        </button>
      </div>
    </section>
  );
};
