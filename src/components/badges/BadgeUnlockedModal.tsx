/**
 * バッジ獲得モーダル（デカデカ表示版）
 */
import { useEffect, useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { useBadgeStore } from '../../store';
import { getBadgeDefinition } from '../../utils/badgeDefinitions';

export function BadgeUnlockedModal() {
  const { newBadges, clearNewBadges } = useBadgeStore();
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (newBadges.length > 0) {
      setCurrentBadgeIndex(0);
      setIsVisible(true);
    }
  }, [newBadges]);

  if (!isVisible || newBadges.length === 0) {
    return null;
  }

  const currentBadgeId = newBadges[currentBadgeIndex];
  const badgeDef = getBadgeDefinition(currentBadgeId);

  if (!badgeDef) {
    return null;
  }

  const handleNext = () => {
    if (currentBadgeIndex < newBadges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    clearNewBadges();
    setCurrentBadgeIndex(0);
  };

  return (
    <div className="badge-modal-overlay-fullscreen">
      <div className="badge-modal-fullscreen">
        <div className="badge-modal-content-fullscreen">
          {/* 背景の輝き */}
          <div className="badge-glow"></div>

          {/* メインコンテンツ */}
          <div className="badge-celebration-large">🎉</div>
          <div className="badge-icon-huge">{badgeDef.icon}</div>

          <h2 className="badge-title-huge">
            <MdCheckCircle size={48} style={{ color: '#10b981', marginRight: '12px' }} />
            バッジ獲得！
          </h2>

          <h3 className="badge-name-huge">{badgeDef.name}</h3>
          <p className="badge-description-large">{badgeDef.description}</p>

          {newBadges.length > 1 && (
            <div className="badge-progress-large">
              {currentBadgeIndex + 1} / {newBadges.length}
            </div>
          )}

          <div className="badge-buttons-large">
            {currentBadgeIndex < newBadges.length - 1 ? (
              <button className="badge-btn-large badge-btn-next" onClick={handleNext}>
                次へ
              </button>
            ) : (
              <button className="badge-btn-large badge-btn-ok" onClick={handleClose}>
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
