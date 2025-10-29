/**
 * AIレシピ生成画面コンポーネント
 */
import React, { useState } from 'react';
import { RecipeGenerator } from './RecipeGenerator';
import { RecipeDisplay } from './RecipeDisplay';
import { RecipeHistory } from './RecipeHistory';
import { FavoriteRecipes } from './FavoriteRecipes';
import { PostCreateScreen } from '../social/PostCreateScreen';
import type { Recipe } from '../../types';
import type { RecipeData } from '../../types/post';
import { MdRestaurantMenu } from 'react-icons/md';

export const RecipeScreen: React.FC = () => {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [attachedRecipe, setAttachedRecipe] = useState<RecipeData | null>(null);

  const handleAttachToPost = (recipe: Recipe) => {
    // RecipeをRecipeDataに変換
    // difficulty を変換（存在しない場合は'easy'）
    let mappedDifficulty: 'easy' | 'medium' | 'hard' = 'easy';
    if (recipe.difficulty === 'super_easy' || recipe.difficulty === 'under_5min') {
      mappedDifficulty = 'easy';
    } else if (recipe.difficulty === 'under_10min') {
      mappedDifficulty = 'medium';
    } else if (recipe.difficulty === 'no_fire') {
      mappedDifficulty = 'easy';
    }

    const recipeData: RecipeData = {
      title: recipe.title,
      description: recipe.content.substring(0, 100), // 100文字に制限
      ingredients: recipe.ingredients,
      instructions: recipe.content.split('\n\n').slice(1), // 最初の見出しを除く
      difficulty: mappedDifficulty,
      servings: 2, // デフォルト値
      preparationTime: 15, // デフォルト値（分）
      cookingTime: 30, // デフォルト値（分）
    };

    setAttachedRecipe(recipeData);
    setShowCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setAttachedRecipe(null);
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    setAttachedRecipe(null);
    alert('レシピを投稿しました！');
  };

  return (
    <section className="screen active">
      <h2>AIレシピ生成</h2>
      <RecipeGenerator
        onRecipeGenerated={setCurrentRecipe}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      {isLoading && (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px', color: 'var(--primary)' }}>
            <MdRestaurantMenu size={48} />
          </div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>レシピを生成中...</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #666)' }}>
            AIがレシピを考えています
          </div>
        </div>
      )}
      {currentRecipe && !isLoading && (
        <RecipeDisplay recipe={currentRecipe} onAttachToPost={handleAttachToPost} />
      )}
      <RecipeHistory onRecipeSelect={setCurrentRecipe} />
      <FavoriteRecipes onRecipeSelect={setCurrentRecipe} />

      {/* 投稿作成モーダル */}
      {showCreatePost && (
        <PostCreateScreen
          onClose={handleCloseCreatePost}
          onPostCreated={handlePostCreated}
          recipeData={attachedRecipe || undefined}
        />
      )}
    </section>
  );
};
