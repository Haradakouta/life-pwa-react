/**
 * 通知ユーティリティ
 * Web Notification APIを使用した食事記録リマインダー
 */

import type { NotificationSettings } from '../types';

/**
 * 通知権限をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('このブラウザは通知をサポートしていません');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * 通知を送信
 */
export function sendNotification(title: string, options?: NotificationOptions): void {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options,
    });
  }
}

/**
 * 食事記録リマインダーを送信
 */
export function sendMealReminder(mealType: 'breakfast' | 'lunch' | 'dinner'): void {
  const mealNames = {
    breakfast: '朝食',
    lunch: '昼食',
    dinner: '夕食',
  };

  const emojis = {
    breakfast: '🍳',
    lunch: '🍱',
    dinner: '🍽️',
  };

  sendNotification(`${emojis[mealType]} ${mealNames[mealType]}の記録をお忘れなく！`, {
    body: '食事の記録を追加して、健康管理を続けましょう',
    tag: `meal-reminder-${mealType}`,
    requireInteraction: false,
  });
}

/**
 * 通知スケジュールを設定
 */
export function scheduleNotifications(settings: NotificationSettings): void {
  if (!settings.enabled) {
    clearAllSchedules();
    return;
  }

  // 既存のスケジュールをクリア
  clearAllSchedules();

  // 各食事時間の通知をスケジュール
  if (settings.breakfast.enabled) {
    scheduleNotification('breakfast', settings.breakfast.time);
  }
  if (settings.lunch.enabled) {
    scheduleNotification('lunch', settings.lunch.time);
  }
  if (settings.dinner.enabled) {
    scheduleNotification('dinner', settings.dinner.time);
  }
}

/**
 * 特定の時間に通知をスケジュール
 */
function scheduleNotification(mealType: 'breakfast' | 'lunch' | 'dinner', time: string): void {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

  // 今日の時刻が過ぎていたら明日にスケジュール
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delay = scheduledTime.getTime() - now.getTime();

  const timeoutId = setTimeout(() => {
    sendMealReminder(mealType);
    // 24時間後に再スケジュール
    scheduleNotification(mealType, time);
  }, delay);

  // タイムアウトIDを保存
  saveScheduleId(mealType, timeoutId);
}

/**
 * すべてのスケジュールをクリア
 */
function clearAllSchedules(): void {
  const schedules = getScheduleIds();
  schedules.forEach((id) => clearTimeout(id));
  localStorage.removeItem('notification-schedules');
}

/**
 * スケジュールIDを保存
 */
function saveScheduleId(_mealType: string, timeoutId: number): void {
  const schedules = getScheduleIds();
  schedules.push(timeoutId);
  localStorage.setItem('notification-schedules', JSON.stringify(schedules));
}

/**
 * スケジュールIDを取得
 */
function getScheduleIds(): number[] {
  const stored = localStorage.getItem('notification-schedules');
  return stored ? JSON.parse(stored) : [];
}

/**
 * 通知が利用可能かチェック
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * 通知権限の状態を取得
 */
export function getNotificationPermission(): NotificationPermission | null {
  if (!('Notification' in window)) {
    return null;
  }
  return Notification.permission;
}
