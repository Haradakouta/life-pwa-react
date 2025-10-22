/**
 * AI健康アドバイザー - 買い物リストの健康チェック
 */

export interface HealthWarning {
  type: 'warning' | 'caution' | 'info';
  category: string;
  reason: string;
  alternatives: string[];
}

interface UnhealthyKeyword {
  keywords: string[];
  category: string;
  reason: string;
  alternatives: string[];
}

// 不健康な食品のキーワード辞書
const unhealthyKeywords: UnhealthyKeyword[] = [
  {
    keywords: ['ポテトチップス', 'チップス', 'スナック菓子', 'かっぱえびせん', 'ドリトス'],
    category: 'スナック菓子',
    reason: '高カロリー・高脂質で、塩分も多く含まれています。',
    alternatives: ['素焼きアーモンド', '無塩ミックスナッツ', '焼き野菜チップス', 'ドライフルーツ'],
  },
  {
    keywords: ['コーラ', 'サイダー', '炭酸飲料', 'ファンタ', 'ペプシ', 'ソーダ'],
    category: '清涼飲料水',
    reason: '糖分が非常に多く、虫歯や肥満の原因になります。',
    alternatives: ['炭酸水', '無糖の紅茶', '麦茶', 'フレーバーウォーター（無糖）'],
  },
  {
    keywords: ['カップラーメン', 'カップ麺', 'インスタントラーメン', 'カップ焼きそば'],
    category: 'インスタント食品',
    reason: '塩分・脂質が多く、栄養バランスが偏りがちです。',
    alternatives: ['生麺', '冷凍うどん', '乾麺（そば・パスタ）', '低塩分インスタント麺'],
  },
  {
    keywords: ['チョコレート', 'チョコ', 'ポッキー', 'きのこの山', 'たけのこの里'],
    category: 'チョコレート菓子',
    reason: '糖分・脂質が多く、カロリーが高めです。',
    alternatives: ['高カカオチョコレート（カカオ70%以上）', 'ドライフルーツ', 'ナッツ'],
  },
  {
    keywords: ['唐揚げ', 'フライドチキン', 'とんかつ', '天ぷら', 'フライドポテト', 'コロッケ'],
    category: '揚げ物',
    reason: '高カロリー・高脂質で、酸化した油が健康に悪影響を及ぼす可能性があります。',
    alternatives: ['グリルチキン', '蒸し鶏', '焼き魚', 'ノンフライ調理品'],
  },
  {
    keywords: ['ハンバーガー', 'ピザ', 'フライドポテト', 'ドーナツ'],
    category: 'ファストフード',
    reason: '高カロリー・高脂質・高塩分で、栄養バランスが偏ります。',
    alternatives: ['サンドイッチ（全粒粉パン）', 'サラダラップ', '手作りピザ（薄皮）'],
  },
  {
    keywords: ['アイスクリーム', 'アイス', 'ジェラート', 'ソフトクリーム'],
    category: 'アイスクリーム',
    reason: '糖分・脂質が多く、食べ過ぎは肥満の原因になります。',
    alternatives: ['フローズンヨーグルト', 'シャーベット', '果物（冷凍）', '低脂肪アイス'],
  },
  {
    keywords: ['ケーキ', 'シュークリーム', 'ドーナツ', 'タルト', 'パウンドケーキ'],
    category: '洋菓子',
    reason: '糖分・脂質が非常に多く、カロリーが高いです。',
    alternatives: ['和菓子（どら焼き、大福）', 'フルーツ', 'ヨーグルト', '低糖質スイーツ'],
  },
  {
    keywords: ['ベーコン', 'ソーセージ', 'ハム', 'サラミ', 'ウインナー'],
    category: '加工肉',
    reason: '塩分・添加物が多く、WHO（世界保健機関）が発がん性を指摘しています。',
    alternatives: ['生肉（鶏むね肉、豚ヒレ肉）', '魚', '豆腐', '納豆'],
  },
  {
    keywords: ['エナジードリンク', 'レッドブル', 'モンスター', 'リアルゴールド'],
    category: 'エナジードリンク',
    reason: 'カフェイン・糖分が多く、心臓への負担や不眠の原因になります。',
    alternatives: ['ブラックコーヒー', '緑茶', '麦茶', 'スポーツドリンク（無糖）'],
  },
  {
    keywords: ['缶詰', '缶コーン', '缶ピーチ', 'フルーツ缶'],
    category: '缶詰（シロップ漬け）',
    reason: 'シロップに糖分が多く含まれています。',
    alternatives: ['生のフルーツ', '冷凍フルーツ', '水煮缶', 'ドライフルーツ'],
  },
  {
    keywords: ['マヨネーズ', 'マーガリン', 'バター', 'ラード'],
    category: '高脂質調味料',
    reason: '脂質・カロリーが非常に高く、使いすぎは肥満の原因になります。',
    alternatives: ['オリーブオイル', 'ごま油（少量）', '低脂肪マヨネーズ', '酢', 'レモン汁'],
  },
];

/**
 * 商品名が不健康な食品かチェック
 */
export function checkHealthWarning(productName: string): HealthWarning | null {
  const lowerProductName = productName.toLowerCase();

  for (const item of unhealthyKeywords) {
    for (const keyword of item.keywords) {
      if (lowerProductName.includes(keyword.toLowerCase())) {
        return {
          type: 'warning',
          category: item.category,
          reason: item.reason,
          alternatives: item.alternatives,
        };
      }
    }
  }

  return null;
}

/**
 * Gemini APIで詳細な健康分析を実行（オプション機能）
 */
export async function getAIHealthAnalysis(
  productName: string,
  apiKey?: string
): Promise<HealthWarning | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `「${productName}」という商品の健康面での懸念点を分析し、より健康的な代替案を3つ提案してください。

以下のJSON形式で回答してください：
{
  "category": "商品カテゴリ",
  "reason": "健康面での懸念点（簡潔に）",
  "alternatives": ["代替案1", "代替案2", "代替案3"]
}

懸念点がない場合は null を返してください。`,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error('AI分析に失敗しました');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return null;
    }

    // JSONを抽出
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const analysis = JSON.parse(jsonMatch[0]);

    if (!analysis || analysis === null) {
      return null;
    }

    return {
      type: 'warning',
      category: analysis.category || '不明',
      reason: analysis.reason || '',
      alternatives: analysis.alternatives || [],
    };
  } catch (error) {
    console.error('AI健康分析エラー:', error);
    return null;
  }
}
