/**
 * Gemini API - Cloud Functions版
 * APIキーをサーバー側で管理し、フロントエンドからはCloud Functions経由で呼び出す
 */

import { httpsCallable } from 'firebase/functions';
import { functions as firebaseFunctions } from '../config/firebase';
import type { RecipeDifficulty, DietaryRestriction } from '../types';

/**
 * レシピ生成（Cloud Functions経由）
 */
export async function generateRecipe(
  ingredients: string[],
  dietaryRestriction: DietaryRestriction = 'none',
  difficulty: RecipeDifficulty = 'normal',
  customRequest: string = ''
): Promise<string> {
  try {
    console.log('[Gemini CF] レシピ生成開始', {
      ingredients,
      dietaryRestriction,
      difficulty,
      customRequest,
    });

    const generateRecipeFunction = httpsCallable(firebaseFunctions, 'generateRecipe');
    
    const result = await generateRecipeFunction({
      ingredients,
      dietaryRestriction,
      difficulty,
      customRequest,
    });

    const data = result.data as { success: boolean; recipe: string };

    if (!data.success || !data.recipe) {
      throw new Error('レシピの生成に失敗しました');
    }

    console.log('[Gemini CF] レシピ生成成功');
    return data.recipe;
  } catch (error: any) {
    console.error('[Gemini CF] レシピ生成エラー:', error);
    
    // エラーメッセージを整形
    let errorMessage = 'レシピの生成に失敗しました';
    if (error.code === 'functions/unauthenticated') {
      errorMessage = '認証が必要です。ログインしてください。';
    } else if (error.code === 'functions/permission-denied') {
      errorMessage = 'この機能を使用する権限がありません。';
    } else if (error.code === 'functions/unavailable') {
      errorMessage = 'サーバーに接続できません。しばらくしてから再試行してください。';
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * 健康アドバイス生成（Cloud Functions経由）
 */
export async function generateHealthAdvice(
  meals: any[],
  exercises: any[],
  weight: number,
  goals: string
): Promise<string> {
  try {
    console.log('[Gemini CF] 健康アドバイス生成開始');

    const generateHealthAdviceFunction = httpsCallable(firebaseFunctions, 'generateHealthAdvice');
    
    const result = await generateHealthAdviceFunction({
      meals,
      exercises,
      weight,
      goals,
    });

    const data = result.data as { success: boolean; advice: string };

    if (!data.success || !data.advice) {
      throw new Error('健康アドバイスの生成に失敗しました');
    }

    console.log('[Gemini CF] 健康アドバイス生成成功');
    return data.advice;
  } catch (error: any) {
    console.error('[Gemini CF] 健康アドバイス生成エラー:', error);
    
    let errorMessage = '健康アドバイスの生成に失敗しました';
    if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * カロリー推定（Cloud Functions経由）
 */
export async function estimateCalories(foodDescription: string): Promise<string> {
  try {
    console.log('[Gemini CF] カロリー推定開始', { foodDescription });

    const estimateCaloriesFunction = httpsCallable(firebaseFunctions, 'estimateCalories');
    
    const result = await estimateCaloriesFunction({
      foodDescription,
    });

    const data = result.data as { success: boolean; estimation: string };

    if (!data.success || !data.estimation) {
      throw new Error('カロリー推定に失敗しました');
    }

    console.log('[Gemini CF] カロリー推定成功');
    return data.estimation;
  } catch (error: any) {
    console.error('[Gemini CF] カロリー推定エラー:', error);
    
    let errorMessage = 'カロリー推定に失敗しました';
    if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * レシピ生成（在庫から）- Cloud Functions経由
 */
export async function generateRecipeFromStock(
  stockItems: Array<{ name: string; quantity: number; unit: string }>,
  dietaryRestriction: DietaryRestriction = 'none',
  difficulty: RecipeDifficulty = 'normal',
  customRequest: string = ''
): Promise<string> {
  // 在庫アイテムから食材名を抽出
  const ingredients = stockItems.map(item => item.name);
  
  return generateRecipe(ingredients, dietaryRestriction, difficulty, customRequest);
}

/**
 * 汎用テキスト生成（Cloud Functions経由）
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    console.log('[Gemini CF] テキスト生成開始');

    const generateTextFunction = httpsCallable(firebaseFunctions, 'generateText');
    
    const result = await generateTextFunction({
      prompt,
    });

    const data = result.data as { success: boolean; text: string };

    if (!data.success || !data.text) {
      throw new Error('テキスト生成に失敗しました');
    }

    console.log('[Gemini CF] テキスト生成成功');
    return data.text;
  } catch (error: any) {
    console.error('[Gemini CF] テキスト生成エラー:', error);
    
    let errorMessage = 'テキスト生成に失敗しました';
    if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
}

/**
 * APIが有効かどうかをチェック（Cloud Functions経由では常にtrue）
 */
export function isGeminiEnabled(): boolean {
  // Cloud Functions経由の場合、サーバー側でAPIキーが管理されているため、常にtrue
  return true;
}
