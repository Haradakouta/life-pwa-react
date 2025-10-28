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

  useEffect(() => {
    // 通知スケジュールを設定
    if (settings.notifications.enabled && permission === 'granted') {
      scheduleNotifications(settings.notifications);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.notifications.enabled, permission]);

  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      alert('このブラウザは通知をサポートしていません');
      return;
    }

    if (!settings.notifications.enabled) {
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
        ...settings.notifications,
        enabled: !settings.notifications.enabled,
      },
    };

    await updateSettings(newSettings);
  };

  const handleToggleMeal = async (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const newNotifications: NotificationSettingsType = {
      ...settings.notifications,
      [meal]: {
        ...settings.notifications[meal],
        enabled: !settings.notifications[meal].enabled,
      },
    };

    await updateSettings({ notifications: newNotifications });
  };

  const handleTimeChange = async (
    meal: 'breakfast' | 'lunch' | 'dinner',
    time: string
  ) => {
    const newNotifications: NotificationSettingsType = {
      ...settings.notifications,
      [meal]: {
        ...settings.notifications[meal],
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
              checked={settings.notifications.enabled}
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

        {settings.notifications.enabled && permission === 'granted' && (
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
                    checked={settings.notifications.breakfast.enabled}
                    onChange={() => handleToggleMeal('breakfast')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.notifications.breakfast.enabled && (
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={settings.notifications.breakfast.time}
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
                    checked={settings.notifications.lunch.enabled}
                    onChange={() => handleToggleMeal('lunch')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.notifications.lunch.enabled && (
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={settings.notifications.lunch.time}
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
                    checked={settings.notifications.dinner.enabled}
                    onChange={() => handleToggleMeal('dinner')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              {settings.notifications.dinner.enabled && (
                <div className="time-input-wrapper">
                  <input
                    type="time"
                    value={settings.notifications.dinner.time}
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
