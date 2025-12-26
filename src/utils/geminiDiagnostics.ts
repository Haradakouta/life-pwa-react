/**
 * Gemini API診断ツール
 * 403エラーの原因を調査するためのユーティリティ
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * APIキーの基本情報を取得
 */
export function getApiKeyInfo(): {
  hasKey: boolean;
  keyPrefix: string;
  keyLength: number;
} {
  const hasKey = !!GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE';
  return {
    hasKey,
    keyPrefix: hasKey ? GEMINI_API_KEY.substring(0, 10) + '...' : 'なし',
    keyLength: GEMINI_API_KEY?.length || 0,
  };
}

/**
 * モデルの可用性をテスト
 */
export async function testModelAvailability(modelName: string): Promise<{
  available: boolean;
  error?: string;
  status?: number;
}> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return { available: false, error: 'APIキーが設定されていません' };
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

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
                text: 'テスト',
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 10,
        },
      }),
    });

    if (response.ok) {
      return { available: true, status: response.status };
    } else {
      const errorText = await response.text();
      let errorData: { error?: { message?: string; code?: number; status?: string }; rawError?: string };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { rawError: errorText };
      }

      return {
        available: false,
        error: errorData.error?.message || errorText,
        status: response.status,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      available: false,
      error: errorMessage || 'テストに失敗しました',
    };
  }
}

/**
 * すべてのモデルの可用性をテスト
 */
export async function testAllModels(): Promise<{
  [modelName: string]: {
    available: boolean;
    error?: string;
    status?: number;
  };
}> {
  const models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-2.5-flash-lite',
  ];

  const results: {
    [key: string]: {
      available: boolean;
      error?: string;
      status?: number;
    };
  } = {};

  for (const model of models) {
    console.log(`[診断] ${model}をテスト中...`);
    results[model] = await testModelAvailability(model);
    // レート制限を避けるため、少し待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}


