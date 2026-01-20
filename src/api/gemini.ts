/**
 * api/gemini.ts — Google Gemini API連携
 *
 * AIレシピ生成・健康分析・レシートOCR・カロリー計測機能を提供し * ⚠️ 重要: gemini-2.5-proを使用（Tier 1従量制プラン）/

import type { RecipeDifficulty, DietaryRestriction } from '../types';
import { useSettingsStore } from '../store';
import { httpsCallable } from 'firebase/functions';
import { functions as firebaseFunctions } from '../config/firebase';

// 運営者APIキーのキャッシュ（パフォーマンス向上のため）
let cachedOperatorApiKey: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間キャッシュ
let isFetchingFromFirestore = false; // 重複リクエストを防ぐ

/**
 * 運営者のAPIキーを取得（Firestore → 環境変数 → デフォルトの順で試行）
 * 非同期でFirestoreから取得を試みるが、同期関数として動作（キャッシュを使用）
 */
function getOperatorApiKey(): string | null {
  // キャッシュが有効な場合はキャッシュを返す
  const now = Date.now();
  if (cachedOperatorApiKey && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedOperatorApiKey;
  }

  // Firestoreから非同期で取得を試みる（バックグラウンドで実行）
  // エラーが発生してもアプリケーションの動作を妨げないようにする
  if (!isFetchingFromFirestore) {
    isFetchingFromFirestore = true;
    import('../utils/firestore').then(({ adminOperations }) => {
      adminOperations.getConfig().then((config) => {
        if (config?.geminiApiKey && config.geminiApiKey.trim() !== '') {
          cachedOperatorApiKey = config.geminiApiKey.trim();
          cacheTimestamp = Date.now();
          console.log('[Gemini] 運営者APIキーをFirestoreから取得');
        }
        isFetchingFromFirestore = false;
      }).catch((error) => {
        // Firestoreからの取得に失敗しても、エラーを出さない（フォールバックを使用）
        console.warn('[Gemini] FirestoreからAPIキー取得失敗（フォールバックを使用）:', error);
        isFetchingFromFirestore = false;
      });
    }).catch((error) => {
      // モジュールのインポートに失敗しても、エラーを出さない
      console.warn('[Gemini] Firestoreモジュールのインポート失敗（フォールバックを使用）:', error);
      isFetchingFromFirestore = false;
    });
  }

  // 環境変数から取得を試みる
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    if (!cachedOperatorApiKey || cachedOperatorApiKey !== envKey) {
      cachedOperatorApiKey = envKey;
      cacheTimestamp = now;
    }
    return envKey;
  }

  // デフォルト値（フォールバック）
  // セキュリティのためハードコードされたキーは削除
  return null;
}

/**
 * 運営者APIキーのキャッシュをクリア（APIキー更新時に使用）
 */
export function clearOperatorApiKeyCache(): void {
  cachedOperatorApiKey = null;
  cacheTimestamp = 0;
}

/**
 * ユーザーのAPIキーを取得（設定から取得）
 */
function getUserApiKey(): string | null {
  const settings = useSettingsStore.getState().settings;
  if (settings.geminiApiKey && settings.geminiApiKey.trim() !== '') {
    return settings.geminiApiKey.trim();
  }
  return null;
}


/**
 * APIが有効かどうかをチェック
 */
function isApiEnabled(): boolean {
  const operatorKey = getOperatorApiKey();
  const userKey = getUserApiKey();
  return !!(operatorKey || userKey);
}

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
    code?: number;
    status?: string;
  };
  rawError?: string;
}

// リクエスト追跡用
interface RequestLog {
  type: 'recipe' | 'receipt';
  timestamp: number;
}

let requestLog: RequestLog[] = [];

/**
 * 直近1分間のリクエスト数を表示
 */
function logRequestStats(newRequestType: 'recipe' | 'receipt') {
  const now = Date.now();

  // 新しいリクエストを記録
  requestLog.push({ type: newRequestType, timestamp: now });

  // 1分以内のリクエストをフィルター
  requestLog = requestLog.filter(r => now - r.timestamp < 60000);

  const recipeCount = requestLog.filter(r => r.type === 'recipe').length;
  const receiptCount = requestLog.filter(r => r.type === 'receipt').length;
  const totalCount = requestLog.length;

  console.log(`[API Usage] 直近1分間の合計リクエスト数: ${totalCount}回`);
  console.log(`  - レシピ生成: ${recipeCount}回`);
  console.log(`  - レシートOCR: ${receiptCount}回`);
  console.log(`  - 残り制限枠: ${15 - totalCount}回 (Free Tier: 15回/分)`);
}

/**
 * 429エラー時に自動リトライするヘルパー関数
 */
async function retryOn429<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  apiKeyName: string = 'APIキー'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const errorStatus = (error as Error & { status?: number; errorData?: GeminiError })?.status;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // 429エラーの場合のみリトライ
      if (errorStatus === 429 && attempt < maxRetries) {
        // retry-afterヘッダーまたはエラーメッセージから待機時間を抽出
        const retryAfterMatch = errorMessage.match(/retry in ([\d.]+)s/i) ||
          errorMessage.match(/([\d.]+)秒後/i);
        const retryAfter = retryAfterMatch ? parseFloat(retryAfterMatch[1]) : 5; // デフォルト5秒

        console.log(`[Gemini] ${apiKeyName}で429エラー発生。${Math.ceil(retryAfter)}秒後にリトライします... (試行 ${attempt + 1}/${maxRetries + 1})`);

        // 待機時間に少し余裕を持たせる
        await new Promise(resolve => setTimeout(resolve, Math.ceil(retryAfter * 1000) + 1000));

        lastError = error as Error;
        continue;
      }

      // 429エラー以外、または最大リトライ回数に達した場合はエラーを投げる
      throw error;
    }
  }

  // ここには到達しないはずだが、型安全性のため
  throw lastError || new Error('リトライに失敗しました');
}

/**
 * Geminiのやり取りをログに記録（非同期・Fire-and-Forget）
 */
const logInteraction = (
  requestType: string,
  prompt: string,
  response: string,
  model: string,
  status: 'success' | 'error',
  errorMessage?: string,
  metadata?: any
) => {
  try {
    const logGeminiInteraction = httpsCallable(firebaseFunctions, 'logGeminiInteraction');
    logGeminiInteraction({
      requestType,
      prompt,
      response,
      model,
      status,
      errorMessage,
      metadata,
      timestamp: Date.now(),
    }).catch((err) => {
      console.warn('[Gemini] Logging failed (background):', err);
    });
  } catch (err) {
    console.warn('[Gemini] Logging initialization failed:', err);
  }
};

/**
 * 過去の成功例を取得（Few-shot Prompting用）
 */
const fetchExamples = async (requestType: string): Promise<string> => {
  try {
    const getFewShotExamples = httpsCallable(firebaseFunctions, 'getFewShotExamples');

    // タイムアウトを設定（例取得に時間がかかりすぎてUXを損なわないように）
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );

    const resultPromise = getFewShotExamples({ requestType, limit: 2 });

    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const examples = result.data.examples || [];

    if (examples.length === 0) return '';

    let examplesText = '\n\n【出力例（参考）】\n以下の形式とトーンを参考にしてください。\n';
    examples.forEach((ex: any, index: number) => {
      // プロンプトが長くなりすぎないように、例の長さを制限するなどの処理が必要かも
      examplesText += `\n--- 例 ${index + 1} ---\nAI: ${ex.response}\n`;
    });

    console.log(`[Gemini] Fetched ${examples.length} few-shot examples`);
    return examplesText;
  } catch (err) {
    console.warn('[Gemini] Failed to fetch examples (skipping):', err);
    return '';
  }
};

/**
 * 材料からレシピを生成（内部実装：指定されたAPIキーで試行）
 */
/**
 * 在庫からレシピを生成（在庫リストをすべて送信）
 */
async function generateRecipeFromStockWithKey(
  apiKey: string,
  stockItems: Array<{ name: string; quantity: number; daysRemaining?: number; category?: string }>,
  dietaryRestriction: DietaryRestriction,
  difficulty: RecipeDifficulty,
  customRequest: string
): Promise<string> {
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

    // 在庫リストをフォーマット
    const stockList = stockItems.map((item) => {
      let info = item.name;
      if (item.quantity > 1) {
        info += ` (${item.quantity}個)`;
      }
      if (item.daysRemaining !== undefined && item.daysRemaining <= 3) {
        info += ' ⚠️期限間近';
      }
      return info;
    }).join('\n');

    // 過去の成功例を取得
    const examples = await fetchExamples('recipe_from_stock');

    const prompt = `
あなたは日本語で答えるプロの料理アドバイザーです。
必ず日本語で回答してください。英語は使わないでください。

以下の在庫から使える${dietLabel}向けの家庭向けレシピを1つ提案してください。
**重要**: 提案するレシピは、以下の在庫リストの中から材料を選んで作れるものにしてください。
在庫にない材料は使わないでください。ただし、基本的な調味料（塩、胡椒、油など）は使用可能とします。

在庫リスト:
${stockList}

料理名・材料・手順・ポイントを含めて出力してください。${difficultyCondition}${additionalRequirements}

出力フォーマットは以下の形式でお願いします：

---
【料理名】
（料理名）

【材料】
（材料一覧 - 在庫リストから選んだ材料を明記）

【作り方】
1.
2.
3.

【ポイント】
（料理のコツやアドバイス）
---
${examples}

在庫から使える材料を最大限活用したレシピを提案してください。
`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    logRequestStats('recipe');

    console.log('[Gemini] 在庫からレシピ生成APIリクエスト送信', {
      stockCount: stockItems.length,
      url: apiKey ? url.replace(apiKey, 'HIDDEN') : url
    });

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
          maxOutputTokens: 2048, // 在庫リストが長い場合があるので増やす
        },
      }),
    });

    console.log('[Gemini] APIレスポンス受信', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: GeminiError;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { rawError: errorText };
      }

      console.error('[Gemini] APIエラー発生', {
        status: response.status,
        error: errorData,
      });

      const errorMessage = errorData.error?.message || errorData.rawError || 'Unknown error';
      const errorStatus = response.status;

      const error = new Error(errorMessage) as Error & { status?: number; errorData?: GeminiError };
      error.status = errorStatus;
      error.errorData = errorData;

      throw error;
    }

    const data: GeminiResponse = await response.json();
    const recipeText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'レシピの生成に失敗しました。';

    console.log('[Gemini] レシピ生成成功', { length: recipeText.length });

    // ログ記録（成功）
    logInteraction(
      'recipe_from_stock',
      prompt,
      recipeText,
      'gemini-2.5-pro',
      'success',
      undefined,
      { stockCount: stockItems.length, dietaryRestriction, difficulty, customRequest }
    );

    return recipeText;
  } catch (error) {
    console.error('[Gemini] レシピ生成エラー', error);

    // ログ記録（エラー）
    // prompt変数がスコープ外になる可能性があるため、tryブロック内で定義するか、ここで再構築する必要があるが、
    // 簡易的にエラーのみ記録するか、構造を見直す。
    // ここではエラー発生時の詳細なコンテキストがないため、最低限の情報を記録
    logInteraction(
      'recipe_from_stock',
      'ERROR_DURING_GENERATION', // プロンプトは取得できない場合がある
      '',
      'gemini-2.5-pro',
      'error',
      error instanceof Error ? error.message : String(error),
      { stockCount: stockItems.length, dietaryRestriction, difficulty, customRequest }
    );

    throw error;
  }
}

async function generateRecipeWithKey(
  apiKey: string,
  ingredients: string[],
  dietaryRestriction: DietaryRestriction,
  difficulty: RecipeDifficulty,
  customRequest: string
): Promise<string> {
  try {
    if (!ingredients || ingredients.length === 0) {
      throw new Error('材料を指定してください。');
    }

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

    // 過去の成功例を取得
    const examples = await fetchExamples('recipe');

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
${examples}
`.trim(    // Gemini 2.5 Pro（Tier 1従量制）を使用  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

    // リクエスト統計を記録
    logRequestStats('recipe');

    console.log('[Gemini] APIリクエスト送信', { url: apiKey ? url.replace(apiKey, 'HIDDEN') : url });

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

    // レート制限情報をログ出力（開発者向け）
    console.log('[Gemini] Rate Limit Info:', {
      limit: response.headers.get('x-ratelimit-limit'),
      remaining: response.headers.get('x-ratelimit-remaining'),
      reset: response.headers.get('x-ratelimit-reset'),
      retryAfter: response.headers.get('retry-after'),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: GeminiError;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { rawError: errorText };
      }

      // すべてのエラーを詳細にログ出力
      console.error('[Gemini] APIエラー発生', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        errorData: errorData,
        errorMessage: errorData.error?.message,
        errorCode: errorData.error?.code,
        errorStatus: errorData.error?.status,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'なし',
        apiKeyLength: apiKey ? apiKey.length : 0,
        url: url.replace(apiKey, 'HIDDEN'),
      });

      // エラーメッセージを見やすく
      let errorMessage = `Gemini API エラー (${response.status})`;
      if (errorData.error?.message) {
        errorMessage += `: ${errorData.error.message}`;
      } else if (errorData.rawError) {
        errorMessage += `: ${errorData.rawError}`;
      }

      // 403エラーの場合
      if (response.status === 403) {
        errorMessage = `APIキーが無効または権限が不足しています (403)\n\n詳細: ${errorData.error?.message || errorData.rawError || 'Permission denied'}\n\n設定画面でAPIキーを確認してください。`;
      }

      // 429エラーの場合
      if (response.status === 429) {
        // リトライ待機時間を抽出（あれば）
        const retryAfter = response.headers.get('retry-after') ||
          (errorText.match(/retry in ([\d.]+)s/i)?.[1]);
        const retryMessage = retryAfter ? `\n\n約${Math.ceil(parseFloat(retryAfter))}秒後に再試行できます。` : '';

        // エラーメッセージから詳細情報を抽出
        const quotaInfo = errorData.error?.message || errorText;
        const isFreeTierLimit = quotaInfo.includes('free_tier') || quotaInfo.includes('limit: 0');
        const tierMessage = isFreeTierLimit
          ? '\n\n⚠️ 無料プランのクォータ制限に達しています。有料プランへのアップグレードを検討してください。'
          : '';

        errorMessage = `API使用制限に達しました (429)\n\n詳細: ${quotaInfo}${retryMessage}${tierMessage}\n\nしばらく待ってから再度お試しください。`;
      }

      // 400エラーの場合（リクエスト形式の問題）
      if (response.status === 400) {
        errorMessage = `リクエスト形式が不正です (400)\n\n詳細: ${errorData.error?.message || errorData.rawError || 'Bad Request'}`;
      }

      const error = new Error(errorMessage) as Error & { status?: number; errorData?: GeminiError };
      error.status = response.status;
      error.errorData = errorData;
      throw error;
    }

    const data: GeminiResponse = await response.json();
    console.log('[Gemini] レスポンスデータ', data);

    // レスポンスからテキストを抽出
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content?.parts && candidate.content.parts.length > 0) {
        const text = candidate.content.parts[0].text;
        console.log('[Gemini] レシピ生成成功');

        // ログ記録（成功）
        logInteraction(
          'recipe',
          prompt,
          text.trim(),
          'gemini-2.5-pro',
          'success',
          undefined,
          { ingredients, dietaryRestriction, difficulty, customRequest }
        );

        return text.trim();
      }
    }

    console.error('[Gemini] レスポンス形式が不正', data);
    throw new Error('Gemini APIからレシピを取得できませんでした。');
  } catch (error) {
    console.error('[Gemini] generateRecipeWithKey でエラー発生', {
      error: error,
      errorType: typeof error,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      hasStatus: error instanceof Error && 'status' in error,
    });

    // ログ記録（エラー）
    logInteraction(
      'recipe',
      'ERROR_DURING_GENERATION',
      '',
      'gemini-2.5-pro',
      'error',
      error instanceof Error ? error.message : String(error),
      { ingredients, dietaryRestriction, difficulty, customRequest }
    );

    // ネットワークエラーなどの場合、statusプロパティがない可能性がある
    if (error instanceof Error && !('status' in error)) {
      const networkError = error as Error & { status?: number; errorData?: GeminiError };
      networkError.status = 0; // ネットワークエラーを示す

      // ネットワークエラーの詳細を追加
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        networkError.message = `ネットワークエラー: ${error.message}\n\nインターネット接続を確認してください。`;
      }

      throw networkError;
    }
    throw error;
  }
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
  const operatorKey = getOperatorApiKey();
  const userKey = getUserApiKey();
  const apiEnabled = isApiEnabled();

  // デバッグ: 設定ストアの状態を確認
  const settings = useSettingsStore.getState().settings;
  console.log('[Gemini] API呼び出し開始', {
    ingredients,
    dietaryRestriction,
    difficulty,
    customRequest,
    API_ENABLED: apiEnabled,
    hasOperatorKey: !!operatorKey,
    hasUserKey: !!userKey,
    userApiKeyFromSettings: settings.geminiApiKey ? `${settings.geminiApiKey.substring(0, 10)}...` : 'なし',
    operatorKeyPrefix: operatorKey ? `${operatorKey.substring(0, 10)}...` : 'なし',
  });

  if (!apiEnabled) {
    console.warn('Gemini APIが無効です。モックデータを返します。');
    return getMockRecipe(ingredients, dietaryRestriction, difficulty);
  }

  // ユーザーのAPIキーが設定されている場合、優先的に使用
  if (userKey) {
    try {
      console.log('[Gemini] ユーザーのAPIキーで試行（優先）');
      return await generateRecipeWithKey(userKey, ingredients, dietaryRestriction, difficulty, customRequest);
    } catch (error) {
      const errorStatus = (error as Error & { status?: number })?.status;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // エラーメッセージから429エラーを検出（statusプロパティがない場合でも）
      const isQuotaError = errorStatus === 429 ||
        errorMessage.includes('429') ||
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('制限');

      console.error('[Gemini] ユーザーのAPIキーでエラー発生', {
        status: errorStatus,
        error: errorMessage,
        errorType: typeof error,
        errorKeys: error instanceof Error ? Object.keys(error) : [],
        isQuotaError: isQuotaError,
        hasOperatorKey: !!operatorKey,
      });

      // ユーザーのAPIキーでエラーが発生した場合、運営者のAPIキーで再試行
      // 403、429、またはネットワークエラーの場合
      if (operatorKey && (errorStatus === 403 || errorStatus === 429 || errorStatus === 0 || isQuotaError)) {
        console.warn('[Gemini] ユーザーのAPIキーでエラー発生。運営者のAPIキーで再試行します。', {
          status: errorStatus,
          error: errorMessage,
          isQuotaError: isQuotaError,
        });
        try {
          console.log('[Gemini] 運営者のAPIキーで再試行');
          return await retryOn429(
            () => generateRecipeWithKey(operatorKey, ingredients, dietaryRestriction, difficulty, customRequest),
            1, // 最大1回リトライ
            '運営者APIキー'
          );
        } catch (operatorError) {
          const operatorErrorStatus = (operatorError as Error & { status?: number })?.status;
          const operatorErrorMessage = operatorError instanceof Error ? operatorError.message : String(operatorError);

          console.error('[Gemini] 運営者のAPIキーでもエラー発生', {
            status: operatorErrorStatus,
            error: operatorErrorMessage,
          });

          // 運営者のAPIキーでもエラーの場合、より詳細なエラーメッセージを表示
          if (operatorErrorStatus === 429 || operatorErrorMessage.includes('429') || operatorErrorMessage.includes('Quota exceeded')) {
            throw new Error(`両方のAPIキーで使用制限に達しました。\n\nユーザーAPIキー: ${errorMessage}\n運営者APIキー: ${operatorErrorMessage}\n\nしばらく待ってから再度お試しください。`);
          }

          throw error; // ユーザーのAPIキーのエラーを優先して表示
        }
      } else {
        throw error;
      }
    }
  }

  // ユーザーのAPIキーがない場合、運営者のAPIキーで試行
  if (operatorKey) {
    try {
      console.log('[Gemini] 運営者のAPIキーで試行');
      return await retryOn429(
        () => generateRecipeWithKey(operatorKey, ingredients, dietaryRestriction, difficulty, customRequest),
        1, // 最大1回リトライ
        '運営者APIキー'
      );
    } catch (error) {
      const errorStatus = (error as Error & { status?: number })?.status;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[Gemini] 運営者のAPIキーでエラー発生', {
        status: errorStatus,
        error: errorMessage,
        errorType: typeof error,
        errorKeys: error instanceof Error ? Object.keys(error) : [],
      });
      throw error;
    }
  }

  // APIキーが全くない場合
  console.warn('Gemini APIキーが設定されていません。モックデータを返します。');
  return getMockRecipe(ingredients, dietaryRestriction, difficulty);
}

/**
 * 在庫からレシピを生成（在庫リストをすべて送信）
 */
export async function generateRecipeFromStock(
  stockItems: Array<{ name: string; quantity: number; daysRemaining?: number; category?: string }>,
  dietaryRestriction: DietaryRestriction = 'none',
  difficulty: RecipeDifficulty = 'none',
  customRequest = ''
): Promise<string> {
  const operatorKey = getOperatorApiKey();
  const userKey = getUserApiKey();
  const apiEnabled = isApiEnabled();

  console.log('[Gemini] 在庫からレシピ生成API呼び出し開始', {
    stockCount: stockItems.length,
    dietaryRestriction,
    difficulty,
    customRequest,
    API_ENABLED: apiEnabled,
    hasOperatorKey: !!operatorKey,
    hasUserKey: !!userKey,
  });

  if (!apiEnabled) {
    console.warn('Gemini APIが無効です。モックデータを返します。');
    const ingredientNames = stockItems.map(item => item.name);
    return getMockRecipe(ingredientNames, dietaryRestriction, difficulty);
  }

  // ユーザーのAPIキーが設定されている場合、優先的に使用
  if (userKey) {
    try {
      console.log('[Gemini] ユーザーのAPIキーで在庫からレシピ生成を試行（優先）');
      return await retryOn429(
        () => generateRecipeFromStockWithKey(userKey, stockItems, dietaryRestriction, difficulty, customRequest),
        1,
        'ユーザーAPIキー'
      );
    } catch (error) {
      const errorStatus = (error as Error & { status?: number })?.status;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const isQuotaError = errorStatus === 429 ||
        errorMessage.includes('429') ||
        errorMessage.includes('Quota exceeded') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('制限');

      console.error('[Gemini] ユーザーのAPIキーでエラー発生', {
        status: errorStatus,
        error: errorMessage,
        isQuotaError: isQuotaError,
        hasOperatorKey: !!operatorKey,
      });

      // ユーザーのAPIキーでエラーが発生した場合、運営者のAPIキーで再試行
      if (operatorKey && (errorStatus === 403 || errorStatus === 429 || errorStatus === 0 || isQuotaError)) {
        console.warn('[Gemini] ユーザーのAPIキーでエラー発生。運営者のAPIキーで再試行します。');
        try {
          console.log('[Gemini] 運営者のAPIキーで在庫からレシピ生成を再試行');
          return await retryOn429(
            () => generateRecipeFromStockWithKey(operatorKey, stockItems, dietaryRestriction, difficulty, customRequest),
            1,
            '運営者APIキー'
          );
        } catch (operatorError) {
          console.error('[Gemini] 運営者のAPIキーでもエラー発生', operatorError);
          throw operatorError;
        }
      } else {
        throw error;
      }
    }
  }

  // ユーザーのAPIキーがない場合、運営者のAPIキーで試行
  if (operatorKey) {
    try {
      console.log('[Gemini] 運営者のAPIキーで在庫からレシピ生成を試行');
      return await retryOn429(
        () => generateRecipeFromStockWithKey(operatorKey, stockItems, dietaryRestriction, difficulty, customRequest),
        1,
        '運営者APIキー'
      );
    } catch (error) {
      const errorStatus = (error as Error & { status?: number })?.status;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error('[Gemini] 運営者のAPIキーでエラー発生', {
        status: errorStatus,
        error: errorMessage,
      });
      throw error;
    }
  }

  // APIキーが全くない場合
  console.warn('Gemini APIキーが設定されていません。モックデータを返します。');
  const ingredientNames = stockItems.map(item => item.name);
  return getMockRecipe(ingredientNames, dietaryRestriction, difficulty);
}

/**
 * Gemini APIが有効かどうかを返す
 */
export function isGeminiEnabled(): boolean {
  return isApiEnabled();
}

/**
 * テキスト生成（内部実装：指定されたAPIキーで試行）
 */
async function generateTextWithKey(apiKey: string, prompt: string): Promise<string> {
  // gemini-2.0-flash-expは無料プランで利用できない可能性があるため、gemini-2.5-proに変更
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  logRequestStats('recipe'); // テキスト生成もrecipeとしてカウント

  console.log('[Gemini Text] APIリクエスト送信');

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
        maxOutputTokens: 2048,
      },
    }),
  });

  console.log('[Gemini Text] APIレスポンス受信', { status: response.status });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini Text] APIエラー', errorText);
    const error = new Error(`Gemini API エラー: ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const data: GeminiResponse = await response.json();
  console.log('[Gemini Text] レスポンスデータ受信');

  // レスポンスからテキストを抽出
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate.content?.parts && candidate.content.parts.length > 0) {
      const text = candidate.content.parts[0].text.trim();
      console.log('[Gemini Text] テキスト生成成功');
      return text;
    }
  }

  throw new Error('テキストを生成できませんでした');
}

/**
 * テキスト生成（月次レポートのAI改善提案など）
 */
export async function generateText(prompt: string): Promise<string> {
  console.log('[Gemini Text] テキスト生成開始');

  const operatorKey = getOperatorApiKey();
  const userKey = getUserApiKey();
  const apiEnabled = isApiEnabled();

  if (!apiEnabled) {
    throw new Error('Gemini APIキーが設定されていません。設定画面でAPIキーを設定してください。');
  }

  // まず運営者のAPIキーで試行
  if (operatorKey) {
    try {
      console.log('[Gemini Text] 運営者のAPIキーで試行');
      return await generateTextWithKey(operatorKey, prompt);
    } catch (error) {
      const errorStatus = (error as Error & { status?: number })?.status;
      // 403または429エラーの場合、ユーザーのAPIキーで再試行
      if (errorStatus === 403 || errorStatus === 429) {
        console.warn('[Gemini Text] 運営者のAPIキーでエラー発生。ユーザーのAPIキーで再試行します。', {
          status: errorStatus,
        });
        if (userKey) {
          try {
            console.log('[Gemini Text] ユーザーのAPIキーで再試行');
            return await generateTextWithKey(userKey, prompt);
          } catch (userError) {
            console.error('[Gemini Text] ユーザーのAPIキーでもエラー発生', userError);
            throw userError;
          }
        } else {
          console.error('[Gemini Text] ユーザーのAPIキーが設定されていません');
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  // 運営者のAPIキーがない場合、ユーザーのAPIキーで試行
  if (userKey) {
    try {
      console.log('[Gemini Text] ユーザーのAPIキーで試行');
      return await generateTextWithKey(userKey, prompt);
    } catch (error) {
      console.error('[Gemini Text] ユーザーのAPIキーでエラー発生', error);
      throw error;
    }
  }

  throw new Error('Gemini APIキーが設定されていません。設定画面でAPIキーを設定してください。');
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
 * 料理画像からカロリーを推定（内部実装：指定されたAPIキーで試行）
 */
async function scanCalorieWithKey(apiKey: string, mealName: string, imageFile: File): Promise<{ calories: number; reasoning: string; confidence?: number }> {
  // 画像をBase64に変換
  const base64Image = await fileToBase64(imageFile);

  const prompt = `
あなたは栄養学の専門家です。
この料理画像を見て、料理名「${mealName}」のカロリーを推定してください。

以下のJSON形式で出力してください：
{
  "calories": 推定カロリー（数値、kcal単位）,
  "reasoning": "カロリー推定の根拠（料理の内容、量、調理方法などを考慮した理由を日本語で詳しく説明）",
  "confidence": 信頼度（0-100の数値、オプション）
}

**重要な指示:**
1. 料理名と画像の両方を参考にして、できるだけ正確なカロリーを推定してください
2. 料理の量、調理方法（揚げ物、蒸し物など）、食材の種類を考慮してください
3. reasoningには、なぜそのカロリーと推定したかの根拠を詳しく書いてください
4. 必ずJSONのみを返してください（説明文は不要）
`.trim();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`;

  // リクエスト統計を記録
  logRequestStats('receipt'); // カロリー計測もreceiptとしてカウント

  console.log('[Gemini Calorie] APIリクエスト送信');

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
        temperature: 0.3, // 低めにして正確性を重視
        topK: 32,
        topP: 1,
        maxOutputTokens: 1024,
      },
    }),
  });

  console.log('[Gemini Calorie] APIレスポンス受信', { status: response.status });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Gemini Calorie] APIエラー', errorText);
    const error = new Error(`Gemini API エラー: ${response.status}`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const data: GeminiResponse = await response.json();
  console.log('[Gemini Calorie] レスポンスデータ', data);

  // レスポンスからテキストを抽出
  if (data.candidates && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    if (candidate.content?.parts && candidate.content.parts.length > 0) {
      const text = candidate.content.parts[0].text.trim();
      console.log('[Gemini Calorie] 抽出テキスト:', text);

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

      const result = {
        calories: parsedData.calories || 0,
        reasoning: parsedData.reasoning || 'カロリーを推定しました',
        confidence: parsedData.confidence,
      };

      console.log('[Gemini Calorie] カロリー計測成功', result);
      return result;
    }
  }

  throw new Error('カロリーを推定できませんでした');
}

/**
 * 料理画像からカロリーを推定
 */
export async function scanCalorie(mealName: string, imageFile: File): Promise<{ calories: number; reasoning: string; confidence?: number }> {
  const operatorKey = getOperatorApiKey();
  const userKey = getUserApiKey();
  const apiEnabled = isApiEnabled();

  console.log('[Gemini Calorie] カロリー計測開始', {
    mealName,
    fileName: imageFile.name,
    fileSize: imageFile.size,
    API_ENABLED: apiEnabled,
    hasOperatorKey: !!operatorKey,
    hasUserKey: !!userKey,
  });

  if (!apiEnabled) {
    throw new Error('Gemini APIキーが設定されていません。設定画面でAPIキーを設定してください。');
  }

  // まず運営者のAPIキーで試行
  if (operatorKey) {
    try {
      console.log('[Gemini Calorie] 運営者のAPIキーで試行');
      return await scanCalorieWithKey(operatorKey, mealName, imageFile);
    } catch (error) {
      const errorStatus = (error as Error & { status?: number })?.status;
      // 403または429エラーの場合、ユーザーのAPIキーで再試行
      if (errorStatus === 403 || errorStatus === 429) {
        console.warn('[Gemini Calorie] 運営者のAPIキーでエラー発生。ユーザーのAPIキーで再試行します。', {
          status: errorStatus,
        });
        if (userKey) {
          try {
            console.log('[Gemini Calorie] ユーザーのAPIキーで再試行');
            return await scanCalorieWithKey(userKey, mealName, imageFile);
          } catch (userError) {
            console.error('[Gemini Calorie] ユーザーのAPIキーでもエラー発生', userError);
            throw userError;
          }
        } else {
          console.error('[Gemini Calorie] ユーザーのAPIキーが設定されていません');
          throw error;
        }
      } else {
        throw error;
      }
    }
  }

  // 運営者のAPIキーがない場合、ユーザーのAPIキーで試行
  if (userKey) {
    try {
      console.log('[Gemini Calorie] ユーザーのAPIキーで試行');
      return await scanCalorieWithKey(userKey, mealName, imageFile);
    } catch (error) {
      console.error('[Gemini Calorie] ユーザーのAPIキーでエラー発生', error);
      throw error;
    }
  }

  throw new Error('Gemini APIキーが設定されていません。設定画面でAPIキーを設定してください。');
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
