/**
 * 装飾要素データ
 */
import type { Cosmetic } from '../types/cosmetic';

export const cosmetics: Cosmetic[] = [
  // ============================================
  // フレーム
  // ============================================
  {
    id: 'frame_default',
    name: 'デフォルトフレーム',
    description: '基本的なフレーム',
    type: 'frame',
    icon: '🖼️',
    price: 0,
    rarity: 'common',
    data: {
      frameUrl: 'frames/default.png',
      frameStyle: {
        border: '2px solid var(--border)',
        borderRadius: '8px',
      },
    },
  },
  {
    id: 'frame_gold',
    name: '黄金のフレーム',
    description: '輝く黄金のフレーム',
    type: 'frame',
    icon: '✨',
    price: 500,
    rarity: 'rare',
    data: {
      frameUrl: 'frames/golden.png',
      frameStyle: {
        border: '3px solid #ffd700',
        borderRadius: '12px',
        boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  {
    id: 'frame_platinum',
    name: 'プラチナフレーム',
    description: '高貴なプラチナのフレーム',
    type: 'frame',
    icon: '💎',
    price: 1000,
    rarity: 'epic',
    data: {
      frameUrl: 'frames/platinum.png',
      frameStyle: {
        border: '4px solid #e5e4e2',
        borderRadius: '16px',
        boxShadow: '0 0 15px rgba(229, 228, 226, 0.7)',
      },
    },
  },
  {
    id: 'frame_legendary',
    name: '伝説のフレーム',
    description: '伝説級の輝きを持つフレーム',
    type: 'frame',
    icon: '👑',
    price: 2000,
    rarity: 'legendary',
    data: {
      frameUrl: 'frames/legendary.png',
      frameStyle: {
        border: '5px solid #ff6b6b',
        borderRadius: '20px',
        boxShadow: '0 0 20px rgba(255, 107, 107, 0.8)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },

  // ============================================
  // 名前の色
  // ============================================
  {
    id: 'namecolor_default',
    name: 'デフォルト色',
    description: '標準の名前色',
    type: 'nameColor',
    icon: '🎨',
    price: 0,
    rarity: 'common',
    data: {
      color: 'var(--text)',
    },
  },
  {
    id: 'namecolor_red',
    name: '深紅の名前',
    description: '深紅に染まる名前',
    type: 'nameColor',
    icon: '🔴',
    price: 200,
    rarity: 'common',
    data: {
      color: '#dc2626',
    },
  },
  {
    id: 'namecolor_blue',
    name: '蒼穹の名前',
    description: '蒼い空のような名前',
    type: 'nameColor',
    icon: '🔵',
    price: 200,
    rarity: 'common',
    data: {
      color: '#2563eb',
    },
  },
  {
    id: 'namecolor_gold',
    name: '黄金の名前',
    description: '黄金に輝く名前',
    type: 'nameColor',
    icon: '⭐',
    price: 500,
    rarity: 'rare',
    data: {
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    },
  },
  {
    id: 'namecolor_rainbow',
    name: '虹色の名前',
    description: '虹のように美しい名前',
    type: 'nameColor',
    icon: '🌈',
    price: 1000,
    rarity: 'epic',
    data: {
      gradient: 'linear-gradient(90deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 100%)',
    },
  },
  {
    id: 'namecolor_legendary',
    name: '伝説の名前色',
    description: '伝説級の輝きを持つ名前',
    type: 'nameColor',
    icon: '💫',
    price: 2000,
    rarity: 'legendary',
    data: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    },
  },

  // ============================================
  // スキン
  // ============================================
  {
    id: 'skin_default',
    name: 'デフォルトスキン',
    description: '標準のスキン',
    type: 'skin',
    icon: '🎨',
    price: 0,
    rarity: 'common',
    data: {
      skinConfig: {
        theme: 'light',
      },
    },
  },
  {
    id: 'skin_dark',
    name: '闇のスキン',
    description: '深い闇に包まれたスキン',
    type: 'skin',
    icon: '🌑',
    price: 300,
    rarity: 'common',
    data: {
      skinConfig: {
        primaryColor: '#1a1a1a',
        secondaryColor: '#2d2d2d',
        theme: 'dark',
      },
    },
  },
  {
    id: 'skin_sakura',
    name: '桜のスキン',
    description: '桜色に染まるスキン',
    type: 'skin',
    icon: '🌸',
    price: 500,
    rarity: 'rare',
    data: {
      skinConfig: {
        primaryColor: '#ffb3d9',
        secondaryColor: '#ff99cc',
        theme: 'custom',
      },
    },
  },
  {
    id: 'skin_ocean',
    name: '海のスキン',
    description: '海のように広がるスキン',
    type: 'skin',
    icon: '🌊',
    price: 500,
    rarity: 'rare',
    data: {
      skinConfig: {
        primaryColor: '#4fc3f7',
        secondaryColor: '#29b6f6',
        theme: 'custom',
      },
    },
  },
  {
    id: 'skin_sunset',
    name: '夕焼けのスキン',
    description: '夕焼けに染まるスキン',
    type: 'skin',
    icon: '🌅',
    price: 800,
    rarity: 'epic',
    data: {
      skinConfig: {
        primaryColor: '#ff6b6b',
        secondaryColor: '#ffa726',
        theme: 'custom',
      },
    },
  },
  {
    id: 'skin_legendary',
    name: '伝説のスキン',
    description: '伝説級の輝きを持つスキン',
    type: 'skin',
    icon: '✨',
    price: 2000,
    rarity: 'legendary',
    data: {
      skinConfig: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        theme: 'custom',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      },
    },
  },

  // ============================================
  // 追加フレーム（厨二っぽく）
  // ============================================
  {
    id: 'frame_crimson',
    name: '深紅の境界',
    description: '深紅に染まる禁断のフレーム',
    type: 'frame',
    icon: '🩸',
    price: 300,
    rarity: 'common',
    data: {
      frameUrl: 'frames/crimson.png',
      frameStyle: {
        border: '3px solid #dc2626',
        borderRadius: '12px',
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
      },
    },
  },
  {
    id: 'frame_azure',
    name: '蒼穹の輪廻',
    description: '蒼い空に包まれたフレーム',
    type: 'frame',
    icon: '💎',
    price: 300,
    rarity: 'common',
    data: {
      frameUrl: 'frames/azure.png',
      frameStyle: {
        border: '3px solid #3b82f6',
        borderRadius: '12px',
        boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
      },
    },
  },
  {
    id: 'frame_void',
    name: '虚無の刻印',
    description: '闇に飲み込まれたフレーム',
    type: 'frame',
    icon: '⚫',
    price: 700,
    rarity: 'rare',
    data: {
      frameUrl: 'frames/void.png',
      frameStyle: {
        border: '4px solid #1a1a1a',
        borderRadius: '16px',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      },
    },
  },
  {
    id: 'frame_phoenix',
    name: '不死鳥の炎',
    description: '炎に包まれた不死のフレーム',
    type: 'frame',
    icon: '🔥',
    price: 800,
    rarity: 'epic',
    data: {
      frameStyle: {
        border: '4px solid #f59e0b',
        borderRadius: '16px',
        boxShadow: '0 0 20px rgba(245, 158, 11, 0.8), 0 0 40px rgba(245, 158, 11, 0.4)',
        background: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
      },
    },
  },
  {
    id: 'frame_dragon',
    name: '龍の逆鱗',
    description: '龍の力が宿るフレーム',
    type: 'frame',
    icon: '🐉',
    price: 1500,
    rarity: 'epic',
    data: {
      frameStyle: {
        border: '5px solid #10b981',
        borderRadius: '20px',
        boxShadow: '0 0 25px rgba(16, 185, 129, 0.8), 0 0 50px rgba(16, 185, 129, 0.4)',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      },
    },
  },

  // ============================================
  // 追加名前色（厨二っぽく）
  // ============================================
  {
    id: 'namecolor_crimson',
    name: '深紅の魂',
    description: '燃え盛る深紅の名前色',
    type: 'nameColor',
    icon: '🩸',
    price: 150,
    rarity: 'common',
    data: {
      color: '#dc2626',
    },
  },
  {
    id: 'namecolor_azure',
    name: '蒼穹の誓い',
    description: '澄み渡る空のような名前色',
    type: 'nameColor',
    icon: '💧',
    price: 150,
    rarity: 'common',
    data: {
      color: '#3b82f6',
    },
  },
  {
    id: 'namecolor_emerald',
    name: '翠玉の加護',
    description: '緑に輝く名前色',
    type: 'nameColor',
    icon: '💚',
    price: 150,
    rarity: 'common',
    data: {
      color: '#10b981',
    },
  },
  {
    id: 'namecolor_purple',
    name: '紫電の刻印',
    description: '紫に光る名前色',
    type: 'nameColor',
    icon: '💜',
    price: 300,
    rarity: 'rare',
    data: {
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    },
  },
  {
    id: 'namecolor_fire',
    name: '業火の紋章',
    description: '炎のように燃える名前色',
    type: 'nameColor',
    icon: '🔥',
    price: 400,
    rarity: 'rare',
    data: {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
    },
  },
  {
    id: 'namecolor_ice',
    name: '氷河の結晶',
    description: '氷のように冷たい名前色',
    type: 'nameColor',
    icon: '❄️',
    price: 400,
    rarity: 'rare',
    data: {
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    },
  },
  {
    id: 'namecolor_void',
    name: '虚無の闇',
    description: '闇に包まれた名前色',
    type: 'nameColor',
    icon: '🌑',
    price: 600,
    rarity: 'epic',
    data: {
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #4b5563 100%)',
    },
  },
  {
    id: 'namecolor_chaos',
    name: '混沌の渦',
    description: '混沌を表す名前色',
    type: 'nameColor',
    icon: '🌀',
    price: 800,
    rarity: 'epic',
    data: {
      gradient: 'linear-gradient(90deg, #dc2626 0%, #f59e0b 14%, #10b981 28%, #3b82f6 42%, #8b5cf6 57%, #ec4899 71%, #dc2626 100%)',
    },
  },

  // ============================================
  // 追加スキン（厨二っぽく）
  // ============================================
  {
    id: 'skin_crimson',
    name: '深紅の領域',
    description: '深紅に染まる世界',
    type: 'skin',
    icon: '🩸',
    price: 400,
    rarity: 'common',
    data: {
      skinConfig: {
        primaryColor: '#dc2626',
        secondaryColor: '#991b1b',
        theme: 'custom',
        cssClass: 'skin-crimson',
      },
    },
  },
  {
    id: 'skin_azure',
    name: '蒼穹の世界',
    description: '蒼い空に包まれた世界',
    type: 'skin',
    icon: '💎',
    price: 400,
    rarity: 'common',
    data: {
      skinConfig: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        theme: 'custom',
        cssClass: 'skin-azure',
      },
    },
  },
  {
    id: 'skin_emerald',
    name: '翠玉の森',
    description: '緑に包まれた森の世界',
    type: 'skin',
    icon: '🌲',
    price: 400,
    rarity: 'common',
    data: {
      skinConfig: {
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        theme: 'custom',
        cssClass: 'skin-emerald',
      },
    },
  },
  {
    id: 'skin_void',
    name: '虚無の闇',
    description: '闇に飲み込まれた世界',
    type: 'skin',
    icon: '🌑',
    price: 600,
    rarity: 'rare',
    data: {
      skinConfig: {
        primaryColor: '#1a1a1a',
        secondaryColor: '#000000',
        theme: 'custom',
        cssClass: 'skin-void',
      },
    },
  },
  {
    id: 'skin_fire',
    name: '業火の獄',
    description: '炎に包まれた世界',
    type: 'skin',
    icon: '🔥',
    price: 700,
    rarity: 'rare',
    data: {
      skinConfig: {
        primaryColor: '#f59e0b',
        secondaryColor: '#dc2626',
        theme: 'custom',
        cssClass: 'skin-fire',
      },
    },
  },
  {
    id: 'skin_ice',
    name: '氷河の世界',
    description: '氷に覆われた世界',
    type: 'skin',
    icon: '❄️',
    price: 700,
    rarity: 'rare',
    data: {
      skinConfig: {
        primaryColor: '#06b6d4',
        secondaryColor: '#0891b2',
        theme: 'custom',
        cssClass: 'skin-ice',
      },
    },
  },
  {
    id: 'skin_chaos',
    name: '混沌の領域',
    description: '混沌に支配された世界',
    type: 'skin',
    icon: '🌀',
    price: 1500,
    rarity: 'epic',
    data: {
      skinConfig: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#7c3aed',
        theme: 'custom',
        cssClass: 'skin-chaos',
      },
    },
  },
  {
    id: 'skin_phoenix',
    name: '不死鳥の炎',
    description: '不死鳥が舞う世界',
    type: 'skin',
    icon: '🔥',
    price: 1800,
    rarity: 'epic',
    data: {
      skinConfig: {
        primaryColor: '#f59e0b',
        secondaryColor: '#dc2626',
        theme: 'custom',
        cssClass: 'skin-phoenix',
        backgroundImage: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 50%, #991b1b 100%)',
      },
    },
  },
  {
    id: 'skin_dragon',
    name: '龍の聖域',
    description: '龍の力が満ちる世界',
    type: 'skin',
    icon: '🐉',
    price: 2500,
    rarity: 'legendary',
    data: {
      skinConfig: {
        primaryColor: '#10b981',
        secondaryColor: '#059669',
        theme: 'custom',
        cssClass: 'skin-dragon',
        backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
      },
    },
  },
  {
    id: 'skin_abyss',
    name: '深淵の闇',
    description: '深淵に沈んだ世界',
    type: 'skin',
    icon: '🌌',
    price: 3000,
    rarity: 'legendary',
    data: {
      skinConfig: {
        primaryColor: '#1a1a1a',
        secondaryColor: '#000000',
        theme: 'custom',
        cssClass: 'skin-abyss',
        backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #000000 100%)',
      },
    },
  },
];


