/**
 * 健康アドバイスモーダルコンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HealthWarning } from '../../utils/healthAdvisor';
import { getAIHealthAnalysis } from '../../utils/healthAdvisor';
import { MdWarning, MdClose, MdLightbulbOutline, MdAutoAwesome } from 'react-icons/md';

interface HealthAdvisorModalProps {
  productName: string;
  warning: HealthWarning;
  onClose: () => void;
  onAddAlternative: (alternative: string) => void;
  onContinueAnyway: () => void;
}

export const HealthAdvisorModal: React.FC<HealthAdvisorModalProps> = ({
  productName,
  warning,
  onClose,
  onAddAlternative,
  onContinueAnyway,
}) => {
  const { t } = useTranslation();
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiWarning, setAiWarning] = useState<HealthWarning | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleAIAnalysis = async () => {
    setIsLoadingAI(true);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const analysis = await getAIHealthAnalysis(productName, apiKey);
    setAiWarning(analysis);
    setShowAIAnalysis(true);
    setIsLoadingAI(false);
  };

  const currentWarning = showAIAnalysis && aiWarning ? aiWarning : warning;

  return (
    <div
      className="modal"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          background: 'var(--card)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
          }}
        >
          <MdClose size={24} />
        </button>

        {/* ヘッダー */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <MdWarning size={32} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t('shopping.healthAdvisor.title')}</h3>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
            }}
          >
            {t('shopping.healthAdvisor.about', { productName })}
          </p>
        </div>

        {/* 警告内容 */}
        <div
          style={{
            background: '#fef3c7',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            borderLeft: '4px solid #f59e0b',
          }}
        >
          <h4
            style={{
              margin: '0 0 8px 0',
              fontSize: '1rem',
              color: '#92400e',
            }}
          >
            {t('shopping.healthAdvisor.category', { category: currentWarning.category })}
          </h4>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#78350f',
              lineHeight: '1.6',
            }}
          >
            {currentWarning.reason}
          </p>
        </div>

        {/* 代替案 */}
        <div style={{ marginBottom: '20px' }}>
          <h4
            style={{
              margin: '0 0 12px 0',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MdLightbulbOutline size={20} color="#10b981" />
            {t('shopping.healthAdvisor.alternatives')}
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {currentWarning.alternatives.map((alt, index) => (
              <button
                key={index}
                onClick={() => onAddAlternative(alt)}
                style={{
                  background: '#f0fdf4',
                  border: '2px solid #10b981',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  color: '#15803d',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dcfce7';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                ✓ {alt}
              </button>
            ))}
          </div>
        </div>

        {/* AI詳細分析ボタン */}
        {!showAIAnalysis && (
          <button
            onClick={handleAIAnalysis}
            disabled={isLoadingAI}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isLoadingAI ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isLoadingAI ? 0.6 : 1,
            }}
          >
            <MdAutoAwesome size={20} />
            {isLoadingAI ? t('shopping.healthAdvisor.aiAnalyzing') : t('shopping.healthAdvisor.aiAnalysis')}
          </button>
        )}

        {/* アクション */}
        <div style={{ display: 'grid', gap: '8px' }}>
          <button
            onClick={onContinueAnyway}
            style={{
              padding: '12px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {t('shopping.healthAdvisor.continueAnyway')}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {t('shopping.healthAdvisor.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};
