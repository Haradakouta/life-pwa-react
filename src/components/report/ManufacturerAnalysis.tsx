/**
 * メーカー別支出分析コンポーネント
 */
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useIntakeStore } from '../../store';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const ManufacturerAnalysis: React.FC = () => {
  const { intakes } = useIntakeStore();

  const chartData = useMemo(() => {
    // メーカー別に支出を集計
    const manufacturerExpense = new Map<string, number>();

    intakes.forEach((intake) => {
      const manufacturer = intake.manufacturer || 'その他';
      const expense = manufacturerExpense.get(manufacturer) || 0;
      manufacturerExpense.set(manufacturer, expense + intake.price);
    });

    // 支出額でソートしてTOP6を取得
    const sorted = Array.from(manufacturerExpense.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name,
        value,
      }));

    return sorted;
  }, [intakes]);

  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasData = totalExpense > 0;

  return (
    <div className="card">
      <h3>🏭 メーカー別支出分析</h3>

      {!hasData ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}
        >
          <p>データがありません</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            メーカー情報付きの食事記録を追加すると、分析が表示されます
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) =>
                  `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => `¥${value.toLocaleString()}`}
                contentStyle={{
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ marginTop: '16px' }}>
            {chartData.map((item, index) => (
              <div
                key={item.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom:
                    index < chartData.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '2px',
                      background: COLORS[index % COLORS.length],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                    {item.name}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--primary)',
                  }}
                >
                  ¥{item.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'var(--background)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600 }}>合計</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>
              ¥{totalExpense.toLocaleString()}
            </span>
          </div>
        </>
      )}
    </div>
  );
};
