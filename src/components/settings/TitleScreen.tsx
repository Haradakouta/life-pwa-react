/**
 * 称号一覧・装備画面
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getUserTitles, equipTitle, getTitleById, checkAndGrantTitles } from '../../utils/title';
import { getUserProfile } from '../../utils/profile';
import { titles } from '../../data/titles';
import type { UserTitle } from '../../types/title';
import { TitleBadge } from '../common/TitleBadge';
import { MdCheckCircle, MdRadioButtonUnchecked, MdRefresh, MdInfo, MdArrowBack } from 'react-icons/md';

interface TitleScreenProps {
  onBack?: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userTitles, setUserTitles] = useState<UserTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newlyGranted, setNewlyGranted] = useState<string[]>([]);
  const [userPrefecture, setUserPrefecture] = useState<string | undefined>(undefined);

  // ユーザーの称号と都道府県を取得
  useEffect(() => {
    if (user) {
      fetchUserTitles();
      fetchUserPrefecture();
    }
  }, [user]);

  const fetchUserPrefecture = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      setUserPrefecture(profile?.prefecture);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
    }
  };

  const fetchUserTitles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const titles = await getUserTitles(user.uid);
      setUserTitles(titles);

      // 称号チェックを実行（新しく獲得できる称号がないか確認）
      const newlyGranted = await checkAndGrantTitles(user.uid);
      if (newlyGranted.length > 0) {
        setNewlyGranted(newlyGranted);
        // 再取得
        const updatedTitles = await getUserTitles(user.uid);
        setUserTitles(updatedTitles);
      }
    } catch (error) {
      console.error('称号取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;

    setRefreshing(true);
    try {
      const newlyGranted = await checkAndGrantTitles(user.uid);
      if (newlyGranted.length > 0) {
        setNewlyGranted(newlyGranted);
        alert(t('settings.honorific.newTitlesGranted', { count: newlyGranted.length }));
      } else {
        alert(t('settings.honorific.noNewTitles'));
      }

      const updatedTitles = await getUserTitles(user.uid);
      setUserTitles(updatedTitles);
    } catch (error) {
      console.error('称号チェックエラー:', error);
      alert(t('settings.honorific.checkFailed'));
    } finally {
      setRefreshing(false);
    }
  };

  const handleEquip = async (titleId: string) => {
    if (!user) return;

    try {
      await equipTitle(user.uid, titleId);
      // 再取得
      const updatedTitles = await getUserTitles(user.uid);
      setUserTitles(updatedTitles);
    } catch (error) {
      console.error('称号装備エラー:', error);
      alert(t('settings.honorific.equipFailed'));
    }
  };

  // 獲得済み称号IDのセット
  const earnedTitleIds = new Set(userTitles.map(t => t.titleId));
  const equippedTitleId = userTitles.find(t => t.isEquipped)?.titleId;

  // カテゴリ別にフィルタリング + 都道府県別称号は自分の都道府県のもののみ表示
  const filteredTitles = (selectedCategory === 'all'
    ? titles
    : titles.filter(t => t.category === selectedCategory)
  ).filter(title => {
    // 都道府県別称号の場合、自分の都道府県のもののみ表示
    if (title.condition.prefectureCode) {
      return title.condition.prefectureCode === userPrefecture;
    }
    return true; // 都道府県別称号でない場合は表示
  });

  // カテゴリ一覧
  const categories = [
    { id: 'all', name: t('settings.honorific.categories.all'), icon: '📋' },
    { id: 'beginner', name: t('settings.honorific.categories.beginner'), icon: '🎉' },
    { id: 'poster', name: t('settings.honorific.categories.poster'), icon: '📝' },
    { id: 'social', name: t('settings.honorific.categories.social'), icon: '⭐' },
    { id: 'recipe', name: t('settings.honorific.categories.recipe'), icon: '🍳' },
    { id: 'achievement', name: t('settings.honorific.categories.achievement'), icon: '🏆' },
    { id: 'prefecture', name: t('settings.honorific.categories.prefecture'), icon: '🗾' },
    { id: 'special', name: t('settings.honorific.categories.special'), icon: '👑' },
  ];

  return (
    <div style={{ padding: '16px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <MdArrowBack size={24} color="var(--text)" />
            </button>
          )}
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>{t('settings.honorific.title')}</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          <MdRefresh size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {t('settings.honorific.check')}
        </button>
      </div>

      {/* 新しく獲得した称号の通知 */}
      {newlyGranted.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '2px solid #fcd34d',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>
            {t('settings.honorific.newTitlesGranted', { count: newlyGranted.length })}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {newlyGranted.map(titleId => {
              const title = getTitleById(titleId);
              if (!title) return null;
              return <TitleBadge key={titleId} title={title} size="small" showName={true} />;
            })}
          </div>
        </div>
      )}

      {/* カテゴリフィルター */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '24px',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--card)',
              color: selectedCategory === cat.id ? 'white' : 'var(--text)',
              border: `1px solid ${selectedCategory === cat.id ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: '6px' }}>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 称号一覧 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 12px',
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          {t('common.loading')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTitles.map(title => {
            const isEarned = earnedTitleIds.has(title.id);
            const isEquipped = equippedTitleId === title.id;

            return (
              <div
                key={title.id}
                style={{
                  padding: '16px',
                  background: isEarned ? 'var(--card)' : 'var(--background)',
                  border: `2px solid ${isEarned ? 'var(--border)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  opacity: isEarned ? 1 : 0.5,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <TitleBadge title={title} size="medium" showName={true} />
                    {isEquipped && (
                      <span style={{
                        padding: '4px 8px',
                        background: 'var(--primary)',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        {t('settings.honorific.equipped')}
                      </span>
                    )}
                  </div>
                  {isEarned && (
                    <button
                      onClick={() => handleEquip(title.id)}
                      style={{
                        padding: '8px 16px',
                        background: isEquipped ? 'var(--primary)' : 'var(--background)',
                        color: isEquipped ? 'white' : 'var(--text)',
                        border: `1px solid ${isEquipped ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isEquipped ? (
                        <>
                          <MdCheckCircle size={18} />
                          {t('settings.honorific.equipped')}
                        </>
                      ) : (
                        <>
                          <MdRadioButtonUnchecked size={18} />
                          {t('settings.honorific.equip')}
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {title.description}
                </div>
                {!isEarned && (
                  <div style={{
                    padding: '8px',
                    background: 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <MdInfo size={14} />
                    {t('settings.honorific.notEarned')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

