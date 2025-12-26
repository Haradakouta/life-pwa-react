/**
 * 健康をテーマにした買い物リスト最適化機能
 */

import type { Settings } from '../types/settings';
import type { Intake } from '../types/intake';
import { useSettingsStore } from '../store';

export interface HealthShoppingRecommendation {
    items: Array<{
        name: string;
        quantity: number;
        category: string;
        reason: string; // なぜこの食材が推奨されるか
    }>;
    summary: string; // 推奨理由のサマリー
}

/**
 * 健康目標に基づいた買い物リスト提案
 */
export async function getHealthBasedShoppingList(
    settings: Settings
): Promise<HealthShoppingRecommendation | null> {
    if (!settings.height || !settings.weight || !settings.age) {
        return null;
    }

    const bmi = calculateBMI(settings.height, settings.weight);
    const bmiCategory = getBMICategory(bmi);

    // Gemini APIを使用して健康目標に基づいた食材を提案
    try {
        // 運営者のAPIキーを取得（環境変数から）
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        const operatorKey = (envKey && envKey !== 'YOUR_GEMINI_API_KEY_HERE') ? envKey : null;

        // ユーザーのAPIキーを取得（設定から取得）
        const userSettings = useSettingsStore.getState().settings;
        const userKey = userSettings.geminiApiKey && userSettings.geminiApiKey.trim() !== ''
            ? userSettings.geminiApiKey.trim()
            : null;

        // 優先順位: ユーザーのAPIキー > 運営者のAPIキー
        const GEMINI_API_KEY = userKey || operatorKey;

        if (!GEMINI_API_KEY) {
            // APIが無効な場合は、基本的な推奨リストを返す
            return getBasicHealthRecommendation(bmi);
        }

        const prompt = `
あなたは栄養学の専門家です。
以下の健康情報に基づいて、1週間分の買い物リストを提案してください。

**健康情報:**
- 年齢: ${settings.age}歳
- 身長: ${settings.height}cm
- 体重: ${settings.weight}kg
- BMI: ${bmi.toFixed(1)} (${bmiCategory})

**目標:**
${getHealthGoal(bmi)}

以下のJSON形式で出力してください：
{
  "items": [
    {
      "name": "食材名",
      "quantity": 数量（数値）,
      "category": "カテゴリ（staple/protein/vegetable/fruit/dairy/seasoning/other）",
      "reason": "なぜこの食材が推奨されるか（健康上の理由を簡潔に）"
    }
  ],
  "summary": "推奨理由のサマリー（健康目標に基づいた食材選択の理由を説明）"
}

**重要な指示:**
1. 健康目標に基づいて、適切な食材を10-15個提案してください
2. 栄養バランスを考慮してください
3. 各食材には健康上の理由を必ず記載してください
4. 必ずJSONのみを返してください（説明文は不要）
`.trim();

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

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
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData: { error?: { message?: string; code?: number; status?: string }; rawError?: string };
            try {
                errorData = JSON.parse(errorText);
            } catch {
                errorData = { rawError: errorText };
            }

            // エラーをログ出力
            console.error('[Health Shopping] APIエラー', {
                status: response.status,
                statusText: response.statusText,
                errorMessage: errorData.error?.message,
            });

            // エラーが発生した場合は基本的な推奨リストを返す
            console.warn('[Health Shopping] APIエラーのため、基本的な推奨リストを返します');
            return getBasicHealthRecommendation(bmi);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content?.parts && candidate.content.parts.length > 0) {
                const text = candidate.content.parts[0].text.trim();

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

                const parsedData = JSON.parse(jsonText);
                return parsedData as HealthShoppingRecommendation;
            }
        }

        throw new Error('AIからの応答を解析できませんでした');
    } catch (error) {
        console.error('健康買い物リスト提案エラー:', error);
        // エラー時は基本的な推奨リストを返す
        return getBasicHealthRecommendation(bmi);
    }
}

/**
 * BMIを計算
 */
function calculateBMI(height: number, weight: number): number {
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
}

/**
 * BMIカテゴリを取得
 */
function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return '低体重';
    if (bmi < 25) return '普通体重';
    if (bmi < 30) return '肥満度1';
    if (bmi < 35) return '肥満度2';
    if (bmi < 40) return '肥満度3';
    return '肥満度4';
}

/**
 * 健康目標を取得
 */
function getHealthGoal(bmi: number): string {
    if (bmi < 18.5) {
        return '体重を適正範囲に増やす（低体重の改善）';
    } else if (bmi >= 25) {
        return '体重を適正範囲に減らす（肥満の改善）';
    } else {
        return '現在の健康状態を維持し、栄養バランスの良い食事を心がける';
    }
}

/**
 * 基本的な健康推奨リスト（APIが無効な場合）
 */
function getBasicHealthRecommendation(bmi: number): HealthShoppingRecommendation {
    const items: HealthShoppingRecommendation['items'] = [];

    if (bmi < 18.5) {
        // 低体重の場合：高タンパク質・高カロリー食材
        items.push(
            { name: '鶏むね肉', quantity: 2, category: 'protein', reason: '高タンパク質で低脂質、体重増加に適している' },
            { name: '卵', quantity: 10, category: 'protein', reason: '良質なタンパク質とビタミンDが豊富' },
            { name: '牛乳', quantity: 2, category: 'dairy', reason: 'カルシウムとタンパク質が豊富' },
            { name: 'アボカド', quantity: 3, category: 'fruit', reason: '健康的な脂質とカロリーが高い' },
            { name: 'ナッツ類', quantity: 1, category: 'other', reason: '高カロリーで栄養価が高い' }
        );
    } else if (bmi >= 25) {
        // 肥満の場合：低カロリー・高タンパク質・食物繊維豊富
        items.push(
            { name: '鶏むね肉', quantity: 2, category: 'protein', reason: '低脂質・高タンパク質で満腹感を得やすい' },
            { name: '魚（サバ・サンマ）', quantity: 2, category: 'protein', reason: '良質な脂質とタンパク質が豊富' },
            { name: '葉物野菜（ほうれん草、レタス）', quantity: 3, category: 'vegetable', reason: '低カロリーで食物繊維が豊富' },
            { name: 'きのこ類', quantity: 2, category: 'vegetable', reason: '低カロリーで食物繊維が豊富、満腹感を得やすい' },
            { name: '豆腐', quantity: 2, category: 'protein', reason: '低カロリーでタンパク質が豊富' }
        );
    } else {
        // 正常範囲：バランスの良い食材
        items.push(
            { name: '鶏むね肉', quantity: 2, category: 'protein', reason: '良質なタンパク質が豊富' },
            { name: '魚', quantity: 2, category: 'protein', reason: 'オメガ3脂肪酸が豊富' },
            { name: '葉物野菜', quantity: 3, category: 'vegetable', reason: 'ビタミン・ミネラルが豊富' },
            { name: '果物', quantity: 2, category: 'fruit', reason: 'ビタミンCと食物繊維が豊富' },
            { name: 'ヨーグルト', quantity: 2, category: 'dairy', reason: 'プロバイオティクスとタンパク質が豊富' }
        );
    }

    return {
        items,
        summary: `BMI ${bmi.toFixed(1)}に基づいた健康目標に合わせた食材を提案しました。`,
    };
}

/**
 * 食事記録から不足している栄養素を分析
 */
export function analyzeNutritionalDeficiencies(
    intakes: Intake[],
    days: number = 7
): {
    protein: number; // 不足しているタンパク質（g）
    fiber: number; // 不足している食物繊維（g）
    vitamins: string[]; // 不足しているビタミン
    minerals: string[]; // 不足しているミネラル
} {
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(today.getDate() - days);

    const recentIntakes = intakes.filter(
        (intake) => new Date(intake.date) >= cutoffDate
    );

    // 簡易的な栄養素分析（実際の栄養素データベースと連携する場合は改善が必要）
    // ここでは、食事記録の名前から推測する簡易版
    const hasProtein = recentIntakes.some((i) =>
        /肉|魚|卵|豆腐|納豆|チーズ|牛乳|ヨーグルト/i.test(i.name)
    );
    const hasFiber = recentIntakes.some((i) =>
        /野菜|果物|きのこ|海藻|豆/i.test(i.name)
    );
    const hasVitamins = recentIntakes.some((i) =>
        /野菜|果物|レバー/i.test(i.name)
    );
    const hasMinerals = recentIntakes.some((i) =>
        /魚|海藻|乳製品|小魚/i.test(i.name)
    );

    return {
        protein: hasProtein ? 0 : 50, // タンパク質が不足している場合の推定値
        fiber: hasFiber ? 0 : 20, // 食物繊維が不足している場合の推定値
        vitamins: hasVitamins ? [] : ['ビタミンC', 'ビタミンA'],
        minerals: hasMinerals ? [] : ['カルシウム', '鉄'],
    };
}

/**
 * 不足栄養素を補う食材を提案
 */
export function getNutritionalSupplementItems(
    deficiencies: ReturnType<typeof analyzeNutritionalDeficiencies>
): HealthShoppingRecommendation['items'] {
    const items: HealthShoppingRecommendation['items'] = [];

    if (deficiencies.protein > 0) {
        items.push(
            { name: '鶏むね肉', quantity: 2, category: 'protein', reason: '高タンパク質で低脂質' },
            { name: '豆腐', quantity: 2, category: 'protein', reason: '植物性タンパク質が豊富' },
            { name: '卵', quantity: 10, category: 'protein', reason: '良質なタンパク質が豊富' }
        );
    }

    if (deficiencies.fiber > 0) {
        items.push(
            { name: '葉物野菜（ほうれん草、レタス）', quantity: 3, category: 'vegetable', reason: '食物繊維が豊富' },
            { name: 'きのこ類', quantity: 2, category: 'vegetable', reason: '食物繊維とビタミンDが豊富' },
            { name: '海藻類', quantity: 1, category: 'vegetable', reason: '食物繊維とミネラルが豊富' }
        );
    }

    if (deficiencies.vitamins.length > 0) {
        items.push(
            { name: '果物（みかん、キウイ）', quantity: 2, category: 'fruit', reason: 'ビタミンCが豊富' },
            { name: 'にんじん', quantity: 3, category: 'vegetable', reason: 'ビタミンAが豊富' }
        );
    }

    if (deficiencies.minerals.length > 0) {
        items.push(
            { name: '小魚（しらす、ちりめんじゃこ）', quantity: 1, category: 'protein', reason: 'カルシウムが豊富' },
            { name: 'レバー', quantity: 1, category: 'protein', reason: '鉄分が豊富' },
            { name: '牛乳', quantity: 2, category: 'dairy', reason: 'カルシウムが豊富' }
        );
    }

    return items;
}
