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
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = 日曜日, 1 = 月曜日, ...

  // 今週の月曜日（または過去直近の月曜日）の00:00を取得
  // getDay(): Sun=0, Mon=1, Tue=2...
  // 月曜を起点(0)としたい場合: (dayOfWeek + 6) % 7
  // Mon(1) -> 0, Tue(2) -> 1, Sun(0) -> 6
  const dist = (dayOfWeek + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - dist);
  thisMonday.setHours(0, 0, 0, 0);

  const lastShownDate = getFromStorage<string>(WEIGHT_REMINDER_KEY, '');

  // まだ一度も表示していない場合は表示
  if (!lastShownDate) {
    return true;
  }

  const lastShown = new Date(lastShownDate);

  // 最後に表示した日時が、直近の月曜日より前であれば表示
  // (つまり、今週の月曜日以降まだ表示していない場合)
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

