/**
 * レシピ生成フォームコンポーネント
 */
import React, { useState, useMemo } from 'react';
import { useStockStore, useRecipeStore } from '../../store';
import { generateRecipe } from '../../api/gemini';
import type { RecipeDifficulty, DietaryRestriction, Recipe, StockCategory } from '../../types';
import { generateUUID } from '../../utils/uuid';
import { MdRestaurantMenu, MdInventory, MdAutoAwesome, MdClose, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';
import { FiSmile, FiZap, FiClock } from 'react-icons/fi';
import { BsSnow } from 'react-icons/bs';

interface RecipeGeneratorProps {
  onRecipeGenerated: (recipe: Recipe) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({
  onRecipeGenerated,
  isLoading,
  setIsLoading,
}) => {
  const { stocks } = useStockStore();
  const { addToHistory } = useRecipeStore();
  const [ingredients, setIngredients] = useState('');
  const [difficulty, setDifficulty] = useState<RecipeDifficulty>('none');
  const [dietaryRestriction, setDietaryRestriction] = useState<DietaryRestriction>('none');
  const [customRequest, setCustomRequest] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedStockIds, setSelectedStockIds] = useState<Set<string>>(new Set());

  // 食材として使えるカテゴリのみをフィルタリング
  const ingredientStocks = useMemo(() => {
    const ingredientCategories: StockCategory[] = ['staple', 'protein', 'vegetable', 'fruit', 'dairy', 'seasoning'];
    return stocks
      .filter((stock) => stock.quantity > 0 && (!stock.category || ingredientCategories.includes(stock.category)))
      .sort((a, b) => {
        // 期限が近いものから優先的に表示
        if (a.daysRemaining !== b.daysRemaining) {
          return a.daysRemaining - b.daysRemaining;
        }
        // 期限が同じなら名前順
        return a.name.localeCompare(b.name, 'ja');
      });
  }, [stocks]);

  const difficultyOptions: Array<{ value: RecipeDifficulty; label: string; icon: React.ReactNode }> = [
    { value: 'none', label: '指定なし', icon: <MdAutoAwesome size={16} /> },
    { value: 'super_easy', label: '超簡単', icon: <FiSmile size={16} /> },
    { value: 'under_5min', label: '5分以内', icon: <FiZap size={16} /> },
    { value: 'under_10min', label: '10分以内', icon: <FiClock size={16} /> },
    { value: 'no_fire', label: '火を使わない', icon: <BsSnow size={16} /> },
  ];

  const dietaryOptions: Array<{ value: DietaryRestriction; label: string; icon: React.ReactNode }> = [
    { value: 'none', label: '指定なし', icon: <MdRestaurantMenu size={16} /> },
    { value: 'vegetarian', label: 'ベジタリアン', icon: <span>🥗</span> },
    { value: 'vegan', label: 'ヴィーガン', icon: <span>🌱</span> },
  ];

  const handleOpenStockModal = () => {
    setShowStockModal(true);
    setSelectedStockIds(new Set());
  };

  const handleToggleStock = (stockId: string) => {
    setSelectedStockIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stockId)) {
        newSet.delete(stockId);
      } else {
        newSet.add(stockId);
      }
      return newSet;
    });
  };

  const handleSelectAllStocks = () => {
    if (selectedStockIds.size === ingredientStocks.length) {
      setSelectedStockIds(new Set());
    } else {
      setSelectedStockIds(new Set(ingredientStocks.map((s) => s.id)));
    }
  };

  const handleAddSelectedStocks = () => {
    const selectedStocks = ingredientStocks.filter((stock) => selectedStockIds.has(stock.id));
    const stockNames = selectedStocks.map((stock) => stock.name);

    if (stockNames.length === 0) {
      alert('材料を選択してください');
      return;
    }

    // 既存の材料に追加（重複を避ける）
    const existingIngredients = ingredients
      .split(/[,、]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    
    const newIngredients = [...new Set([...existingIngredients, ...stockNames])];
    setIngredients(newIngredients.join(', '));
    
    setShowStockModal(false);
    setSelectedStockIds(new Set());
  };

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      alert('材料を入力してください');
      return;
    }

    setIsLoading(true);
    try {
      const ingredientArray = ingredients.split(/[,、]/).map((item) => item.trim()).filter((item) => item.length > 0);
      const recipeContent = await generateRecipe(
        ingredientArray,
        dietaryRestriction,
        difficulty,
        customRequest
      );

      const newRecipe: Recipe = {
        id: generateUUID(),
        title: `${ingredientArray.slice(0, 3).join('、')}を使ったレシピ`,
        content: recipeContent,
        ingredients: ingredientArray,
        difficulty,
        dietaryRestriction,
        customRequest,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };

      addToHistory(newRecipe);
      onRecipeGenerated(newRecipe);
    } catch (error) {
      console.error('レシピ生成エラー:', error);
      interface ErrorWithStatus extends Error {
        status?: number;
        errorData?: { error?: { message?: string; code?: number; status?: string }; rawError?: string };
      }

      console.error('エラー詳細:', {
        error: error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        hasStatus: error instanceof Error && 'status' in error,
        status: error instanceof Error && 'status' in error ? (error as ErrorWithStatus).status : undefined,
        errorData: error instanceof Error && 'errorData' in error ? (error as ErrorWithStatus).errorData : undefined,
      });

      let errorMessage = 'レシピの生成に失敗しました。';
      if (error instanceof Error) {
        errorMessage += `\n\n${error.message}`;

        // エラーの種類に応じた追加情報
        if (error.message.includes('403') || error.message.includes('無効') || error.message.includes('権限')) {
          errorMessage += '\n\n【対処法】\n1. 設定画面でAPIキーを確認してください\n2. APIキーが正しく入力されているか確認してください\n3. Google AI StudioでAPIキーが有効か確認してください';
        } else if (error.message.includes('429') || error.message.includes('制限')) {
          errorMessage += '\n\n【対処法】\n1. しばらく待ってから再度お試しください\n2. API使用量を確認してください';
        } else if (error.message.includes('ネットワーク') || error.message.includes('Failed to fetch')) {
          errorMessage += '\n\n【対処法】\n1. インターネット接続を確認してください\n2. ファイアウォールやプロキシの設定を確認してください';
        } else if (error.message.includes('400') || error.message.includes('リクエスト形式')) {
          errorMessage += '\n\n【対処法】\n1. 材料を正しく入力してください\n2. しばらく待ってから再度お試しください';
        }
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MdRestaurantMenu size={20} />
        レシピを生成
      </h3>

      <label>材料（カンマ区切り）</label>
      <input
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="例: 鶏肉, じゃがいも, 玉ねぎ"
        disabled={isLoading}
      />

      <button
        onClick={handleOpenStockModal}
        style={{
          background: '#10b981',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        disabled={isLoading || ingredientStocks.length === 0}
      >
        <MdInventory size={18} />
        在庫から材料を選択 ({ingredientStocks.length}件)
      </button>

      {/* 在庫選択モーダル */}
      {showStockModal && (
        <div
          className="modal active"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowStockModal(false);
            }
          }}
        >
          <div className="modal-content" style={{ maxWidth: '500px', maxHeight: '80vh' }}>
            <div className="modal-header">
              <h3 className="modal-title">在庫から材料を選択</h3>
              <button
                className="modal-close"
                onClick={() => setShowStockModal(false)}
                aria-label="閉じる"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={handleSelectAllStocks}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {selectedStockIds.size === ingredientStocks.length ? 'すべて解除' : 'すべて選択'}
              </button>
              <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {selectedStockIds.size}件選択中
              </span>
            </div>

            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              {ingredientStocks.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  食材として使える在庫がありません
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {ingredientStocks.map((stock) => {
                    const isSelected = selectedStockIds.has(stock.id);
                    return (
                      <div
                        key={stock.id}
                        onClick={() => handleToggleStock(stock.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--card)',
                          border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--background)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'var(--card)';
                          }
                        }}
                      >
                        {isSelected ? (
                          <MdCheckBox size={24} color="var(--primary)" />
                        ) : (
                          <MdCheckBoxOutlineBlank size={24} color="var(--text-secondary)" />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{stock.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            数量: {stock.quantity}個
                            {stock.daysRemaining !== undefined && (
                              <>
                                {' '}・ 期限まで: {stock.daysRemaining}日
                                {stock.daysRemaining <= 3 && (
                                  <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                                )}
                              </>
                            )}
                            {stock.category && (
                              <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                                ({stock.category === 'staple' ? '主食' : 
                                  stock.category === 'protein' ? 'たんぱく質' :
                                  stock.category === 'vegetable' ? '野菜' :
                                  stock.category === 'fruit' ? '果物' :
                                  stock.category === 'dairy' ? '乳製品' :
                                  stock.category === 'seasoning' ? '調味料' : 'その他'})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowStockModal(false)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={handleAddSelectedStocks}
                disabled={selectedStockIds.size === 0}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedStockIds.size > 0 ? 'var(--primary)' : 'var(--border)',
                  color: selectedStockIds.size > 0 ? 'white' : 'var(--text-secondary)',
                  cursor: selectedStockIds.size > 0 ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                }}
              >
                選択した材料を追加 ({selectedStockIds.size}件)
              </button>
            </div>
          </div>
        </div>
      )}

      <label>難易度</label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {difficultyOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setDifficulty(option.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `2px solid ${difficulty === option.value ? 'var(--primary)' : 'var(--border)'}`,
              background: difficulty === option.value ? 'var(--primary)' : 'var(--card)',
              color: difficulty === option.value ? 'white' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: difficulty === option.value ? 600 : 400,
            }}
            disabled={isLoading}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{option.icon} {option.label}</span>
          </button>
        ))}
      </div>

      <label>食事制限</label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {dietaryOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setDietaryRestriction(option.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: `2px solid ${dietaryRestriction === option.value ? 'var(--primary)' : 'var(--border)'}`,
              background: dietaryRestriction === option.value ? 'var(--primary)' : 'var(--card)',
              color: dietaryRestriction === option.value ? 'white' : 'var(--text)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: dietaryRestriction === option.value ? 600 : 400,
            }}
            disabled={isLoading}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{option.icon} {option.label}</span>
          </button>
        ))}
      </div>

      <label>カスタムリクエスト（任意）</label>
      <textarea
        value={customRequest}
        onChange={(e) => setCustomRequest(e.target.value)}
        placeholder="例: 辛めに作りたい、子供向けに優しい味で"
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--card)',
          color: 'var(--text)',
          fontSize: '1rem',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
        disabled={isLoading}
      />

      <button className="submit" onClick={handleGenerate} disabled={isLoading}>
        <MdAutoAwesome size={18} style={{ marginRight: '8px' }} />
        レシピを生成する
      </button>
    </div>
  );
};
