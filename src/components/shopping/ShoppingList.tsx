/**
 * 買い物リスト表示コンポーネント
 */
import React, { useState } from 'react';
import { useShoppingStore, useStockStore, useExpenseStore } from '../../store';
import { MdDelete, MdInventory, MdCheckCircle } from 'react-icons/md';

export const ShoppingList: React.FC = () => {
  const { items, toggleItem, deleteItem, clearCompleted } = useShoppingStore();
  const { addStock } = useStockStore();
  const { addExpense } = useExpenseStore();
  const [showSuccess, setShowSuccess] = useState(false);

  // 合計金額を計算
  const totalAmount = items
    .filter((item) => !item.checked)
    .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const checkedAmount = items
    .filter((item) => item.checked)
    .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const handleClear = () => {
    if (confirm('チェック済みのアイテムをすべて削除しますか？')) {
      clearCompleted();
    }
  };

  const handleMoveToStock = () => {
    const checkedItems = items.filter((item) => item.checked);
    if (checkedItems.length === 0) {
      alert('チェック済みのアイテムがありません');
      return;
    }

    // 価格情報がある商品の合計金額を計算
    const totalPrice = checkedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const priceInfo = totalPrice > 0 ? `\n（合計金額: ¥${totalPrice.toLocaleString()}を家計簿に記録します）` : '';

    if (
      !confirm(
        `チェック済みのアイテム ${checkedItems.length}個を在庫に追加しますか？\n（賞味期限は7日後に設定されます）${priceInfo}`
      )
    ) {
      return;
    }

    // 在庫に追加
    checkedItems.forEach((item) => {
      addStock({
        name: item.name,
        quantity: item.quantity,
        daysRemaining: 7,
      });
    });

    // 家計簿に記録（価格情報がある場合のみ）
    if (totalPrice > 0) {
      const itemNames = checkedItems.map((item) => item.name).join('、');
      addExpense({
        category: 'food',
        amount: totalPrice,
        memo: `買い物: ${itemNames}`,
        date: new Date().toISOString(),
      });
    }

    clearCompleted();

    // 成功メッセージを表示
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="card">
      <h3>買い物リスト</h3>
      {items.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          リストが空です
        </p>
      ) : (
        <>
          {/* 合計金額表示 */}
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--background)', borderRadius: '8px', border: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>未購入の合計</span>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>¥{totalAmount.toLocaleString()}</span>
            </div>
            {checkedAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>購入済みの合計</span>
                <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '1.1rem' }}>¥{checkedAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {items.map((item) => (
              <li
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleItem(item.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        textDecoration: item.checked ? 'line-through' : 'none',
                        color: item.checked ? '#999' : 'inherit',
                      }}
                    >
                      {item.name}
                      {item.quantity > 1 && (
                        <span
                          style={{
                            fontSize: '0.85rem',
                            color: '#666',
                            marginLeft: '8px',
                          }}
                        >
                          x{item.quantity}
                        </span>
                      )}
                    </div>
                    {item.price && (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        ¥{item.price.toLocaleString()} {item.quantity > 1 && `(小計: ¥${(item.price * item.quantity).toLocaleString()})`}
                      </div>
                    )}
                  </div>
                </label>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="delete-btn"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  <MdDelete size={20} />
                </button>
              </li>
            ))}
          </ul>
          {items.some((item) => item.checked) && (
            <>
              {/* 目玉機能: 在庫に追加 */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                  }}
                >
                  <MdInventory size={20} />
                  <span>買い物完了後はこちら！</span>
                </div>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.85rem',
                    margin: '0 0 12px 0',
                    lineHeight: '1.5',
                  }}
                >
                  チェックした商品を在庫に一括追加できます。
                  <br />
                  賞味期限は自動で7日後に設定されます。
                </p>
                <button
                  className="submit"
                  onClick={handleMoveToStock}
                  style={{
                    background: 'white',
                    color: '#10b981',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    padding: '14px',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <MdInventory size={22} />
                  在庫に追加（{items.filter((item) => item.checked).length}個）
                </button>
              </div>

              {/* クリアボタン */}
              <button
                className="submit"
                onClick={handleClear}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '2px solid #ef4444',
                  marginTop: '8px',
                  width: '100%',
                }}
              >
                チェック済みをクリア
              </button>
            </>
          )}

          {/* 成功メッセージ */}
          {showSuccess && (
            <div
              style={{
                position: 'fixed',
                top: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#10b981',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                zIndex: 1000,
                animation: 'slideDown 0.3s ease-out',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              <MdCheckCircle size={28} />
              <span>在庫に追加しました！</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
