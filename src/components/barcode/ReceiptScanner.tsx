/**
 * レシートスキャナーコンポーネント（ネイティブカメラ使用版）
 */
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { scanReceipt, type ReceiptOCRResult } from '../../api/vision';
import { MdCameraAlt, MdClose, MdPhotoLibrary } from 'react-icons/md';

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

  // コンポーネントマウント時に自動的にカメラを起動
  useEffect(() => {
    if (fileInputRef.current && !isProcessing && !error) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      // ファイルが選択されなかった場合（キャンセルなど）、閉じるか、再試行を促す
      // ここではユーザーが意図的にキャンセルしたとみなして閉じるのが自然だが、
      // 誤操作の可能性もあるため、画面上に留まる
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await scanReceipt(file);
      onReceiptScanned(result);
    } catch (err: any) {
      console.error('OCRエラー:', err);
      setError(err.message || t('barcode.receiptScanner.ocrError'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '20px',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        <MdClose size={32} />
      </button>

      <h2 style={{ marginBottom: '32px' }}>{t('barcode.receiptScanner.title')}</h2>

      {isProcessing ? (
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '48px', height: '48px', margin: '0 auto 16px' }} />
          <p>{t('barcode.receiptScanner.processing')}</p>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ background: '#ef4444', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <MdCameraAlt size={24} />
            カメラを起動
          </button>

          <button
            onClick={() => {
              // capture属性なしでクリックすることでアルバム選択になる場合が多いが、
              // 明示的に別のinputを用意する手もある。
              // ここではシンプルに同じinputを使い回すが、captureを外すのはReactだと少し面倒なので
              // ユーザーがカメラ起動後にアルバムを選べるOSの挙動に任せるか、
              // 別途アルバム用ボタンを作るならinputを分ける。
              // 今回は「アルバム」ボタンも要望にあったので分ける。
              const albumInput = document.createElement('input');
              albumInput.type = 'file';
              albumInput.accept = 'image/*';
              albumInput.onchange = (e) => handleFileSelect(e as any);
              albumInput.click();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <MdPhotoLibrary size={24} />
            {t('barcode.receiptScanner.album')}
          </button>
        </div>
      )}
    </div>
  );
};
