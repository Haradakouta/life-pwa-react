const d="AIzaSyBSqmtDaNAqF09NTYYKQsTKm-3fLl1LMr0",I=d!=="YOUR_GEMINI_API_KEY_HERE";let h=[];function w(n){const o=Date.now();h.push({type:n,timestamp:o}),h=h.filter(r=>o-r.timestamp<6e4);const e=h.filter(r=>r.type==="recipe").length,t=h.filter(r=>r.type==="receipt").length,a=h.length;console.log(`[API Usage] 直近1分間の合計リクエスト数: ${a}回`),console.log(`  - レシピ生成: ${e}回`),console.log(`  - レシートOCR: ${t}回`),console.log(`  - 残り制限枠: ${15-a}回 (Free Tier: 15回/分)`)}async function P(n,o="none",e="none",t=""){if(console.log("[Gemini] API呼び出し開始",{ingredients:n,dietaryRestriction:o,difficulty:e,customRequest:t,API_ENABLED:I,apiKeyPrefix:d.substring(0,10)+"..."}),!n||n.length===0)throw new Error("材料を指定してください。");try{const a=o==="vegetarian"?"ベジタリアン":o==="vegan"?"ヴィーガン":"";let r="";e==="super_easy"?r=`

**重要**: 料理初心者でも絶対に失敗しない超簡単なレシピにしてください。調理工程は3ステップ以内、特別な道具や技術は不要にしてください。`:e==="under_5min"?r=`

**重要**: 調理時間5分以内で完成するレシピにしてください。`:e==="under_10min"?r=`

**重要**: 調理時間10分以内で完成するレシピにしてください。`:e==="no_fire"&&(r=`

**重要**: 火を使わずに作れるレシピにしてください（電子レンジやトースターは可）。`);const i=t?`

**追加のリクエスト**: ${t}`:"",g=`
あなたは日本語で答えるプロの料理アドバイザーです。
必ず日本語で回答してください。英語は使わないでください。

次の食材を使った${a}向けの家庭向けレシピを1つ提案してください。
料理名・材料・手順・ポイントを含めて出力してください。${r}${i}

食材: ${n.join("、")}

出力フォーマットは以下の形式でお願いします：

---
【料理名】
（料理名）

【材料】
（材料一覧）

【作り方】
1.
2.
3.

【ポイント】
（料理のコツやアドバイス）
---
`.trim(),p=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${d}`;w("recipe"),console.log("[Gemini] APIリクエスト送信",{url:p.replace(d,"HIDDEN")});const s=await fetch(p,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:g}]}],generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:1024}})});if(console.log("[Gemini] APIレスポンス受信",{status:s.status,ok:s.ok}),console.log("[Gemini] Rate Limit Info:",{limit:s.headers.get("x-ratelimit-limit"),remaining:s.headers.get("x-ratelimit-remaining"),reset:s.headers.get("x-ratelimit-reset"),retryAfter:s.headers.get("retry-after")}),!s.ok){const m=await s.text();let c;try{c=JSON.parse(m)}catch{c={rawError:m}}console.error("[Gemini] APIエラー詳細",{status:s.status,statusText:s.statusText,errorData:c});let u=`Gemini API エラー (${s.status})`;throw c.error?.message&&(u+=`: ${c.error.message}`),new Error(u)}const l=await s.json();if(console.log("[Gemini] レスポンスデータ",l),l.candidates&&l.candidates.length>0){const m=l.candidates[0];if(m.content?.parts&&m.content.parts.length>0){const c=m.content.parts[0].text;return console.log("[Gemini] レシピ生成成功"),c.trim()}}throw console.error("[Gemini] レスポンス形式が不正",l),new Error("Gemini APIからレシピを取得できませんでした。")}catch(a){return console.error("[Gemini] エラー発生:",a),console.warn("[Gemini] モックデータを使用します。"),console.info("[Gemini] 新しいAPIキーが必要な場合: https://aistudio.google.com/app/apikey"),a instanceof Error&&a.message.includes("403")&&console.error("[Gemini] 403エラー: APIキーが無効または期限切れです。新しいキーを取得してください。"),A(n,o,e)}}async function y(n){console.log("[Gemini Text] テキスト生成開始");try{const o=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${d}`;w("recipe"),console.log("[Gemini Text] APIリクエスト送信");const e=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:n}]}],generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:2048}})});if(console.log("[Gemini Text] APIレスポンス受信",{status:e.status}),!e.ok){const a=await e.text();throw console.error("[Gemini Text] APIエラー",a),new Error(`Gemini API エラー: ${e.status}`)}const t=await e.json();if(console.log("[Gemini Text] レスポンスデータ受信"),t.candidates&&t.candidates.length>0){const a=t.candidates[0];if(a.content?.parts&&a.content.parts.length>0){const r=a.content.parts[0].text.trim();return console.log("[Gemini Text] テキスト生成成功"),r}}throw new Error("テキストを生成できませんでした")}catch(o){throw console.error("[Gemini Text] エラー:",o),o}}const T=n=>new Promise((o,e)=>{const t=new FileReader;t.onload=()=>{const r=t.result.split(",")[1];o(r)},t.onerror=e,t.readAsDataURL(n)});let x=0;const G=5e3;async function $(n){console.log("[Gemini Receipt] OCR処理開始",{fileName:n.name,fileSize:n.size,API_ENABLED:I});const o=Date.now(),e=o-x;if(e<G){const t=Math.ceil((G-e)/1e3);throw new Error(`レート制限: ${t}秒後に再試行してください`)}try{x=o;const t=await T(n),a=`
あなたは日本語のレシート解析の専門家です。
このレシート画像から商品名と価格を正確に抽出してください。

以下のJSON形式で出力してください：
{
  "storeName": "店舗名（わかれば）",
  "date": "日付（YYYY-MM-DD形式、わかれば）",
  "total": 合計金額（数値、わかれば）,
  "items": [
    {
      "name": "商品名",
      "price": 価格（数値）,
      "quantity": 数量（数値、デフォルトは1）
    }
  ]
}

**重要な指示:**
1. 商品名と価格は必ず正確に抽出してください
2. 価格は数値のみ（円記号やカンマは除く）
3. 同じ商品が複数ある場合はquantityで表現
4. 合計金額や税金などの行は除外
5. 不明な項目は省略してOK
6. 必ずJSONのみを返してください（説明文は不要）
`.trim(),r=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${d}`;w("receipt"),console.log("[Gemini Receipt] APIリクエスト送信");const i=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:a},{inlineData:{mimeType:n.type||"image/jpeg",data:t}}]}],generationConfig:{temperature:.1,topK:32,topP:1,maxOutputTokens:2048}})});if(console.log("[Gemini Receipt] APIレスポンス受信",{status:i.status}),console.log("[Gemini Receipt] Rate Limit Info:",{limit:i.headers.get("x-ratelimit-limit"),remaining:i.headers.get("x-ratelimit-remaining"),reset:i.headers.get("x-ratelimit-reset"),retryAfter:i.headers.get("retry-after")}),!i.ok){const p=await i.text();throw console.error("[Gemini Receipt] APIエラー",p),i.status===429?new Error("レート制限に達しました。数秒後に再試行してください。"):new Error(`Gemini API エラー: ${i.status}`)}const g=await i.json();if(console.log("[Gemini Receipt] レスポンスデータ",g),g.candidates&&g.candidates.length>0){const p=g.candidates[0];if(p.content?.parts&&p.content.parts.length>0){const s=p.content.parts[0].text.trim();console.log("[Gemini Receipt] 抽出テキスト:",s);let l=s;const m=s.match(/```json\s*([\s\S]*?)\s*```/);if(m)l=m[1];else if(s.includes("```")){const f=s.match(/```\s*([\s\S]*?)\s*```/);f&&(l=f[1])}const c=JSON.parse(l),u={items:c.items||[],total:c.total,storeName:c.storeName,date:c.date,rawText:s};return console.log("[Gemini Receipt] OCR成功",u),u}}throw new Error("レシートからテキストを抽出できませんでした")}catch(t){throw console.error("[Gemini Receipt] エラー:",t),t}}function A(n,o,e="none"){const t=o==="vegetarian"?"ベジタリアン":o==="vegan"?"ヴィーガン":"",a=e==="super_easy"?"（超簡単）":e==="under_5min"?"（5分）":e==="under_10min"?"（10分）":e==="no_fire"?"（火を使わない）":"";return`
【料理名】
${n.join("と")}の${t}炒め${a}

【材料】
${n.map(r=>`・${r} 適量`).join(`
`)}
・塩、こしょう 少々
・サラダ油 大さじ1

【作り方】
1. ${n[0]||"材料"}を食べやすい大きさに切ります。
2. フライパンに油を熱し、材料を炒めます。
3. 塩、こしょうで味を調えて完成です。

【ポイント】
シンプルな炒め物なので、お好みで醤油やにんにくを加えても美味しいです。
野菜の食感を残すため、強火でサッと炒めるのがコツです。

※ このレシピはデモ用のモックデータです。実際のGemini APIキーを設定すると、AIが本格的なレシピを生成します。
※ 403エラーが発生しています。新しいAPIキーを https://aistudio.google.com/app/apikey で取得してください。
`.trim()}export{y as a,P as g,$ as s};
