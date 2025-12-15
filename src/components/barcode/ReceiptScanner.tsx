/**
 * レシートスキャナーコンポーネント
 * Simple Direct Flow (2025-12-10)
 */
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { scanReceipt, type ReceiptOCRResult } from '../../api/vision';
import { MdCameraAlt, MdClose, MdReceiptLong } from 'react-icons/md';
import { ProGate } from '../subscription/ProGate';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// --- Styled Components & Animations ---

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ContentCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
  position: relative;
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: white;
  text-align: center;
`;

const Description = styled.p`
  font-size: 14px;
  color: #94a3b8;
  text-align: center;
  margin: 0;
  line-height: 1.6;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  
  &:active {
    transform: scale(0.98);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  &:active {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const LoadingBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 24px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0; width: 50%;
    background: #22c55e;
    animation: ${shimmer} 1.5s infinite linear;
    background: linear-gradient(90deg, transparent, #22c55e, transparent);
  }
`;

interface ReceiptScannerProps {
  onReceiptScanned: (result: ReceiptOCRResult) => void;
  onClose: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onReceiptScanned,
  onClose,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-trigger camera on mount (Restored for seamless flow)
  useEffect(() => {
    if (fileInputRef.current && !isProcessing && !error) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // User cancelled camera, do nothing (stay on this screen so they can retry or close)
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Give visual feedback
    if (navigator.vibrate) navigator.vibrate(50);

    try {
      const result = await scanReceipt(file);
      onReceiptScanned(result);

      // Update stats
      import('../../config/firebase').then(({ auth }) => {
        if (auth.currentUser) {
          import('../../utils/profile').then(({ getUserProfile, updateUserStats }) => {
            getUserProfile(auth.currentUser!.uid).then((profile) => {
              if (profile) {
                const currentCount = profile.stats.barcodeScanCount || 0;
                updateUserStats(auth.currentUser!.uid, {
                  barcodeScanCount: currentCount + 1
                }).catch(err => console.error(err));
              }
            });
          });
        }
      });
    } catch (err: any) {
      console.error('OCR Error:', err);
      setError(t('barcode.receiptScanner.ocrError') || '読み取りに失敗しました。');
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Processing View (Full Screen, No Close Button to prevent interruption)
  if (isProcessing) {
    return (
      <Container>
        <LoadingOverlay>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔮</div>
          <div style={{ fontWeight: 600, fontSize: '18px' }}>読み取り中...</div>
          <div style={{ fontSize: '13px', opacity: 0.7, marginTop: '8px' }}>解析しています...</div>
          <LoadingBar />
        </LoadingOverlay>
      </Container>
    );
  }

  // 2. Initial / Retry View
  return (
    <Container>
      <CloseButton onClick={onClose}>
        <MdClose size={24} />
      </CloseButton>

      {/* Hidden inputs */}
      <ProGate
        featureName={t('barcode.receiptScanner.title')}
        description="レシートOCRはプレミアム機能です。"
        lockType="overlay"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </ProGate>

      <ContentCard>
        <IconWrapper>
          <MdReceiptLong size={40} color="white" />
        </IconWrapper>

        <Title>{t('barcode.receiptScanner.title')}</Title>

        {error ? (
          <div style={{
            width: '100%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '12px',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : (
          <Description>レシートを撮影してください</Description>
        )}

        <ActionButton onClick={() => fileInputRef.current?.click()}>
          <MdCameraAlt size={22} />
          カメラを起動
        </ActionButton>
      </ContentCard>
    </Container>
  );
};
