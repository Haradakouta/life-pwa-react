# Stable Diffusion フレーム画像生成プロンプト

## 共通設定
- **サイズ**: 512x512px または 1024x1024px（正方形）
- **形式**: PNG（透過対応）
- **中央部分**: 透明（プロフィール画像が見えるように）
- **スタイル**: ゲームUI、装飾的な枠、プロフィールフレーム

---

## 1. デフォルトフレーム (frame_default)

**プロンプト:**
```
simple elegant frame border, profile picture frame, minimal design, clean lines, subtle shadow, white or gray border, transparent center, game UI style, square frame
```

**Negative Prompt:**
```
complex patterns, detailed decoration, glowing effects, colorful, ornate
```

---

## 2. 黄金のフレーム (frame_gold)

**プロンプト:**
```
golden ornate frame border, profile picture frame, luxurious golden frame, elegant decoration, golden glow, shimmer effect, transparent center, game UI style, square frame, premium quality, golden embossed pattern
```

**Negative Prompt:**
```
dull colors, matte finish, simple design, plain border
```

---

## 3. プラチナフレーム (frame_platinum)

**プロンプト:**
```
platinum silver ornate frame border, profile picture frame, elegant platinum frame, sophisticated decoration, silver glow, metallic shine, transparent center, game UI style, square frame, premium quality, platinum embossed pattern, high-end design
```

**Negative Prompt:**
```
golden colors, warm tones, simple design, plain border
```

---

## 4. 伝説のフレーム (frame_legendary)

**プロンプト:**
```
legendary epic ornate frame border, profile picture frame, magnificent glowing frame, magical aura, rainbow glow, epic decoration, mystical patterns, transparent center, game UI style, square frame, legendary quality, divine frame, ethereal glow, fantasy style
```

**Negative Prompt:**
```
simple design, plain border, dull colors, no glow
```

---

## 5. 深紅の境界 (frame_crimson)

**プロンプト:**
```
crimson red ornate frame border, profile picture frame, deep red frame, blood red decoration, crimson glow, dark fantasy style, mysterious aura, transparent center, game UI style, square frame, forbidden frame, dark red patterns, gothic style
```

**Negative Prompt:**
```
bright colors, cheerful design, light tones, simple border
```

---

## 6. 蒼穹の輪廻 (frame_azure)

**プロンプト:**
```
azure blue ornate frame border, profile picture frame, sky blue frame, celestial blue decoration, azure glow, ethereal aura, transparent center, game UI style, square frame, heavenly frame, sky blue patterns, celestial style, divine blue glow
```

**Negative Prompt:**
```
dark colors, red tones, warm colors, simple design
```

---

## 7. 虚無の刻印 (frame_void)

**プロンプト:**
```
void black ornate frame border, profile picture frame, dark void frame, shadowy decoration, black glow, dark aura, void patterns, transparent center, game UI style, square frame, abyss frame, dark fantasy style, shadow patterns, ominous glow
```

**Negative Prompt:**
```
bright colors, light tones, colorful, cheerful design
```

---

## 8. 不死鳥の炎 (frame_phoenix)

**プロンプト:**
```
phoenix fire ornate frame border, profile picture frame, flaming phoenix frame, fire and flame decoration, orange red glow, phoenix feathers pattern, burning aura, transparent center, game UI style, square frame, legendary phoenix frame, fire effects, phoenix patterns, mythical flames
```

**Negative Prompt:**
```
cold colors, ice, water, simple design, no fire effects
```

---

## 9. 龍の逆鱗 (frame_dragon)

**プロンプト:**
```
dragon scale ornate frame border, profile picture frame, dragon frame, dragon scale pattern, green emerald glow, dragon scales decoration, powerful aura, transparent center, game UI style, square frame, legendary dragon frame, dragon scales texture, emerald green glow, mythical dragon pattern
```

**Negative Prompt:**
```
simple design, plain border, no dragon patterns, dull colors
```

---

## 生成時の推奨設定

### ControlNet（使用する場合）
- **Control Type**: Canny または OpenPose
- **Preprocessor**: Canny
- **Model**: control_v11p_sd15_canny

### パラメータ
- **Steps**: 20-30
- **CFG Scale**: 7-9
- **Sampler**: DPM++ 2M Karras または Euler A
- **Seed**: ランダム（好みの結果が出たら固定）

### 後処理
- 中央部分を透明にする（画像編集ソフトで）
- プロフィール画像サイズに合わせてリサイズ（例: 200x200pxのプロフィール画像なら、フレームは220x220px）

---

## 使用例（Stable Diffusion WebUI）

### 基本プロンプト構造
```
(masterpiece, best quality, ultra detailed), [フレームのプロンプト], transparent center, profile picture frame, game UI style, square frame, 512x512
```

### 例：不死鳥の炎
```
(masterpiece, best quality, ultra detailed), phoenix fire ornate frame border, profile picture frame, flaming phoenix frame, fire and flame decoration, orange red glow, phoenix feathers pattern, burning aura, transparent center, game UI style, square frame, legendary phoenix frame, fire effects, 512x512
```

**Negative Prompt:**
```
(low quality, worst quality, normal quality, lowres, low details, oversaturated, undersaturated, greyscale, bad anatomy, bad hands, text, watermark, signature, blur, jpeg artifacts, compression artifacts, poorly drawn, mutation, mutated, extra limb, missing limb, floating limbs, disconnected limbs, malformed, mutated hands, out of focus, long neck, long body, mutated, bad anatomy, bad proportions, gross proportions, text, error, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blur, artist name, trademark, watermark, title, multiple view, Reference sheet), simple design, plain border, no fire effects, cold colors, ice, water
```

---

## Tips

1. **透過処理**: 生成後、画像編集ソフト（GIMP、Photoshop、Photopeaなど）で中央部分を透明にする
2. **サイズ調整**: プロフィール画像サイズに合わせてフレームサイズを調整（通常はプロフィール画像より20-40px大きめ）
3. **バリエーション**: 同じプロンプトで複数生成し、好みのものを選ぶ
4. **レアリティに応じた装飾**: Commonはシンプル、Rareは装飾的、Epicは光るエフェクト、Legendaryは最も豪華に



