/**
 * デイリーミッションデータ
 */
import type { DailyMission } from '../types/mission';

export const dailyMissions: DailyMission[] = [
  {
    id: 'mission_login',
    type: 'login',
    name: '日常の訪問',
    description: 'アプリにログインする',
    icon: '🚪',
    target: 1,
    points: 50,
    order: 1,
  },
  {
    id: 'mission_intake',
    type: 'intake',
    name: '食事の記録',
    description: '食事を記録する',
    icon: '🍽️',
    target: 1,
    points: 100,
    order: 2,
  },
  {
    id: 'mission_expense',
    type: 'expense',
    name: '支出の記録',
    description: '支出を記録する',
    icon: '💰',
    target: 1,
    points: 100,
    order: 3,
  },
  {
    id: 'mission_recipe',
    type: 'recipe',
    name: '創造の記録',
    description: 'レシピを作成する',
    icon: '🍳',
    target: 1,
    points: 150,
    order: 4,
  },
];




