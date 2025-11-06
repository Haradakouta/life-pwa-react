/**
 * よく買う商品ランキングコンポーネント
 */
import React, { useMemo } from 'react';
import { useIntakeStore } from '../../store';

export const ProductRanking: React.FC = () => {
  const { intakes } = useIntakeStore();

  const ranking = useMemo(() => {
    // 商品名ごとに購入回数を集計（AIレシピ由来のintakesは除外）
    const productCount = new Map<string, number>();

    intakes.forEach((intake) => {
      // AIレシピ由来のintakesは除外（よく買う商品TOP5には含めない）
      if (intake.source === 'recipe') {
        return;
      }
      const count = productCount.get(intake.name) || 0;
      productCount.set(intake.name, count + 1);
    });

    // 購入回数でソートしてTOP5を取得
    const sorted = Array.from(productCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count], index) => ({
        rank: index + 1,
        name,
        count,
      }));

    return sorted;
  }, [intakes]);

  return (
    <div className="card">
      <h3>🏆 よく買う商品 TOP5</h3>

      {ranking.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}
        >
          <p>データがありません</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            食事記録を追加すると、よく買う商品が表示されます
          </p>
        </div>
      ) : (
        <div style={{ marginTop: '16px' }}>
          {ranking.map((item) => (
            <div
              key={item.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom:
                  item.rank < ranking.length ? '1px solid var(--border)' : 'none',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background:
                    item.rank === 1
                      ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)'
                      : item.rank === 2
                      ? 'linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)'
                      : item.rank === 3
                      ? 'linear-gradient(135deg, #cd7f32 0%, #daa06d 100%)'
                      : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color: item.rank <= 3 ? '#fff' : '#666',
                  marginRight: '16px',
                  flexShrink: 0,
                }}
              >
                {item.rank}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  購入回数: {item.count}回
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
