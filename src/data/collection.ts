import type { CollectionItem } from '../types/collection';

export const collectionItems: CollectionItem[] = [
    // Common (60%)
    { id: 'c1', name: 'おにぎりスライム', description: 'もちもちしたお米のモンスター。', rarity: 'common', imageUrl: '/images/collection/rice_ball_slime.png' },
    { id: 'c2', name: 'ブロッコリーの妖精', description: 'ビタミン豊富な森の住人。', rarity: 'common', imageUrl: '🥦' },
    { id: 'c3', name: 'キャロットラビット', description: '目が良くなる気がするウサギ。', rarity: 'common', imageUrl: '🥕' },
    { id: 'c4', name: '豆腐小僧', description: 'ヘルシーで崩れやすい。', rarity: 'common', imageUrl: '🧊' },
    { id: 'c5', name: '納豆ゴースト', description: 'ネバネバして離れない。', rarity: 'common', imageUrl: '🫘' },

    // Rare (30%)
    { id: 'r1', name: 'エッグナイト', description: 'タンパク質の守護者。', rarity: 'rare', imageUrl: '🍳' },
    { id: 'r2', name: 'サーモンサムライ', description: 'DHAの刃で悪を断つ。', rarity: 'rare', imageUrl: '/images/collection/salmon_samurai.png' },
    { id: 'r3', name: 'アボカドウィザード', description: '森のバターの魔法使い。', rarity: 'rare', imageUrl: '🥑' },
    { id: 'r4', name: 'チキンヒーロー', description: '低脂質高タンパクの味方。', rarity: 'rare', imageUrl: '🍗' },

    // Super Rare (10%)
    { id: 'sr1', name: 'ステーキドラゴン', description: '圧倒的なパワーを誇る肉の王。', rarity: 'super_rare', imageUrl: '/images/collection/steak_dragon.png' },
    { id: 'sr2', name: 'レインボーパフェ', description: 'たまには甘いものも必要。', rarity: 'super_rare', imageUrl: '🍨' },
    { id: 'sr3', name: 'ゴールデンアップル', description: '医者いらずの伝説の果実。', rarity: 'super_rare', imageUrl: '🍎' },
];
