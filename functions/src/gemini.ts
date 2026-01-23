/**
 * Cloud Functions for Gemini API
 * 軽量版 - 環境変数からAPIキーを取得
 */

import * as functions from 'firebase-functions';

// Gemini API設定
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const PRO_MODEL_NAME = 'gemini-3-pro-preview'; // AI改善提案用（高品質）
const FLASH_MODEL_NAME = 'gemini-3-flash-preview'; // レシピ生成・カロリー計測用（高速・低コスト）

// 言語コードから言語名へのマッピング
const LANGUAGE_MAP: { [key: string]: string } = {
  'ja': '日本語',
  'en': 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  'ko': '한국어',
  'vi': 'Tiếng Việt',
  'ru': 'Русский',
  'id': 'Bahasa Indonesia',
};

/**
 * 言語コードから言語名を取得
 */
function getLanguageName(languageCode: string): string {
  return LANGUAGE_MAP[languageCode] || LANGUAGE_MAP['ja'];
}

/**
 * 環境変数からAPIキーを取得
 */
function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY environment variable.');
  }
  return apiKey;
}

/**
 * Gemini APIにリクエストを送信
 */
async function callGeminiApi(
  prompt: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
    model?: 'pro' | 'flash'; // pro: AI改善提案, flash: その他
  } = {}
): Promise<any> {
  const apiKey = getGeminiApiKey();
  const modelName = options.model === 'pro' ? PRO_MODEL_NAME : FLASH_MODEL_NAME;
  const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * レシピ生成
 */
export const generateRecipe = functions.https.onCall(
  { timeoutSeconds: 300, memory: '512MiB' },
  async (request: any) => {
  const { ingredients, dietaryRestriction, difficulty, customRequest, language } = request.data;
  const languageName = getLanguageName(language || 'ja');

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', '食材が指定されていません');
  }

  const dietLabel = dietaryRestriction === 'vegetarian' ? 'ベジタリアン' : dietaryRestriction === 'vegan' ? 'ヴィーガン' : '';

  let difficultyCondition = '';
  if (difficulty === 'super_easy') {
    difficultyCondition = '\n\n**重要**: 料理初心者でも絶対に失敗しない超簡単なレシピにしてください。調理工程は3ステップ以内。';
  } else if (difficulty === 'under_5min') {
    difficultyCondition = '\n\n**重要**: 調理時間5分以内で完成するレシピにしてください。';
  } else if (difficulty === 'under_10min') {
    difficultyCondition = '\n\n**重要**: 調理時間10分以内で完成するレシピにしてください。';
  } else if (difficulty === 'no_fire') {
    difficultyCondition = '\n\n**重要**: 火を使わずに作れるレシピにしてください。';
  }

  const additionalRequirements = customRequest ? `\n\n**追加のリクエスト**: ${customRequest}` : '';

const prompt = `あなたは${languageName}で答えるプロの料理アドバイザーです。
次の食材を使った${dietLabel}向けの家庭向けレシピを１つ提案してください。${difficultyCondition}${additionalRequirements}

**重要**: 必ず${languageName}で回答してください。

食材: ${ingredients.join('、')}

出力フォーマット:
---
【料理名】
【材料】
【作り方】
1.
2.
3.
【ポイント】
---`;

  try {
    const result = await callGeminiApi(prompt, { temperature: 0.8, maxOutputTokens: 2048 });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { success: true, recipe: text };
  } catch (error: any) {
    console.error('[Gemini] Recipe error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'レシピ生成に失敗しました');
  }
});


/**
 * 汎用テキスト生成
 */
export const generateText = functions.https.onCall(
  { timeoutSeconds: 300, memory: '512MiB' },
  async (request: any) => {
  const { prompt, language } = request.data;
  const languageName = getLanguageName(language || 'ja');

  if (!prompt) {
    throw new functions.https.HttpsError('invalid-argument', 'プロンプトが指定されていません');
  }

  // 言語指定をプロンプトに追加
  const promptWithLanguage = `${prompt}\n\n**重要**: 必ず${languageName}で回答してください。`;

  try {
    // AI改善提案はProモデルを使用（高品質）
    const result = await callGeminiApi(promptWithLanguage, { temperature: 0.7, maxOutputTokens: 2048, model: 'pro' });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { success: true, text };
  } catch (error: any) {
    console.error('[Gemini] Text error:', error);
    throw new functions.https.HttpsError('internal', error.message || 'テキスト生成に失敗しました');
  }
});


/**
 * 画像付きでGemini APIにリクエストを送信（常にFlashモデル使用）
 */
async function callGeminiApiWithImage(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<any> {
  const apiKey = getGeminiApiKey();
  const url = `${GEMINI_API_BASE_URL}/models/${FLASH_MODEL_NAME}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      topK: 32,
      topP: 1,
      maxOutputTokens: options.maxOutputTokens ?? 1024,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * カロリー推定（画像解析）
 */
export const scanCalorie = functions.https.onCall(
  { timeoutSeconds: 300, memory: '512MiB' },
  async (request: any) => {
    const { mealName, imageBase64, mimeType, language } = request.data;
    const languageName = getLanguageName(language || 'ja');

    if (!mealName) {
      throw new functions.https.HttpsError('invalid-argument', '料理名が指定されていません');
    }

    if (!imageBase64) {
      throw new functions.https.HttpsError('invalid-argument', '画像データが指定されていません');
    }

    const prompt = `
あなたは栄養学の専門家です。
この料理画像を見て、料理名「${mealName}」のカロリーを推定してください。

**重要**: 必ず${languageName}で回答してください。

以下のJSON形式で出力してください：
{
  "calories": 推定カロリー（数値、kcal単位）,
  "reasoning": "カロリー推定の根拠（料理の内容、量、調理方法などを考慮した理由を${languageName}で詳しく説明）",
  "confidence": 信頼度（0-100の数値、オプション）
}

**重要な指示:**
1. 料理名と画像の両方を参考にして、できるだけ正確なカロリーを推定してください
2. 料理の量、調理方法（揚げ物、蒸し物など）、食材の種類を考慮してください
3. reasoningには、なぜそのカロリーと推定したかの根拠を${languageName}で詳しく書いてください
4. 必ずJSONのみを返してください（説明文は不要）
`.trim();

    try {
      const result = await callGeminiApiWithImage(
        prompt,
        imageBase64,
        mimeType || 'image/jpeg',
        { temperature: 0.3, maxOutputTokens: 1024 }
      );

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // JSONを抽出（マークダウンのコードブロックを除去）
      let jsonText = text.trim();
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      } else if (jsonText.includes('```')) {
        const codeMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonText = codeMatch[1];
        }
      }

      // JSONをパース
      const parsedData = JSON.parse(jsonText);

      return {
        success: true,
        calories: parsedData.calories || 0,
        reasoning: parsedData.reasoning || 'カロリーを推定しました',
        confidence: parsedData.confidence,
      };
    } catch (error: any) {
      console.error('[Gemini] Calorie scan error:', error);
      throw new functions.https.HttpsError('internal', error.message || 'カロリー推定に失敗しました');
    }
  }
);
