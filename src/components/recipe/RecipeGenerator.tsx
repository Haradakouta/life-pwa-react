/**
 * レシピ生成フォームコンポーネント
 */
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStockStore, useRecipeStore } from '../../store';
import { generateRecipe, generateRecipeFromStock } from '../../api/geminiCloudFunctions';
import type { RecipeDifficulty, DietaryRestriction, Recipe, StockCategory } from '../../types';
import { generateUUID } from '../../utils/uuid';
import { MdRestaurantMenu, MdInventory, MdAutoAwesome, MdClose, MdCheckBox, MdCheckBoxOutlineBlank, MdSmartToy } from 'react-icons/md';
import { FiSmile, FiZap, FiClock } from 'react-icons/fi';
import { BsSnow } from 'react-icons/bs';
import { ProGate } from '../subscription/ProGate';

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
  const { t } = useTranslation();
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
    { value: 'none', label: t('recipe.generator.difficultyOptions.none'), icon: <MdAutoAwesome size={16} /> },
    { value: 'super_easy', label: t('recipe.generator.difficultyOptions.super_easy'), icon: <FiSmile size={16} /> },
    { value: 'under_5min', label: t('recipe.generator.difficultyOptions.under_5min'), icon: <FiZap size={16} /> },
    { value: 'under_10min', label: t('recipe.generator.difficultyOptions.under_10min'), icon: <FiClock size={16} /> },
    { value: 'no_fire', label: t('recipe.generator.difficultyOptions.no_fire'), icon: <BsSnow size={16} /> },
  ];

  const dietaryOptions: Array<{ value: DietaryRestriction; label: string; icon: React.ReactNode }> = [
    { value: 'none', label: t('recipe.generator.dietaryOptions.none'), icon: <MdRestaurantMenu size={16} /> },
    { value: 'vegetarian', label: t('recipe.generator.dietaryOptions.vegetarian'), icon: <span>🥗</span> },
    { value: 'vegan', label: t('recipe.generator.dietaryOptions.vegan'), icon: <span>🌱</span> },
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
      alert(t('recipe.generator.selectIngredientsRequired'));
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

  const handleGenerateFromStock = async () => {
    if (ingredientStocks.length === 0) {
      alert(t('recipe.generator.noStock'));
      return;
    }

    setIsLoading(true);
    try {
      // すべての在庫をAIに送信
      const stockItems = ingredientStocks.map(stock => ({
        name: stock.name,
        quantity: stock.quantity,
        daysRemaining: stock.daysRemaining,
        category: stock.category,
      }));

      const recipeContent = await generateRecipeFromStock(
        stockItems,
        dietaryRestriction,
        difficulty,
        customRequest
      );

      // レシピから料理名を抽出
      const titleMatch = recipeContent.match(/【料理名】\s*([^\n]+)/);
      const recipeTitle = titleMatch ? titleMatch[1].trim() : t('recipe.generator.defaultTitle');

      // レシピから材料を抽出（AIが提案した材料を使用）
      const ingredientMatch = recipeContent.match(/【材料】\s*([\s\S]*?)(?=【作り方】|【ポイント】|$)/);
      const extractedIngredients: string[] = [];
      if (ingredientMatch) {
        const ingredientsText = ingredientMatch[1];
        // 材料リストから材料名を抽出（「・」「-」「*」などの記号で始まる行を抽出）
        const lines = ingredientsText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        lines.forEach(line => {
          // 記号を除去して材料名を抽出
          const cleaned = line.replace(/^[・\-\*\d\.\s]+/, '').trim();
          if (cleaned && cleaned.length > 0) {
            // 数量や単位を除去（例：「鶏肉 200g」→「鶏肉」）
            // ただし、「：」や「:」の後は材料名として扱う
            const parts = cleaned.split(/[：:]/);
            const materialName = parts.length > 1 ? parts[1].trim() : cleaned;
            const nameOnly = materialName.split(/\s+/)[0];
            if (nameOnly && nameOnly.length > 0 && nameOnly.length < 50) {
              extractedIngredients.push(nameOnly);
            }
          }
        });
      }

      // 材料が抽出できなかった場合は、在庫から主要なものを使用
      const finalIngredients = extractedIngredients.length > 0
        ? extractedIngredients
        : ingredientStocks.slice(0, 5).map(s => s.name);

      const newRecipe: Recipe = {
        id: generateUUID(),
        title: recipeTitle,
        content: recipeContent,
        ingredients: finalIngredients,
        difficulty,
        dietaryRestriction,
        customRequest: customRequest || t('recipe.generator.defaultCustomRequest'),
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };

      addToHistory(newRecipe);
      onRecipeGenerated(newRecipe);

      // ミッション進捗を更新
      import('../../utils/mission').then(() => {
        import('../../config/firebase').then(({ auth }) => {
          if (auth.currentUser) {
            // レシピ作成ミッションを直接更新
            import('../../utils/mission').then(({ updateMissionProgress }) => {
              updateMissionProgress(auth.currentUser!.uid, 'mission_recipe', 1);
            });
          }
        });
      });
    } catch (error) {
      console.error('在庫からレシピ生成エラー:', error);
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

      let errorMessage = t('recipe.generator.error.generateFromStockFailed');
      if (error instanceof Error) {
        errorMessage += `\n\n${error.message}`;

        if (error.message.includes('403') || error.message.includes('無効') || error.message.includes('権限')) {
          errorMessage += `\n\n${t('recipe.generator.error.apiKey.title')}\n${t('recipe.generator.error.apiKey.step1')}\n${t('recipe.generator.error.apiKey.step2')}\n${t('recipe.generator.error.apiKey.step3')}`;
        } else if (error.message.includes('429') || error.message.includes('制限')) {
          errorMessage += `\n\n${t('recipe.generator.error.rateLimit.title')}\n${t('recipe.generator.error.rateLimit.step1')}\n${t('recipe.generator.error.rateLimit.step2')}`;
        } else if (error.message.includes('ネットワーク') || error.message.includes('Failed to fetch')) {
          errorMessage += `\n\n${t('recipe.generator.error.network.title')}\n${t('recipe.generator.error.network.step1')}\n${t('recipe.generator.error.network.step2')}`;
        } else if (error.message.includes('400') || error.message.includes('リクエスト形式')) {
          errorMessage += `\n\n${t('recipe.generator.error.request.title')}\n${t('recipe.generator.error.request.step1')}\n${t('recipe.generator.error.request.step2')}`;
        }
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!ingredients.trim()) {
      alert(t('recipe.generator.ingredientsRequired'));
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
        title: t('recipe.generator.recipeTitle', { ingredients: ingredientArray.slice(0, 3).join('、') }),
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

      // ミッション進捗を更新
      import('../../utils/mission').then(() => {
        // useAuthフックはこのコンポーネント内では使えないため、localStorageなどからIDを取得するか、
        // 親コンポーネントからIDを受け取る必要がありますが、ここではfirebase/authから直接取得します
        import('../../config/firebase').then(({ auth }) => {
          if (auth.currentUser) {
            // レシピ作成ミッションを直接更新
            import('../../utils/mission').then(({ updateMissionProgress }) => {
              updateMissionProgress(auth.currentUser!.uid, 'mission_recipe', 1);
            });
          }
        });
      });
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

      let errorMessage = t('recipe.generator.error.generateFailed');
      if (error instanceof Error) {
        errorMessage += `\n\n${error.message}`;

        // エラーの種類に応じた追加情報
        if (error.message.includes('403') || error.message.includes('無効') || error.message.includes('権限')) {
          errorMessage += `\n\n${t('recipe.generator.error.apiKey.title')}\n${t('recipe.generator.error.apiKey.step1')}\n${t('recipe.generator.error.apiKey.step2')}\n${t('recipe.generator.error.apiKey.step3')}`;
        } else if (error.message.includes('429') || error.message.includes('制限')) {
          errorMessage += `\n\n${t('recipe.generator.error.rateLimit.title')}\n${t('recipe.generator.error.rateLimit.step1')}\n${t('recipe.generator.error.rateLimit.step2')}`;
        } else if (error.message.includes('ネットワーク') || error.message.includes('Failed to fetch')) {
          errorMessage += `\n\n${t('recipe.generator.error.network.title')}\n${t('recipe.generator.error.network.step1')}\n${t('recipe.generator.error.network.step2')}`;
        } else if (error.message.includes('400') || error.message.includes('リクエスト形式')) {
          errorMessage += `\n\n${t('recipe.generator.error.request.title')}\n${t('recipe.generator.error.request.step1')}\n${t('recipe.generator.error.request.step2')}`;
        }
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProGate
      featureName={t('recipe.generator.title')}
      description="AIによるレシピ生成（食材からの提案含む）はプレミアムプラン限定機能です。"
    >
      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MdRestaurantMenu size={20} />
          {t('recipe.generator.title')}
        </h3>

        <label>{t('recipe.generator.ingredients')}</label>
        <input
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder={t('recipe.generator.ingredientsPlaceholder')}
          disabled={isLoading}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              minWidth: '150px',
            }}
            disabled={isLoading || ingredientStocks.length === 0}
          >
            <MdInventory size={18} />
            {t('recipe.generator.selectIngredients')} ({ingredientStocks.length}件)
          </button>

          <button
            onClick={handleGenerateFromStock}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: 1,
              minWidth: '150px',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
            }}
            disabled={isLoading || ingredientStocks.length === 0}
          >
            <MdSmartToy size={18} />
            {t('recipe.generator.generateFromStock')}
          </button>
        </div>

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
                <h3 className="modal-title">{t('recipe.generator.selectIngredients')}</h3>
                <button
                  className="modal-close"
                  onClick={() => setShowStockModal(false)}
                  aria-label={t('common.cancel')}
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
                  {selectedStockIds.size === ingredientStocks.length ? t('receipt.deselectAll') : t('recipe.generator.selectAll')}
                </button>
                <span style={{ marginLeft: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {t('recipe.generator.selectedCount', { count: selectedStockIds.size })}
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
                    {t('recipe.generator.noStockInModal')}
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
                              {t('recipe.generator.quantity', { count: stock.quantity })}
                              {stock.daysRemaining !== undefined && (
                                <>
                                  {' '}・ {t('recipe.generator.expiryDays', { days: stock.daysRemaining })}
                                  {stock.daysRemaining <= 3 && (
                                    <span style={{ color: '#ef4444', marginLeft: '4px' }}>⚠️</span>
                                  )}
                                </>
                              )}
                              {stock.category && (
                                <span style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                                  ({t(`stock.categories.${stock.category}`)})
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
                  {t('common.cancel')}
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
                  {t('recipe.generator.addSelected')} ({selectedStockIds.size}件)
                </button>
              </div>
            </div>
          </div>
        )}

        <label>{t('recipe.generator.difficulty')}</label>
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

        <label>{t('recipe.generator.dietaryRestriction')}</label>
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

        <label>{t('recipe.generator.customRequest')}</label>
        <textarea
          value={customRequest}
          onChange={(e) => setCustomRequest(e.target.value)}
          placeholder={t('recipe.generator.customRequestPlaceholder')}
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
          {t('recipe.generator.generate')}
        </button>
      </div>
    </ProGate>
  );
};
