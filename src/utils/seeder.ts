import { db } from '../config/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { generateUUID } from './uuid';

// ハーちゃんのペルソナデータ
// 29歳社会人、投資精通、ヘビーユーザー
// 期間: 2025-10-01 ~ 2026-01-26

const START_DATE = new Date('2025-10-01');
const END_DATE = new Date('2026-01-26');

const FIXED_COSTS_DATA = [
    { title: '家賃', amount: 110000, category: 'housing', cycle: 'monthly' },
    { title: '電気代', amount: 8000, category: 'utilities', cycle: 'monthly' },
    { title: 'ガス代', amount: 4500, category: 'utilities', cycle: 'monthly' },
    { title: '水道代', amount: 3000, category: 'utilities', cycle: 'monthly' },
    { title: 'スマホ通信費', amount: 7000, category: 'communication', cycle: 'monthly' },
    { title: '光回線', amount: 5000, category: 'communication', cycle: 'monthly' },
    { title: 'Netflix', amount: 1980, category: 'subscription', cycle: 'monthly' },
    { title: 'ジム会費', amount: 8800, category: 'subscription', cycle: 'monthly' },
    { title: 'つみたてNISA', amount: 50000, category: 'other', cycle: 'monthly' },
];

const ASSETS_DATA: any[] = [
    { title: '三菱UFJ銀行', type: 'bank', amount: 1250000 },
    { title: '三井住友銀行', type: 'bank', amount: 840000 },
    { title: 'SBI証券', type: 'securities', quantity: 1, currentPrice: 4520000, code: 'TOTAL' },
    { title: 'Bitcoin', type: 'crypto', quantity: 0.15, currentPrice: 9500000, code: 'BTC' },
    { title: '財布', type: 'cash', amount: 42000 },
    { title: '楽天ポイント', type: 'points', amount: 15300 },
];

const MEALS = {
    breakfast: [
        { title: 'トーストとコーヒー', calories: 350, price: 100, manufacturer: '自家製' },
        { title: 'ヨーグルトとフルーツ', calories: 250, price: 200, manufacturer: '明治' },
        { title: 'プロテイン', calories: 120, price: 100, manufacturer: 'MyProtein' },
        { title: 'おにぎり', calories: 200, price: 150, manufacturer: 'セブンイレブン' },
    ],
    lunch: [
        { title: '唐揚げ定食', calories: 850, price: 950, manufacturer: '大戸屋' },
        { title: 'コンビニ弁当', calories: 700, price: 650, manufacturer: 'セブンイレブン' },
        { title: 'サラダチキンとパン', calories: 400, price: 500, manufacturer: 'ファミリーマート' },
        { title: 'パスタランチ', calories: 800, price: 1200, manufacturer: 'サイゼリヤ' },
        { title: '社食（A定食）', calories: 750, price: 600, manufacturer: '社食' },
    ],
    dinner: [
        { title: '自炊（野菜炒め定食）', calories: 600, price: 400, manufacturer: '自家製' },
        { title: '自炊（カレー）', calories: 750, price: 300, manufacturer: '自家製' },
        { title: '刺身とビール', calories: 500, price: 2000, manufacturer: 'スーパー（ライフ）' },
        { title: '焼き肉（外食）', calories: 1200, price: 5000, manufacturer: '牛角' },
        { title: '居酒屋', calories: 1000, price: 4000, manufacturer: '鳥貴族' },
    ],
    snack: [
        { title: 'チョコレート', calories: 200, price: 150, manufacturer: '明治' },
        { title: 'コーヒー', calories: 50, price: 350, manufacturer: 'スターバックス' },
        { title: 'ナッツ', calories: 150, price: 200, manufacturer: 'カルディ' },
        { title: 'ポテトチップス', calories: 350, price: 160, manufacturer: 'カルビー' },
        { title: 'アイスクリーム', calories: 250, price: 180, manufacturer: 'ハーゲンダッツ' },
    ]
};

const SHOPPING_ITEMS = [
    { name: '牛乳', category: 'dairy' },
    { name: '卵', category: 'protein' },
    { name: '納豆', category: 'protein' },
    { name: 'キャベツ', category: 'vegetable' },
    { name: '玉ねぎ', category: 'vegetable' },
    { name: '人参', category: 'vegetable' },
    { name: '豚肉', category: 'protein' },
    { name: '鶏胸肉', category: 'protein' },
    { name: '米', category: 'staple' },
    { name: '醤油', category: 'seasoning' },
    { name: '味噌', category: 'seasoning' },
    { name: 'バナナ', category: 'fruit' },
    { name: 'りんご', category: 'fruit' },
    { name: '食パン', category: 'staple' },
];

const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// コレクション全削除
const clearCollection = async (userId: string, colName: string, onProgress?: (msg: string) => void) => {
    if (onProgress) onProgress(`${colName}のデータを削除中...`);
    const ref = collection(db, `users/${userId}/${colName}`);
    const snap = await getDocs(ref);
    if (snap.empty) return;

    const batchSize = 500;
    const chunks = [];
    let chunk: any[] = [];

    snap.docs.forEach((doc) => {
        chunk.push(doc);
        if (chunk.length >= batchSize) {
            chunks.push(chunk);
            chunk = [];
        }
    });
    if (chunk.length > 0) chunks.push(chunk);

    for (const c of chunks) {
        const batch = writeBatch(db);
        c.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    }
};

export const seedHaachanData = async (userId: string, onProgress?: (msg: string) => void) => {
    console.log('Seeding data for Haachan...', userId);
    if (onProgress) onProgress('初期化を開始します...');

    // 1. データクリア
    await clearCollection(userId, 'intakes', onProgress);
    await clearCollection(userId, 'expenses', onProgress);
    await clearCollection(userId, 'fixedCosts', onProgress);
    await clearCollection(userId, 'assets', onProgress);
    await clearCollection(userId, 'shopping', onProgress); // 買い物リストもクリア

    const batchSize = 500;
    let batch = writeBatch(db);
    let opCount = 0;

    const commitBatch = async () => {
        if (opCount > 0) {
            await batch.commit();
            batch = writeBatch(db);
            opCount = 0;
        }
    };

    if (onProgress) onProgress('日次データを生成中...');

    // 2. 日次データ生成
    let currentDate = new Date(START_DATE);
    while (currentDate <= END_DATE) {
        const datesTr = currentDate.toISOString();
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

        // --- Intake & Food Expense ---
        // Breakfast
        const breakfast = getRandomItem(MEALS.breakfast);
        const bId = generateUUID();
        batch.set(doc(db, `users/${userId}/intakes`, bId), {
            title: breakfast.title,
            calories: breakfast.calories + getRandomInt(-20, 20),
            protein: getRandomInt(5, 20),
            fat: getRandomInt(5, 15),
            carbs: getRandomInt(20, 50),
            date: datesTr,
            type: 'breakfast',
            price: breakfast.price,
            manufacturer: breakfast.manufacturer, // メーカー追加
            createdAt: datesTr
        });
        opCount++;
        if (breakfast.price > 0) {
            const eId = generateUUID();
            batch.set(doc(db, `users/${userId}/expenses`, eId), {
                title: breakfast.title,
                amount: breakfast.price,
                category: 'food',
                type: 'expense',
                date: datesTr,
                createdAt: datesTr
            });
            opCount++;
        }

        // Lunch
        const lunch = getRandomItem(MEALS.lunch);
        const lId = generateUUID();
        batch.set(doc(db, `users/${userId}/intakes`, lId), {
            title: lunch.title,
            calories: lunch.calories + getRandomInt(-50, 50),
            protein: getRandomInt(20, 40),
            fat: getRandomInt(15, 30),
            carbs: getRandomInt(60, 100),
            date: datesTr,
            type: 'lunch',
            price: lunch.price,
            manufacturer: lunch.manufacturer, // メーカー追加
            createdAt: datesTr
        });
        opCount++;
        if (lunch.price > 0) {
            const eId = generateUUID();
            batch.set(doc(db, `users/${userId}/expenses`, eId), {
                title: lunch.title,
                amount: lunch.price,
                category: 'food',
                type: 'expense',
                date: datesTr,
                createdAt: datesTr
            });
            opCount++;
        }

        // Dinner
        const dinner = isWeekend ? getRandomItem([MEALS.dinner[3], MEALS.dinner[4]]) : getRandomItem(MEALS.dinner.slice(0, 3));
        const dId = generateUUID();
        batch.set(doc(db, `users/${userId}/intakes`, dId), {
            title: dinner.title,
            calories: dinner.calories + getRandomInt(-50, 100),
            protein: getRandomInt(20, 50),
            fat: getRandomInt(10, 40),
            carbs: getRandomInt(40, 80),
            date: datesTr,
            type: 'dinner',
            price: dinner.price,
            manufacturer: dinner.manufacturer, // メーカー追加
            createdAt: datesTr
        });
        opCount++;
        if (dinner.price > 0) {
            const eId = generateUUID();
            batch.set(doc(db, `users/${userId}/expenses`, eId), {
                title: dinner.title,
                amount: dinner.price,
                category: 'food',
                type: 'expense',
                date: datesTr,
                createdAt: datesTr
            });
            opCount++;
        }

        // Snack (Random)
        if (Math.random() > 0.5) {
            const snack = getRandomItem(MEALS.snack);
            const sId = generateUUID();
            batch.set(doc(db, `users/${userId}/intakes`, sId), {
                title: snack.title,
                calories: snack.calories,
                date: datesTr,
                type: 'snack',
                price: snack.price,
                manufacturer: snack.manufacturer, // メーカー追加
                createdAt: datesTr
            });
            opCount++;
            if (snack.price > 0 && Math.random() > 0.5) {
                const eId = generateUUID();
                batch.set(doc(db, `users/${userId}/expenses`, eId), {
                    title: snack.title,
                    amount: snack.price,
                    category: 'food',
                    type: 'expense',
                    date: datesTr,
                    createdAt: datesTr
                });
                opCount++;
            }
        }

        // --- Shopping List (Completed) ---
        // 週2回程度の買い物シミュレーション
        if (Math.random() > 0.7) {
            const numItems = getRandomInt(3, 8);
            for (let i = 0; i < numItems; i++) {
                const item = getRandomItem(SHOPPING_ITEMS);
                const sId = generateUUID();
                batch.set(doc(db, `users/${userId}/shopping`, sId), {
                    name: item.name,
                    category: item.category,
                    quantity: 1,
                    checked: true, // 購入済みとして記録
                    createdAt: datesTr
                });
                opCount++;
            }
        }

        // --- Other Expenses ---
        // Transport
        if (Math.random() > 0.7) {
            const eId = generateUUID();
            batch.set(doc(db, `users/${userId}/expenses`, eId), {
                title: '交通費',
                amount: getRandomInt(200, 1000),
                category: 'transport',
                type: 'expense',
                date: datesTr,
                createdAt: datesTr
            });
            opCount++;
        }
        // Shopping (Non-food) / Entertainment
        if ((isWeekend && Math.random() > 0.3) || (!isWeekend && Math.random() > 0.9)) {
            const cat = isWeekend ? 'entertainment' : 'daily_goods';
            const amt = isWeekend ? getRandomInt(3000, 15000) : getRandomInt(1000, 3000);
            const title = isWeekend ? '週末アクティビティ' : '日用品購入';
            const eId = generateUUID();
            batch.set(doc(db, `users/${userId}/expenses`, eId), {
                title,
                amount: amt,
                category: cat,
                type: 'expense',
                date: datesTr,
                createdAt: datesTr
            });
            opCount++;
        }

        // Fixed Costs (1st of month)
        if (currentDate.getDate() === 1) {
            for (const fc of FIXED_COSTS_DATA) {
                const eId = generateUUID();
                batch.set(doc(db, `users/${userId}/expenses`, eId), {
                    title: fc.title,
                    amount: fc.amount,
                    category: fc.category,
                    type: 'expense',
                    date: datesTr,
                    createdAt: datesTr
                });
                opCount++;
            }
        }

        if (opCount >= batchSize) await commitBatch();

        // Next day
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (onProgress) onProgress('固定費・資産データを登録中...');

    // 3. 固定費設定の登録
    for (const fc of FIXED_COSTS_DATA) {
        const id = generateUUID();
        batch.set(doc(db, `users/${userId}/fixedCosts`, id), {
            ...fc,
            id,
            createdAt: new Date().toISOString()
        });
        opCount++;
    }

    // 4. 資産データの登録
    for (const asset of ASSETS_DATA) {
        const id = generateUUID();
        batch.set(doc(db, `users/${userId}/assets`, id), {
            ...asset,
            id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        opCount++;
    }

    await commitBatch();
    console.log('Seeding completed!');
    if (onProgress) onProgress('完了しました！');
};
