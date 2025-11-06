/**
 * 称号データ（30種類 + 47都道府県）
 */
import type { Title } from '../types/title';
import { prefectures } from '../types/prefecture';

export const titles: Title[] = [
    // ============================================
    // 初心者系（Common）
    // ============================================
    {
        id: 'first_post',
        name: '初めての咆哮',
        description: '最初の言葉を世界に放った瞬間',
        category: 'beginner',
        icon: '🎉',
        rarity: 'common',
        condition: { type: 'first_post' },
        order: 1,
    },
    {
        id: 'profile_complete',
        name: '真我の覚醒',
        description: '己の姿を定めた者への証',
        category: 'beginner',
        icon: '👤',
        rarity: 'common',
        condition: { type: 'profile_complete' },
        order: 2,
    },
    {
        id: 'first_like',
        name: '共鳴の始まり',
        description: '初めて他者と共鳴した瞬間',
        category: 'beginner',
        icon: '👍',
        rarity: 'common',
        condition: { type: 'like_count', threshold: 1 },
        order: 3,
    },
    {
        id: 'first_comment',
        name: '言葉の刻印',
        description: '初めて言葉の力を使った者',
        category: 'beginner',
        icon: '💬',
        rarity: 'common',
        condition: { type: 'comment_count', threshold: 1 },
        order: 4,
    },

    // ============================================
    // 投稿者系（Common → Rare）
    // ============================================
    {
        id: 'post_10',
        name: '言葉の使い手',
        description: '10回の言葉を世界に放った者',
        category: 'poster',
        icon: '📝',
        rarity: 'common',
        condition: { type: 'post_count', threshold: 10 },
        order: 10,
    },
    {
        id: 'post_50',
        name: '言葉の支配者',
        description: '50回の言葉で世界を支配し始めた存在',
        category: 'poster',
        icon: '📚',
        rarity: 'rare',
        condition: { type: 'post_count', threshold: 50 },
        order: 11,
    },
    {
        id: 'post_100',
        name: '絶対言語の覇者',
        description: '100回の言葉で現実を歪めた超越者',
        category: 'poster',
        icon: '📖',
        rarity: 'epic',
        condition: { type: 'post_count', threshold: 100 },
        order: 12,
    },
    {
        id: 'post_500',
        name: '無限の言葉の真祖',
        description: '500回の言葉で時空を超越した存在',
        category: 'poster',
        icon: '📜',
        rarity: 'legendary',
        condition: { type: 'post_count', threshold: 500 },
        order: 13,
    },

    // ============================================
    // ソーシャル系（Common → Rare）
    // ============================================
    {
        id: 'follower_10',
        name: '共鳴する者',
        description: '10人から崇拝される存在',
        category: 'social',
        icon: '⭐',
        rarity: 'common',
        condition: { type: 'follower_count', threshold: 10 },
        order: 20,
    },
    {
        id: 'follower_50',
        name: '支配の始まり',
        description: '50人の魂を支配した闇の支配者',
        category: 'social',
        icon: '🌟',
        rarity: 'rare',
        condition: { type: 'follower_count', threshold: 50 },
        order: 21,
    },
    {
        id: 'follower_100',
        name: '絶対支配の魔王',
        description: '100人の心を完全に支配した超越者',
        category: 'social',
        icon: '✨',
        rarity: 'epic',
        condition: { type: 'follower_count', threshold: 100 },
        order: 22,
    },
    {
        id: 'follower_500',
        name: '無限の支配の真祖',
        description: '500人の運命を操る禁断の存在',
        category: 'social',
        icon: '👑',
        rarity: 'legendary',
        condition: { type: 'follower_count', threshold: 500 },
        order: 23,
    },
    {
        id: 'following_50',
        name: '闇の観測者',
        description: '50人を監視する深淵の目',
        category: 'social',
        icon: '🤝',
        rarity: 'common',
        condition: { type: 'following_count', threshold: 50 },
        order: 24,
    },

    // ============================================
    // いいね・エンゲージメント系（Common → Epic）
    // ============================================
    {
        id: 'like_100',
        name: '共鳴の始動',
        description: '100の魂が共鳴した瞬間',
        category: 'achievement',
        icon: '💕',
        rarity: 'common',
        condition: { type: 'total_likes', threshold: 100 },
        order: 30,
    },
    {
        id: 'like_500',
        name: '絶対共鳴の支配者',
        description: '500の魂を完全に共鳴させた超越者',
        category: 'achievement',
        icon: '💖',
        rarity: 'rare',
        condition: { type: 'total_likes', threshold: 500 },
        order: 31,
    },
    {
        id: 'like_1000',
        name: '無限共鳴の真祖',
        description: '1000の魂を支配する禁断の存在',
        category: 'achievement',
        icon: '👑',
        rarity: 'epic',
        condition: { type: 'total_likes', threshold: 1000 },
        order: 32,
    },
    {
        id: 'popular_post',
        name: '時空を歪める者',
        description: 'トレンドを創造し現実を歪めた存在',
        category: 'achievement',
        icon: '🔥',
        rarity: 'epic',
        condition: { type: 'popular' },
        order: 33,
    },

    // ============================================
    // レシピ系（Common → Epic）
    // ============================================
    {
        id: 'recipe_1',
        name: '創造の始まり',
        description: '初めての創造を成した者',
        category: 'recipe',
        icon: '🍳',
        rarity: 'common',
        condition: { type: 'recipe_count', threshold: 1 },
        order: 40,
    },
    {
        id: 'recipe_10',
        name: '禁断の創造者',
        description: '10の創造で世界に干渉した存在',
        category: 'recipe',
        icon: '👨‍🍳',
        rarity: 'rare',
        condition: { type: 'recipe_count', threshold: 10 },
        order: 41,
    },
    {
        id: 'recipe_50',
        name: '絶対創造の真祖',
        description: '50の創造で現実を書き換えた超越者',
        category: 'recipe',
        icon: '🍽️',
        rarity: 'epic',
        condition: { type: 'recipe_count', threshold: 50 },
        order: 42,
    },

    // ============================================
    // 継続系（Rare → Epic）→ 不屈の意志
    // ============================================
    {
        id: 'streak_7',
        name: '不屈の炎',
        description: '7日間、絶えず存在を示し続けた者',
        category: 'achievement',
        icon: '🔥',
        rarity: 'rare',
        condition: { type: 'consecutive_days', threshold: 7 },
        order: 50,
    },
    {
        id: 'streak_30',
        name: '絶対不屈の覇者',
        description: '30日間、時空を超越して存在し続けた超越者',
        category: 'achievement',
        icon: '💪',
        rarity: 'epic',
        condition: { type: 'consecutive_days', threshold: 30 },
        order: 51,
    },
    {
        id: 'streak_100',
        name: '無限継続の真祖',
        description: '100日間、現実を歪め続ける禁断の存在',
        category: 'achievement',
        icon: '🏆',
        rarity: 'legendary',
        condition: { type: 'consecutive_days', threshold: 100 },
        order: 52,
    },

    // ============================================
    // ベテラン系（Rare → Legendary）→ 時の支配者
    // ============================================
    {
        id: 'veteran_30',
        name: '時の観測者',
        description: '30日の時を経て覚醒した者',
        category: 'special',
        icon: '🎖️',
        rarity: 'rare',
        condition: { type: 'veteran', threshold: 30 },
        order: 60,
    },
    {
        id: 'veteran_100',
        name: '時の支配者',
        description: '100日の時を支配した超越者',
        category: 'special',
        icon: '🏅',
        rarity: 'epic',
        condition: { type: 'veteran', threshold: 100 },
        order: 61,
    },
    {
        id: 'veteran_365',
        name: '無限時の真祖',
        description: '365日の時を超越し、神格化した存在',
        category: 'special',
        icon: '👑',
        rarity: 'legendary',
        condition: { type: 'veteran', threshold: 365 },
        order: 62,
    },

    // ============================================
    // 特別系（Epic → Legendary）→ 究極の存在
    // ============================================
    {
        id: 'trend_setter',
        name: '時空を歪める者',
        description: 'トレンドを創造し現実を歪めた存在',
        category: 'special',
        icon: '📈',
        rarity: 'epic',
        condition: { type: 'hashtag_trend' },
        order: 70,
    },
    {
        id: 'comment_master',
        name: '絶対言葉の支配者',
        description: '100回の言葉で現実を支配した超越者',
        category: 'achievement',
        icon: '💭',
        rarity: 'rare',
        condition: { type: 'comment_count', threshold: 100 },
        order: 71,
    },
    {
        id: 'repost_master',
        name: '無限の拡散者',
        description: '50回の拡散で世界を支配した存在',
        category: 'achievement',
        icon: '🔄',
        rarity: 'rare',
        condition: { type: 'repost_count', threshold: 50 },
        order: 72,
    },
    {
        id: 'all_rounder',
        name: '全知全能の真祖',
        description: 'すべての領域を支配した究極の存在',
        category: 'special',
        icon: '⭐',
        rarity: 'legendary',
        condition: { type: 'special' },
        order: 73,
    },

    // ============================================
    // 都道府県別称号（47都道府県 × 各分野）
    // ============================================
    // 都道府県×投稿
    ...prefectures.flatMap((pref, prefIndex) => [
        {
            id: `prefecture_${pref.code}_post_10`,
            name: `${pref.name}投稿の使い手`,
            description: `${pref.name}で10回の言葉を世界に放った者`,
            category: 'prefecture' as const,
            icon: '📝',
            rarity: 'common' as const,
            condition: { type: 'prefecture_post' as const, prefectureCode: pref.code, threshold: 10 },
            order: 1000 + prefIndex * 10 + 1,
        },
        {
            id: `prefecture_${pref.code}_post_50`,
            name: `${pref.name}投稿の支配者`,
            description: `${pref.name}で50回の言葉で世界を支配した存在`,
            category: 'prefecture' as const,
            icon: '📚',
            rarity: 'rare' as const,
            condition: { type: 'prefecture_post' as const, prefectureCode: pref.code, threshold: 50 },
            order: 1000 + prefIndex * 10 + 2,
        },
        {
            id: `prefecture_${pref.code}_post_100`,
            name: `${pref.name}投稿の真祖`,
            description: `${pref.name}で100回の言葉で現実を歪めた超越者`,
            category: 'prefecture' as const,
            icon: '📖',
            rarity: 'epic' as const,
            condition: { type: 'prefecture_post' as const, prefectureCode: pref.code, threshold: 100 },
            order: 1000 + prefIndex * 10 + 3,
        },
    ]),

    // 都道府県×レシピ
    ...prefectures.flatMap((pref, prefIndex) => [
        {
            id: `prefecture_${pref.code}_recipe_5`,
            name: `${pref.name}レシピの創造者`,
            description: `${pref.name}で5の創造を成した者`,
            category: 'prefecture' as const,
            icon: '🍳',
            rarity: 'common' as const,
            condition: { type: 'prefecture_recipe' as const, prefectureCode: pref.code, threshold: 5 },
            order: 2000 + prefIndex * 10 + 1,
        },
        {
            id: `prefecture_${pref.code}_recipe_20`,
            name: `${pref.name}レシピの支配者`,
            description: `${pref.name}で20の創造で世界に干渉した存在`,
            category: 'prefecture' as const,
            icon: '👨‍🍳',
            rarity: 'rare' as const,
            condition: { type: 'prefecture_recipe' as const, prefectureCode: pref.code, threshold: 20 },
            order: 2000 + prefIndex * 10 + 2,
        },
        {
            id: `prefecture_${pref.code}_recipe_50`,
            name: `${pref.name}レシピの真祖`,
            description: `${pref.name}で50の創造で現実を書き換えた超越者`,
            category: 'prefecture' as const,
            icon: '🍽️',
            rarity: 'epic' as const,
            condition: { type: 'prefecture_recipe' as const, prefectureCode: pref.code, threshold: 50 },
            order: 2000 + prefIndex * 10 + 3,
        },
    ]),

    // 都道府県×いいね
    ...prefectures.flatMap((pref, prefIndex) => [
        {
            id: `prefecture_${pref.code}_like_50`,
            name: `${pref.name}いいねの共鳴者`,
            description: `${pref.name}で50の魂が共鳴した瞬間`,
            category: 'prefecture' as const,
            icon: '💕',
            rarity: 'common' as const,
            condition: { type: 'prefecture_like' as const, prefectureCode: pref.code, threshold: 50 },
            order: 3000 + prefIndex * 10 + 1,
        },
        {
            id: `prefecture_${pref.code}_like_200`,
            name: `${pref.name}いいねの支配者`,
            description: `${pref.name}で200の魂を完全に共鳴させた超越者`,
            category: 'prefecture' as const,
            icon: '💖',
            rarity: 'rare' as const,
            condition: { type: 'prefecture_like' as const, prefectureCode: pref.code, threshold: 200 },
            order: 3000 + prefIndex * 10 + 2,
        },
        {
            id: `prefecture_${pref.code}_like_500`,
            name: `${pref.name}いいねの真祖`,
            description: `${pref.name}で500の魂を支配する禁断の存在`,
            category: 'prefecture' as const,
            icon: '💝',
            rarity: 'epic' as const,
            condition: { type: 'prefecture_like' as const, prefectureCode: pref.code, threshold: 500 },
            order: 3000 + prefIndex * 10 + 3,
        },
    ]),

    // 都道府県×コメント
    ...prefectures.flatMap((pref, prefIndex) => [
        {
            id: `prefecture_${pref.code}_comment_20`,
            name: `${pref.name}コメントの刻印者`,
            description: `${pref.name}で20回の言葉で現実を支配した者`,
            category: 'prefecture' as const,
            icon: '💬',
            rarity: 'common' as const,
            condition: { type: 'prefecture_comment' as const, prefectureCode: pref.code, threshold: 20 },
            order: 4000 + prefIndex * 10 + 1,
        },
        {
            id: `prefecture_${pref.code}_comment_100`,
            name: `${pref.name}コメントの支配者`,
            description: `${pref.name}で100回の言葉で現実を支配した超越者`,
            category: 'prefecture' as const,
            icon: '💭',
            rarity: 'rare' as const,
            condition: { type: 'prefecture_comment' as const, prefectureCode: pref.code, threshold: 100 },
            order: 4000 + prefIndex * 10 + 2,
        },
        {
            id: `prefecture_${pref.code}_comment_300`,
            name: `${pref.name}コメントの真祖`,
            description: `${pref.name}で300回の言葉で時空を超越した存在`,
            category: 'prefecture' as const,
            icon: '🗣️',
            rarity: 'epic' as const,
            condition: { type: 'prefecture_comment' as const, prefectureCode: pref.code, threshold: 300 },
            order: 4000 + prefIndex * 10 + 3,
        },
    ]),

    // 都道府県×フォロワー
    ...prefectures.flatMap((pref, prefIndex) => [
        {
            id: `prefecture_${pref.code}_follower_20`,
            name: `${pref.name}フォロワーの共鳴者`,
            description: `${pref.name}で20人から崇拝される存在`,
            category: 'prefecture' as const,
            icon: '⭐',
            rarity: 'common' as const,
            condition: { type: 'prefecture_follower' as const, prefectureCode: pref.code, threshold: 20 },
            order: 5000 + prefIndex * 10 + 1,
        },
        {
            id: `prefecture_${pref.code}_follower_100`,
            name: `${pref.name}フォロワーの支配者`,
            description: `${pref.name}で100人の魂を支配した闇の支配者`,
            category: 'prefecture' as const,
            icon: '🌟',
            rarity: 'rare' as const,
            condition: { type: 'prefecture_follower' as const, prefectureCode: pref.code, threshold: 100 },
            order: 5000 + prefIndex * 10 + 2,
        },
        {
            id: `prefecture_${pref.code}_follower_300`,
            name: `${pref.name}フォロワーの真祖`,
            description: `${pref.name}で300人の運命を操る禁断の存在`,
            category: 'prefecture' as const,
            icon: '👑',
            rarity: 'epic' as const,
            condition: { type: 'prefecture_follower' as const, prefectureCode: pref.code, threshold: 300 },
            order: 5000 + prefIndex * 10 + 3,
        },
    ]),
];

/**
 * 称号IDから称号を取得
 */
export const getTitleById = (id: string): Title | undefined => {
    return titles.find(title => title.id === id);
};

/**
 * カテゴリ別に称号を取得
 */
export const getTitlesByCategory = (category: Title['category']): Title[] => {
    return titles.filter(title => title.category === category);
};

/**
 * レアリティ別に称号を取得
 */
export const getTitlesByRarity = (rarity: Title['rarity']): Title[] => {
    return titles.filter(title => title.rarity === rarity);
};

