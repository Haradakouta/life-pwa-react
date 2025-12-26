"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanReceiptWithVision = void 0;
const functions = require("firebase-functions");
// CLOVA OCR API Configuration (Firebase Secrets / env)
const CLOVA_API_URL = process.env.CLOVA_API_URL;
const CLOVA_SECRET_KEY = process.env.CLOVA_SECRET_KEY;
/**
 * 全角数字・記号・スペースを半角に変換
 */
const normalizeText = (text) => {
    return text
        .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
        .replace(/　/g, ' ');
};
/**
 * CLOVA OCR APIを呼び出す
 */
const callClovaOCR = async (base64Image) => {
    if (!CLOVA_API_URL || !CLOVA_SECRET_KEY) {
        throw new Error('CLOVA OCR is not configured (missing CLOVA_API_URL / CLOVA_SECRET_KEY)');
    }
    const body = {
        version: 'V2',
        requestId: `req-${Date.now()}`,
        timestamp: Date.now(),
        lang: 'ja',
        images: [
            {
                format: 'jpg', // Base64画像はフォーマット指定が必要だが、中身が合っていれば概ね動作する
                name: 'receipt',
                data: base64Image
            }
        ]
    };
    const response = await fetch(CLOVA_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-OCR-SECRET': CLOVA_SECRET_KEY
        },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('CLOVA OCR API Error:', response.status, errorText);
        throw new Error(`CLOVA OCR API failed with status ${response.status}`);
    }
    const data = await response.json();
    if (!data.images || !data.images[0] || !data.images[0].fields) {
        console.warn('CLOVA OCR returned no fields:', JSON.stringify(data));
        return [];
    }
    return data.images[0].fields;
};
/**
 * CLOVAのレスポンスから行を再構築する
 * Y座標の重なりを見て同じ行とみなす
 */
const reconstructLinesFromClova = (fields) => {
    if (fields.length === 0)
        return [];
    // Y座標でソート
    const sortedFields = [...fields].sort((a, b) => {
        const minY_A = Math.min(...a.boundingPoly.vertices.map(v => v.y));
        const minY_B = Math.min(...b.boundingPoly.vertices.map(v => v.y));
        return minY_A - minY_B;
    });
    const lines = [];
    for (const field of sortedFields) {
        const minY = Math.min(...field.boundingPoly.vertices.map(v => v.y));
        const maxY = Math.max(...field.boundingPoly.vertices.map(v => v.y));
        const centerY = (minY + maxY) / 2;
        const height = maxY - minY;
        // 既存の行の中で、Y座標が重なるものを探す
        let added = false;
        for (const line of lines) {
            // 行の平均Y座標と高さを計算
            const lineMinY = Math.min(...line.map(f => Math.min(...f.boundingPoly.vertices.map(v => v.y))));
            const lineMaxY = Math.max(...line.map(f => Math.max(...f.boundingPoly.vertices.map(v => v.y))));
            const lineCenterY = (lineMinY + lineMaxY) / 2;
            const lineHeight = lineMaxY - lineMinY;
            // 中心が相手の範囲内にある、または重なりが大きい場合
            // 許容誤差: 行の高さの半分程度
            const threshold = Math.max(height, lineHeight) * 0.5;
            if (Math.abs(centerY - lineCenterY) < threshold) {
                line.push(field);
                added = true;
                break;
            }
        }
        if (!added) {
            lines.push([field]);
        }
    }
    // 各行内でX座標順にソートして結合
    return lines.map(line => {
        line.sort((a, b) => {
            const minX_A = Math.min(...a.boundingPoly.vertices.map(v => v.x));
            const minX_B = Math.min(...b.boundingPoly.vertices.map(v => v.x));
            return minX_A - minX_B;
        });
        return line.map(f => f.inferText).join(' '); // スペース区切りで結合
    });
};
/**
 * レシートテキストを解析して商品情報を抽出
 */
const parseReceiptText = (lines) => {
    const items = [];
    let storeName;
    let branchName;
    let total;
    let date;
    // 除外キーワード
    const excludeKeywords = [
        '小計', '合計', 'お釣り', '現計', '消費税', '内税', '外税', '対象', '預り', '釣銭', '支払', '買上',
        'TOTAL', 'SUBTOTAL', 'CHANGE', 'TAX', 'DUE', 'CASH', 'CREDIT',
        '電話', 'TEL', 'FAX', 'No.', '店', '担当', 'レジ', '取引', '番号', '領収書', 'レシート'
    ];
    // 日付パターン
    const datePattern = /(\d{4})[\/\-.年\s](\d{1,2})[\/\-.月\s](\d{1,2})/;
    // 合計金額パターン
    const totalPattern = /(?:合計|小計|計|total|お買上|お支払い)[\s\S]*?([\d,]+)/i;
    // 行ごとの解析
    for (let i = 0; i < lines.length; i++) {
        const line = normalizeText(lines[i]).trim();
        if (line.length === 0)
            continue;
        // 1. 店名と支店名の抽出（最初の5行以内で、日付や電話番号っぽくないもの）
        if (!storeName && i < 5) {
            // 電話番号や日付、除外キーワードを含まない行
            if (!line.match(/[\d-]{10,}/) &&
                !line.match(datePattern) &&
                !excludeKeywords.some(k => line.includes(k) && k !== '店')) { // '店'は支店名に含まれる可能性があるため除外しない
                // パターンA: "LAWSON 大分店" のようにスペース区切りで支店名がある場合
                const spaceSplit = line.split(/\s+/);
                if (spaceSplit.length >= 2 && spaceSplit[1].endsWith('店')) {
                    storeName = spaceSplit[0];
                    branchName = spaceSplit[1];
                }
                // パターンB: 単独の行で、次の行が支店名かもしれない場合
                else {
                    storeName = line;
                    // 次の行をチェック
                    if (i + 1 < lines.length) {
                        const nextLine = normalizeText(lines[i + 1]).trim();
                        if (nextLine.endsWith('店') && !nextLine.match(/[\d-]{10,}/)) {
                            branchName = nextLine;
                            // 次の行は支店名として処理したのでスキップしたいが、ループ構造上難しいので
                            // branchNameがセットされたら次のループでstoreNameの上書きを防ぐ
                        }
                    }
                }
            }
        }
        else if (storeName && !branchName && i < 5) {
            // storeNameは決まったがbranchNameがまだで、今の行が"〇〇店"の場合
            if (line.endsWith('店') && !line.match(/[\d-]{10,}/) && !excludeKeywords.some(k => line.includes(k) && k !== '店')) {
                branchName = line;
            }
        }
        // 2. 日付の抽出
        if (!date) {
            const dateMatch = line.match(datePattern);
            if (dateMatch) {
                date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
            }
        }
        // 3. 合計金額の抽出
        if (!total) {
            const totalMatch = line.match(totalPattern);
            if (totalMatch) {
                total = parseInt(totalMatch[1].replace(/,/g, ''), 10);
            }
        }
        // 4. 商品と価格の抽出
        // 優先順位:
        // 1. "税込" や "内税" の後ろにある数値
        // 2. 行末の数値 (括弧などは除去して判定)
        let price;
        let name;
        // パターンA: 税込表記がある場合 (例: "商品A 100円 (税込 110円)")
        const taxIncludedMatch = line.match(/(?:税込|内税|込)[\s:：]*([\d,]+)/);
        if (taxIncludedMatch) {
            price = parseInt(taxIncludedMatch[1].replace(/,/g, ''), 10);
            // 価格部分より前を商品名とする
            const matchIndex = line.indexOf(taxIncludedMatch[0]);
            name = line.substring(0, matchIndex).trim();
        }
        // パターンB: 行末の数値を価格とする (通常パターン)
        if (!price) {
            // 末尾の記号(括弧や円など)を除去した状態で判定
            const cleanLine = line.replace(/[)）\]］}｝>＞\\¥￥\s]+$/, '');
            const priceMatch = cleanLine.match(/([\d,]+)(?:円)?$/);
            if (priceMatch) {
                price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
                // 価格部分を除いた残りを商品名とする
                name = cleanLine.substring(0, cleanLine.length - priceMatch[0].length).trim();
            }
        }
        if (price !== undefined && name) {
            // 価格としてあり得る範囲 (1円〜100万円)
            if (price > 0 && price <= 1000000) {
                // 末尾の記号などを除去
                name = name.replace(/[\\¥￥\s]+$/, '');
                // 除外キーワードが含まれていないか
                const hasExcludeKeyword = excludeKeywords.some(keyword => name.includes(keyword));
                // 名前が短すぎる、または数字・記号のみの場合は除外
                const isInvalidName = name.length < 1 || name.match(/^[\d\s\W]+$/);
                if (!hasExcludeKeyword && !isInvalidName) {
                    // 既に同じ商品がある場合は数量を増やす
                    const existing = items.find((item) => item.name === name && item.price === price);
                    if (existing && existing.quantity) {
                        existing.quantity += 1;
                    }
                    else {
                        items.push({ name, price, quantity: 1 });
                    }
                }
            }
        }
    }
    // 合計金額が見つからなかった場合、商品の合計を計算してみる
    if (!total && items.length > 0) {
        total = items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    }
    return {
        items,
        total,
        storeName,
        branchName,
        date,
        rawText: lines.join('\n'),
    };
};
exports.scanReceiptWithVision = functions.https.onCall({ region: 'us-central1', memory: '512MiB', secrets: ['CLOVA_API_URL', 'CLOVA_SECRET_KEY'] }, async (request) => {
    // 認証チェック
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', '認証が必要です。');
    }
    const { base64Image } = request.data;
    if (!base64Image) {
        throw new functions.https.HttpsError('invalid-argument', '画像データが必要です。');
    }
    try {
        // CLOVA OCR APIを呼び出し
        const fields = await callClovaOCR(base64Image);
        // 行を再構築
        const lines = reconstructLinesFromClova(fields);
        // 解析実行
        const parsedResult = parseReceiptText(lines);
        console.log('Receipt scanned successfully (CLOVA)', {
            itemCount: parsedResult.items.length,
            total: parsedResult.total,
        });
        return parsedResult;
    }
    catch (error) {
        console.error('OCR Error:', error);
        throw new functions.https.HttpsError('internal', '画像の解析に失敗しました。');
    }
});
//# sourceMappingURL=vision.js.map