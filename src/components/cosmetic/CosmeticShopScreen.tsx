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

  const filteredCosmetics = selectedType === 'all'
    ? cosmetics
    : cosmetics.filter(c => c.type === selectedType);

  const getRarityColor = (rarity: Cosmetic['rarity']): string => {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'rare': return '#2196f3';
      case 'epic': return '#9c27b0';
      case 'legendary': return '#ffc107';
      default: return '#9e9e9e';
    }
  };

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

  return (
    <div style={{ padding: '16px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--background)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <MdArrowBack size={24} color="var(--text)" />
            </button>
          )}
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>装飾ショップ</h2>
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
      }}>
        <MdEmojiEvents size={32} />
        <div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>現在のポイント</div>
          <div style={{ fontSize: '28px', fontWeight: 700 }}>
            {userCosmetics?.totalPoints || 0}
          </div>
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '24px',
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
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: '6px' }}>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* 装飾一覧 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredCosmetics.map(cosmetic => {
          const owned = isOwned(cosmetic.id);
          const equipped = isEquipped(cosmetic.id, cosmetic.type);
          const canAfford = (userCosmetics?.totalPoints || 0) >= cosmetic.price;

          return (
            <div
              key={cosmetic.id}
              style={{
                padding: '16px',
                background: owned ? 'var(--card)' : 'var(--background)',
                border: `2px solid ${equipped ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: '12px',
                opacity: owned ? 1 : 0.9,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>{cosmetic.icon}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                        {cosmetic.name}
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        background: getRarityColor(cosmetic.rarity),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}>
                        {cosmetic.rarity}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {cosmetic.description}
                    </div>
                  </div>
                </div>
                {equipped && (
                  <div style={{
                    padding: '4px 8px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    装備中
                  </div>
                )}
              </div>

              {/* プレビュー */}
              {cosmetic.type === 'nameColor' && cosmetic.data.color && (
                <div style={{
                  padding: '8px',
                  background: cosmetic.data.color,
                  borderRadius: '6px',
                  marginBottom: '12px',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                }}>
                  名前の色プレビュー
                </div>
              )}
              {cosmetic.type === 'nameColor' && cosmetic.data.gradient && (
                <div style={{
                  padding: '8px',
                  background: cosmetic.data.gradient,
                  borderRadius: '6px',
                  marginBottom: '12px',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: 600,
                }}>
                  名前の色プレビュー
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  padding: '6px 12px',
                  background: 'var(--background)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: canAfford || owned ? 'var(--text)' : '#dc2626',
                }}>
                  {cosmetic.price === 0 ? '無料' : `${cosmetic.price}P`}
                </div>
                
                {owned ? (
                  <button
                    onClick={() => handleEquip(cosmetic.id, cosmetic.type)}
                    style={{
                      padding: '8px 16px',
                      background: equipped ? 'var(--primary)' : 'var(--background)',
                      color: equipped ? 'white' : 'var(--text)',
                      border: `1px solid ${equipped ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
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
                        装備
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handlePurchase(cosmetic.id)}
                    disabled={!canAfford}
                    style={{
                      padding: '8px 16px',
                      background: canAfford ? 'var(--primary)' : 'var(--border)',
                      color: canAfford ? 'white' : 'var(--text-secondary)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      opacity: canAfford ? 1 : 0.6,
                    }}
                  >
                    <MdShoppingCart size={18} />
                    購入
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

