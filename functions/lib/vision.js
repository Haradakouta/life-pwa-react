"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanReceiptWithVision = void 0;
const functions = require("firebase-functions");
// Gemini API Configuration
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const FLASH_MODEL_NAME = 'gemini-3-flash-preview';
/**
 * 環境変数からAPIキーを取得
 */
function getGeminiApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.');
    }
    return apiKey;
}
/**
 * Gemini APIでレシート画像を解析
 */
const analyzeReceiptWithGemini = async (base64Image) => {
    var _a, _b, _c, _d, _e;
    const apiKey = getGeminiApiKey();
    const url = `${GEMINI_API_BASE_URL}/models/${FLASH_MODEL_NAME}:generateContent?key=${apiKey}`;
    const prompt = `あなたはレシート解析の専門家です。この画像からレシート情報を抽出してください。

以下のJSON形式で出力してください:
{
  "items": [
    {
      "name": "商品名",
      "price": 価格（数値）,
      "quantity": 数量（数値、省略可）
    }
  ],
  "total": 合計金額（数値、省略可）,
  "storeName": "店舗名（省略可）",
  "branchName": "支店名（省略可）",
  "date": "日付（YYYY-MM-DD形式、省略可）"
}

重要:
- 商品名と価格を正確に抽出してください
- 小計、合計、税金などの項目は除外してください
- 価格は数値のみ（カンマや円記号は不要）
- 読み取れない場合は空の配列を返してください`;
    const body = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inline_data: {
                            mime_type: 'image/jpeg',
                            data: base64Image
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
        }
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API failed with status ${response.status}`);
    }
    const data = await response.json();
    const text = ((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || '';
    // JSONを抽出
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('JSON形式の応答が得られませんでした');
    }
    const jsonText = jsonMatch[1] || jsonMatch[0];
    const result = JSON.parse(jsonText);
    return {
        items: result.items || [],
        total: result.total,
        storeName: result.storeName,
        branchName: result.branchName,
        date: result.date,
        rawText: text
    };
};
exports.scanReceiptWithVision = functions.https.onCall({ region: 'us-central1', memory: '512MiB', timeoutSeconds: 300 }, async (request) => {
    // 認証チェック
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', '認証が必要です。');
    }
    const { base64Image } = request.data;
    if (!base64Image) {
        throw new functions.https.HttpsError('invalid-argument', '画像データが必要です。');
    }
    try {
        // Gemini APIで直接解析
        const parsedResult = await analyzeReceiptWithGemini(base64Image);
        console.log('Receipt scanned successfully (Gemini)', {
            itemCount: parsedResult.items.length,
            total: parsedResult.total,
        });
        return parsedResult;
    }
    catch (error) {
        console.error('OCR Error:', error);
        throw new functions.https.HttpsError('internal', '画像の解析に失敗しました。');
    }
});
//# sourceMappingURL=vision.js.map