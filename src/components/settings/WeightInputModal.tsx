/**
 * 週次体重入力モーダルコンポーネント
 */
import React, { useState } from 'react';
import { MdClose, MdHealthAndSafety, MdSave } from 'react-icons/md';
import { useSettingsStore } from '../../store';
import type { WeightRecord } from '../../types/settings';
import { useTranslation } from 'react-i18next';

interface WeightInputModalProps {
  onClose: () => void;
}

export const WeightInputModal: React.FC<WeightInputModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettingsStore();
  const [weight, setWeight] = useState(settings.weight?.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!weight || Number(weight) <= 0) {
      alert(t('settings.health.weightRequired'));
      return;
    }

    setSaving(true);
    try {
      const weightValue = Number(weight);
      const today = new Date().toISOString();

      // 体重履歴を更新
      const weightHistory = settings.weightHistory || [];
      const newRecord: WeightRecord = {
        date: today,
        weight: weightValue,
      };

      // 同じ日の記録があれば更新、なければ追加
      const existingIndex = weightHistory.findIndex(
        (record) => record.date.startsWith(today.split('T')[0])
      );

      let updatedHistory: WeightRecord[];
      if (existingIndex >= 0) {
        updatedHistory = [...weightHistory];
        updatedHistory[existingIndex] = newRecord;
      } else {
        updatedHistory = [...weightHistory, newRecord];
      }

      // 最新の記録順にソート（最新が先頭）
      updatedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      await updateSettings({
        weight: weightValue,
        weightHistory: updatedHistory,
        lastWeightInputDate: today,
      });

      alert(t('settings.health.weightRecorded'));
      onClose();
    } catch (error) {
      console.error('体重の保存エラー:', error);
      alert(t('settings.health.weightSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', width: '90%' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '12px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdHealthAndSafety size={24} color="var(--primary)" />
            {t('settings.health.weeklyRecordTitle')}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <MdClose size={24} />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {t('settings.health.weeklyRecordDescription')}
        </p>

        <label>{t('settings.health.weightLabel')}</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={t('settings.health.weightPlaceholder')}
          min="1"
          max="300"
          step="0.1"
          autoFocus
        />

        {settings.height && weight && Number(weight) > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              borderRadius: '8px',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>
              <strong>BMI:</strong>{' '}
              {((Number(weight) / ((settings.height / 100) ** 2))).toFixed(1)}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--button-secondary-background)',
              color: 'var(--button-secondary-text)',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !weight || Number(weight) <= 0}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              opacity: saving || !weight || Number(weight) <= 0 ? 0.6 : 1,
            }}
          >
            <MdSave size={18} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            {saving ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};
