---
title: 電流がつくる磁場とアンペールの法則・平行電流間の力
description: 高校物理の電磁気学最頻出テーマ。右ねじの法則、直線電流（H=I/2πr）・円形電流（H=I/2r）・ソレノイド（H=nI）の3大公式、アンペールの法則、平行電流間に働く力（同方向は引力、逆方向は斥力）をシミュレーションとオリジナル例題で完全解説。
---

# 電流がつくる磁場とアンペールの法則・平行電流間の力

<div class="lead">
「磁場（磁力）」を生み出すのは、永久磁石だけではありません。<br>
1820年、デンマークの物理学者エルステッドは、導線に電流を流した瞬間、近くに置いてあった方位磁針がピクッと動くのを発見しました。<br>
<strong>「電荷が動く（電流が流れる）と、その周りに必ず磁場が生まれる」</strong>――。<br>
この大発見によって、「電気」と「磁気」が1つの学問「電磁気学」へと統合されました。<br>
本ページでは、右ねじの法則の直感から3大幾何形状の公式、平行電流間に働く力の導出までを完全攻略します。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **電磁石・リニアモーターカー**: 鉄心に導線を何千回も巻きつけて電流を流すと、数トンもの鉄を持ち上げる超強力な磁石になる。
* **スピーカー・ヘッドホン**: 永久磁石と円形コイルを組み合わせ、音声電流を流したときに生じる磁場変化で振動板を細かく震わせて音を鳴らしている。
* **高圧送電線のまわりの磁場**: 大電流が流れる送電線の周りには同心円状の磁場が広がっており、送電線の下で方位磁針を持つと針が狂う。

### 学習の到達目標
1. **右ねじの法則による向きの即答**: 直線電流、円形電流、ソレノイドの各形状で、右手を使って磁場の向き（N極側）を瞬時に判定できる。
2. **3大公式の完全使い分け**: 直線電流 $H = \frac{I}{2\pi r}$、円形電流 $H = \frac{I}{2r}$、ソレノイド $H = nI$ の分母の違い（$\pi$ の有無）を物理的理由から正しく識別できる。
3. **平行電流間の力の導出**: 電流1が作る磁場から電流2が受けるアンペール力（フレミング左手）を合成し、「同方向は引力、逆方向は斥力」を完璧に導出できる。

---

## 🧪 インタラクティブ実験室

「直線電流」「円形電流」「ソレノイド」の3モードを切り替え、電流の向きや強さを変えたときの方位磁針（コンパス）の向きを観察してみましょう。

<MagneticFieldSim />

---

## 2. 右ねじの法則と3大形状の磁場公式

磁場の強さを $H\,[\text{A/m}]$、磁束密度を $B\,[\text{T}]$（$B = \mu H$、真空中では $B = \mu_0 H$）とします。

### (1) 直線電流がつくる磁場（同心円状）
無限に長い直線導線に電流 $I$ を流すと、導線を中心とする同心円状の磁場が生じます。

<div class="vector-graph-card">
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-mag-circ" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
  </defs>
  <!-- 導線 (鉛直中央) -->
  <line x1="270" y1="20" x2="270" y2="200" stroke="#fbbf24" stroke-width="4"/>
  <text x="285" y="40" fill="#fbbf24" font-size="14" font-weight="700">電流 I (上向き)</text>
  <!-- 水平平面 (楕円透視図) -->
  <ellipse cx="270" cy="120" rx="160" ry="45" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- 半径 r の同心円磁力線 -->
  <ellipse cx="270" cy="120" rx="100" ry="28" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <!-- 磁場矢印 (反時計回り) -->
  <line x1="370" y1="120" x2="370" y2="105" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-mag-circ)"/>
  <rect x="380" y="100" width="130" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="445" y="114" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">磁場 H ＝ I / (2πr)</text>
  <!-- 半径 r の寸法線 -->
  <line x1="270" y1="120" x2="370" y2="120" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="305" y="128" width="45" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="327" y="141" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">距離 r</text>
</svg>
<div class="graph-caption">図: 直線電流がつくる同心円状の磁場（右手の親指を電流に向けると、残り4本の指が磁場の向きを指す）</div>
</div>

導線から距離 $r\,[\text{m}]$ 離れた点での磁場の強さは、**円周の長さ $2\pi r$** で割った形になります：

$$
\boxed{H = \frac{I}{2\pi r}} \quad \Longleftrightarrow \quad \boxed{B = \frac{\mu_0 I}{2\pi r}}
$$

---

### (2) 円形電流がつくる中心の磁場
半径 $r$ の円形導線に電流 $I$ を流したとき、中心点における磁場は円の面に垂直です：

$$
\boxed{H = \frac{I}{2r}} \quad \Longleftrightarrow \quad \boxed{B = \frac{\mu_0 I}{2r}}
$$

::: tip なぜ円形電流の分母には $\pi$ がつかないのか？
* 直線電流のまわりの磁場は「円周 $2\pi r$」に広がっていくため分母に $\pi$ がつきます。
* 円形電流の中心では、円周上の全電流からの寄与が集まって足し合わされるため、$\pi$ が相殺されて**「直径 $2r$」**が分母に残る形になります。
:::

---

### (3) ソレノイドがつくる内部の一様磁場
単位長さあたり $n\,[\text{回/m}]$ 巻かれた十分に長いソレノイドコイルに電流 $I$ を流すと、内部には**場所によらず完全に均一な平行磁場**が生まれます：

$$
\boxed{H = n I} \quad \Longleftrightarrow \quad \boxed{B = \mu_0 n I}
$$

* 全長 $L\,[\text{m}]$、総巻き数 $N$ のコイルの場合：$n = \frac{N}{L}$ なので $H = \frac{N I}{L}$ です。
* ソレノイドの外部の磁場はほぼゼロ（外部に漏れない）になります。

---

## 3. アンペールの法則（周回積分）

静電気学における「ガウスの法則」に対応する、磁気学の最も基礎的な法則が**アンペールの法則（Ampère's Circuital Law）**です。

> **任意の閉じた経路を一巡する磁場の線積分（周回積分）は、その経路の内側を貫く電流の総和に等しい：**
> $$\oint \vec{H} \cdot d\vec{l} = \sum I$$

* **直線電流の導出**:
  半径 $r$ の円周経路（長さ $2\pi r$）を一巡すると：
  $$H \times (2\pi r) = I \implies H = \frac{I}{2\pi r}$$
* **ソレノイドの導出**:
  内部の長さ $L$ の経路をとると、貫く電流は $N \times I = (nL)I$ なので：
  $$H \times L = n L I \implies H = n I$$

---

## 4. 平行電流間に働く力（引力と斥力）

距離 $r$ だけ離れて平行に置かれた2本の長い導線に、それぞれ電流 $I_1, I_2$ が流れているとき、両者の間には電磁気力（アンペール力）が働きます。

<div class="vector-graph-card">
<svg viewBox="0 0 540 260" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-par-f" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
  </defs>
  <!-- 導線 1 (左: x = 160) -->
  <line x1="160" y1="20" x2="160" y2="220" stroke="#fbbf24" stroke-width="4"/>
  <text x="135" y="40" fill="#fbbf24" font-size="14" font-weight="700">I₁</text>
  <!-- 導線 2 (右: x = 360) -->
  <line x1="360" y1="20" x2="360" y2="220" stroke="#fbbf24" stroke-width="4"/>
  <text x="375" y="40" fill="#fbbf24" font-size="14" font-weight="700">I₂</text>
  <!-- 距離 r -->
  <line x1="160" y1="120" x2="360" y2="120" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"/>
  <rect x="235" y="110" width="50" height="18" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="260" y="123" fill="#cbd5e1" font-size="10" text-anchor="middle">距離 r</text>
  <!-- 電流1が導線2の位置につくる磁場 B1 (奥向き ⊗) -->
  <circle cx="360" cy="120" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="360" y="125" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle">⊗</text>
  <rect x="380" y="112" width="125" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="442" y="126" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">B₁ ＝ μ₀ I₁ / (2πr)</text>
  <!-- 導線2が受ける力 F (フレミング左手: 左向き引力) -->
  <line x1="360" y1="160" x2="280" y2="160" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-par-f)"/>
  <rect x="290" y="172" width="55" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="317" y="185" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">引力 F</text>
  <!-- 導線1が受ける反作用の力 F (右向き引力) -->
  <line x1="160" y1="160" x2="240" y2="160" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-par-f)"/>
  <rect x="180" y="172" width="55" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="207" y="185" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">引力 F</text>
  <rect x="140" y="228" width="240" height="24" rx="4" fill="#0f172a" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="260" y="244" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">【同方向の電流は互いに引き合う！】</text>
</svg>
<div class="graph-caption">図: 平行電流間に働く力（電流 <i>I</i>₁ がつくる磁場 <i>B</i>₁ の中を流れる電流 <i>I</i>₂ がフレミング左手の法則で引力を受ける）</div>
</div>

### 単位長さあたりに働く力 $f$ の導出
1. 導線 1 が導線 2 の位置につくる磁束密度は：
   $$B_1 = \frac{\mu_0 I_1}{2\pi r}$$
2. この磁場中を流れる導線 2 の長さ $L$ の部分が受ける電磁気力は $F = I_2 B_1 L$ より：
   $$F = I_2 \left(\frac{\mu_0 I_1}{2\pi r}\right) L = \frac{\mu_0 I_1 I_2}{2\pi r} L$$
3. 単位長さ（$1\,\text{m}$）あたりに働く力 $f = \frac{F}{L}$ は：
   $$
   \boxed{f = \frac{\mu_0 I_1 I_2}{2\pi r}} \quad [\text{N/m}]
   $$

::: danger 電流の向きによる引力・斥力の引っかけ！
* **同方向の電流**: **引き合う（引力）**
* **逆方向の電流**: **反発し合う（斥力）**

静電気では「同種電荷（$++$ や $--$）は反発」だったので、**符号の直感が逆**になります！入試で極めて間違いやすいので、必ずフレミングの左手の法則で手を使って確認してください。
:::

---

## 5. 例題での使い方（完全オリジナル）

### 【例題】平行3本導線のつり合い

::: info 📖 【問題設定】
真空中に、3本の十分に長い直線導線 A, B, C を互いに平行に、等間隔 d = 10 cm で同一平面上に配置した。
導線 A に上向き 6.0 A、導線 C に上向き 4.0 A の電流が流れている。
真空の透磁率を μ₀ = 4π × 10⁻⁷ N/A² とする。

(1) 導線 A と C のちょうど真ん中にある導線 B に、上向きに電流 I_B = 2.0 A を流した。
    導線 B の単位長さあたりに働く電磁気力の大きさと向きを求めよ。
(2) 導線 B に働く電磁気力をゼロにするには、導線 B を導線 A から何 cm の位置に置けばよいか。
:::

#### 【解法ステップ】

**Step 1: (1) 導線 B が受ける合力を求める**  
導線 A からの距離は $d = 0.10\,\text{m}$、導線 C からの距離も $d = 0.10\,\text{m}$。  
* 導線 A から受ける力 $f_A$（同方向なので左向きの引力）:
  $$f_A = \frac{\mu_0 I_A I_B}{2\pi d} = \frac{(4\pi \times 10^{-7}) \times 6.0 \times 2.0}{2\pi \times 0.10} = \frac{24.0 \times 10^{-7}}{0.10} = 2.4 \times 10^{-5}\,\text{N/m} \quad (\text{左向き})$$
* 導線 C から受ける力 $f_C$（同方向なので右向きの引力）:
  $$f_C = \frac{\mu_0 I_C I_B}{2\pi d} = \frac{(4\pi \times 10^{-7}) \times 4.0 \times 2.0}{2\pi \times 0.10} = \frac{16.0 \times 10^{-7}}{0.10} = 1.6 \times 10^{-5}\,\text{N/m} \quad (\text{右向き})$$

合力は左向きを正として：
$$f_{\text{net}} = f_A - f_C = (2.4 - 1.6) \times 10^{-5} = 0.8 \times 10^{-5} = 8.0 \times 10^{-6}\,\text{N/m} \quad (\text{左向き})$$

**Step 2: (2) 導線 B に働く合力がゼロになる位置を求める**  
合力がゼロになるには、導線 A と C が作る磁場が打ち消し合って $B_A = B_C$ となればよい。  
導線 A からの距離を $x$ とすると、導線 C からの距離は $2d - x$ です：
$$\frac{\mu_0 I_A}{2\pi x} = \frac{\mu_0 I_C}{2\pi (2d - x)} \iff \frac{I_A}{x} = \frac{I_C}{2d - x}$$
$$\frac{6.0}{x} = \frac{4.0}{20 - x} \implies 6.0(20 - x) = 4.0x$$
$$120 - 6.0x = 4.0x \implies 10.0x = 120 \implies x = 12\,\text{cm}$$

**答**: (1) $8.0 \times 10^{-6}\,\text{N/m}$（左向き・導線A側へ引かれる）、(2) **導線 A から $12\,\text{cm}$**

---

## 6. 要点まとめ

::: tip 📌 電流がつくる磁場のマスター公式
* **直線電流**:
  $$H = \frac{I}{2\pi r}$$
* **円形電流（中心）**:
  $$H = \frac{I}{2r}$$
* **ソレノイド（内部一様）**:
  $$H = n I \quad (n \text{ は単位長さあたりの巻き数})$$
* **平行電流間の力**:
  $$f = \frac{\mu_0 I_1 I_2}{2\pi r} \quad [\text{N/m}]$$
  （※同方向は引力、逆方向は斥力）
:::

<!--@include: ../parts/notice.md-->
