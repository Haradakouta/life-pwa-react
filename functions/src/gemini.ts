/**
 * Cloud Functions for Gemini API
 * すべてのGemini API呼び出しをサーバー側で処理し、APIキーの漏洩を防ぐ
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Gemini API設定
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_NAME = 'gemini-2.5-pro';

/**
 * 環境変数またはFirestoreからAPIキーを取得
 */
async function getGeminiApiKey(): Promise<string> {
  // 環境変数から取得を試みる
  const envKey = functions.config().gemini?.api_key;
  if (envKey && envKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    return envKey;
  }

  // Firestoreから取得を試みる
  try {
    const configDoc = await db.collection('admin').doc('config').get();
    if (configDoc.exists) {
      const config = configDoc.data();
      if (config?.geminiApiKey && config.geminiApiKey.trim() !== '') {
        return config.geminiApiKey.trim();
      }
    }
  } catch (error) {
    console.error('[Gemini] Failed to get API key from Firestore:', error);
  }

  throw new Error('Gemini API key not configured');
}

/**
 * Gemini APIにリクエストを送信
 */
async function callGeminiApi(
  prompt: string,
  options: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<any> {
  const apiKey = await getGeminiApiKey();
  const url = `${GEMINI_API_BASE_URL}/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  };

  if (options.systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
  async (data: any, context: any) => {
    try {
      const { ingredients, dietaryRestriction, difficulty, customRequest } = data;

      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', '食材が指定されていません');
      }

      // 食事制限のラベル
      const dietLabel =
        dietaryRestriction === 'vegetarian'
          ? 'ベジタリアン'
          : dietaryRestriction === 'vegan'
            ? 'ヴィーガン'
            : '';

      // 難易度に応じた条件
      let difficultyCondition = '';
      if (difficulty === 'super_easy') {
        difficultyCondition =
          '\n\n**重要**: 料理初心者でも絶対に失敗しない超簡単なレシピにしてください。調理工程は3ステップ以内、特別な道具や技術は不要にしてください。';
      } else if (difficulty === 'under_5min') {
        difficultyCondition = '\n\n**重要**: 調理時間5分以内で完成するレシピにしてください。';
      } else if (difficulty === 'under_10min') {
        difficultyCondition = '\n\n**重要**: 調理時間10分以内で完成するレシピにしてください。';
      } else if (difficulty === 'no_fire') {
        difficultyCondition =
          '\n\n**重要**: 火を使わずに作れるレシピにしてください（電子レンジやトースターは可）。';
      }

      // 追加リクエスト
      const additionalRequirements = customRequest ? `\n\n**追加のリクエスト**: ${customRequest}` : '';

      const prompt = `
あなたは日本語で答えるプロの料理アドバイザーです。
必ず日本語で回答してください。英語は使わないでください。

次の食材を使った${dietLabel}向けの家庭向けレシピを1つ提案してください。
料理名・材料・手順・ポイントを含めて出力してください。${difficultyCondition}${additionalRequirements}

食材: ${ingredients.join('、')}

出力フォーマットは以下の形式でお願いします：

---
【料理名】
（料理名）

【材料】
（材料一覧）

【作り方】
1.
2.
3.

【ポイント】
（料理のコツやアドバイス）
---
`.trim();

      const result = await callGeminiApi(prompt, {
        temperature: 0.8,
        maxOutputTokens: 2048,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        success: true,
        recipe: text,
      };
    } catch (error: any) {
      console.error('[Gemini] Recipe generation error:', error);
      throw new functions.https.HttpsError('internal', error.message || 'レシピ生成に失敗しました');
    }
  }
);

/**
 * 健康アドバイス生成
 */
export const generateHealthAdvice = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      const { meals, exercises, weight, goals } = data;

      const prompt = `
あなたは健康管理の専門家です。以下のデータに基づいて、具体的で実践的な健康アドバイスを日本語で提供してください。

【食事データ】
${JSON.stringify(meals, null, 2)}

【運動データ】
${JSON.stringify(exercises, null, 2)}

【体重】
${weight}kg

【目標】
${goals}

以下の形式で回答してください：
1. 現状分析
2. 改善点
3. 具体的なアクション
4. 励ましのメッセージ
`.trim();

      const result = await callGeminiApi(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        success: true,
        advice: text,
      };
    } catch (error: any) {
      console.error('[Gemini] Health advice generation error:', error);
      throw new functions.https.HttpsError('internal', error.message || '健康アドバイス生成に失敗しました');
    }
  }
);

/**
 * カロリー推定（画像なしテキストベース）
 */
export const estimateCalories = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      const { foodDescription } = data;

      if (!foodDescription) {
        throw new functions.https.HttpsError('invalid-argument', '食事の説明が必要です');
      }

      const prompt = `
以下の食事のカロリーを推定してください。

食事: ${foodDescription}

以下の形式で回答してください：
- 推定カロリー: XXX kcal
- 主な栄養素: タンパク質 XX g、脂質 XX g、炭水化物 XX g
- 備考: （食材の特徴や注意点）
`.trim();

      const result = await callGeminiApi(prompt, {
        temperature: 0.5,
        maxOutputTokens: 1024,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        success: true,
        estimation: text,
      };
    } catch (error: any) {
      console.error('[Gemini] Calorie estimation error:', error);
      throw new functions.https.HttpsError('internal', error.message || 'カロリー推定に失敗しました');
    }
  }
);

/**
 * 汎用テキスト生成（月次レポートのAI改善提案など）
 */
export const generateText = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      const { prompt } = data;

      if (!prompt) {
        throw new functions.https.HttpsError('invalid-argument', 'プロンプトが指定されていません');
      }

      const result = await callGeminiApi(prompt, {
        temperature: 0.7,
        maxOutputTokens: 2048,
      });

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        success: true,
        text: text,
      };
    } catch (error: any) {
      console.error('[Gemini] Text generation error:', error);
      throw new functions.https.HttpsError('internal', error.message || 'テキスト生成に失敗しました');
    }
  }
);
