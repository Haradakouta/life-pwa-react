/**
 * バーコードスキャン画面コンポーネント
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductDisplay } from './ProductDisplay';
import { ReceiptScanner } from './ReceiptScanner';
import { ReceiptResult } from './ReceiptResult';
import type { ProductInfo } from '../../types';
import type { ReceiptOCRResult } from '../../api/vision';
import { MdQrCodeScanner, MdCamera, MdReceipt } from 'react-icons/md';

type ScanMode = 'select' | 'barcode' | 'receipt';

interface BarcodeScreenProps {
  onNavigateToStock?: () => void;
}

export const BarcodeScreen: React.FC<BarcodeScreenProps> = ({ onNavigateToStock }) => {
  const { t } = useTranslation();
  const [scanMode, setScanMode] = useState<ScanMode>('select');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<ProductInfo | null>(null);
  const [receiptResult, setReceiptResult] = useState<ReceiptOCRResult | null>(null);

  const handleSelectBarcode = () => {
    setScanMode('barcode');
    setIsScanning(true);
    setScannedProduct(null);
  };

  const handleSelectReceipt = () => {
    setScanMode('receipt');
    setIsScanning(true);
    setReceiptResult(null);
  };

  const handleProductFound = (product: ProductInfo) => {
    setScannedProduct(product);
    setIsScanning(false);
  };

  const handleReceiptScanned = (result: ReceiptOCRResult) => {
    setReceiptResult(result);
    setIsScanning(false);
  };

  const handleProductAdded = () => {
    setScannedProduct(null);
    setScanMode('select');
  };

  const handleReceiptClose = () => {
    setReceiptResult(null);
    setScanMode('select');
  };

  const handleBackToSelect = () => {
    setScanMode('select');
    setIsScanning(false);
    setScannedProduct(null);
    setReceiptResult(null);
  };

  return (
    <section className="screen active">
      <h2>{t('barcode.screen.title')}</h2>

      {/* モード選択画面 */}
      {scanMode === 'select' && !isScanning && !scannedProduct && !receiptResult && (
        <>
          <div className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MdCamera size={20} />
              {t('barcode.screen.selectMode')}
            </h3>
            <p style={{ color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              {t('barcode.screen.modeDescription')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={handleSelectBarcode}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '24px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500,
                  fontSize: '16px',
                }}
              >
                <MdQrCodeScanner size={48} />
                <span>{t('barcode.screen.barcodeButton')}</span>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>{t('barcode.screen.barcodeSubtext')}</span>
              </button>

              <button
                onClick={handleSelectReceipt}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '24px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500,
                  fontSize: '16px',
                }}
              >
                <MdReceipt size={48} />
                <span>{t('barcode.screen.receiptButton')}</span>
                <span style={{ fontSize: '12px', opacity: 0.9 }}>{t('barcode.screen.receiptSubtext')}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* バーコードスキャン */}
      {scanMode === 'barcode' && isScanning && (
        <BarcodeScanner
          onProductFound={handleProductFound}
          onClose={handleBackToSelect}
        />
      )}

      {scanMode === 'barcode' && scannedProduct && (
        <ProductDisplay
          product={scannedProduct}
          onAdded={handleProductAdded}
          onNavigateToStock={onNavigateToStock}
        />
      )}

      {/* レシートスキャン */}
      {scanMode === 'receipt' && isScanning && (
        <ReceiptScanner
          onReceiptScanned={handleReceiptScanned}
          onClose={handleBackToSelect}
        />
      )}

      {scanMode === 'receipt' && receiptResult && (
        <ReceiptResult
          result={receiptResult}
          onClose={handleReceiptClose}
        />
      )}
    </section>
  );
};
