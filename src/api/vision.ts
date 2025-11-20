/**
 * Google Cloud Vision API連携 (Cloud Functions経由)
 */
import { getFunctions, httpsCallable } from 'firebase/functions';

export interface ReceiptItem {
  name: string;
  price: number;
  quantity?: number;
}

export interface ReceiptOCRResult {
  items: ReceiptItem[];
  total?: number;
  storeName?: string;
  date?: string;
  rawText: string;
  error?: string;
}

/**
 * 画像をBase64エンコード
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // "data:image/jpeg;base64," の部分を除去
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * レシートOCRを実行 (Cloud Functions)
 */
export const scanReceipt = async (imageFile: File): Promise<ReceiptOCRResult> => {
  try {
    // 画像をBase64に変換
    const base64Image = await fileToBase64(imageFile);

    // Cloud Functionsを呼び出し
    const functions = getFunctions();
    const scanReceiptWithVision = httpsCallable<{ base64Image: string }, ReceiptOCRResult>(
      functions,
      'scanReceiptWithVision'
    );

    const result = await scanReceiptWithVision({ base64Image });
    return result.data;

  } catch (error) {
    console.error('Receipt Scan Error:', error);
    throw error;
  }
};
