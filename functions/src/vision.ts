import * as functions from 'firebase-functions';

import { ImageAnnotatorClient } from '@google-cloud/vision';

// Vision APIクライアントの初期化
const client = new ImageAnnotatorClient();

interface ScanReceiptData {
    base64Image: string;
}

interface ReceiptItem {
    name: string;
    price: number;
    quantity?: number;
}

interface ReceiptOCRResult {
    items: ReceiptItem[];
    total?: number;
    storeName?: string;
    date?: string;
    rawText: string;
}

/**
 * レシートテキストを解析して商品情報を抽出
 */
/**
 * レシートテキストを解析して商品情報を抽出
 */
/**
 * 全角数字・記号・スペースを半角に変換
 */
const normalizeText = (text: string): string => {
    return text
        .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        .replace(/　/g, ' ');
};

/**
 * レシートテキストを解析して商品情報を抽出
 */
const parseReceiptText = (text: string): ReceiptOCRResult => {
    const normalizedText = normalizeText(text);
    const lines = normalizedText.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

    const items: ReceiptItem[] = [];
    let storeName: string | undefined;
    let total: number | undefined;
    let date: string | undefined;

    // 除外キーワード（これらが含まれる行は商品とみなさない）
    const excludeKeywords = [
        '小計', '合計', 'お釣り', '現計', '消費税', '内税', '外税', '対象', '預り', '釣銭', '支払', '買上',
        'TOTAL', 'SUBTOTAL', 'CHANGE', 'TAX', 'DUE', 'CASH', 'CREDIT',
        '電話', 'TEL', 'FAX', 'No.', '店', '担当', 'レジ', '取引', '番号'
    ];

    // 日付パターン
    const datePattern = /(\d{4})[\/\-.年\s](\d{1,2})[\/\-.月\s](\d{1,2})/;

    // 合計金額パターン
    const totalPattern = /(?:合計|小計|計|total|お買上|お支払い)[\s\S]*?([\d,]+)/i;

    // 行ごとの解析
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. 店名の抽出（最初の5行以内で、日付や電話番号っぽくないもの）
        if (!storeName && i < 5) {
            if (!line.match(/[\d-]{10,}/) && // 電話番号
                !line.match(datePattern) &&   // 日付
                !line.includes('レシート') &&
                !line.includes('領収書') &&
                line.length > 1) {
                storeName = line;
            }
        }

        // 2. 日付の抽出
        if (!date) {
            const dateMatch = line.match(datePattern);
            if (dateMatch) {
                date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
            }
        }

        // 3. 合計金額の抽出
        if (!total) {
            const totalMatch = line.match(totalPattern);
            if (totalMatch) {
                total = parseInt(totalMatch[1].replace(/,/g, ''), 10);
            }
        }

        // 4. 商品と価格の抽出
        // 行末が数字（価格）で終わっているかチェック
        // 例: "商品A 100", "商品B 1,000", "商品C ¥500"
        // 記号(¥)や"円"はnormalizeで半角になっているか、除去して考える
        const priceMatch = line.match(/([\d,]+)(?:円)?$/);

        if (priceMatch) {
            const priceStr = priceMatch[1].replace(/,/g, '');
            const price = parseInt(priceStr, 10);

            // 価格としてあり得る範囲 (1円〜100万円)
            if (price > 0 && price <= 1000000) {
                // 価格部分を除いた残りを商品名とする
                let name = line.substring(0, line.length - priceMatch[0].length).trim();

                // 末尾の記号などを除去
                name = name.replace(/[\\¥￥\s]+$/, '');

                // 除外キーワードが含まれていないか
                const hasExcludeKeyword = excludeKeywords.some(keyword => name.includes(keyword));

                // 名前が短すぎる、または数字・記号のみの場合は除外
                const isInvalidName = name.length < 1 || name.match(/^[\d\s\W]+$/);

                if (!hasExcludeKeyword && !isInvalidName) {
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
    }

    // 合計金額が見つからなかった場合、商品の合計を計算してみる
    if (!total && items.length > 0) {
        total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    }

    return {
        items,
        total,
        storeName,
        date,
        rawText: text,
    };
};

export const scanReceiptWithVision = functions.https.onCall(
    { region: 'us-central1', memory: '512MiB' },
    async (request: functions.https.CallableRequest<ScanReceiptData>) => {
        // 認証チェック
        if (!request.auth) {
            throw new functions.https.HttpsError('unauthenticated', '認証が必要です。');
        }

        const { base64Image } = request.data;
        if (!base64Image) {
            throw new functions.https.HttpsError('invalid-argument', '画像データが必要です。');
        }

        try {
            // Vision APIを呼び出し (documentTextDetectionを使用)
            const [result] = await client.documentTextDetection({
                image: {
                    content: base64Image,
                },
                imageContext: {
                    languageHints: ['ja'], // 日本語を優先
                },
            });

            const fullTextAnnotation = result.fullTextAnnotation;
            if (!fullTextAnnotation || !fullTextAnnotation.text) {
                return {
                    items: [],
                    rawText: '',
                    error: 'テキストが検出されませんでした。',
                };
            }

            // 全文テキスト
            const fullText = fullTextAnnotation.text;

            // 解析実行
            const parsedResult = parseReceiptText(fullText);

            console.log('Receipt scanned successfully', {
                itemCount: parsedResult.items.length,
                total: parsedResult.total,
            });

            return parsedResult;

        } catch (error) {
            console.error('Vision API Error:', error);
            throw new functions.https.HttpsError('internal', '画像の解析に失敗しました。');
        }
    }
);
