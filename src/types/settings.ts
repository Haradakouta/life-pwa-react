/**
 * 設定（Settings）の型定義
 */

export interface NotificationTime {
  enabled: boolean;
  time: string; // "HH:MM" format
}

export interface NotificationSettings {
  enabled: boolean; // 通知全体のON/OFF
  breakfast: NotificationTime;
  lunch: NotificationTime;
  dinner: NotificationTime;
}

export interface Settings {
  monthlyBudget: number; // 月間予算
  darkMode: boolean; // ダークモード
  notifications: NotificationSettings; // 通知設定
  firstTime: boolean; // 初回起動フラグ（オンボーディング用）
}

export interface SettingsFormData {
  monthlyBudget: number;
  darkMode: boolean;
  notifications: NotificationSettings;
}
