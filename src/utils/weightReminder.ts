/**
 * 週次体重入力リマインダー機能
 */

import { getFromStorage, saveToStorage } from './localStorage';

const WEIGHT_REMINDER_KEY = 'weight_reminder_last_shown';

/**
 * 今日が月曜日かどうかをチェック
 */
export function isMonday(): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = 日曜日, 1 = 月曜日, ...
  return dayOfWeek === 1;
}

/**
 * 今週の月曜日が既にリマインダーを表示したかどうかをチェック
 */
export function shouldShowWeightReminder(): boolean {
  if (!isMonday()) {
    return false;
  }

  const lastShownDate = getFromStorage<string>(WEIGHT_REMINDER_KEY, '');
  if (!lastShownDate) {
    return true;
  }

  const lastShown = new Date(lastShownDate);
  const today = new Date();
  
  // 今週の月曜日の日付を取得
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - (today.getDay() - 1));
  thisMonday.setHours(0, 0, 0, 0);

  // 最後に表示した日が今週の月曜日より前なら表示
  return lastShown < thisMonday;
}

/**
 * リマインダーを表示したことを記録
 */
export function markWeightReminderShown(): void {
  const today = new Date();
  saveToStorage(WEIGHT_REMINDER_KEY, today.toISOString());
}

/**
 * 今週の月曜日の日付を取得
 */
export function getThisMondayDate(): Date {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (today.getDay() - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

