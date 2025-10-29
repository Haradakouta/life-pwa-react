/**
 * レシピ表示コンポーネント
 */
import React from 'react';
import type { Recipe } from '../../types';
import { useRecipeStore, useStockStore, useShoppingStore } from '../../store';
import { MdStar, MdStarBorder, MdInventory, MdShoppingCart, MdShare } from 'react-icons/md';
import { FiSmile, FiZap, FiClock } from 'react-icons/fi';
import { BsSnow } from 'react-icons/bs';

interface RecipeDisplayProps {
  recipe: Recipe;
  onAttachToPost?: (recipe: Recipe) => void;
}

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, onAttachToPost }) => {
  const { addToHistory, addToFavorites, removeFromFavorites, favoriteRecipes } =
    useRecipeStore();
  const { addStock } = useStockStore();
  const { addItem } = useShoppingStore();

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
          gridTemplateColumns: onAttachToPost ? '1fr 1fr 1fr' : '1fr 1fr',
          gap: '8px',
        }}
      >
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
            }}
          >
            <MdShare size={18} /> 投稿に添付
          </button>
        )}
      </div>
    </div>
  );
};
