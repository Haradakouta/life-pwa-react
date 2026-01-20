/**
 * Gemini API 403エラー診断ツール
 * 403エラーの詳細な原因を調査するためのユーティリティ
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface DiagnosticResult {
  timestamp: string;
  apiKeyInfo: {
    hasKey: boolean;
    keyPrefix: string;
    keyLength: number;
  };
  testResults: {
    [modelName: string]: {
      status: number;
      error?: string;
      errorDetails?: { error?: { message?: string; code?: number; status?: string }; rawError?: string };
    };
  };
  recommendations: string[];
}

/**
 * 403エラーの詳細な原因を診断
 */
export async function diagnose403Error(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    timestamp: new Date().toISOString(),
    apiKeyInfo: {
      hasKey: !!GEMINI_API_KEY && GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE',
      keyPrefix: GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'なし',
      keyLength: GEMINI_API_KEY?.length || 0,
    },
    testResults: {},
    recommendations: [],
  };

  if (!result.apiKeyInfo.hasKey) {
    result.recommendations.push('APIキーが設定されていません。環境変数VITE_GEMINI_API_KEYを設定してください。');
    return result;
  }

  // 各モデルをテスト
  const models = [
    'gemini-2.5-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  for (const model of models) {
    try {
      const testResult = await testModel(model);
      result.testResults[model] = testResult;

      if (testResult.status === 403) {
        // 403エラーの詳細を分析
        analyze403Error(testResult, result);
      }

      // レート制限を避けるため、少し待機
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.testResults[model] = {
        status: 0,
        error: errorMessage || 'テストに失敗しました',
      };
    }
  }

  // 推奨事項を生成
  generateRecommendations(result);

  return result;
}

/**
 * モデルをテスト
 */
async function testModel(modelName: string): Promise<{
  status: number;
  error?: string;
  errorDetails?: { error?: { message?: string; code?: number; status?: string }; rawError?: string };
}> {
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
                text: 'test',
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
      return { status: response.status };
    } else {
      const errorText = await response.text();
      let errorData: { error?: { message?: string; code?: number; status?: string }; rawError?: string };
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { rawError: errorText };
      }

      return {
        status: response.status,
        error: errorData.error?.message || errorText,
        errorDetails: errorData,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      status: 0,
      error: errorMessage || 'テストに失敗しました',
    };
  }
}

/**
 * 403エラーを分析
 */
function analyze403Error(
  testResult: { error?: string; errorDetails?: { error?: { message?: string; code?: number; status?: string }; rawError?: string } },
  result: DiagnosticResult
): void {
  if (!testResult.error) return;

  const errorMsg = testResult.error.toLowerCase();
  const errorDetails = testResult.errorDetails;

  // エラーメッセージから原因を推測
  if (errorMsg.includes('permission') || errorMsg.includes('permission denied')) {
    result.recommendations.push('APIキーに権限がありません。Google Cloud ConsoleでAPIキーに「Generative Language API」の権限を付与してください。');
  } else if (errorMsg.includes('quota') || errorMsg.includes('limit') || errorMsg.includes('exceeded')) {
    result.recommendations.push('使用制限に達しています。Google AI Studioで使用量を確認し、必要に応じて課金を有効化してください。');
  } else if (errorMsg.includes('billing') || errorMsg.includes('payment') || errorMsg.includes('account')) {
    result.recommendations.push('請求情報が未設定です。Google AI Studioでプロジェクトの課金を有効化してください。');
  } else if (errorMsg.includes('invalid') || errorMsg.includes('key') || errorMsg.includes('unauthorized')) {
    result.recommendations.push('APIキーが無効または期限切れです。新しいAPIキーを https://aistudio.google.com/app/apikey で取得してください。');
  } else if (errorMsg.includes('restricted') || errorMsg.includes('not allowed')) {
    result.recommendations.push('APIキーに制限が設定されています。Google Cloud ConsoleでAPIキーの制限設定（IP制限、リファラー制限など）を確認してください。');
  } else if (errorDetails?.error?.status === 'PERMISSION_DENIED') {
    result.recommendations.push('APIキーに権限がありません。Google Cloud ConsoleでAPIキーに「Generative Language API」の権限を付与してください。');
  } else if (errorDetails?.error?.status === 'RESOURCE_EXHAUSTED') {
    result.recommendations.push('使用制限に達しています。Google AI Studioで使用量を確認し、必要に応じて課金を有効化してください。');
  } else if (errorDetails?.error?.status === 'INVALID_ARGUMENT') {
    result.recommendations.push('リクエストの形式が正しくない可能性があります。モデル名やリクエストボディを確認してください。');
  }
}

/**
 * 推奨事項を生成
 */
function generateRecommendations(result: DiagnosticResult): void {
  // すべてのモデルで403エラーが発生している場合
  const all403 = Object.values(result.testResults).every(r => r.status === 403);
  if (all403) {
    result.recommendations.push('すべてのモデルで403エラーが発生しています。APIキーの設定を確認してください。');
  }

  // 一部のモデルでのみ403エラーが発生している場合
  const some403 = Object.values(result.testResults).some(r => r.status === 403);
  const some200 = Object.values(result.testResults).some(r => r.status === 200);
  if (some403 && some200) {
    result.recommendations.push('一部のモデルでのみ403エラーが発生しています。モデルごとに利用可能な権限が異なる可能性があります。');
  }

  // 推奨事項が空の場合
  if (result.recommendations.length === 0) {
    result.recommendations.push('403エラーの原因を特定できませんでした。Google AI Studioのサポートにお問い合わせください。');
  }
}

/**
 * 診断結果をコンソールに出力
 */
export function logDiagnosticResult(result: DiagnosticResult): void {
  console.group('🔍 Gemini API 403エラー診断結果');
  console.log('診断時刻:', result.timestamp);
  console.log('APIキー情報:', result.apiKeyInfo);
  console.log('テスト結果:');
  Object.entries(result.testResults).forEach(([model, testResult]) => {
    console.log(`  ${model}:`, {
      status: testResult.status,
      error: testResult.error,
      errorDetails: testResult.errorDetails,
    });
  });
  console.log('推奨事項:');
  result.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });
  console.groupEnd();
}


