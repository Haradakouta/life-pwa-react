/**
 * バーコードスキャナーコンポーネント
 * ZXing (Zebra Crossing) ライブラリを使用
 */
import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useTranslation } from 'react-i18next';
import { searchProductByJAN } from '../../api/rakuten';
import type { ProductInfo } from '../../types';

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

  const startScanning = async () => {
    try {
      setError(null);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // カメラデバイスを取得
      const videoInputDevices = await codeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        throw new Error(t('barcode.cameraNotFound'));
      }

      // 外部カメラ（背面カメラ）を強制的に使用
      // スマホの場合、内蔵カメラ（フロントカメラ）ではなく、
      // 背面カメラを優先的に選択することでバーコードスキャンの精度を向上
      const backCamera = videoInputDevices.find((device) => {
        const label = device.label.toLowerCase();
        // 複数のキーワードで背面カメラを検出
        // 'back': 英語の一般的な表記
        // 'rear': 背面カメラの別表記
        // 'environment': facingModeの標準値
        // 'camera 0': 一部のデバイスでの背面カメラの表記
        return (
          label.includes('back') ||
          label.includes('rear') ||
          label.includes('environment') ||
          (label.includes('camera') && label.includes('0'))
        );
      });

      // 背面カメラが見つかった場合はそれを使用、
      // 見つからない場合は最後のカメラを使用（多くの場合、最後が背面カメラ）
      const selectedDeviceId = backCamera
        ? backCamera.deviceId
        : videoInputDevices[videoInputDevices.length - 1].deviceId;

      console.log('使用するカメラ:', backCamera ? backCamera.label : videoInputDevices[videoInputDevices.length - 1].label);

      // スキャン開始
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result, error) => {
          if (result && !isProcessing) {
            const code = result.getText();

            // 同じコードを連続してスキャンしないようにする
            if (code === lastScannedCode) {
              return;
            }

            setLastScannedCode(code);
            setIsProcessing(true);

            try {
              // 商品情報を取得
              const product = await searchProductByJAN(code);

              if (product) {
                onProductFound(product);
                stopScanning();

                // バーコードスキャン回数を更新
                import('../../config/firebase').then(({ auth }) => {
                  if (auth.currentUser) {
                    import('../../utils/profile').then(({ getUserProfile, updateUserStats }) => {
                      getUserProfile(auth.currentUser!.uid).then((profile) => {
                        if (profile) {
                          const currentCount = profile.stats.barcodeScanCount || 0;
                          updateUserStats(auth.currentUser!.uid, {
                            barcodeScanCount: currentCount + 1
                          }).catch(err => console.error('Stats update failed:', err));
                        }
                      });
                    });
                  }
                });

              } else {
                setError(t('barcode.productNotFound', { code }));
                setIsProcessing(false);
                // 3秒後にエラーをクリアして再スキャン可能にする
                setTimeout(() => {
                  setError(null);
                  setLastScannedCode(null);
                }, 3000);
              }
            } catch (err) {
              console.error('商品情報取得エラー:', err);
              setError(t('barcode.fetchFailed'));
              setIsProcessing(false);
              setTimeout(() => {
                setError(null);
                setLastScannedCode(null);
              }, 3000);
            }
          }

          if (error && !(error instanceof NotFoundException)) {
            console.error('スキャンエラー:', error);
          }
        }
      );
    } catch (err) {
      console.error('カメラ起動エラー:', err);
      setError(
        err instanceof Error ? err.message : t('barcode.cameraStartFailed')
      );
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>
          {t('barcode.title')}
        </h2>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ✕
        </button>
      </div>

      {/* カメラビュー */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* スキャンガイド */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '300px',
            height: '150px',
            border: '2px solid #22c55e',
            borderRadius: '8px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* ステータス表示 */}
        {isProcessing && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '20px 32px',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {t('barcode.processing')}
          </div>
        )}

        {error && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(239, 68, 68, 0.95)',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* フッター */}
      <div
        style={{
          padding: '16px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#999' }}>
          {t('barcode.guide')}
        </p>
      </div>
    </div>
  );
};
