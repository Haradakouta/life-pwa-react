/**
 * コレクション・ガチャ画面
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserCollection, spinGacha, setPartner, setProfileIcon } from '../../utils/collection';
import { getUserTotalPoints } from '../../utils/mission';
import { collectionItems } from '../../data/collection';
import type { UserCollection, UserCollectionItem } from '../../types/collection';
import { MdArrowBack, MdPerson, MdHome } from 'react-icons/md';

interface CollectionScreenProps {
    onBack?: () => void;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [collection, setCollection] = useState<UserCollection | null>(null);
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [spinning, setSpinning] = useState(false);
    const [gachaResult, setGachaResult] = useState<{ item: UserCollectionItem; isNew: boolean } | null>(null);
    const [selectedItem, setSelectedItem] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [colData, pts] = await Promise.all([
                getUserCollection(user.uid),
                getUserTotalPoints(user.uid)
            ]);
            setCollection(colData);
            setPoints(pts);
        } catch (error) {
            console.error('データ取得エラー:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSpin = async () => {
        if (!user || points < 100) return;

        setSpinning(true);
        setGachaResult(null);

        // 演出用ウェイト
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = await spinGacha(user.uid);

        if (result.success && result.item) {
            const isNew = !collection?.items.some(i => i.itemId === result.item!.itemId);
            setGachaResult({ item: result.item, isNew });
            await fetchData(); // データ更新
        } else {
            alert(result.error || 'ガチャに失敗しました');
        }

        setSpinning(false);
    };

    const handleSetPartner = async (itemId: string) => {
        if (!user) return;
        try {
            await setPartner(user.uid, itemId);
            await fetchData();
            alert('パートナーに設定しました！');
        } catch (error) {
            console.error(error);
            alert('設定に失敗しました');
        }
    };

    const handleSetIcon = async (itemId: string) => {
        if (!user) return;
        try {
            await setProfileIcon(user.uid, itemId);
            await fetchData();
            alert('アイコンに設定しました！');
        } catch (error) {
            console.error(error);
            alert('設定に失敗しました');
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>;

    return (
        <div style={{ padding: '16px', paddingBottom: '80px' }}>
            {/* ヘッダー */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                {onBack && (
                    <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <MdArrowBack size={24} />
                    </button>
                )}
                <h2 style={{ margin: 0 }}>コレクション</h2>
                <div style={{ marginLeft: 'auto', background: '#f3f4f6', padding: '4px 12px', borderRadius: '99px', fontSize: '14px', fontWeight: 'bold' }}>
                    {points} P
                </div>
            </div>

            {/* ガチャセクション */}
            <div style={{
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                color: 'white',
                marginBottom: '32px',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
            }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>モンスターガチャ</h3>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                    {spinning ? '🎰' : '🎁'}
                </div>

                {gachaResult ? (
                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '16px', borderRadius: '12px', marginBottom: '16px', animation: 'popIn 0.5s' }}>
                        <div style={{ fontSize: '14px' }}>{gachaResult.isNew ? '✨ NEW! ✨' : 'GET!'}</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0', display: 'flex', justifyContent: 'center' }}>
                            {(() => {
                                const imgUrl = collectionItems.find(i => i.id === gachaResult.item.itemId)?.imageUrl;
                                return imgUrl?.startsWith('/') ? (
                                    <img src={imgUrl} alt="result" style={{ width: '96px', height: '96px', objectFit: 'contain' }} />
                                ) : (
                                    imgUrl
                                );
                            })()}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>
                            {collectionItems.find(i => i.id === gachaResult.item.itemId)?.name}
                        </div>
                        <button
                            onClick={() => setGachaResult(null)}
                            style={{
                                marginTop: '12px',
                                background: 'white',
                                color: '#FF6B6B',
                                border: 'none',
                                padding: '4px 16px',
                                borderRadius: '99px',
                                cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSpin}
                        disabled={spinning || points < 100}
                        style={{
                            background: 'white',
                            color: points < 100 ? '#ccc' : '#FF6B6B',
                            border: 'none',
                            padding: '12px 32px',
                            borderRadius: '99px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: points < 100 ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 0 rgba(0,0,0,0.1)',
                            transform: spinning ? 'scale(0.95)' : 'none',
                            transition: 'all 0.2s'
                        }}
                    >
                        {spinning ? '抽選中...' : '1回 100P'}
                    </button>
                )}
            </div>

            {/* コレクションリスト */}
            <h3 style={{ marginBottom: '16px' }}>獲得済み ({collection?.items.length || 0}/{collectionItems.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                {collectionItems.map(item => {
                    const userItem = collection?.items.find(i => i.itemId === item.id);
                    const isOwned = !!userItem;
                    const isPartner = collection?.partnerItemId === item.id;
                    const isIcon = collection?.iconItemId === item.id;

                    return (
                        <div
                            key={item.id}
                            onClick={() => isOwned && setSelectedItem(item.id)}
                            style={{
                                aspectRatio: '1',
                                background: isOwned ? 'var(--card)' : '#f3f4f6',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                                position: 'relative',
                                cursor: isOwned ? 'pointer' : 'default',
                                border: isPartner ? '2px solid var(--primary)' : '2px solid transparent',
                                opacity: isOwned ? 1 : 0.5,
                                filter: isOwned ? 'none' : 'grayscale(100%)'
                            }}
                        >
                            {item.imageUrl.startsWith('/') ? (
                                <img src={item.imageUrl} alt={item.name} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                            ) : (
                                item.imageUrl
                            )}
                            {isOwned && userItem!.count > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    fontSize: '10px',
                                    background: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    padding: '2px 6px',
                                    borderRadius: '99px'
                                }}>
                                    x{userItem!.count}
                                </div>
                            )}
                            {isIcon && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background: 'var(--secondary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '2px',
                                    fontSize: '12px'
                                }}>
                                    <MdPerson />
                                </div>
                            )}
                            {isPartner && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '-4px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    padding: '2px',
                                    fontSize: '12px'
                                }}>
                                    <MdHome />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 詳細モーダル */}
            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setSelectedItem(null)}>
                    <div style={{
                        background: 'var(--card)',
                        padding: '24px',
                        borderRadius: '16px',
                        width: '80%',
                        maxWidth: '300px',
                        textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        {(() => {
                            const item = collectionItems.find(i => i.id === selectedItem);
                            if (!item) return null;
                            return (
                                <>
                                    <div style={{ fontSize: '64px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                                        {item.imageUrl.startsWith('/') ? (
                                            <img src={item.imageUrl} alt={item.name} style={{ width: '128px', height: '128px', objectFit: 'contain' }} />
                                        ) : (
                                            item.imageUrl
                                        )}
                                    </div>
                                    <h3 style={{ margin: '0 0 8px 0' }}>{item.name}</h3>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '99px',
                                        fontSize: '12px',
                                        marginBottom: '16px',
                                        background: item.rarity === 'super_rare' ? '#ffd700' : item.rarity === 'rare' ? '#c0c0c0' : '#cd7f32',
                                        color: 'white'
                                    }}>
                                        {item.rarity.toUpperCase()}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                                        {item.description}
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <button
                                            onClick={() => { handleSetPartner(item.id); setSelectedItem(null); }}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--primary)',
                                                background: 'var(--primary-light)',
                                                color: 'var(--primary)',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            パートナーに設定
                                        </button>
                                        <button
                                            onClick={() => { handleSetIcon(item.id); setSelectedItem(null); }}
                                            style={{
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--secondary)',
                                                background: 'var(--secondary-light)',
                                                color: 'var(--secondary)',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            アイコンに設定
                                        </button>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};
