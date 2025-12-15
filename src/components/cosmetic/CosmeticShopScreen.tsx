/**
 * 装飾要素ショップ画面
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserCosmetics, purchaseCosmetic, equipCosmetic } from '../../utils/cosmetic';
import { cosmetics } from '../../data/cosmetics';
import type { Cosmetic, UserCosmetic } from '../../types/cosmetic';
import { MdArrowBack, MdCheckCircle, MdShoppingCart, MdEmojiEvents, MdRadioButtonUnchecked } from 'react-icons/md';

interface CosmeticShopScreenProps {
  onBack?: () => void;
}

export const CosmeticShopScreen: React.FC<CosmeticShopScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [userCosmetics, setUserCosmetics] = useState<UserCosmetic | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [selectedType, setSelectedType] = useState<'frame' | 'nameColor' | 'skin' | 'all'>('all');

  useEffect(() => {
    if (user) {
      fetchUserCosmetics();
    }
  }, [user]);

  const fetchUserCosmetics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await getUserCosmetics(user.uid);
      setUserCosmetics(data);
    } catch (error) {
      console.error('装飾データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (cosmeticId: string) => {
    if (!user) return;

    try {
      const success = await purchaseCosmetic(user.uid, cosmeticId);
      if (success) {
        alert('装飾を購入しました！');
        await fetchUserCosmetics();
      } else {
        alert('ポイントが不足しています。');
      }
    } catch (error) {
      console.error('購入エラー:', error);
      alert('購入に失敗しました');
    }
  };

  const handleEquip = async (cosmeticId: string, type: 'frame' | 'nameColor' | 'skin') => {
    if (!user) return;

    try {
      await equipCosmetic(user.uid, cosmeticId, type);
      await fetchUserCosmetics();
    } catch (error) {
      console.error('装備エラー:', error);
      alert('装備に失敗しました');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          margin: '0 auto 12px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        読み込み中...
      </div>
    );
  }

  const isOwned = (cosmeticId: string): boolean => {
    return userCosmetics?.ownedCosmetics.includes(cosmeticId) || false;
  };

  const isEquipped = (cosmeticId: string, type: Cosmetic['type']): boolean => {
    if (!userCosmetics) return false;
    if (type === 'frame') return userCosmetics.equippedFrame === cosmeticId;
    if (type === 'nameColor') return userCosmetics.equippedNameColor === cosmeticId;
    if (type === 'skin') return userCosmetics.equippedSkin === cosmeticId;
    return false;
  };

  const filteredCosmetics = cosmetics.filter(c => {
    // カテゴリフィルタ
    if (selectedType !== 'all' && c.type !== selectedType) return false;

    // タブフィルタ
    if (activeTab === 'inventory') {
      return isOwned(c.id);
    } else {
      // Shopタブ: 未所持のみ表示、または全表示？
      // ここでは「未所持」を表示し、所持済みはInventoryへ誘導する形にするか、
      // 単に全表示して「所持済み」バッジを出すか。
      // ユーザー体験的には「全表示」で「所持済み」がわかる方が良い。
      return true;
    }
  });

  const getRarityColor = (rarity: Cosmetic['rarity']): string => {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ffc107';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MdArrowBack size={24} color="var(--text)" />
            </button>
          )}
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>装飾ショップ</h2>
        </div>
      </div>

      {/* ポイント表示 */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        marginBottom: '24px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
      }}>
        <MdEmojiEvents size={32} />
        <div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>現在のポイント</div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>
            {userCosmetics?.totalPoints || 0}
          </div>
        </div>
      </div>

      {/* タブ切り替え */}
      <div style={{ display: 'flex', marginBottom: '24px', background: 'var(--card)', borderRadius: '12px', padding: '4px' }}>
        <button
          onClick={() => setActiveTab('shop')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            background: activeTab === 'shop' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'shop' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          ショップ
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '8px',
            background: activeTab === 'inventory' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'inventory' ? 'white' : 'var(--text-secondary)',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          持ち物
        </button>
      </div>

      {/* カテゴリフィルター */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
      }}>
        {[
          { id: 'all', name: 'すべて', icon: '📋' },
          { id: 'frame', name: 'フレーム', icon: '🖼️' },
          { id: 'nameColor', name: '名前色', icon: '🎨' },
          { id: 'skin', name: 'スキン', icon: '✨' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedType(cat.id as any)}
            style={{
              padding: '8px 16px',
              background: selectedType === cat.id ? 'var(--primary)' : 'var(--card)',
              color: selectedType === cat.id ? 'white' : 'var(--text)',
              border: `1px solid ${selectedType === cat.id ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: selectedType === cat.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <span style={{ marginRight: '6px' }}>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 装飾一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredCosmetics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            {activeTab === 'inventory' ? 'アイテムを持っていません' : 'アイテムがありません'}
          </div>
        ) : (
          filteredCosmetics.map(cosmetic => {
            const owned = isOwned(cosmetic.id);
            const equipped = isEquipped(cosmetic.id, cosmetic.type);
            const canAfford = (userCosmetics?.totalPoints || 0) >= cosmetic.price;

            return (
              <div
                key={cosmetic.id}
                style={{
                  padding: '16px',
                  background: 'var(--card)',
                  border: `2px solid ${equipped ? 'var(--primary)' : 'transparent'}`,
                  borderRadius: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {equipped && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '4px 12px',
                    borderBottomLeftRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    装備中
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '32px',
                    background: 'var(--background)',
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px'
                  }}>
                    {cosmetic.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
                        {cosmetic.name}
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        background: getRarityColor(cosmetic.rarity),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}>
                        {cosmetic.rarity.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {cosmetic.description}
                    </div>
                  </div>
                </div>

                {/* プレビュー */}
                {(cosmetic.type === 'nameColor' || cosmetic.type === 'frame') && (
                  <div style={{
                    padding: '12px',
                    background: 'var(--background)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}>
                    {cosmetic.type === 'nameColor' && (
                      <span style={{
                        fontWeight: 700,
                        fontSize: '16px',
                        background: cosmetic.data.gradient,
                        color: cosmetic.data.color || 'inherit',
                        WebkitBackgroundClip: cosmetic.data.gradient ? 'text' : undefined,
                        WebkitTextFillColor: cosmetic.data.gradient ? 'transparent' : undefined,
                      }}>
                        User Name
                      </span>
                    )}
                    {cosmetic.type === 'frame' && (
                      <div style={{ display: 'inline-block', position: 'relative', width: '48px', height: '48px' }}>
                        {/* フレームプレビュー（簡易的） */}
                        <div style={{
                          position: 'absolute',
                          top: -4, left: -4, right: -4, bottom: -4,
                          border: '2px solid gold', // 実際のフレーム画像があればそれを使う
                          borderRadius: '50%',
                          pointerEvents: 'none'
                        }} />
                        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#ccc' }} />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: canAfford || owned ? 'var(--primary)' : '#ef4444',
                  }}>
                    {cosmetic.price === 0 ? 'FREE' : `${cosmetic.price.toLocaleString()} P`}
                  </div>

                  {activeTab === 'shop' ? (
                    owned ? (
                      <button
                        onClick={() => setActiveTab('inventory')}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--background)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        持ち物へ
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(cosmetic.id)}
                        disabled={!canAfford}
                        style={{
                          padding: '8px 20px',
                          background: canAfford ? 'var(--primary)' : 'var(--border)',
                          color: canAfford ? 'white' : 'var(--text-secondary)',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: canAfford ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                        }}
                      >
                        <MdShoppingCart size={18} />
                        購入する
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleEquip(cosmetic.id, cosmetic.type)}
                      disabled={equipped}
                      style={{
                        padding: '8px 20px',
                        background: equipped ? 'var(--background)' : 'var(--primary)',
                        color: equipped ? 'var(--text-secondary)' : 'white',
                        border: equipped ? '1px solid var(--border)' : 'none',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: equipped ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: equipped ? 0.7 : 1
                      }}
                    >
                      {equipped ? (
                        <>
                          <MdCheckCircle size={18} />
                          装備中
                        </>
                      ) : (
                        <>
                          <MdRadioButtonUnchecked size={18} />
                          装備する
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

