---
title: 光の干渉・ヤングの二重スリット実験
description: 高校物理の波動分野。ヤングの二重スリット実験、経路差の完全近似導出、明線・暗線条件、明線間隔の公式（Δx=Lλ/d）、媒質中での波長短縮、薄膜挿入による光路長変化をシミュレーションとオリジナル例題で完全攻略。
---

# 光の干渉・ヤングの二重スリット実験

<div class="lead">
シャボン玉の虹色のきらめき、CDの裏面が七色に光る神秘的な模様。<br>
これらの美しい現象はすべて、光が「波」として重なり合い、強め合ったり弱め合ったりする<strong>光の干渉</strong>によるものです。<br>
1801年にトマス・ヤングが行った「二重スリット実験」は、それまで粒子だと信じられていた光が「波」であることを決定づけた物理学史上最も有名な実験の一つです。
このページでは、受験頻出の経路差の近似導出から、薄膜による干渉縞のシフトまでを動く実験室で体感的にマスターします。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **シャボン玉の虹色**: シャボン膜の表面と裏面で反射した2つの光が干渉し、特定の色の光だけが強め合って見えます。
* **水たまりに浮いたガソリン油膜**: わずか数マイクロメートルの薄い油膜が、太陽光の波長ごとに干渉して鮮やかに光ります。
* **ブルーレイ・DVD・CDのディスク**: 表面に刻まれた微小なピット（溝）が回折格子として働き、光を干渉・分光させます。

### 学習の到達目標
1. **光の干渉条件の本質**: 2つの波の山と山が重なる「同位相（強め合い）」と、山と谷が重なる「逆位相（弱め合い）」の条件を導ける。
2. **経路差の近似導出**: スリット間隔 $d$、スクリーン距離 $L$、中心からの距離 $x$ から、経路差 $\Delta l \approx d \frac{x}{L}$ を三平方の定理および三角比から完璧に導出できる。
3. **光路長（光学距離）の理解**: 屈折率 $n$ の薄膜を通ったとき、なぜ光が遅れて「実質的な距離が $n$ 倍に伸びる」のかを説明し、干渉縞の移動問題を解ける。

---

## 2. 現象のしくみ

### なぜ2つのスリットが必要なのか？
部屋の天井にある2つの蛍光灯をつけても、壁に縞模様（明暗の干渉縞）は現れません。
これは、通常の光源から出る光は無数の原子からバラバラなタイミングで放出されており、波の位相がランダムに乱れているためです（**インコヒーレントな光**）。

ヤングの実験では、1つの単色光源（レーザーなど）から出た光を2つのスリット $\text{S}_1, \text{S}_2$ に通すことで、 **「常に同じタイミングで振動する（同位相の）2つの波」** を作り出します。これによって、きれいな干渉縞がスクリーンにくっきりと現れます。

<div class="vector-graph-card">
<svg viewBox="0 0 580 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-young-ray" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#38bdf8" />
    </marker>
  </defs>
  <!-- 左端: 単色光源 -->
  <rect x="15" y="95" width="55" height="50" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="42" y="118" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">単色光源</text>
  <text x="42" y="133" fill="#94a3b8" font-size="10" text-anchor="middle">波長 λ</text>
  <!-- 光源からの光線 -->
  <line x1="70" y1="120" x2="125" y2="120" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-young-ray)"/>
  <!-- スリット板 (x = 135) -->
  <line x1="135" y1="20" x2="135" y2="95" stroke="#64748b" stroke-width="4"/>
  <line x1="135" y1="110" x2="135" y2="130" stroke="#64748b" stroke-width="4"/>
  <line x1="135" y1="145" x2="135" y2="220" stroke="#64748b" stroke-width="4"/>
  <text x="130" y="15" fill="#94a3b8" font-size="11" text-anchor="end">スリット板</text>
  <!-- スリット S1, S2 -->
  <circle cx="135" cy="102" r="3" fill="#fbbf24"/>
  <text x="120" y="106" fill="#fbbf24" font-size="12" font-weight="700">S₁</text>
  <circle cx="135" cy="138" r="3" fill="#fbbf24"/>
  <text x="120" y="142" fill="#fbbf24" font-size="12" font-weight="700">S₂</text>
  <!-- スリット間隔 d の寸法線 -->
  <line x1="150" y1="102" x2="150" y2="138" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="145" y1="102" x2="155" y2="102" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="145" y1="138" x2="155" y2="138" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="160" y="124" fill="#fbbf24" font-size="12" font-weight="700">d</text>
  <!-- 右端: スクリーン (x = 380) -->
  <line x1="380" y1="20" x2="380" y2="220" stroke="#94a3b8" stroke-width="3"/>
  <text x="380" y="15" fill="#94a3b8" font-size="11" text-anchor="middle">スクリーン</text>
  <!-- 中心軸 (y = 120) -->
  <line x1="135" y1="120" x2="380" y2="120" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
  <circle cx="380" cy="120" r="4" fill="#94a3b8"/>
  <rect x="390" y="110" width="85" height="20" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <text x="432" y="124" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">点 O (中央)</text>
  <!-- スクリーン上の点 P (y = 60, x = 380) -->
  <circle cx="380" cy="60" r="5" fill="#f43f5e"/>
  <rect x="390" y="50" width="95" height="20" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="437" y="64" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">点 P (変位 x)</text>
  <!-- 光路 l1, l2 -->
  <line x1="135" y1="102" x2="380" y2="60" stroke="#38bdf8" stroke-width="2"/>
  <rect x="230" y="66" width="60" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="260" y="79" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">光路 l₁</text>
  <line x1="135" y1="138" x2="380" y2="60" stroke="#22d3ee" stroke-width="2"/>
  <rect x="230" y="103" width="60" height="18" rx="3" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>
  <text x="260" y="116" fill="#22d3ee" font-size="11" font-weight="600" text-anchor="middle">光路 l₂</text>
  <!-- スクリーン右側の明暗縞プレビュー (x = 505..535) -->
  <g transform="translate(505, 20)">
    <rect x="0" y="0" width="30" height="200" fill="#020617" stroke="#334155" stroke-width="1"/>
    <!-- 明線 (グラデーション) -->
    <rect x="2" y="90" width="26" height="20" fill="#38bdf8" opacity="0.9"/> <!-- m = 0 -->
    <rect x="2" y="30" width="26" height="20" fill="#38bdf8" opacity="0.8"/> <!-- m = +1 -->
    <rect x="2" y="150" width="26" height="20" fill="#38bdf8" opacity="0.8"/> <!-- m = -1 -->
    <text x="15" y="104" fill="#000" font-size="10" font-weight="700" text-anchor="middle">明</text>
    <text x="15" y="44" fill="#000" font-size="10" font-weight="700" text-anchor="middle">明</text>
    <text x="15" y="164" fill="#000" font-size="10" font-weight="700" text-anchor="middle">明</text>
  </g>
  <text x="520" y="235" fill="#38bdf8" font-size="11" font-weight="600" text-anchor="middle">明暗の干渉縞</text>
  <!-- 距離 L の寸法線 -->
  <line x1="135" y1="210" x2="380" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="135" y1="205" x2="135" y2="215" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="380" y1="205" x2="380" y2="215" stroke="#94a3b8" stroke-width="1.5"/>
  <rect x="230" y="200" width="60" height="20" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="260" y="214" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">距離 L</text>
</svg>
<div class="graph-caption">図: ヤングの二重スリット実験（スリット間隔 <i>d</i>、スクリーン距離 <i>L</i>、経路差 Δ<i>l</i> = <i>l</i>₂ − <i>l</i>₁ ≈ <i>dx</i>/<i>L</i> による明暗干渉縞の形成）</div>
</div>

---

## 3. 基本法則・公式

### ① 経路差の近似導出（最重要！）
スリット $\text{S}_1, \text{S}_2$ の間隔を $d$、スリット板からスクリーンまでの距離を $L$ とする。
スクリーン中心 $\text{O}$ から距離 $x$ の位置にある点 $\text{P}$ までの2つの光の距離を $l_1 = \text{S}_1\text{P}$、$l_2 = \text{S}_2\text{P}$ とする。

$$L \gg d \quad \text{かつ} \quad L \gg x$$

という高校物理の実用条件（$L \approx 1\sim 2\,\text{m}$ に対し、$d \approx 0.1\,\text{mm}, x \approx \text{数}\text{mm}$）のもとでは、2つの経路はほぼ平行とみなせます。

$$\text{経路差 } \Delta l = l_2 - l_1 \approx d \sin\theta \approx d \tan\theta = d \frac{x}{L}$$

> [!NOTE]
> **三平方の定理を用いた厳密な近似導出**  
> $$l_2^2 - l_1^2 = \left[ L^2 + \left(x + \frac{d}{2}\right)^2 \right] - \left[ L^2 + \left(x - \frac{d}{2}\right)^2 \right] = 2dx$$
> $$(l_2 - l_1)(l_2 + l_1) = 2dx$$
> $L \gg d, x$ より $l_2 + l_1 \approx 2L$ と近似できるため：
> $$l_2 - l_1 \approx \frac{2dx}{2L} = \frac{dx}{L}$$

---

### ② 明線（強め合い）・暗線（弱め合い）の条件
光源 $\text{S}_1, \text{S}_2$ が同位相で振動しているとき：

$$\begin{cases}
\text{明線条件（強め合い）}: & d \dfrac{x}{L} = m \lambda \quad (m = 0, \pm 1, \pm 2, \dots) \\
\text{暗線条件（弱め合い）}: & d \dfrac{x}{L} = \left(m + \dfrac{1}{2}\right) \lambda \quad (m = 0, \pm 1, \pm 2, \dots)
\end{cases}$$

* $m = 0$: 中央明線（$x = 0$、経路差ゼロ）
* $m = \pm 1$: 1次の明線（経路差が波長1個分 $\lambda$）
* $m = \pm 2$: 2次の明線（経路差が波長2個分 $2\lambda$）

---

### ③ 隣り合う明線の間隔 $\Delta x$
$m$ 次の明線の位置 $x_m = m \frac{L\lambda}{d}$ と、$(m+1)$ 次の明線の位置 $x_{m+1} = (m+1) \frac{L\lambda}{d}$ の差は一定です：

$$\Delta x = x_{m+1} - x_m = \frac{L \lambda}{d}$$

* **波長 $\lambda$ が長い（赤色光など）**$\to$ $\Delta x$ は**広がる**
* **波長 $\lambda$ が短い（青・紫色光など）**$\to$ $\Delta x$ は**狭まる**
* **スリット間隔 $d$ が狭い**$\to$ $\Delta x$ は**広がる**
* **スクリーン距離 $L$ が遠い**$\to$ $\Delta x$ は**広がる**

---

### ④ 媒質の変化と光路長（光学距離）
1. **装置全体を屈折率 $n$ の液体（水など）に入れた場合**:
   光の振動数 $f$ は不変ですが、光速が $v = c/n$ に遅くなるため、波長が $\lambda' = \frac{\lambda}{n}$ に縮みます。
   したがって明線間隔も狭くなります：
   $$\Delta x' = \frac{L \lambda'}{d} = \frac{L \lambda}{n d} = \frac{\Delta x}{n}$$
2. **片方のスリットの前に厚さ $t$、屈折率 $n$ の透明薄膜を置いた場合**:
   薄膜の中を通過する光は、幾何学的距離 $t$ の代わりに **光路長 $n t$** だけ進んだことになります。
   したがって、薄膜を通過した側の光は $(n - 1)t$ だけ余分に遠回りした（遅れた）ことになります。
   * 中央明線（経路差ゼロの点）は、 **薄膜を置いたスリットの側へシフト** します！

---

## 4. 成立条件と注意点

### 近似が成り立つ前提条件
* $L$（メートル単位）は $d, x$（ミリ〜マイクロメートル単位）に比べて圧倒的に大きいこと（$L \gg d, L \gg x$）。
* スクリーン上の中心からあまりに離れた端っこ（$x$ が $L$ と同程度になるような大角度）では $\tan\theta \approx \sin\theta$ の近似が破綻するため、厳密な三角比の計算が必要です。

---

## 5. シミュレーションで体感する

下の実験室では、レーザー光源の波長 $\lambda$（赤〜紫）、スリット間隔 $d$、スクリーン距離 $L$ をスライダーで自由に変更できます。
右側のスクリーン上に投影されるリアルな干渉縞と光強度分布 $I(x)$ を観察してください。

<ClientOnly>
  <YoungSim />
</ClientOnly>

### 観察のポイント
1. **色の変化と縞の間隔**: 波長スライダーを動かして赤色（$650\,\text{nm}$）から紫色（$405\,\text{nm}$）へ変化させてみましょう。波長が短くなるにつれて、明線の間隔 $\Delta x$ がギュッと詰まっていく様子がはっきりと確認できます。
2. **スリット間隔 $d$ の影響**: スリットの間隔を狭くするほど、スクリーン上の干渉縞が大きく広がります。
3. **薄膜挿入チェック**: 「上スリットに薄膜挿入」にチェックを入れると、中央明線（$m=0$）を含めた干渉縞全体が上方向（薄膜を置いた側）へと平行移動することを確かめてください。

---

## 6. 例題での使い方（完全オリジナル）

### 【例題】ヤングの実験と透明薄膜による干渉縞の移動

#### 問題設定
空気中において、間隔 $d = 0.20\,\text{mm} = 2.0 \times 10^{-4}\,\text{m}$ の二重スリット $\text{S}_1, \text{S}_2$ に、波長 $\lambda = 6.0 \times 10^{-7}\,\text{m}$ の赤色単色光を垂直に照射した。
スリット板から $L = 1.5\,\text{m}$ 離れた位置にスクリーンが置かれている。空気の屈折率を $1.0$ とする。

1. スクリーン上に生じる明線の間隔 $\Delta x\,[\text{mm}]$ を求めよ。
2. 上側のスリット $\text{S}_1$ の直後に、厚さ $t = 3.6 \times 10^{-6}\,\text{m}$、屈折率 $n = 1.5$ の均一な透明薄膜を垂直に貼り付けた。
   このとき、中央明線（$m=0$ の明線）は元の位置（スクリーン中心 $\text{O}$）からどちら向きに何 $\text{mm}$ 移動するか求めよ。

---

#### 解答・解説

##### 設問(1)
* **着眼点**: 明線間隔の公式 $\Delta x = \frac{L \lambda}{d}$ に数値を代入する。
* **計算**:
  $$\Delta x = \frac{1.5 \times (6.0 \times 10^{-7})}{2.0 \times 10^{-4}} = \frac{9.0 \times 10^{-7}}{2.0 \times 10^{-4}} = 4.5 \times 10^{-3}\,\text{m} = 4.5\,\text{mm}$$

**答**: $4.5\,\text{mm}$

---

##### 設問(2)
* **ステップ1：薄膜挿入による光路差の立式**
  スクリーン上の点 $\text{P}$（中心から上向きに座標 $x$）を考える。
  * スリット $\text{S}_1$ から点 $\text{P}$ までの光路長（光学距離）:
    幾何学的距離 $l_1$ のうち、厚さ $t$ の部分だけ屈折率 $n$ の媒質を通るため：
    $$l_1' = (l_1 - t) + n t = l_1 + (n - 1)t$$
  * スリット $\text{S}_2$ から点 $\text{P}$ までの光路長:
    $$l_2' = l_2$$
  * 2つの光の光路差 $\Delta L_{\text{opt}}$:
    $$\Delta L_{\text{opt}} = l_2' - l_1' = l_2 - [l_1 + (n - 1)t] = (l_2 - l_1) - (n - 1)t$$
    幾何学的経路差 $l_2 - l_1 \approx d \frac{x}{L}$ を代入すると：
    $$\Delta L_{\text{opt}} = d \frac{x}{L} - (n - 1)t$$

* **ステップ2：中央明線（$m=0$）の位置を求める**
  中央明線とは、2つの光の光路差が完全に $0$ になる点である：
  $$\Delta L_{\text{opt}} = 0 \implies d \frac{x_0}{L} - (n - 1)t = 0$$
  $$x_0 = \frac{L (n - 1)t}{d}$$
  $n > 1$ より $x_0 > 0$（上向き）となるため、 **中央明線は薄膜を置いた上側へ移動する** ことが数式からも証明される。

* **ステップ3：数値代入**
  $$x_0 = \frac{1.5 \times (1.5 - 1.0) \times (3.6 \times 10^{-6})}{2.0 \times 10^{-4}}$$
  $$x_0 = \frac{1.5 \times 0.5 \times 3.6 \times 10^{-6}}{2.0 \times 10^{-4}} = \frac{2.7 \times 10^{-6}}{2.0 \times 10^{-4}} = 1.35 \times 10^{-2}\,\text{m} = 13.5\,\text{mm}$$
  （これは明線間隔 $\Delta x = 4.5\,\text{mm}$ のちょうど 3 個分、すなわち $m=3$ 本分だけ上にシフトしたことを意味します）

**答**: 上向きに $13.5\,\text{mm}$（または $1.4 \times 10^{-2}\,\text{m}$）

---

## 7. 受験生が陥りやすい誤解・つまずき

### 誤解1：「波長が長い光ほど干渉縞が細かくなる」
* **原因**: 「波長が長い＝エネルギーが大きい？」といった漠然とした連想による勘違い。
* **正しい理解**: 公式 $\Delta x = \frac{L \lambda}{d}$ の通り、明線間隔 $\Delta x$ は波長 $\lambda$ に**正比例**します。
  * 赤色光（波長大）：干渉縞の間隔が広く、ゆったり並ぶ。
  * 青・紫色光（波長小）：干渉縞の間隔が狭く、細かく密集する。

### 誤解2：「薄膜を置くと光が遅くなるから、干渉縞は反対側へ逃げる」
* **原因**: 「遅れたから押し出される」という直感の逆転。
* **正しい理解**:
  中央明線は「両方のスリットから同じ時間で到達する点（光路長が等しい点）」です。
  上側のスリット $\text{S}_1$ に薄膜を置くと、上側の光が足止めを食らって遅れます。
  両者が同時にゴールするためには、 **下側の光により長い距離を走らせる（ハンデを与える）**必要があります。下側の光がより長く走る場所は「中心より上側」なので、縞全体が**薄膜を置いた側へ引き寄せられるようにシフト** します。

---

## 8. 要点まとめ

::: tip 【ヤングの実験の最重要公式】
- **幾何学的経路差**: $\Delta l = |l_1 - l_2| \approx d \cdot \frac{x}{L} \quad (L \gg d, x)$
- **明線条件（強め合い）**: $d \cdot \frac{x}{L} = m\lambda \quad (m = 0, \pm 1, \pm 2, \dots)$
- **暗線条件（弱め合い）**: $d \cdot \frac{x}{L} = \left(m + \frac{1}{2}\right)\lambda$
- **明線間隔**: $\Delta x = \frac{L\lambda}{d}$（波長 $\lambda$ が長いほど、スクリーン距離 $L$ が遠いほど広がる）
- **光路長（光学距離）**: $L_{\text{opt}} = n \cdot l$（真空中換算の長さ。厚さ $t$ の薄膜で $(n - 1)t$ 増加し、中央明線は薄膜側へシフト）
:::

<!--@include: ../parts/notice.md-->
