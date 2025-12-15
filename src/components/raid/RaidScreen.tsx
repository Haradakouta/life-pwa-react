import React, { useState, useEffect } from 'react';
import { getCurrentRaidBoss, getUserRaidData, attackRaidBoss } from '../../utils/raid';
import type { RaidBoss, UserRaidData } from '../../utils/raid';
import { useAuth } from '../../hooks/useAuth';
import { useIntakeStore, useExerciseStore } from '../../store';
import { MdFitnessCenter, MdRestaurant, MdWarning, MdFlashOn } from 'react-icons/md';

export const RaidScreen: React.FC = () => {
    const { user } = useAuth();
    const [boss, setBoss] = useState<RaidBoss | null>(null);
    const [userData, setUserData] = useState<UserRaidData | null>(null);
    const [loading, setLoading] = useState(true);
    const [attacking, setAttacking] = useState(false);
    const [attackMessage, setAttackMessage] = useState<string | null>(null);

    const intakeStore = useIntakeStore();
    const exerciseStore = useExerciseStore();

    const [availableDamage, setAvailableDamage] = useState(0);
    const [potentialStats, setPotentialStats] = useState({ meal: 0, exercise: 0 });

    useEffect(() => {
        fetchData();
    }, [user]);

    // データ同期と計算
    useEffect(() => {
        if (!userData) return;
        calculateDamageRights();
    }, [userData, intakeStore.intakes, exerciseStore.exercises]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [bossData, userRaidData] = await Promise.all([
                getCurrentRaidBoss(),
                getUserRaidData(user.uid)
            ]);
            setBoss(bossData);
            setUserData(userRaidData);
        } catch (error) {
            console.error('Failed to fetch raid data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDamageRights = () => {
        if (!userData) return;

        const today = new Date().toISOString().split('T')[0];

        // 1. 食時ダメージ計算 (1記録 = 500ダメージ, 上限1500)
        const todaysIntakes = intakeStore.getIntakesByDate(today);
        const mealDamagePotential = Math.min(todaysIntakes.length * 500, 1500);

        // 2. 運動ダメージ計算 (時間ベース: 1分 = 25ダメージ, 1日最大60分=1500ダメージ)
        const todaysExercises = exerciseStore.getExercisesByDate(today);
        const totalDuration = todaysExercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
        const cappedDuration = Math.min(totalDuration, 60);
        const exerciseDamagePotential = cappedDuration * 25;

        const totalPotential = mealDamagePotential + exerciseDamagePotential;
        const dealtToday = userData.dailyDamage[today] || 0;

        const available = Math.max(0, totalPotential - dealtToday);

        setPotentialStats({
            meal: mealDamagePotential,
            exercise: exerciseDamagePotential
        });
        setAvailableDamage(available);
    };

    const handleAttack = async () => {
        if (!user || attacking || availableDamage <= 0) return;
        setAttacking(true);
        setAttackMessage(null);

        // 蓄積されたダメージを一気に放出
        const result = await attackRaidBoss(user.uid, availableDamage);

        setAttackMessage(result.message);
        if (result.success) {
            await fetchData(); // データ更新（これにより availableDamage も再計算される）
        }
        setAttacking(false);
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Raid...</div>;
    if (!boss) return <div style={{ padding: '20px', textAlign: 'center' }}>No Active Raid</div>;

    const hpPercentage = (boss.hp / boss.maxHp) * 100;

    return (
        <div style={{ padding: '20px', paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
            <div
                style={{
                    background: 'linear-gradient(135deg, #2a0845 0%, #6441a5 100%)',
                    borderRadius: '24px',
                    padding: '24px',
                    color: 'white',
                    boxShadow: '0 10px 30px rgba(42, 8, 69, 0.5)',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ margin: '0 0 16px', fontSize: '24px', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        BOSS: {boss.name}
                    </h2>

                    <div style={{
                        height: '240px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '80px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* モンスター画像 */}
                        <img
                            src="/assets/monsters/jankfoodgorem.png"
                            alt="Junk Food Golem"
                            style={{
                                height: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))'
                            }}
                        />
                    </div>

                    {/* HP Bar */}
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
                        <span>HP</span>
                        <span>{boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}</span>
                    </div>
                    <div style={{ width: '100%', height: '16px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${hpPercentage}%`,
                                height: '100%',
                                background: hpPercentage > 50 ? '#4ade80' : hpPercentage > 20 ? '#facc15' : '#ef4444',
                                transition: 'width 0.5s ease-out'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdFlashOn size={24} color="#f59e0b" />
                    攻撃パワーチャージ
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {/* 食事ステータス */}
                    <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#059669', fontWeight: 700 }}>
                            <MdRestaurant />
                            食事パワー
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669' }}>
                            {potentialStats.meal} <span style={{ fontSize: '14px', fontWeight: 600 }}>/ 1500</span>
                        </div>
                    </div>

                    {/* 運動ステータス */}
                    <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#2563eb', fontWeight: 700 }}>
                            <MdFitnessCenter />
                            運動パワー (時間)
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: '#2563eb' }}>
                            {potentialStats.exercise} <span style={{ fontSize: '14px', fontWeight: 600 }}>/ 1500</span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', opacity: 0.8 }}>
                            {Math.min(exerciseStore.getExercisesByDate(new Date().toISOString().split('T')[0]).reduce((sum, ex) => sum + (ex.duration || 0), 0), 60)} / 60 min
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>攻撃可能ダメージ</div>
                    <div style={{ fontSize: '48px', fontWeight: 900, color: availableDamage > 0 ? '#ef4444' : 'var(--text-secondary)', textShadow: availableDamage > 0 ? '0 2px 4px rgba(239, 68, 68, 0.3)' : 'none' }}>
                        {availableDamage.toLocaleString()}
                    </div>
                </div>

                <button
                    onClick={handleAttack}
                    disabled={attacking || boss.status === 'defeated' || availableDamage <= 0}
                    style={{
                        width: '100%',
                        padding: '20px',
                        background: availableDamage > 0 ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'var(--border)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '20px',
                        fontWeight: 800,
                        cursor: attacking || boss.status === 'defeated' || availableDamage <= 0 ? 'not-allowed' : 'pointer',
                        opacity: attacking || boss.status === 'defeated' ? 0.7 : 1,
                        boxShadow: availableDamage > 0 ? '0 8px 20px rgba(239, 68, 68, 0.4)' : 'none',
                        transform: attacking ? 'scale(0.98)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}
                >
                    {attacking ? '攻撃中...' : boss.status === 'defeated' ? '討伐完了！' : availableDamage > 0 ? '全パワー放出！！' : 'パワー不足'}
                </button>

                {attackMessage && (
                    <div style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <MdWarning />
                        {attackMessage}
                    </div>
                )}

                <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>累計ダメージ</span>
                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{userData?.totalDamage.toLocaleString() || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
