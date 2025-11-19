/**
 * 健康情報設定画面コンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdHealthAndSafety, MdSave } from 'react-icons/md';
import { useSettingsStore } from '../../store';

interface HealthSettingScreenProps {
    onBack: () => void;
}

/**
 * BMIを計算する関数
 */
const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
};

/**
 * BMIカテゴリを取得する関数
 */
const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'obese1';
    if (bmi < 35) return 'obese2';
    if (bmi < 40) return 'obese3';
    return 'obese4';
};

export const HealthSettingScreen: React.FC<HealthSettingScreenProps> = ({ onBack }) => {
    const { t } = useTranslation();
    const { settings, updateSettings } = useSettingsStore();
    const [age, setAge] = useState(settings.age?.toString() || '');
    const [height, setHeight] = useState(settings.height?.toString() || '');
    const [weight, setWeight] = useState(settings.weight?.toString() || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const weightValue = weight ? Number(weight) : undefined;
            const today = new Date().toISOString();

            // 体重が入力されている場合、体重履歴も更新
            let weightHistory = settings.weightHistory || [];
            if (weightValue && weightValue > 0) {
                const newRecord = {
                    date: today,
                    weight: weightValue,
                };

                // 同じ日の記録があれば更新、なければ追加
                const existingIndex = weightHistory.findIndex(
                    (record) => record.date.startsWith(today.split('T')[0])
                );

                if (existingIndex >= 0) {
                    weightHistory = [...weightHistory];
                    weightHistory[existingIndex] = newRecord;
                } else {
                    weightHistory = [...weightHistory, newRecord];
                }

                // 最新の記録順にソート（最新が先頭）
                weightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            }

            await updateSettings({
                age: age ? Number(age) : undefined,
                height: height ? Number(height) : undefined,
                weight: weightValue,
                weightHistory: weightHistory.length > 0 ? weightHistory : undefined,
                lastWeightInputDate: weightValue ? today : settings.lastWeightInputDate,
            });
            alert(t('settings.health.saved'));
            onBack();
        } catch (error) {
            console.error('健康情報の保存エラー:', error);
            alert(t('settings.health.saveFailed'));
        } finally {
            setSaving(false);
        }
    };

    // BMI計算（リアルタイム表示）
    const bmi = height && weight ? calculateBMI(Number(height), Number(weight)) : null;
    const bmiCategory = bmi ? getBMICategory(bmi) : null;

    return (
        <section className="screen active">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '8px',
                        borderRadius: '8px',
                        color: 'var(--text)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--hover)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <MdArrowBack size={24} />
                </button>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdHealthAndSafety size={24} color="var(--primary)" />
                    {t('settings.health.title')}
                </h2>
            </div>

            <div className="card">
                <h3>{t('settings.health.basicInfo')}</h3>
                <label>{t('settings.health.age')} ({t('settings.health.years')})</label>
                <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="例: 30"
                    min="1"
                    max="150"
                />

                <label>{t('settings.health.height')} ({t('settings.health.cm')})</label>
                <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="例: 170"
                    min="1"
                    max="300"
                />

                <label>{t('settings.health.weight')} ({t('settings.health.kg')})</label>
                <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={t('settings.health.weightPlaceholder')}
                    min="1"
                    max="300"
                    step="0.1"
                />

                {bmi && (
                    <div
                        style={{
                            marginTop: '16px',
                            padding: '12px',
                            background: bmi >= 18.5 && bmi < 25 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            border: `2px solid ${bmi >= 18.5 && bmi < 25 ? '#10b981' : '#f59e0b'}`,
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <MdHealthAndSafety size={20} color={bmi >= 18.5 && bmi < 25 ? '#10b981' : '#f59e0b'} />
                            <strong style={{ color: 'var(--text)' }}>BMI: {bmi.toFixed(1)}</strong>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                            {t('settings.health.category')}: {t(`bmi.${bmiCategory}`)}
                        </p>
                    </div>
                )}

                <button className="submit" onClick={handleSave} disabled={saving} style={{ marginTop: '16px' }}>
                    <MdSave size={18} style={{ marginRight: '8px' }} />
                    {saving ? t('common.saving') : t('common.save')}
                </button>
            </div>

            <div className="card">
                <h3>{t('settings.health.about')}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {t('settings.health.aboutDescription')}
                </p>
                <ul style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>{t('settings.health.aboutList.bmi')}</li>
                    <li>{t('settings.health.aboutList.shopping')}</li>
                    <li>{t('settings.health.aboutList.meal')}</li>
                    <li>{t('settings.health.aboutList.weight')}</li>
                </ul>
            </div>
        </section>
    );
};


