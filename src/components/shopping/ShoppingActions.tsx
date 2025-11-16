/**
 * 買い物リストアクションコンポーネント（1週間分生成、低在庫追加）
 */
import React, { useState } from 'react';
import { useShoppingStore, useStockStore, useSettingsStore, useIntakeStore } from '../../store';
import { getHealthBasedShoppingList, analyzeNutritionalDeficiencies, getNutritionalSupplementItems } from '../../utils/healthShopping';
import { MdHealthAndSafety, MdRefresh } from 'react-icons/md';

export const ShoppingActions: React.FC = () => {
  const { addWeeklyEssentials, addLowStockItems, addItem } = useShoppingStore();
  const { getExpiringStocks } = useStockStore();
  const { settings } = useSettingsStore();
  const { intakes } = useIntakeStore();
  const [loadingHealthRecommendation, setLoadingHealthRecommendation] = useState(false);

  const handleWeeklyList = () => {
    addWeeklyEssentials();
    alert('1週間分の買い物リストを追加しました！');
  };

  const handleLowStock = () => {
    const lowStockItems = getExpiringStocks(2); // 残り2日以下
    if (lowStockItems.length === 0) {
      alert('在庫が少ない商品はありません');
      return;
    }

    addLowStockItems(
      lowStockItems.map((item) => ({
        name: item.name,
        category: item.category,
      }))
    );
    alert(`${lowStockItems.length}件の商品を追加しました！`);
  };

  const handleHealthRecommendation = async () => {
    if (!settings.height || !settings.weight || !settings.age) {
      alert('健康情報（身長・体重・年齢）を設定してください。\n設定画面から健康情報を設定できます。');
      return;
    }

    setLoadingHealthRecommendation(true);
    try {
      const recommendation = await getHealthBasedShoppingList(settings);
      if (!recommendation) {
        alert('健康買い物リストの生成に失敗しました');
        return;
      }

      // 不足栄養素を分析
      const deficiencies = analyzeNutritionalDeficiencies(intakes, 7);
      const supplementItems = getNutritionalSupplementItems(deficiencies);

      // すべての推奨アイテムを買い物リストに追加
      const allItems = [...recommendation.items, ...supplementItems];
      let addedCount = 0;

      for (const item of allItems) {
        try {
          await addItem({
            name: item.name,
            quantity: item.quantity,
            category: (item.category === 'staple' || item.category === 'protein' || item.category === 'vegetable' || item.category === 'fruit' || item.category === 'dairy' || item.category === 'seasoning' || item.category === 'other') 
              ? item.category 
              : 'other',
          });
          addedCount++;
        } catch (error) {
          console.error('アイテム追加エラー:', error);
        }
      }

      alert(
        `健康目標に基づいた買い物リストを追加しました！\n\n${recommendation.summary}\n\n${addedCount}件の商品を追加しました。`
      );
    } catch (error) {
      console.error('健康買い物リスト生成エラー:', error);
      alert('健康買い物リストの生成に失敗しました');
    } finally {
      setLoadingHealthRecommendation(false);
    }
  };

  return (
    <div className="card">
      <h3>🔰 初心者向けサポート</h3>
      <button
        className="submit"
        onClick={handleWeeklyList}
        style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          marginBottom: '8px',
        }}
      >
        📅 1週間分の買い物リストを生成
      </button>
      <button
        className="submit"
        onClick={handleLowStock}
        style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
      >
        ⚠️ 在庫が少ない商品を追加
      </button>
      <button
        className="submit"
        onClick={handleHealthRecommendation}
        disabled={loadingHealthRecommendation || !settings.height || !settings.weight || !settings.age}
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          marginTop: '8px',
          opacity: (!settings.height || !settings.weight || !settings.age) ? 0.6 : 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        {loadingHealthRecommendation ? (
          <>
            <MdRefresh size={18} style={{ animation: 'spin 1s linear infinite' }} />
            生成中...
          </>
        ) : (
          <>
            <MdHealthAndSafety size={18} />
            🎯 健康目標に基づいた買い物リスト
          </>
        )}
      </button>
      {(!settings.height || !settings.weight || !settings.age) && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
          ※ 健康情報を設定すると利用できます
        </p>
      )}
    </div>
  );
};
