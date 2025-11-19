/**
 * バッジ一覧コンポーネント
 */
import { useBadgeStore } from '../../store';
import { BADGE_DEFINITIONS } from '../../utils/badgeDefinitions';
import type { BadgeCategory } from '../../types';
import { useTranslation } from 'react-i18next';

export function BadgeList() {
  const { t, i18n } = useTranslation();
  const { badges, isUnlocked, getUnlockedCount, getTotalCount } = useBadgeStore();

  const categories: BadgeCategory[] = ['streak', 'milestone', 'goal', 'feature'];

  const getBadgesByCategory = (category: BadgeCategory) => {
    return BADGE_DEFINITIONS.filter((def) => def.category === category);
  };

  return (
    <div className="badge-list">
      <div className="badge-summary">
        <h3>
          {t('badges.title')}{' '}
          <span className="badge-count">
            {getUnlockedCount()} / {getTotalCount()}
          </span>
        </h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(getUnlockedCount() / getTotalCount()) * 100}%`,
            }}
          />
        </div>
      </div>

      {categories.map((category) => {
        const categoryBadges = getBadgesByCategory(category);

        return (
          <div key={category} className="badge-category">
            <h4 className="category-title">{t(`badges.categories.${category}`)}</h4>
            <div className="badge-grid">
              {categoryBadges.map((def) => {
                const unlocked = isUnlocked(def.id);
                const badge = badges.find((b) => b.id === def.id);

                return (
                  <div
                    key={def.id}
                    className={`badge-item ${unlocked ? 'unlocked' : 'locked'}`}
                  >
                    <div className="badge-icon">{unlocked ? def.icon : '🔒'}</div>
                    <div className="badge-info">
                      <div className="badge-name">{def.name}</div>
                      <div className="badge-description">{def.description}</div>
                      {!unlocked && (
                        <div className="badge-requirement">{def.requirement}</div>
                      )}
                      {unlocked && badge?.unlockedAt && (
                        <div className="badge-unlocked-date">
                          {new Date(badge.unlockedAt).toLocaleDateString(i18n.language)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
