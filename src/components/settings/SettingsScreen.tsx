/**
 * 設定画面コンポーネント
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore, useIntakeStore, useExpenseStore, useStockStore } from '../../store';
import { InquiryScreen } from './InquiryScreen';
import { getUnreadInquiryCount } from '../../utils/inquiry';
import { MdDarkMode, MdDescription, MdSave, MdLogout, MdPerson, MdChevronRight, MdEmojiEvents, MdLocationOn, MdAssignment, MdShoppingBag, MdHealthAndSafety, MdNotifications, MdNotificationsOff, MdLanguage, MdMail } from 'react-icons/md';
import { logout } from '../../utils/auth';
import { useAuth } from '../../hooks/useAuth';
import { ProfileEditScreen } from '../profile/ProfileEditScreen';
import { TitleScreen } from './TitleScreen';
import { PrefectureSettingScreen } from './PrefectureSettingScreen';
import { DailyMissionScreen } from '../mission/DailyMissionScreen';
import { CosmeticShopScreen } from '../cosmetic/CosmeticShopScreen';
import { HealthSettingScreen } from './HealthSettingScreen';
import { UpgradeButton } from '../subscription/UpgradeButton';
import { PrivacyPolicyScreen } from './PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './TermsOfServiceScreen';
import { FixedCostScreen } from './FixedCostScreen';
import { MdAutorenew } from 'react-icons/md';

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
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showFixedCost, setShowFixedCost] = useState(false);
  const [unreadInquiryCount, setUnreadInquiryCount] = useState(0);

  useEffect(() => {
    if (user) {
      getUnreadInquiryCount(user.uid).then(setUnreadInquiryCount);
    }
  }, [user, showInquiry]); // Re-check when closing inquiry screen


  const handleSaveSettings = () => {
    updateSettings({
      monthlyBudget: Number(budget),
    });
    alert(t('common.success'));
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
  // 健康情報設定画面を表示中
  if (showHealthSetting) {
    return <HealthSettingScreen onBack={() => setShowHealthSetting(false)} />;
  }

  // プライバシーポリシー画面を表示中
  if (showPrivacyPolicy) {
    return <PrivacyPolicyScreen onBack={() => setShowPrivacyPolicy(false)} />;
  }

  // 利用規約画面を表示中
  if (showTermsOfService) {
    return <TermsOfServiceScreen onBack={() => setShowTermsOfService(false)} />;
  }

  // 固定費管理画面を表示中
  if (showFixedCost) {
    return <FixedCostScreen onBack={() => setShowFixedCost(false)} />;
  }

  // お問い合わせ画面を表示中
  if (showInquiry) {
    return <InquiryScreen onBack={() => setShowInquiry(false)} />;
  }




  return (
    <section className="screen active">
      <h2>{t('settings.title')}</h2>

      <div className="card" style={{ background: 'linear-gradient(135deg, #fffbec 0%, #fff 100%)', border: '1px solid #fcd34d' }}>
        <h3 style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdEmojiEvents /> プレミアムプラン
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#b45309', marginBottom: '12px' }}>
          AI機能（レシート認識、食事アドバイス）を制限なく利用できます。
        </p>
        <UpgradeButton />
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdMail size={24} color="var(--primary)" />
          お問い合わせ・サポート
        </h3>
        <button
          onClick={() => setShowInquiry(true)}
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
            <div style={{ position: 'relative', display: 'flex' }}>
              <MdMail size={24} color="var(--primary)" />
              {unreadInquiryCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: 'red',
                  border: '2px solid var(--background)'
                }} />
              )}
            </div>
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              お問い合わせ
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
      </div>

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
        <h3>固定費・サブスク</h3>
        <button
          onClick={() => setShowFixedCost(true)}
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
            <MdAutorenew size={24} color="#ec4899" />
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              固定費・サブスク管理
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
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
        <h3>{t('settings.language.title')}</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          {t('settings.language.description')}
        </p>
        <div className="setting-item">
          <div className="setting-item-left">
            <div className="setting-icon">
              <MdLanguage size={24} />
            </div>
            <span className="setting-label">{t('settings.language.title')}</span>
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
            <option value="ja">{t('settings.language.japanese')}</option>
            <option value="en">{t('settings.language.english')}</option>
            <option value="zh-CN">{t('settings.language.chineseSimplified')}</option>
            <option value="zh-TW">{t('settings.language.chineseTraditional')}</option>
            <option value="ko">{t('settings.language.korean')}</option>
            <option value="vi">{t('settings.language.vietnamese')}</option>
            <option value="ru">{t('settings.language.russian')}</option>
            <option value="id">{t('settings.language.indonesian')}</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdDescription size={24} color="var(--primary)" />
          {t('settings.about.title', 'アプリについて')}
        </h3>
        <button
          onClick={() => setShowPrivacyPolicy(true)}
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
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              {t('settings.privacyPolicy', 'セキュリティポリシー')}
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <button
          onClick={() => setShowTermsOfService(true)}
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
            <span style={{ color: 'var(--text)', fontSize: '16px', fontWeight: '500' }}>
              {t('settings.termsOfService', '利用規約')}
            </span>
          </div>
          <MdChevronRight size={24} color="var(--text-secondary)" />
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>
          Version 1.0.0
        </p>
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
