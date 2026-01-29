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
      maxOutputTokens: options.maxOutputTokens ?? 8192,
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
      const result = await callGeminiApi(promptWithLanguage, { temperature: 0.7, maxOutputTokens: 8192, model: 'pro' });
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
    model?: 'pro' | 'flash';
  } = {}
): Promise<any> {
  const apiKey = getGeminiApiKey();
  const modelName = options.model === 'pro' ? PRO_MODEL_NAME : FLASH_MODEL_NAME;
  const url = `${GEMINI_API_BASE_URL}/models/${modelName}:generateContent?key=${apiKey}`;

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
        { temperature: 0.3, maxOutputTokens: 4096, model: 'pro' }
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

/**
 * 傾向に基づいた1週間分の買い物リストを生成
 */
export const generateShoppingListWithTrend = functions.https.onCall(
  { timeoutSeconds: 60, memory: '256MiB' }, // タイムアウトとメモリを削減（API呼ばないので）
  async (request: any) => {
    const { trend } = request.data;
    // const languageName = getLanguageName(language || 'ja'); // ローカル生成なので一旦日本語固定または簡易対応

    if (!trend) {
      throw new functions.https.HttpsError('invalid-argument', '傾向が指定されていません');
    }

    // 1. 食材データベース (米は除外済み)
    // type: カテゴリ (staple, protein, vegetable, fruit, dairy, seasoning, other)
    // trends: その食材が適している傾向 (空配列なら全傾向OK)
    interface Ingredient {
      name: string;
      category: string;
      trends?: string[]; // 指定がなければ汎用
    }

    const INGREDIENTS_DB: Ingredient[] = [
      // --- Protein (主菜・タンパク質) ---
      { name: '鶏むね肉', category: 'protein', trends: ['diet', 'healthy', 'economical', 'balanced'] },
      { name: '鶏ささみ', category: 'protein', trends: ['diet', 'healthy', 'quick'] },
      { name: '豚こま切れ肉', category: 'protein', trends: ['economical', 'quick', 'balanced'] },
      { name: '豚ロース薄切り', category: 'protein', trends: ['balanced', 'quick'] },
      { name: '牛切り落とし肉', category: 'protein', trends: ['balanced', 'quick'] },
      { name: '合い挽き肉', category: 'protein', trends: ['economical', 'quick', 'balanced'] },
      { name: '鮭の切り身', category: 'protein', trends: ['balanced', 'healthy', 'diet'] },
      { name: 'サバの切り身', category: 'protein', trends: ['balanced', 'healthy'] },
      { name: '木綿豆腐', category: 'protein', trends: ['diet', 'healthy', 'economical', 'balanced'] },
      { name: '納豆', category: 'protein', trends: ['healthy', 'economical', 'diet', 'balanced'] },
      { name: '卵', category: 'protein', trends: ['economical', 'quick', 'balanced', 'diet'] },
      { name: 'ツナ缶', category: 'protein', trends: ['quick', 'economical', 'balanced'] },

      // --- Vegetable (野菜) ---
      { name: 'キャベツ', category: 'vegetable', trends: ['economical', 'diet', 'balanced'] },
      { name: 'レタス', category: 'vegetable', trends: ['quick', 'healthy', 'balanced'] },
      { name: 'トマト', category: 'vegetable', trends: ['healthy', 'quick', 'balanced'] },
      { name: 'きゅうり', category: 'vegetable', trends: ['quick', 'diet', 'balanced'] },
      { name: 'ブロッコリー', category: 'vegetable', trends: ['healthy', 'diet', 'balanced'] },
      { name: 'ほうれん草', category: 'vegetable', trends: ['healthy', 'balanced'] },
      { name: '小松菜', category: 'vegetable', trends: ['economical', 'healthy', 'balanced'] },
      { name: '玉ねぎ', category: 'vegetable', trends: ['economical', 'balanced', 'healthy'] },
      { name: 'にんじん', category: 'vegetable', trends: ['economical', 'balanced', 'healthy'] },
      { name: 'じゃがいも', category: 'vegetable', trends: ['economical', 'balanced'] },
      { name: 'もやし', category: 'vegetable', trends: ['economical', 'diet', 'quick'] },
      { name: 'きのこセット', category: 'vegetable', trends: ['diet', 'healthy', 'economical'] },
      { name: '大根', category: 'vegetable', trends: ['economical', 'diet'] },
      { name: 'ピーマン', category: 'vegetable', trends: ['balanced', 'healthy'] },

      // --- Fruit (果物) ---
      { name: 'バナナ', category: 'fruit', trends: ['economical', 'quick', 'balanced', 'healthy'] },
      { name: 'りんご', category: 'fruit', trends: ['healthy', 'balanced'] },
      { name: 'キウイフルーツ', category: 'fruit', trends: ['healthy', 'diet'] },

      // --- Dairy (乳製品) ---
      { name: '牛乳', category: 'dairy', trends: ['balanced', 'healthy'] },
      { name: 'ヨーグルト', category: 'dairy', trends: ['healthy', 'diet', 'balanced'] },
      { name: 'チーズ', category: 'dairy', trends: ['quick', 'balanced'] },

      // --- Staple (主食 - 米以外) ---
      { name: '食パン', category: 'staple', trends: ['quick', 'economical', 'balanced'] },
      { name: 'うどん', category: 'staple', trends: ['quick', 'economical'] },
      { name: 'パスタ', category: 'staple', trends: ['economical', 'balanced'] },
      { name: 'オートミール', category: 'staple', trends: ['diet', 'healthy'] },

      // --- Other (その他) ---
      { name: '味噌', category: 'seasoning', trends: ['balanced', 'healthy'] },
      { name: 'だしパック', category: 'seasoning', trends: ['quick', 'balanced'] }
    ];

    // 2. 傾向ごとの構成比率定義（栄養バランスを担保するロジック）
    // 合計が7〜10個程度になるように設定
    const COMPOSITION: { [key: string]: { [category: string]: number } } = {
      'balanced': { protein: 3, vegetable: 4, fruit: 1, dairy: 1, staple: 1, seasoning: 1 },
      'healthy': { protein: 3, vegetable: 5, fruit: 2, dairy: 1, staple: 0, seasoning: 0 },
      'economical': { protein: 2, vegetable: 4, fruit: 0, dairy: 0, staple: 2, seasoning: 0 }, // 安い食材中心
      'quick': { protein: 2, vegetable: 3, fruit: 1, dairy: 1, staple: 2, seasoning: 0 },
      'diet': { protein: 4, vegetable: 5, fruit: 0, dairy: 1, staple: 0, seasoning: 0 }, // 高タンパク・低脂質
    };

    const targetComposition = COMPOSITION[trend] || COMPOSITION['balanced'];

    // 3. ランダム抽出ロジック
    const selectedItems: any[] = [];
    const usedNames = new Set<string>();

    Object.entries(targetComposition).forEach(([category, count]) => {
      // そのカテゴリで、かつトレンドに合う（または汎用の）食材をフィルタリング
      const candidates = INGREDIENTS_DB.filter(item =>
        item.category === category &&
        (!item.trends || item.trends.includes(trend))
      );

      // ランダムにシャッフル
      const shuffled = candidates.sort(() => 0.5 - Math.random());

      // 指定数だけピックアップ
      let pickedCount = 0;
      for (const item of shuffled) {
        if (pickedCount >= count) break;
        if (!usedNames.has(item.name)) {
          selectedItems.push({
            name: item.name,
            quantity: 1, // 数量は1固定
            category: item.category
          });
          usedNames.add(item.name);
          pickedCount++;
        }
      }
    });

    // 4. サマリー生成
    const trendNames: { [key: string]: string } = {
      'balanced': '栄養バランスの整った',
      'healthy': '野菜たっぷりでヘルシーな',
      'economical': 'お財布に優しい',
      'quick': '時短で作れる',
      'diet': '高タンパク・低カロリーな'
    };
    const summary = `${trendNames[trend] || 'バランスの良い'}食材を厳選しました。在庫に合わせて活用してください。`;

    console.log('Generated Logic-based Shopping List:', selectedItems);

    return {
      success: true,
      shoppingList: {
        items: selectedItems,
        summary: summary
      }
    };
  }
);
