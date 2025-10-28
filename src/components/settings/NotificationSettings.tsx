/**
 * 通知設定コンポーネント
 */
import { useState, useEffect } from 'react';
import { MdNotifications, MdNotificationsOff } from 'react-icons/md';
import { useSettingsStore } from '../../store/useSettingsStore';
import {
  requestNotificationPermission,
  scheduleNotifications,
  isNotificationSupported,
  getNotificationPermission,
} from '../../utils/notifications';
import type { NotificationSettings as NotificationSettingsType } from '../../types';

export function NotificationSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    getNotificationPermission()
  );

  // notifications が undefined の場合のフォールバック
  const notificationSettings = settings.notifications || {
    enabled: false,
    breakfast: { enabled: false, time: '07:00' },
    lunch: { enabled: false, time: '12:00' },
    dinner: { enabled: false, time: '18:00' },
  };

  useEffect(() => {
    // 通知スケジュールを設定
    if (notificationSettings.enabled && permission === 'granted') {
      scheduleNotifications(notificationSettings);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationSettings.enabled, permission]);

  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      alert('このブラウザは通知をサポートしていません');
      return;
    }

    if (!notificationSettings.enabled) {
      // 通知を有効化する場合、権限をリクエスト
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');

      if (!granted) {
        alert('通知を有効にするには、ブラウザの設定で通知を許可してください');
        return;
      }
    }

    // 設定を更新
    const newSettings = {
      notifications: {
        ...notificationSettings,
        enabled: !notificationSettings.enabled,
      },
    };

    await updateSettings(newSettings);
  };

  const handleToggleMeal = async (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const newNotifications: NotificationSettingsType = {
      ...notificationSettings,
      [meal]: {
        ...notificationSettings[meal],
        enabled: !notificationSettings[meal].enabled,
      },
    };

    await updateSettings({ notifications: newNotifications });
  };

  const handleTimeChange = async (
    meal: 'breakfast' | 'lunch' | 'dinner',
    time: string
  ) => {
    const newNotifications: NotificationSettingsType = {
      ...notificationSettings,
      [meal]: {
        ...notificationSettings[meal],
        time,
      },
    };

    await updateSettings({ notifications: newNotifications });
  };

  return (
    <div className="notification-settings">
      <div className="setting-section">
        <div className="setting-header">
          <h3>
            {settings.notifications.enabled ? (
              <MdNotifications size={24} />
            ) : (
              <MdNotificationsOff size={24} />
            )}
            食事記録リマインダー
          </h3>
          <p className="setting-description">
            指定した時間に食事記録の入力を促す通知を送信します
          </p>
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>通知を有効化</span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notificationSettings.enabled}
              onChange={handleToggleNotifications}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {permission === 'denied' && (
          <div className="notification-warning">
            <p>
              ⚠️ 通知が拒否されています。ブラウザの設定で通知を許可してください。
            </p>
          </div>
        )}

        {notificationSettings.enabled && permission === 'granted' && (
          <div className="meal-notifications">
            {/* 朝食 */}
            <div className="meal-notification-item">
              <div className="meal-header">
                <div className="meal-info">
                  <span className="meal-icon">🍳</span>
                  <span className="meal-name">朝食</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.breakfast.enabled}
                    onChange={() => handleToggleMeal('breakfast')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {notificationSettings.breakfast.enabled && (
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={notificationSettings.breakfast.time}
                    onChange={(e) => handleTimeChange('breakfast', e.target.value)}
                    className="time-input"
                  />
                </div>
              )}
            </div>

            {/* 昼食 */}
            <div className="meal-notification-item">
              <div className="meal-header">
                <div className="meal-info">
                  <span className="meal-icon">🍱</span>
                  <span className="meal-name">昼食</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.lunch.enabled}
                    onChange={() => handleToggleMeal('lunch')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {notificationSettings.lunch.enabled && (
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={notificationSettings.lunch.time}
                    onChange={(e) => handleTimeChange('lunch', e.target.value)}
                    className="time-input"
                  />
                </div>
              )}
            </div>

            {/* 夕食 */}
            <div className="meal-notification-item">
              <div className="meal-header">
                <div className="meal-info">
                  <span className="meal-icon">🍽️</span>
                  <span className="meal-name">夕食</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={notificationSettings.dinner.enabled}
                    onChange={() => handleToggleMeal('dinner')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {notificationSettings.dinner.enabled && (
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={notificationSettings.dinner.time}
                    onChange={(e) => handleTimeChange('dinner', e.target.value)}
                    className="time-input"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
