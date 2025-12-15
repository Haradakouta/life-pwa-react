/**
 * デイリーミッション画面
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserMissionData, getUserTotalPoints } from '../../utils/mission';
import { dailyMissions } from '../../data/missions';
import type { MissionProgress } from '../../types/mission';
import { MdRefresh, MdArrowBack } from 'react-icons/md';

interface DailyMissionScreenProps {
  onBack?: () => void;
}

export const DailyMissionScreen: React.FC<DailyMissionScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [missionData, setMissionData] = useState<{ missions: MissionProgress[]; totalPoints: number; missionLevel: number; currentExp: number } | null>(null);
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
          missionLevel: data.missionLevel || 1,
          currentExp: data.currentExp || 0,
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

  const nextLevelExp = Math.floor(100 * Math.pow(missionData?.missionLevel || 1, 1.5));
  const currentExp = missionData?.currentExp || 0;
  const progressPercent = Math.min(100, (currentExp / nextLevelExp) * 100);

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
              }}
            >
              <MdArrowBack size={24} color="var(--text)" />
            </button>
          )}
          <h2 style={{ margin: 0 }}>ミッション</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            opacity: refreshing ? 0.5 : 1,
          }}
        >
          <MdRefresh size={24} />
        </button>
      </div>

      {/* Level & XP Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: 'white',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(118, 75, 162, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>Current Level</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{missionData?.missionLevel || 1}</div>
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            {currentExp} / {nextLevelExp} XP
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPercent}%`,
            background: '#fff',
            borderRadius: '4px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
        <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'right', opacity: 0.8 }}>
          あと {nextLevelExp - currentExp} XP でレベルアップ！
        </div>
      </div>

      {/* Mission List */}
      <h3 style={{ marginBottom: '12px' }}>常設ミッション</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {dailyMissions.map(mission => {
          const progress = missionData?.missions.find(m => m.missionId === mission.id);
          const current = progress?.current || 0;
          const target = progress?.target || mission.target;
          const isCompleted = progress?.completed || false;

          return (
            <div key={mission.id} style={{
              background: 'var(--card)',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              opacity: isCompleted ? 0.7 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Progress Bar Background */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '4px',
                width: `${Math.min(100, (current / target) * 100)}%`,
                background: 'var(--primary)',
                transition: 'width 0.3s ease'
              }} />

              <div style={{ fontSize: '32px' }}>{mission.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{mission.name}</div>
                  {isCompleted && (
                    <span style={{
                      fontSize: '12px',
                      background: 'var(--primary)',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      COMPLETED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{mission.description}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--primary)' }}>+{mission.points} XP & Point</span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {current} / {target}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
