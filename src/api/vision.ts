/**
 * Google Cloud Vision API連携
 */

const VISION_API_KEY = import.meta.env.VITE_VISION_API_KEY;
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

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
 * レシートOCRを実行
 */
export const scanReceipt = async (imageFile: File): Promise<ReceiptOCRResult> => {
  if (!VISION_API_KEY) {
    throw new Error('Vision API キーが設定されていません');
  }

  try {
    // 画像をBase64に変換
    const base64Image = await fileToBase64(imageFile);

    // Vision APIにリクエスト
    const response = await fetch(`${VISION_API_URL}?key=${VISION_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 1,
              },
            ],
            imageContext: {
              languageHints: ['ja'],
            },
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API エラー: ${response.status}`);
    }

    const data = await response.json();
    const textAnnotations = data.responses[0]?.textAnnotations;

    if (!textAnnotations || textAnnotations.length === 0) {
      throw new Error('テキストが検出されませんでした');
    }

    // 全文テキスト
    const fullText = textAnnotations[0].description;

    // レシートデータを解析
    const result = parseReceiptText(fullText);

    return result;
  } catch (error) {
    console.error('Vision API エラー:', error);
    throw error;
  }
};

/**
 * レシートテキストを解析して商品情報を抽出
 */
const parseReceiptText = (text: string): ReceiptOCRResult => {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  const items: ReceiptItem[] = [];
  let storeName: string | undefined;
  let total: number | undefined;
  let date: string | undefined;

  // 店名を抽出（最初の数行から）
  if (lines.length > 0) {
    storeName = lines[0];
  }

  // 日付パターン（例: 2025/01/23, 2025-01-23, 2025.01.23）
  const datePattern = /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/;

  // 商品と価格のパターン
  // 例: "りんご 150", "牛乳 ¥200", "パン　120円"
  const itemPricePattern = /^(.+?)[\s　]+[\¥￥]?([0-9,]+)円?$/;

  // 合計金額のパターン
  const totalPattern = /(?:合計|小計|計|total)[\s　]*[\¥￥]?([0-9,]+)円?/i;

  for (const line of lines) {
    // 日付を抽出
    const dateMatch = line.match(datePattern);
    if (dateMatch && !date) {
      date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
      continue;
    }

    // 合計金額を抽出
    const totalMatch = line.match(totalPattern);
    if (totalMatch) {
      total = parseInt(totalMatch[1].replace(/,/g, ''), 10);
      continue;
    }

    // 商品と価格を抽出
    const itemMatch = line.match(itemPricePattern);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const priceStr = itemMatch[2].replace(/,/g, '');
      const price = parseInt(priceStr, 10);

      // 価格が妥当な範囲かチェック（0円～100,000円）
      if (price > 0 && price <= 100000 && name.length > 0) {
        // 既に同じ商品がある場合は数量を増やす
        const existing = items.find((item) => item.name === name && item.price === price);
        if (existing && existing.quantity) {
          existing.quantity += 1;
        } else {
          items.push({ name, price, quantity: 1 });
        }
      }
    }
  }

  return {
    items,
    total,
    storeName,
    date,
    rawText: text,
  };
};
