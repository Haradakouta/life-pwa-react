/**
 * Twitterスタイルの数値フォーマット
 * 1,000未満: そのまま表示（例: 856）
 * 1,000以上: K表記（例: 1.2K、15.6K）
 * 1,000,000以上: M表記（例: 1.2M）
 */
export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 1000000) {
    const k = count / 1000;
    // 小数点第1位まで表示、末尾の0は削除
    return k % 1 === 0 ? `${Math.floor(k)}K` : `${k.toFixed(1)}K`;
  }

  const m = count / 1000000;
  return m % 1 === 0 ? `${Math.floor(m)}M` : `${m.toFixed(1)}M`;
};

/**
 * 相対時間のフォーマット（Twitterスタイル）
 * 1分未満: 今
 * 1時間未満: 〇分
 * 24時間未満: 〇時間
 * 7日未満: 〇日
 * それ以降: 月日
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return '今';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}分`;
  }

  if (diffHours < 24) {
    return `${diffHours}時間`;
  }

  if (diffDays < 7) {
    return `${diffDays}日`;
  }

  // 7日以上前: 月日で表示
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

/**
 * 参加日のフォーマット（Twitterスタイル）
 * 例: "2024年10月からXを利用しています"
 */
export const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}年${month}月から利用しています`;
};
