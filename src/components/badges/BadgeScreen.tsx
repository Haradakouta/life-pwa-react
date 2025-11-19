/**
 * バッジ画面
 */
import { useTranslation } from 'react-i18next';
import { BadgeList } from './BadgeList';

export function BadgeScreen() {
  const { t } = useTranslation();
  return (
    <section className="screen active">
      <h2>{t('badges.screenTitle')}</h2>
      <div className="card">
        <BadgeList />
      </div>
    </section>
  );
}
