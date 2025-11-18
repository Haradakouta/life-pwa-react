/**
 * 都道府県設定画面
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../utils/profile';
import { prefectures, getPrefectureByCode } from '../../types/prefecture';
import { MdLocationOn, MdInfo } from 'react-icons/md';

interface PrefectureSettingScreenProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export const PrefectureSettingScreen: React.FC<PrefectureSettingScreenProps> = ({ onBack, onComplete }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [currentPrefecture, setCurrentPrefecture] = useState<string | undefined>(undefined);
  const [prefectureChangedAt, setPrefectureChangedAt] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setCurrentPrefecture(profile.prefecture);
          setSelectedPrefecture(profile.prefecture || '');
          setPrefectureChangedAt(profile.prefectureChangedAt);
        }
      } catch (error) {
        console.error('プロフィール取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const canChangePrefecture = (): boolean => {
    if (!prefectureChangedAt) return true; // 未設定の場合は変更可能

    const lastChanged = new Date(prefectureChangedAt);
    const now = new Date();
    const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceChange >= 30;
  };

  const getDaysUntilChange = (): number => {
    if (!prefectureChangedAt) return 0;

    const lastChanged = new Date(prefectureChangedAt);
    const now = new Date();
    const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));

    return Math.max(0, 30 - daysSinceChange);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!selectedPrefecture) {
      setError(t('settings.prefecture.selectRequired'));
      return;
    }

    // 変更可能かチェック
    if (currentPrefecture && !canChangePrefecture()) {
      const daysLeft = getDaysUntilChange();
      setError(t('settings.prefecture.changeLimit', { days: daysLeft }));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 都道府県が変更される場合、古い都道府県の称号を削除
      if (currentPrefecture && currentPrefecture !== selectedPrefecture) {
        const { removePrefectureTitles } = await import('../../utils/title');
        await removePrefectureTitles(user.uid, currentPrefecture);
      }

      await updateUserProfile(user.uid, {
        prefecture: selectedPrefecture,
        prefectureChangedAt: new Date().toISOString(),
      });

      // 新しい都道府県の称号をチェック
      const { checkAndGrantTitles } = await import('../../utils/title');
      await checkAndGrantTitles(user.uid);

      if (onComplete) {
        onComplete();
      } else if (onBack) {
        onBack();
      }
    } catch (error: unknown) {
      console.error('都道府県設定エラー:', error);
      setError(t('settings.prefecture.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 12px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        読み込み中...
      </div>
    );
  }

  const daysLeft = getDaysUntilChange();
  const canChange = canChangePrefecture();

  return (
    <div style={{ padding: '16px' }}>
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
            marginBottom: '16px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--background)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <MdLocationOn size={24} color="var(--text)" />
        </button>
      )}

      <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
        都道府県を設定
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
        都道府県を選択してください（30日に1回のみ変更可能）
      </p>

      {currentPrefecture && !canChange && (
        <div style={{
          padding: '12px',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#856404',
        }}>
          <MdInfo size={20} />
          <span style={{ fontSize: '14px' }}>
            現在の都道府県: {getPrefectureByCode(currentPrefecture)?.name}。あと{daysLeft}日で変更可能です。
          </span>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>
          <MdLocationOn size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          都道府県
        </label>
        <select
          value={selectedPrefecture}
          onChange={(e) => setSelectedPrefecture(e.target.value)}
          disabled={!canChange && !!currentPrefecture}
          required
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            fontSize: '16px',
            background: canChange || !currentPrefecture ? 'var(--card)' : 'var(--background)',
            color: 'var(--text)',
            cursor: canChange || !currentPrefecture ? 'pointer' : 'not-allowed',
            opacity: canChange || !currentPrefecture ? 1 : 0.6,
          }}
        >
          <option value="">選択してください</option>
          {prefectures.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          background: '#ffebee',
          border: '1px solid #f44336',
          borderRadius: '8px',
          color: '#c62828',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || (!canChange && !!currentPrefecture)}
        style={{
          width: '100%',
          padding: '14px',
          background: (canChange || !currentPrefecture) && !saving ? 'var(--primary)' : 'var(--border)',
          color: (canChange || !currentPrefecture) && !saving ? 'white' : 'var(--text-secondary)',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: (canChange || !currentPrefecture) && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
        }}
      >
        {saving ? '保存中...' : currentPrefecture ? '都道府県を変更' : '都道府県を設定'}
      </button>
    </div>
  );
};

