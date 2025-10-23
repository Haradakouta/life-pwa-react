/**
 * レシートスキャナーコンポーネント
 */
import React, { useRef, useState } from 'react';
import { scanReceipt, type ReceiptOCRResult } from '../../api/gemini';
import { MdCamera, MdClose, MdPhotoCamera } from 'react-icons/md';

interface ReceiptScannerProps {
  onReceiptScanned: (result: ReceiptOCRResult) => void;
  onClose: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onReceiptScanned,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // カメラを起動
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // 背面カメラを使用
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      console.error('カメラアクセスエラー:', err);
      setError('カメラにアクセスできません。ファイル選択をお試しください。');
    }
  };

  // コンポーネントマウント時にカメラ起動
  React.useEffect(() => {
    startCamera();

    return () => {
      // クリーンアップ：カメラを停止
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 写真を撮影してOCR実行
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context が取得できません');
      }

      // カメラ映像をキャンバスに描画
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // キャンバスをBlobに変換
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob変換に失敗しました'));
        }, 'image/jpeg', 0.95);
      });

      // BlobをFileに変換
      const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });

      // OCR実行
      const result = await scanReceipt(file);

      // カメラを停止
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      onReceiptScanned(result);
    } catch (err: any) {
      console.error('OCRエラー:', err);
      setError(err.message || 'レシートの読み取りに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // ファイル選択からOCR実行
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await scanReceipt(file);

      // カメラを停止
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      onReceiptScanned(result);
    } catch (err: any) {
      console.error('OCRエラー:', err);
      setError(err.message || 'レシートの読み取りに失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
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
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ color: 'white', margin: 0 }}>レシートをスキャン</h3>
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
          }}
          disabled={isProcessing}
        >
          <MdClose size={24} />
        </button>
      </div>

      {/* カメラプレビュー */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* ガイド枠 */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: '60%',
            border: '2px dashed rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            レシートを枠内に収めてください
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ef4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              maxWidth: '80%',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* コントロールボタン */}
      <div
        style={{
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          style={{
            background: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: isProcessing ? 0.5 : 1,
          }}
        >
          <MdPhotoCamera size={20} />
          ファイル選択
        </button>

        <button
          onClick={capturePhoto}
          disabled={isProcessing}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            opacity: isProcessing ? 0.5 : 1,
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isProcessing ? '...' : <MdCamera size={32} />}
        </button>
      </div>
    </div>
  );
};
