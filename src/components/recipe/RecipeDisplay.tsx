/**
 * レシピ表示コンポーネント
 */
import React from 'react';
import type { Recipe } from '../../types';
import { useRecipeStore, useStockStore, useShoppingStore, useIntakeStore } from '../../store';
import { MdStar, MdStarBorder, MdInventory, MdShoppingCart, MdShare, MdRestaurantMenu } from 'react-icons/md';
import { FiSmile, FiZap, FiClock } from 'react-icons/fi';
import { BsSnow } from 'react-icons/bs';

interface RecipeDisplayProps {
  recipe: Recipe;
  onAttachToPost?: (recipe: Recipe) => void;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onAttachToPost }) => {
  const { addToHistory, addToFavorites, removeFromFavorites, favoriteRecipes } =
    useRecipeStore();
  const { addStock, stocks, updateStock, deleteStock } = useStockStore();
  const { addItem } = useShoppingStore();
  const { addIntake } = useIntakeStore();

  const isFavorite = favoriteRecipes.some((fav) => fav.id === recipe.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe);
      addToHistory(recipe);
    }
  };

  const handleAddToStock = () => {
    if (
      !confirm(
        `材料 ${recipe.ingredients.length} 個を在庫に追加しますか？\n（賞味期限は7日後に設定されます）`
      )
    ) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => {
      addStock({
        name: ingredient,
        quantity: 1,
        daysRemaining: 7,
      });
    });

    alert(`${recipe.ingredients.length}個の材料を在庫に追加しました！`);
  };

  const handleAddToShopping = () => {
    if (
      !confirm(`材料 ${recipe.ingredients.length} 個を買い物リストに追加しますか？`)
    ) {
      return;
    }

    recipe.ingredients.forEach((ingredient) => {
      addItem({
        name: ingredient,
        quantity: 1,
      });
    });

    alert(`${recipe.ingredients.length}個の材料を買い物リストに追加しました！`);
  };

  const handleCookRecipe = () => {
    // 在庫にある材料とない材料を確認
    const missingIngredients: string[] = [];
    const availableIngredients: { name: string; stockId: string; quantity: number }[] = [];

    recipe.ingredients.forEach((ingredient) => {
      const stock = stocks.find((s) => s.name === ingredient);
      if (stock) {
        availableIngredients.push({
          name: ingredient,
          stockId: stock.id,
          quantity: stock.quantity,
        });
      } else {
        missingIngredients.push(ingredient);
      }
    });

    // 確認メッセージ
    let confirmMessage = `このレシピを作りますか？\n\n`;
    if (availableIngredients.length > 0) {
      confirmMessage += `在庫から使用する材料（${availableIngredients.length}個）:\n`;
      availableIngredients.forEach((ing) => {
        confirmMessage += `・${ing.name} (残り: ${ing.quantity}個)\n`;
      });
    }
    if (missingIngredients.length > 0) {
      confirmMessage += `\n⚠️ 在庫にない材料（${missingIngredients.length}個）:\n`;
      missingIngredients.forEach((ing) => {
        confirmMessage += `・${ing}\n`;
      });
      confirmMessage += `\n※在庫にない材料は減らされません`;
    }
    confirmMessage += `\n\n食事記録にも追加されます。`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // 在庫を減らす
    availableIngredients.forEach((ing) => {
      if (ing.quantity > 1) {
        // 数量が2以上なら-1する
        updateStock(ing.stockId, { quantity: ing.quantity - 1 });
      } else {
        // 数量が1なら削除
        deleteStock(ing.stockId);
      }
    });

    // 食事記録に追加
    // 時刻に基づいてカテゴリを推測
    const now = new Date();
    const hour = now.getHours();
    let category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    if (hour >= 5 && hour < 10) {
      category = 'breakfast';
    } else if (hour >= 10 && hour < 15) {
      category = 'lunch';
    } else if (hour >= 15 && hour < 21) {
      category = 'dinner';
    } else {
      category = 'snack';
    }

    addIntake({
      name: recipe.title,
      calories: 500, // デフォルト値（後で編集可能）
      price: 0,
      category,
      source: 'recipe', // AIレシピ由来であることを識別
    });

    let resultMessage = `レシピを作りました！\n\n`;
    if (availableIngredients.length > 0) {
      resultMessage += `${availableIngredients.length}個の材料を在庫から減らしました\n`;
    }
    resultMessage += `食事記録に追加しました（${category === 'breakfast' ? '朝食' : category === 'lunch' ? '昼食' : category === 'dinner' ? '夕食' : '間食'}）`;
    if (missingIngredients.length > 0) {
      resultMessage += `\n\n買い物リストに追加してください:\n`;
      missingIngredients.forEach((ing) => {
        resultMessage += `・${ing}\n`;
      });
    }

    alert(resultMessage);
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px',
        }}
      >
        <h3>{recipe.title}</h3>
        <button
          onClick={handleToggleFavorite}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
            color: isFavorite ? '#fbbf24' : 'var(--text-secondary)',
          }}
          title={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          {isFavorite ? <MdStar size={28} /> : <MdStarBorder size={28} />}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        {recipe.difficulty && recipe.difficulty !== 'none' && (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              background: '#f0fdf4',
              color: '#15803d',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {
                {
                  super_easy: <><FiSmile size={14} /> 超簡単</>,
                  under_5min: <><FiZap size={14} /> 5分以内</>,
                  under_10min: <><FiClock size={14} /> 10分以内</>,
                  no_fire: <><BsSnow size={14} /> 火を使わない</>,
                  none: '',
                }[recipe.difficulty]
              }
            </span>
          </span>
        )}
        {recipe.dietaryRestriction && recipe.dietaryRestriction !== 'none' && (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              background: '#fef3c7',
              color: '#92400e',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {
              {
                vegetarian: '🥗 ベジタリアン',
                vegan: '🌱 ヴィーガン',
                none: '',
              }[recipe.dietaryRestriction]
            }
          </span>
        )}
      </div>

      <div
        style={{
          background: 'var(--background)',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px',
          whiteSpace: 'pre-wrap',
          fontSize: '0.95rem',
          lineHeight: '1.6',
        }}
      >
        {recipe.content}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: onAttachToPost ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
          gap: '8px',
        }}
      >
        <button
          onClick={handleCookRecipe}
          style={{
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            gridColumn: onAttachToPost ? 'span 2' : 'span 2',
          }}
        >
          <MdRestaurantMenu size={18} /> このレシピを作る
        </button>
        <button
          onClick={handleAddToStock}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MdInventory size={18} /> 在庫に追加
        </button>
        <button
          onClick={handleAddToShopping}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <MdShoppingCart size={18} /> 買い物リストへ
        </button>
        {onAttachToPost && (
          <button
            onClick={() => onAttachToPost(recipe)}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              gridColumn: 'span 2',
            }}
          >
            <MdShare size={18} /> 投稿に添付
          </button>
        )}
      </div>
    </div>
  );
};
