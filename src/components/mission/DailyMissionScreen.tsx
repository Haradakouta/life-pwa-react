/**
 * デイリーミッション画面
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserMissionData, checkAndUpdateMissions, getUserTotalPoints } from '../../utils/mission';
import { dailyMissions } from '../../data/missions';
import type { MissionProgress } from '../../types/mission';
import { MdRefresh, MdCheckCircle, MdRadioButtonUnchecked, MdArrowBack, MdEmojiEvents } from 'react-icons/md';
import { useIntakeStore, useExpenseStore } from '../../store';

interface DailyMissionScreenProps {
  onBack?: () => void;
}

export const DailyMissionScreen: React.FC<DailyMissionScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const intakeStore = useIntakeStore();
  const expenseStore = useExpenseStore();
  const [missionData, setMissionData] = useState<{ missions: MissionProgress[]; totalPoints: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMissionData();
    }
  }, [user]);

  const fetchMissionData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getUserMissionData(user.uid);
      const totalPoints = await getUserTotalPoints(user.uid);
      if (data) {
        setMissionData({
          missions: data.missions,
          totalPoints,
        });
      }
    } catch (error) {
      console.error('ミッションデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await checkAndUpdateMissions(user.uid, {
        intakeCount: intakeStore.intakes.length,
        expenseCount: expenseStore.expenses.length,
      });
      await fetchMissionData();
    } catch (error) {
      console.error('ミッション更新エラー:', error);
    } finally {
      setRefreshing(false);
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

  const getMissionProgress = (missionId: string): MissionProgress | undefined => {
    return missionData?.missions.find(m => m.missionId === missionId);
  };

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
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>デイリーミッション</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            opacity: refreshing ? 0.7 : 1,
          }}
        >
          {refreshing ? (
            <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <MdRefresh size={20} />
          )}
          更新
        </button>
      </div>

      {/* ポイント表示 */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        marginBottom: '24px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MdEmojiEvents size={32} />
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>累計ポイント</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>
              {missionData?.totalPoints || 0}
            </div>
          </div>
        </div>
      </div>

      {/* ミッション一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {dailyMissions.map(mission => {
          const progress = getMissionProgress(mission.id);
          const current = progress?.current || 0;
          const completed = progress?.completed || false;
          const percentage = Math.min((current / mission.target) * 100, 100);

          return (
            <div
              key={mission.id}
              style={{
                padding: '16px',
                background: completed ? 'var(--card)' : 'var(--background)',
                border: `2px solid ${completed ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '12px',
                opacity: completed ? 1 : 0.9,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{mission.icon}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                      {mission.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {mission.description}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {completed ? (
                    <MdCheckCircle size={24} color="var(--primary)" />
                  ) : (
                    <MdRadioButtonUnchecked size={24} color="var(--text-secondary)" />
                  )}
                  <div style={{
                    padding: '4px 12px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}>
                    +{mission.points}P
                  </div>
                </div>
              </div>
              
              {/* 進捗バー */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>{current} / {mission.target}</span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: 'var(--border)',
                  borderRadius: '9999px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: completed
                      ? 'linear-gradient(90deg, var(--primary) 0%, #43a047 100%)'
                      : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

