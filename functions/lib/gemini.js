"use strict";
/**
 * Cloud Functions for Gemini API
 * 軽量版 - 環境変数からAPIキーを取得
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateText = exports.generateRecipe = void 0;
const functions = require("firebase-functions");
// Gemini API設定
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL_NAME = 'gemini-2.5-pro';
/**
 * 環境変数からAPIキーを取得
 */
function getGeminiApiKey() {
    var _a;
    const apiKey = (_a = functions.config().gemini) === null || _a === void 0 ? void 0 : _a.api_key;
    if (!apiKey) {
        throw new Error('Gemini API key not configured. Run: firebase functions:config:set gemini.api_key="YOUR_KEY"');
    }
    return apiKey;
}
/**
 * Gemini APIにリクエストを送信
 */
async function callGeminiApi(prompt, options = {}) {
    var _a, _b;
    const apiKey = getGeminiApiKey();
    const url = `${GEMINI_API_BASE_URL}/models/${MODEL_NAME}:generateContent?key=${apiKey}`;
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: (_a = options.temperature) !== null && _a !== void 0 ? _a : 0.7,
            maxOutputTokens: (_b = options.maxOutputTokens) !== null && _b !== void 0 ? _b : 2048,
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
exports.generateRecipe = functions.https.onCall(async (data) => {
    var _a, _b, _c, _d, _e;
    const { ingredients, dietaryRestriction, difficulty, customRequest } = data;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        throw new functions.https.HttpsError('invalid-argument', '食材が指定されていません');
    }
    const dietLabel = dietaryRestriction === 'vegetarian' ? 'ベジタリアン' : dietaryRestriction === 'vegan' ? 'ヴィーガン' : '';
    let difficultyCondition = '';
    if (difficulty === 'super_easy') {
        difficultyCondition = '\n\n**重要**: 料理初心者でも絶対に失敗しない超簡単なレシピにしてください。調理工程は3ステップ以内。';
    }
    else if (difficulty === 'under_5min') {
        difficultyCondition = '\n\n**重要**: 調理時間5分以内で完成するレシピにしてください。';
    }
    else if (difficulty === 'under_10min') {
        difficultyCondition = '\n\n**重要**: 調理時間10分以内で完成するレシピにしてください。';
    }
    else if (difficulty === 'no_fire') {
        difficultyCondition = '\n\n**重要**: 火を使わずに作れるレシピにしてください。';
    }
    const additionalRequirements = customRequest ? `\n\n**追加のリクエスト**: ${customRequest}` : '';
    const prompt = `あなたは日本語で答えるプロの料理アドバイザーです。
次の食材を使った${dietLabel}向けの家庭向けレシピを1つ提案してください。${difficultyCondition}${additionalRequirements}

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
        const text = ((_e = (_d = (_c = (_b = (_a = result.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || '';
        return { success: true, recipe: text };
    }
    catch (error) {
        console.error('[Gemini] Recipe error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'レシピ生成に失敗しました');
    }
});
/**
 * 汎用テキスト生成
 */
exports.generateText = functions.https.onCall(async (data) => {
    var _a, _b, _c, _d, _e;
    const { prompt } = data;
    if (!prompt) {
        throw new functions.https.HttpsError('invalid-argument', 'プロンプトが指定されていません');
    }
    try {
        const result = await callGeminiApi(prompt, { temperature: 0.7, maxOutputTokens: 2048 });
        const text = ((_e = (_d = (_c = (_b = (_a = result.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || '';
        return { success: true, text };
    }
    catch (error) {
        console.error('[Gemini] Text error:', error);
        throw new functions.https.HttpsError('internal', error.message || 'テキスト生成に失敗しました');
    }
});
//# sourceMappingURL=gemini.js.map