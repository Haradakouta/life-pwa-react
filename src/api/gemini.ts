/**
 * api/gemini.ts — Google Gemini API連携
 *
 * AIレシピ生成機能を提供します。
 * Gemini 2.0 Flash モデルを使用。
 */

import type { RecipeDifficulty, DietaryRestriction } from '../types';

// レシートOCR用の型定義
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

// Gemini APIキー（環境変数から取得、または直接設定）
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBSqmtDaNAqF09NTYYKQsTKm-3fLl1LMr0';

// API有効フラグ
const API_ENABLED = !!GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GeminiError {
  error?: {
    message: string;
  };
  rawError?: string;
}

/**
 * 材料からレシピを生成
 */
export async function generateRecipe(
  ingredients: string[],
  dietaryRestriction: DietaryRestriction = 'none',
  difficulty: RecipeDifficulty = 'none',
  customRequest = ''
): Promise<string> {
  console.log('[Gemini] API呼び出し開始', {
    ingredients,
    dietaryRestriction,
    difficulty,
    customRequest,
    API_ENABLED,
    apiKeyPrefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'なし'
  });

  if (!API_ENABLED) {
    console.warn('Gemini APIが無効です。モックデータを返します。');
    return getMockRecipe(ingredients, dietaryRestriction, difficulty);
  }

  if (!ingredients || ingredients.length === 0) {
    throw new Error('材料を指定してください。');
  }

  try {
    const dietLabel =
      dietaryRestriction === 'vegetarian'
        ? 'ベジタリアン'
        : dietaryRestriction === 'vegan'
        ? 'ヴィーガン'
        : '';

    // 難易度に応じた条件を追加
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

    // 自由記入欄の内容を追加
    const additionalRequirements = customRequest
      ? `\n\n**追加のリクエスト**: ${customRequest}`
      : '';

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    console.log('[Gemini] APIリクエスト送信', { url: url.replace(GEMINI_API_KEY, 'HIDDEN') });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    console.log('[Gemini] APIレスポンス受信', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: GeminiError;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { rawError: errorText };
      }
      console.error('[Gemini] APIエラー詳細', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData,
      });

      // エラーメッセージを見やすく
      let errorMessage = `Gemini API エラー (${response.status})`;
      if (errorData.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      }

      throw new Error(errorMessage);
    }

    const data: GeminiResponse = await response.json();
    console.log('[Gemini] レスポンスデータ', data);

    // レスポンスからテキストを抽出
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text;
        console.log('[Gemini] レシピ生成成功');
        return text.trim();
      }
    }

    console.error('[Gemini] レスポンス形式が不正', data);
    throw new Error('Gemini APIからレシピを取得できませんでした。');
  } catch (error) {
    console.error('[Gemini] エラー発生:', error);

    // エラー時はモックデータを返す
    console.warn('[Gemini] モックデータを使用します。');
    console.info('[Gemini] 新しいAPIキーが必要な場合: https://aistudio.google.com/app/apikey');

    // 403エラーの場合は特別なメッセージを表示
    if (error instanceof Error && error.message.includes('403')) {
      console.error(
        '[Gemini] 403エラー: APIキーが無効または期限切れです。新しいキーを取得してください。'
      );
    }

    return getMockRecipe(ingredients, dietaryRestriction, difficulty);
  }
}

/**
 * Gemini APIが有効かどうかを返す
 */
export function isGeminiEnabled(): boolean {
  return API_ENABLED;
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
 * レシート画像からOCRで商品情報を抽出
 */
export async function scanReceipt(imageFile: File): Promise<ReceiptOCRResult> {
  console.log('[Gemini Receipt] OCR処理開始', {
    fileName: imageFile.name,
    fileSize: imageFile.size,
    API_ENABLED,
  });

  if (!API_ENABLED) {
    throw new Error('Gemini APIキーが設定されていません');
  }

  try {
    // 画像をBase64に変換
    const base64Image = await fileToBase64(imageFile);

    const prompt = `
あなたは日本語のレシート解析の専門家です。
このレシート画像から商品名と価格を正確に抽出してください。

以下のJSON形式で出力してください：
{
  "storeName": "店舗名（わかれば）",
  "date": "日付（YYYY-MM-DD形式、わかれば）",
  "total": 合計金額（数値、わかれば）,
  "items": [
    {
      "name": "商品名",
      "price": 価格（数値）,
      "quantity": 数量（数値、デフォルトは1）
    }
  ]
}

**重要な指示:**
1. 商品名と価格は必ず正確に抽出してください
2. 価格は数値のみ（円記号やカンマは除く）
3. 同じ商品が複数ある場合はquantityで表現
4. 合計金額や税金などの行は除外
5. 不明な項目は省略してOK
6. 必ずJSONのみを返してください（説明文は不要）
`.trim();

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    console.log('[Gemini Receipt] APIリクエスト送信');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType: imageFile.type || 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1, // 低めにして正確性を重視
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      }),
    });

    console.log('[Gemini Receipt] APIレスポンス受信', { status: response.status });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Gemini Receipt] APIエラー', errorText);
      throw new Error(`Gemini API エラー: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('[Gemini Receipt] レスポンスデータ', data);

    // レスポンスからテキストを抽出
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text.trim();
        console.log('[Gemini Receipt] 抽出テキスト:', text);

        // JSONを抽出（マークダウンのコードブロックを除去）
        let jsonText = text;
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else if (text.includes('```')) {
          const codeMatch = text.match(/```\s*([\s\S]*?)\s*```/);
          if (codeMatch) {
            jsonText = codeMatch[1];
          }
        }

        // JSONをパース
        const parsedData = JSON.parse(jsonText);

        const result: ReceiptOCRResult = {
          items: parsedData.items || [],
          total: parsedData.total,
          storeName: parsedData.storeName,
          date: parsedData.date,
          rawText: text,
        };

        console.log('[Gemini Receipt] OCR成功', result);
        return result;
      }
    }

    throw new Error('レシートからテキストを抽出できませんでした');
  } catch (error) {
    console.error('[Gemini Receipt] エラー:', error);
    throw error;
  }
}

/**
 * モックレシピデータ（API無効時やエラー時のフォールバック）
 */
function getMockRecipe(
  ingredients: string[],
  dietaryRestriction: DietaryRestriction,
  difficulty: RecipeDifficulty = 'none'
): string {
  const dietLabel =
    dietaryRestriction === 'vegetarian'
      ? 'ベジタリアン'
      : dietaryRestriction === 'vegan'
      ? 'ヴィーガン'
      : '';
  const difficultyLabel =
    difficulty === 'super_easy'
      ? '（超簡単）'
      : difficulty === 'under_5min'
      ? '（5分）'
      : difficulty === 'under_10min'
      ? '（10分）'
      : difficulty === 'no_fire'
      ? '（火を使わない）'
      : '';

  return `
【料理名】
${ingredients.join('と')}の${dietLabel}炒め${difficultyLabel}

【材料】
${ingredients.map((ing) => `・${ing} 適量`).join('\n')}
・塩、こしょう 少々
・サラダ油 大さじ1

【作り方】
1. ${ingredients[0] || '材料'}を食べやすい大きさに切ります。
2. フライパンに油を熱し、材料を炒めます。
3. 塩、こしょうで味を調えて完成です。

【ポイント】
シンプルな炒め物なので、お好みで醤油やにんにくを加えても美味しいです。
野菜の食感を残すため、強火でサッと炒めるのがコツです。

※ このレシピはデモ用のモックデータです。実際のGemini APIキーを設定すると、AIが本格的なレシピを生成します。
※ 403エラーが発生しています。新しいAPIキーを https://aistudio.google.com/app/apikey で取得してください。
`.trim();
}
