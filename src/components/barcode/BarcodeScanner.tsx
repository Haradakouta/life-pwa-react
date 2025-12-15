/**
 * バーコードスキャナーコンポーネント
 * ZXing (Zebra Crossing) ライブラリを使用
 * Enhanced Design & UX (2025-12-10)
 */
import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { useTranslation } from 'react-i18next';
import { searchProductByJAN } from '../../api/rakuten';
import type { ProductInfo } from '../../types';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { MdClose, MdQrCodeScanner } from 'react-icons/md';

// --- Styled Components & Animations ---

const scanAnimation = keyframes`
  0% { transform: translateY(0); opacity: 0.5; }
  50% { transform: translateY(150px); opacity: 1; }
  100% { transform: translateY(0); opacity: 0.5; }
`;

const pulseAnimation = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background: #000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.2s;

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }
`;

const CameraView = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;



const ScanFrame = styled.div`
  position: absolute;
  width: 80vw;
  max-width: 320px;
  height: 200px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6); // 周りを暗くする簡単な方法
  z-index: 10;
  overflow: hidden;

  // コーナーのアクセント
  &::before, &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-color: #22c55e;
    border-style: solid;
    transition: all 0.3s;
  }

  &::before {
    top: -2px;
    left: -2px;
    border-width: 4px 0 0 4px;
    border-top-left-radius: 16px;
  }

  &::after {
    bottom: -2px;
    right: -2px;
    border-width: 0 4px 4px 0;
    border-bottom-right-radius: 16px;
  }
`;

const ScanLine = styled.div`
  position: absolute;
  top: 10%;
  left: 5%;
  right: 5%;
  height: 2px;
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
  animation: ${scanAnimation} 2s infinite ease-in-out;
`;

const StatusBadge = styled.div<{ isError?: boolean }>`
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.isError ? 'rgba(239, 68, 68, 0.9)' : 'rgba(34, 199, 94, 0.9)'};
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 14px;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 20;
  animation: ${pulseAnimation} 2s infinite;
`;

const GuideText = styled.div`
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  z-index: 20;
  padding: 0 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
`;

interface BarcodeScannerProps {
  onProductFound: (product: ProductInfo) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onProductFound,
  onClose,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const startScanning = async () => {
    try {
      setError(null);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();


      if (videoInputDevices.length === 0) {
        throw new Error(t('barcode.cameraNotFound'));
      }

      // Select back camera
      const backCamera = videoInputDevices.find((device) => {
        const label = device.label.toLowerCase();
        return (
          label.includes('back') ||
          label.includes('rear') ||
          label.includes('environment') ||
          (label.includes('camera') && label.includes('0'))
        );
      });

      const selectedDeviceId = backCamera
        ? backCamera.deviceId
        : videoInputDevices[videoInputDevices.length - 1].deviceId;

      const constraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { min: 1280, ideal: 1920, max: 2560 },
          height: { min: 720, ideal: 1080, max: 1440 },
          facingMode: 'environment'
        }
      };

      await codeReader.decodeFromConstraints(
        constraints,
        videoRef.current!,
        async (result) => {
          if (result && !isProcessing) {
            const code = result.getText();

            if (code === lastScannedCode) return;

            triggerHaptic();
            setLastScannedCode(code);
            setIsProcessing(true);

            try {
              const product = await searchProductByJAN(code);

              if (product) {
                // Success Haptic
                if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                onProductFound(product);
                stopScanning();

                // Update stats
                import('../../config/firebase').then(({ auth }) => {
                  if (auth.currentUser) {
                    import('../../utils/profile').then(({ getUserProfile, updateUserStats }) => {
                      getUserProfile(auth.currentUser!.uid).then((profile) => {
                        if (profile) {
                          const currentCount = profile.stats.barcodeScanCount || 0;
                          updateUserStats(auth.currentUser!.uid, {
                            barcodeScanCount: currentCount + 1
                          }).catch(e => console.error(e));
                        }
                      });
                    });
                  }
                });

              } else {
                if (navigator.vibrate) navigator.vibrate(200);
                setError(t('barcode.productNotFound', { code }));
                setIsProcessing(false);
                setTimeout(() => {
                  setError(null);
                  setLastScannedCode(null);
                }, 3000);
              }
            } catch (apiErr) {
              console.error('API Error:', apiErr);
              setError(t('barcode.fetchFailed'));
              setIsProcessing(false);
              setTimeout(() => {
                setError(null);
                setLastScannedCode(null);
              }, 3000);
            }
          }
        }
      );
    } catch (err) {
      console.error('Camera Error:', err);
      setError(err instanceof Error ? err.message : t('barcode.cameraStartFailed'));
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdQrCodeScanner size={24} />
          <span style={{ fontWeight: 600 }}>{t('barcode.title')}</span>
        </div>
        <CloseButton onClick={handleClose}>
          <MdClose size={24} />
        </CloseButton>
      </Header>

      <CameraView>
        <video ref={videoRef} autoPlay muted playsInline />

        {/* スキャン枠 */}
        <ScanFrame>
          <ScanLine />
          {/* 角の装飾（反対側） */}
          <div style={{
            position: 'absolute',
            top: -2, right: -2,
            width: 20, height: 20,
            borderTop: '4px solid #22c55e',
            borderRight: '4px solid #22c55e',
            borderTopRightRadius: 16
          }} />
          <div style={{
            position: 'absolute',
            bottom: -2, left: -2,
            width: 20, height: 20,
            borderBottom: '4px solid #22c55e',
            borderLeft: '4px solid #22c55e',
            borderBottomLeftRadius: 16
          }} />
        </ScanFrame>

        {isProcessing && (
          <StatusBadge>
            <div className="loading-spinner" style={{ width: 16, height: 16, border: '2px solid white', borderTopColor: 'transparent' }} />
            {t('barcode.processing')}
          </StatusBadge>
        )}

        {error && (
          <StatusBadge isError>
            {error}
          </StatusBadge>
        )}

        <GuideText>
          {t('barcode.guide')}
        </GuideText>
      </CameraView>
    </Container>
  );
};
