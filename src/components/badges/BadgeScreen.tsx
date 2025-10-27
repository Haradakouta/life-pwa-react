/**
 * バッジ画面
 */
import { BadgeList } from './BadgeList';

export function BadgeScreen() {
  return (
    <section className="screen active">
      <h2>🏆 アチーブメント</h2>
      <div className="card">
        <BadgeList />
      </div>
    </section>
  );
}
