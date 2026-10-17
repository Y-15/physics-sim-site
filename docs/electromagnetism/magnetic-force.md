---
title: 電磁力と平行電流間に働く力（アンペール力）の完全導出
description: 高校物理・共通テスト・二次試験頻出「電磁力と平行電流間に働く力」。アンペールの力F=IBL、直線電流の磁場B=μ0I/(2πr)、平行電流の単位長さあたりの力f=μ0I1I2/(2πr)の導出、同方向電流（引力）と逆方向電流（斥力）の物理的メカニズム、1アンペアの定義をシミュレータと図解で徹底解説！
---

# 電磁力と平行電流間に働く力（アンペール力）

磁場の中に置かれた導線に電流を流すと、導線は磁場から力を受けます。
この力を**「電磁力（アンペール力 / Ampère force）」**と呼びます。

この原理を応用して、2本の長い平行な導線に電流を流すと、それぞれの電流がつくる磁場によって、導線同士が互いに力を及ぼし合います。

驚くべきことに、
- **同じ向きに流れる電流同士は「引き合い（引力）」**
- **逆向きに流れる電流同士は「反発し合う（斥力）」**

という性質をもちます。これは電荷のクーロン力（同種電荷は反発、異種電荷は引き合う）と**真逆の振る舞い**をするため、初学者が最も混乱しやすい重要テーマです。

<ClientOnly>
  <MagneticForceSim />
</ClientOnly>

---

## 1. 電流が受ける電磁力（アンペールの力）の公式

一様な磁場 $B$ [T] の中に置かれた長さ $L$ [m] の導線に電流 $I$ [A] を流すとき、導線が受ける電磁力 $F$ [N] の大きさは：

$$
F = I B L \sin\theta
$$

ここで $\theta$ は電流の向きと磁場の向きがなす角です。
電流と磁場が垂直（$\theta = 90^\circ$）のとき、力は最大値をとります。

$$
F = I B L
$$

力の向きは**「フレミングの左手の法則」**（中指：電流 $I$、人差し指：磁場 $B$、親指：力 $F$）または**「右手のひらの法則」**によって決まります。

---

## 2. 直線電流がつくる磁場（アンペールの法則）

真空中で、十分長い直線導線に電流 $I_1$ を流すと、導線から距離 $r$ 離れた点に形成される磁場 $B_1$ の強さは次のようになります。

$$
B_1 = \frac{\mu_0 I_1}{2\pi r} \quad [\text{T}]
$$

- $\mu_0$: 真空の透磁率（$\mu_0 = 4\pi \times 10^{-7}\,\text{N/A}^2$）
- 向き：電流の向きに右手の親指を向けたとき、残り4本の指が巻きつく向き（**右ねじの法則**）

---

## 3. 平行電流間に働く力の完全導出

距離 $r$ だけ離して平行に置かれた2本の導線1、導線2を考えます。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 220" class="academic-svg" aria-label="平行電流間に働く力のベクトル図解">
    <defs>
      <marker id="wire-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="wire-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
      <marker id="dim-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
      </marker>
    </defs>

    <!-- 導線1 -->
    <line x1="140" y1="20" x2="140" y2="200" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
    <line x1="140" y1="110" x2="140" y2="60" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#wire-arrow-blue)" />
    <text x="140" y="45" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">I₁ (上向き)</text>
    <text x="140" y="215" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">導線1</text>

    <!-- 導線2 -->
    <line x1="380" y1="20" x2="380" y2="200" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
    <line x1="380" y1="110" x2="380" y2="60" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#wire-arrow-blue)" />
    <text x="380" y="45" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">I₂ (上向き)</text>
    <text x="380" y="215" fill="#94a3b8" font-size="11" font-weight="bold" text-anchor="middle">導線2</text>

    <!-- 距離 r 寸法線 -->
    <line x1="140" y1="150" x2="380" y2="150" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
    <line x1="140" y1="150" x2="160" y2="150" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#dim-arrow)" />
    <line x1="380" y1="150" x2="360" y2="150" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#dim-arrow)" />
    <text x="260" y="142" fill="#94a3b8" font-size="13" font-weight="bold" text-anchor="middle">距離 r</text>

    <!-- 導線1が導線2の位置につくる磁場 B1 (奥向き ⊗) -->
    <g transform="translate(380, 100)">
      <circle cx="0" cy="0" r="14" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2" />
      <line x1="-7" y1="-7" x2="7" y2="7" stroke="#ef4444" stroke-width="2" />
      <line x1="7" y1="-7" x2="-7" y2="7" stroke="#ef4444" stroke-width="2" />
    </g>
    <text x="410" y="105" fill="#ef4444" font-size="12" font-weight="bold">B₁ = μ₀I₁ / (2πr)</text>
    <text x="410" y="122" fill="#94a3b8" font-size="11">（紙面奥向き ⊗）</text>

    <!-- 導線2が受ける引力 F2 -->
    <line x1="380" y1="100" x2="300" y2="100" stroke="#ef4444" stroke-width="2.5" marker-end="url(#wire-arrow-red)" />
    <text x="330" y="90" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">引力 F₂</text>

    <!-- 導線1が受ける反作用引力 F1 -->
    <line x1="140" y1="100" x2="220" y2="100" stroke="#ef4444" stroke-width="2.5" marker-end="url(#wire-arrow-red)" />
    <text x="180" y="90" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">引力 F₁</text>
  </svg>
  <div class="diagram-caption">図: 同方向に流れる2本の平行電流間に働く引力（アンペールの力）のメカニズム</div>
</div>

1. **導線1が導線2の位置につくる磁場 $B_1$**:
   $$
   B_1 = \frac{\mu_0 I_1}{2\pi r}
   $$
2. **磁場 $B_1$ から導線2（長さ $L$）が受ける力 $F_2$**:
   電磁力の公式 $F = I B L$ より：
   $$
   F_2 = I_2 B_1 L = I_2 \left(\frac{\mu_0 I_1}{2\pi r}\right) L = \frac{\mu_0 I_1 I_2 L}{2\pi r}
   $$
3. **単位長さあたりに働く力 $f$**:
   両辺を長さ $L$ で割ると、単位長さ（1mあたり）に働く力 $f$ が導かれます。

$$
f = \frac{F_2}{L} = \frac{\mu_0 I_1 I_2}{2\pi r} \quad [\text{N/m}]
$$

数値としては、$\frac{\mu_0}{2\pi} = 2 \times 10^{-7}$ であるため：

$$
f = 2 \times 10^{-7} \frac{I_1 I_2}{r} \quad [\text{N/m}]
$$

### 作用・反作用の法則（$\vec{F}_1 = -\vec{F}_2$）
導線2の電流 $I_2$ もまた導線1の位置に磁場 $B_2 = \frac{\mu_0 I_2}{2\pi r}$ をつくります。
導線1が受ける力 $F_1$ を計算すると、全く同一の式 $\frac{\mu_0 I_1 I_2 L}{2\pi r}$ となり、**向きは真逆**になります。
したがって、2本の導線に働く力は常に**作用・反作用のペア**（大きさが等しく逆向き）です。

---

## 4. 引力と斥力の物理的メカニズム（なぜ引き合うのか？）

### ① 同方向の電流 $\implies$ 引力（引き合う）
2本の導線の間にできる磁場に注目すると、2つの右ねじの回転が**中央部で互いに逆向きになり打ち消し合います**。
その結果、導線の間（内側）の磁場が弱くなり、外側の磁場が強くなるため、**磁力線の張力によって2本の導線は引き寄せられます（引力）**。

### ② 逆方向の電流 $\implies$ 斥力（反発する）
中央部で2つの右ねじの磁場が**同じ向きに重なり合って強め合います**。
導線の間（内側）の磁場が極めて高密度になるため、**磁力線同士の横方向の反発圧力によって導線は押し広げられます（斥力）**。

---

## 5. かつての「1アンペア（A）」の国際基準定義

国際単位系（SI）において、2019年に電気素量 $e$ の定義値に基づく改定が行われるまで、電流の基本単位「1アンペア」はこの平行電流の力を用いて定義されていました。

> **旧SIにおける1アンペアの定義**:
> 真空中に $1\,\text{m}$ の間隔で平行に置かれた無限に長い2本の直線導線に、それぞれ等しい電流を流したとき、導線 $1\,\text{m}$ あたりに $2 \times 10^{-7}\,\text{N}$ の力が働くときの電流の強さを $1\,\text{A}$ とする。

---

## 6. 実戦入試演習問題

### 【基本演習】平行電流間に働く力と磁場の重ね合わせ

#### 【問題】
真空中において、$20\,\text{cm}$ 離して平行に固定された十分に長い2本の導線 A, B がある。
導線 A には上向きに $I_A = 6.0\,\text{A}$、導線 B には上向きに $I_B = 4.0\,\text{A}$ の電流が流れている。
真空の透磁率を $\mu_0 = 4\pi \times 10^{-7}\,\text{N/A}^2$ とする。

1. 導線 B の長さ $0.50\,\text{m}$ の部分が受ける電磁力の大きさと向きを求めよ。
2. 導線 A, B を含む平面上で、A と B の間に第3の導線 C を平行に置く。導線 C に上向きに電流 $I_C = 2.0\,\text{A}$ を流したとき、導線 C に働く電磁力の合力がゼロになる位置は、導線 A から何 $\text{cm}$ 離れた点か。

---

#### 【解答・解説】

##### 1. 導線 B が受ける力
導線 A の電流がつくる、導線 B の位置での磁場 $B_A$ は：

$$
B_A = \frac{\mu_0 I_A}{2\pi r} = 2 \times 10^{-7} \times \frac{6.0}{0.20} = 6.0 \times 10^{-6}\,\text{T}
$$

向きは右ねじの法則より紙面の「裏から表（手前向き）」。
長さ $L = 0.50\,\text{m}$ の導線 B が受ける力 $F$ は：

$$
F = I_B B_A L = 4.0 \times (6.0 \times 10^{-6}) \times 0.50 = \mathbf{1.2 \times 10^{-5}\,\text{N}}
$$

電流の向きがともに上向き（同方向）であるため、向きは導線 A に近づく向き（**引力：左向き**）です。

##### 2. 合力がゼロになる導線 C の位置
導線 A から導線 C までの距離を $x$ [m] とすると、導線 B から導線 C までの距離は $0.20 - x$ [m] です。
同方向の電流は引き合うため：
- 導線 A からは左向きの引力 $F_{CA} = \frac{\mu_0 I_C I_A L}{2\pi x}$ を受けます。
- 導線 B からは右向きの引力 $F_{CB} = \frac{\mu_0 I_C I_B L}{2\pi (0.20 - x)}$ を受けます。

これらがつり合う条件は：

$$
\frac{I_A}{x} = \frac{I_B}{0.20 - x}
$$

数値を代入すると：

$$
\frac{6.0}{x} = \frac{4.0}{0.20 - x} \implies 6.0(0.20 - x) = 4.0 x
$$

$$
1.20 - 6.0 x = 4.0 x \implies 10.0 x = 1.20 \implies x = 0.12\,\text{m} = \mathbf{12\,\text{cm}}
$$

したがって、導線 A から **$12\,\text{cm}$** 離れた位置（導線 B からは $8\,\text{cm}$）で力が完全につり合います。

---

### 【最難関大・発展演習】重力場と一様磁場中における荷電粒子のサイクロイド運動と床面衝突

高校物理（「物理基礎」および「物理」）の学習指導要領の範囲内で解くことができるものの、**微積分を使わずに解くには深い物理的洞察力（座標系の変換・力積と運動量・エネルギー保存則の有機的な結合）が求められる難関大入試レベルの記述式難問**です。

<div style="text-align: center; margin: 20px 0;">
  <svg viewBox="0 0 700 240" style="max-width: 100%; height: auto; background: #0c0e14; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
    <!-- Grid lines -->
    <defs>
      <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="arrowRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
    </defs>
    <rect width="700" height="240" fill="url(#gridPattern)" />
    
    <!-- Axes -->
    <line x1="50" y1="70" x2="660" y2="70" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" marker-end="url(#arrow)" />
    <text x="665" y="74" fill="#a1a1aa" font-size="12" font-family="sans-serif">x</text>
    <line x1="90" y1="220" x2="90" y2="20" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" marker-end="url(#arrow)" />
    <text x="86" y="16" fill="#a1a1aa" font-size="12" font-family="sans-serif">y</text>
    <circle cx="90" cy="70" r="3" fill="#fff" />
    <text x="70" y="65" fill="#a1a1aa" font-size="11" font-family="sans-serif">O(0,0)</text>

    <!-- Gravity & B field symbols -->
    <line x1="600" y1="25" x2="600" y2="55" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrowRed)" />
    <text x="612" y="44" fill="#f43f5e" font-size="11" font-weight="bold" font-family="sans-serif">g (重力)</text>
    <text x="560" y="25" fill="#38bdf8" font-size="12" font-weight="bold" font-family="monospace">⊗ B (紙面奥向き)</text>
    <text x="240" y="35" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>

    <!-- Floor line y = -R -->
    <line x1="50" y1="150" x2="660" y2="150" stroke="#f59e0b" stroke-width="2.5" />
    <text x="520" y="142" fill="#f59e0b" font-size="12" font-weight="bold" font-family="sans-serif">床面 y = -R</text>
    <line x1="70" y1="70" x2="70" y2="150" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" />
    <text x="55" y="115" fill="#f59e0b" font-size="11" font-family="sans-serif">R</text>

    <!-- Cycloid arc 1: O to P1 -->
    <!-- R = 80px. omega*t1 = pi/2 -> x1 = R*(pi/2 - 1) = 80*(0.5708) = 45.6px. cx = 90 + 45.6 = 135.6, cy = 150 -->
    <path d="M 90 70 C 90 110, 110 150, 135.6 150" fill="none" stroke="#22d3ee" stroke-width="2.5" />
    <circle cx="135.6" cy="150" r="4" fill="#f59e0b" />
    <text x="125" y="168" fill="#f59e0b" font-size="11" font-weight="bold" font-family="sans-serif">P₁ (第1衝突)</text>

    <!-- Bounce 1: P1 to P2 -->
    <!-- Delta X = (pi - 2)*R = 80*1.1416 = 91.3px. cx2 = 135.6 + 91.3 = 226.9, cy2 = 150. Max height reaches y = 0 (cy = 70) -->
    <path d="M 135.6 150 C 145 90, 160 70, 181.2 70 C 202 70, 218 90, 226.9 150" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-dasharray="4,2" />
    <circle cx="226.9" cy="150" r="4" fill="#f59e0b" />
    <text x="216" y="168" fill="#f59e0b" font-size="11" font-weight="bold" font-family="sans-serif">P₂ (第2衝突)</text>

    <!-- Bounce 2: P2 to P3 (with e < 1 damping) -->
    <path d="M 226.9 150 C 235 110, 250 95, 268 95 C 285 95, 298 110, 305 150" fill="none" stroke="#38bdf8" stroke-width="2" />
    <circle cx="305" cy="150" r="3.5" fill="#f59e0b" />
    <text x="296" y="168" fill="#f59e0b" font-size="11" font-family="sans-serif">P₃</text>

    <!-- Settling arrow -->
    <path d="M 305 150 Q 340 150, 480 150" fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="2,2" />
    <line x1="480" y1="150" x2="520" y2="150" stroke="#10b981" stroke-width="3" marker-end="url(#arrow)" />
    <text x="350" y="138" fill="#10b981" font-size="11" font-weight="bold" font-family="sans-serif">n → ∞：床面上を速さ V₀ で等速直線運動（垂直抗力 N = 0）</text>

    <!-- Initial particle -->
    <circle cx="90" cy="70" r="5" fill="#38bdf8" stroke="#fff" stroke-width="1.5" />
    <text x="98" y="85" fill="#38bdf8" font-size="11" font-weight="bold" font-family="sans-serif">q, m (静止放流)</text>
  </svg>
</div>

<ClientOnly>
  <CycloidBounceSim />
</ClientOnly>

#### 【問題文】
鉛直上向きに $y$ 軸、水平右向きに $x$ 軸をとる $xy$ 平面を考える。空間全体には、$xy$ 平面に垂直で手前から奥に向かう向き（$-z$ 向き）に、磁束密度の大きさ $B$ の一様な磁場がかかっている。また、重力加速度の大きさを $g$ とし、重力は $-y$ 向きにはたらくものとする。

質量 $m$、電気量 $q$（$q$ は正）の小さな荷電粒子（質点とみなす）を、時刻 $t = 0$ に原点 $\mathrm{O}(0, 0)$ から運動させる。空気抵抗や荷電粒子の運動に伴う電磁波の放射は無視できるものとする。

##### 設問 (1)：等速直線運動の条件
まず、空間に床や壁がない場合を考える。時刻 $t = 0$ に原点 $\mathrm{O}(0, 0)$ から $+x$ 向きにある速さ $V_0$ で荷電粒子を打ち出したところ、粒子は $x$ 軸上を一定の速さ $V_0$ で等速直線運動し続けた。この速さ $V_0$ を $m, g, q, B$ を用いて表せ。

##### 設問 (2)：初速度 $0$ で静かに放した場合の運動
引き続き、空間に床や壁がない場合を考える。時刻 $t = 0$ に原点 $\mathrm{O}(0, 0)$ で荷電粒子を初速度 $0$ で静かに放した。
設問 (1) で求めた速さ $V_0$ で $+x$ 向きに等速直線運動する観測者（慣性系 $\mathrm{S}'$）から見た粒子の相対速度に着目することで、次の値を $m, g, q, B$ を用いて表せ。
- (a) 粒子が到達する最も低い位置の $y$ 座標 $y_{\min}$
- (b) 粒子が放たれてから最初に高さ $y = 0$ に戻ってくる時刻 $t_0$ と、そのときの $x$ 座標 $x_0$

##### 設問 (3)：水平な絶縁体の床との最初の衝突
ここからは、$y = -R$（ただし $R = \dfrac{m^2 g}{q^2 B^2}$）の位置に、$x$ 軸に平行でなめらかな（摩擦のない）電気を通さない水平な床を設置する。荷電粒子が床と衝突しても電気量 $q$ は失われないものとする。

時刻 $t = 0$ に原点 $\mathrm{O}(0, 0)$ から初速度 $0$ で粒子を静かに放したとき、粒子が最初に床（$y = -R$）に衝突する時刻 $t_1$、衝突点 $\mathrm{P}_1$ の $x$ 座標 $x_1$、および衝突直前の速度の $x$ 成分 $v_{1x}$・$y$ 成分 $v_{1y}$ をそれぞれ $m, g, q, B$ を用いて表せ。

##### 設問 (4)：弾性衝突を繰り返す場合の周期運動
粒子と床との間の反発係数（はね返り係数）が $e = 1$（弾性衝突）であるとする。
1回目の衝突後、粒子が再び床に衝突する点 $\mathrm{P}_2$ までの水平移動距離 $\Delta X = x_2 - x_1$ と、1回目の衝突から2回目の衝突までの経過時間 $\Delta T$ を $m, g, q, B$ を用いて表せ。また、1回目の衝突から2回目の衝突までの間に粒子が達する最高点の $y$ 座標 $y_{\max, 1}$ を答えよ。

##### 設問 (5)：非弾性衝突を繰り返す場合と十分時間が経過した後の運動
粒子と床との間の反発係数が $e$（ただし $e$ は $0$ より大きく $1$ より小さい定数）であるとする。
- (a) $x$ 方向の運動方程式において、微小時間 $\Delta t$ の間の速度変化 $\Delta v_x$ と高さの変化 $\Delta y = v_y \Delta t$ の関係に着目することで、粒子が何回衝突を繰り返した後であっても、床（$y = -R$）に達した瞬間の速度の $x$ 成分は常に設問 (1) の $V_0$ に等しいことを示せ。
- (b) $n$ 回目の衝突直後から $(n+1)$ 回目の衝突直前までの飛行時間 $\Delta T_n$ と水平移動距離 $\Delta X_n$ を $m, g, q, B, e, n$ のうち必要なものを用いて表せ。また、衝突を無限回繰り返して十分時間が経過した後（$n \to \infty$）、粒子はどのような運動に落ち着くか、床から受ける垂直抗力の大きさとあわせて答えよ。

---

<details class="tip">
<summary><strong>💡 思考のヒント・着眼点（クリックして開く）</strong></summary>

1. **設問 (2) の座標変換（ドリフト系への移行）**
   静止系（実験室系 $\mathrm{S}$）での粒子の速度 $\vec{v} = (v_x, v_y)$ を、速さ $V_0$ で $+x$ 向きに動く慣性系 $\mathrm{S}'$ から見た相対速度 $\vec{u} = (u_x, u_y)$ を用いて $v_x = V_0 + u_x, \, v_y = u_y$ と表してみましょう。運動方程式に代入すると、重力項 $mg$ がローレンツ力の定数項 $q V_0 B$ と完全に相殺し、系 $\mathrm{S}'$ では**単純な等速円運動**になります。
2. **設問 (4) の衝突直後の相対速度ベクトル**
   床（$y = -R$）で跳ね返った直後の速度 $(v_{1x}', v_{1y}')$ を、動く慣性系 $\mathrm{S}'$ から見た相対速度 $\vec{u}_1' = (v_{1x}' - V_0, \, v_{1y}')$ に変換してみてください。$\vec{u}_1'$ がどの向きを向いているかに気づけば、衝突後の軌道が一目瞭然になります。
3. **設問 (5) の $x$ 方向運動量と高さ $y$ の関係**
   床はなめらかなので、衝突の瞬間には $x$ 方向の力積を受けません。また飛行中は $m \dfrac{\Delta v_x}{\Delta t} = -q B v_y = -q B \dfrac{\Delta y}{\Delta t}$ が成り立ちます。
</details>

---

#### 【解答・完全解説】

##### 設問 (1) の解説
粒子が $+x$ 向きに速さ $V_0$ で運動するとき、フレミングの左手の法則（または $\vec{F} = q(\vec{v} \times \vec{B})$）より、ローレンツ力は $+y$ 向き（鉛直上向き）にはたらき、その大きさは $q V_0 B$ である。
粒子が $x$ 軸上を等速直線運動し続けるためには、鉛直方向の力がつり合っていればよいので、

$$
q V_0 B - mg = 0
$$

これより、求める速さ $V_0$ は以下のようになる。

$$
\mathbf{V_0 = \frac{mg}{qB}}
$$

##### 設問 (2) の解説
時刻 $t$ における粒子の速度を $\vec{v} = (v_x, v_y)$、加速度を $\vec{a} = (a_x, a_y)$ とすると、速度の $x$ 成分 $v_x$ によるローレンツ力は $+y$ 向きに $q B v_x$、速度の $y$ 成分 $v_y$ によるローレンツ力は $-x$ 向きに $q B v_y$ はたらく。したがって運動方程式は以下のようになる。

$$
m a_x = -q B v_y
$$

$$
m a_y = q B v_x - mg
$$

ここで、$+x$ 向きに一定の速さ $V_0 = \dfrac{mg}{qB}$ で動く観測者（慣性系 $\mathrm{S}'$）から見た粒子の相対速度を $\vec{u} = (u_x, u_y)$ とおくと、

$$
v_x = V_0 + u_x, \quad v_y = u_y
$$

が成り立つ。$V_0$ は定数なので、系 $\mathrm{S}'$ における加速度も $\vec{a} = (a_x, a_y)$ のままである。これを運動方程式に代入し、$q B V_0 = mg$ を用いると、

$$
m a_x = -q B u_y
$$

$$
m a_y = q B (V_0 + u_x) - mg = q B u_x
$$

となる。これは、**慣性系 $\mathrm{S}'$ から見ると重力が消え、相対速度 $\vec{u}$ に対して常に垂直（反時計回り方向）に大きさ $q B u$ のローレンツ力のみがはたらく等速円運動**であることを示している。

時刻 $t = 0$ において、実験室系での初速度は $(0, 0)$ なので、慣性系 $\mathrm{S}'$ における初速度は、

$$
\vec{u}(0) = (-V_0, 0)
$$

である。したがって、系 $\mathrm{S}'$ において粒子は速さ $V_0$ で反時計回りの等速円運動を行う。この円運動の半径を $R$、角速度を $\omega$ とすると、

$$
\omega = \frac{qB}{m}, \quad R = \frac{m V_0}{qB} = \frac{m^2 g}{q^2 B^2}
$$

となる。時刻 $t = 0$ で粒子は円の最高点 $(0, 0)$ におり、$-x$ 向きに動き始めるため、時刻 $t$ における系 $\mathrm{S}'$ での位置 $(x'(t), y'(t))$ は中心 $(0, -R)$ の円軌道となり、

$$
x'(t) = -R \sin(\omega t), \quad y'(t) = -R(1 - \cos(\omega t))
$$

と表される。実験室系 $\mathrm{S}$ での位置 $(x(t), y(t))$ は、これに $V_0 t = R \omega t$ を加えて、

$$
x(t) = R(\omega t - \sin(\omega t)), \quad y(t) = -R(1 - \cos(\omega t))
$$

となる（サイクロイド曲線）。

- **(a) 最も低い位置の $y$ 座標 $y_{\min}$**  
  $\cos(\omega t) = -1$ のとき最も低くなるので、
  
  $$
  \mathbf{y_{\min} = -2R = -\frac{2m^2 g}{q^2 B^2}}
  $$

- **(b) 最初に $y = 0$ に戻る時刻 $t_0$ と $x$ 座標 $x_0$**  
  円運動の1周期分 $\omega t_0 = 2\pi$ のとき最初に $y = 0$ に戻るので、
  
  $$
  \mathbf{t_0 = \frac{2\pi}{\omega} = \frac{2\pi m}{qB}}
  $$
  
  そのときの $x$ 座標は、
  
  $$
  \mathbf{x_0 = V_0 t_0 = \frac{2\pi m^2 g}{q^2 B^2}}
  $$

##### 設問 (3) の解説
床の位置 $y = -R$ に最初に到達するのは、$y(t) = -R(1 - \cos(\omega t)) = -R$ より、$\cos(\omega t_1) = 0$ となる最初の時刻、すなわち位相が $\omega t_1 = \dfrac{\pi}{2}$（円運動の $\dfrac{1}{4}$ 周期）のときである。

- **衝突時刻 $t_1$：**
  
  $$
  \mathbf{t_1 = \frac{\pi}{2\omega} = \frac{\pi m}{2qB}}
  $$

- **衝突点 $\mathrm{P}_1$ の $x$ 座標 $x_1$：**
  
  $$
  \mathbf{x_1 = R\left(\frac{\pi}{2} - \sin\frac{\pi}{2}\right) = \left(\frac{\pi}{2} - 1\right)\frac{m^2 g}{q^2 B^2}}
  $$

- **衝突直前の速度成分 $(v_{1x}, v_{1y})$：**  
  系 $\mathrm{S}'$ において $\omega t_1 = \dfrac{\pi}{2}$ のとき、粒子は円軌道の最左端を通過中で相対速度は真下向き $\vec{u}(t_1) = (0, -V_0)$ となっている。したがって実験室系 $\mathrm{S}$ での速度は、
  
  $$
  \mathbf{v_{1x} = V_0 + 0 = \frac{mg}{qB}}
  $$
  
  $$
  \mathbf{v_{1y} = -V_0 = -\frac{mg}{qB}}
  $$
  
  （別解：ローレンツ力は仕事をしないため、力学的エネルギー保存則 $\dfrac{1}{2}m(v_{1x}^2 + v_{1y}^2) = mgR$ からも確認できる。）

##### 設問 (4) の解説
床はなめらかで水平であり、反発係数 $e = 1$ であるから、1回目の衝突直後の速度 $(v_{1x}', v_{1y}')$ は、

$$
v_{1x}' = v_{1x} = V_0, \quad v_{1y}' = -v_{1y} = +V_0
$$

となる。
ここで再び、速さ $V_0$ で $+x$ 向きに動く慣性系 $\mathrm{S}'$ から見た衝突直後の相対速度 $\vec{u}_1' = (u_{1x}', u_{1y}')$ を求めると、

$$
u_{1x}' = v_{1x}' - V_0 = 0, \quad u_{1y}' = +V_0
$$

となる。すなわち、**系 $\mathrm{S}'$ において粒子は速さ $V_0$ で鉛直上向き（$+y$ 向き）に打ち出される**。

したがって、系 $\mathrm{S}'$ における衝突後の軌道は、衝突点から半径 $R = \dfrac{V_0}{\omega}$ の円（中心の $y$ 座標は床と同じ $y = -R$ で、衝突点より $R$ だけ左側の点）を反時計回りに描く運動となる。

- **最高点の $y$ 座標 $y_{\max, 1}$：**  
  円の中心の高さが $y = -R$ で半径が $R$ であるため（または弾性衝突で力学的エネルギーが保存されるため）、最高点の $y$ 座標は、
  
  $$
  \mathbf{y_{\max, 1} = -R + R = 0}
  $$

- **2回目の衝突までの経過時間 $\Delta T$：**  
  系 $\mathrm{S}'$ において、$y = -R$ から真上に打ち出された粒子が円の上半分（半円、中心角 $\pi$）を回って再び $y = -R$ に真下向きで戻ってくるまでの時間なので、
  
  $$
  \mathbf{\Delta T = \frac{\pi}{\omega} = \frac{\pi m}{qB}}
  $$

- **水平移動距離 $\Delta X = x_2 - x_1$：**  
  この時間 $\Delta T$ の間に、慣性系 $\mathrm{S}'$ 自体は $+x$ 向きに $V_0 \Delta T = R \omega \cdot \dfrac{\pi}{\omega} = \pi R$ だけ進み、系 $\mathrm{S}'$ の中で粒子は半円の右端から左端へ $-2R$ だけ移動する。よって実験室系での水平移動距離 $\Delta X$ は、
  
  $$
  \mathbf{\Delta X = \pi R - 2R = (\pi - 2)\frac{m^2 g}{q^2 B^2}}
  $$
  
  （なお、2回目の衝突直前の速度も再び $(V_0, -V_0)$ となるため、以降は周期 $\Delta T$、歩幅 $\Delta X$ のバウンド運動を永久に繰り返す。）

##### 設問 (5) の解説

###### (a) 床面上での速度の $x$ 成分が不変であることの証明
飛行中の $x$ 方向の運動方程式 $m \dfrac{\Delta v_x}{\Delta t} = -q B v_y$ の両辺に微小時間 $\Delta t$ を掛けると、$\Delta y = v_y \Delta t$ より、

$$
m \Delta v_x = -q B \Delta y
$$

が成り立つ。
また、床との衝突時には、床がなめらかで水平であるため水平方向の力積は $0$ であり、衝突の前後で $v_x$ は変化しない。
したがって、時刻 $t = 0$（$v_x = 0, \, y = 0$）から任意の時刻 $t$ までのすべての微小変化を足し合わせると、衝突の回数や反発係数 $e$ の値にかかわらず、粒子の位置 $y$ と速度 $v_x$ の間には常に

$$
m v_x - 0 = -q B (y - 0) \implies v_x = -\frac{qB}{m} y
$$

が成り立つ。ゆえに、粒子が床（$y = -R = -\dfrac{m^2 g}{q^2 B^2}$）に達した瞬間には、常に

$$
\mathbf{v_x = \frac{qB}{m} R = \frac{mg}{qB} = V_0}
$$

となる。（証明終）

###### (b) $n$ 回目の衝突後の飛行時間・水平移動距離と最終状態
(a) の結果より、任意の $k$ 回目の衝突において、床（$y = -R$）に衝突する直前・直後の速度の $x$ 成分は常に $v_x = V_0$ である。すなわち、慣性系 $\mathrm{S}'$ における相対速度の $x$ 成分は、床面では常に $u_x = v_x - V_0 = 0$ となる。

1回目の衝突直前の $y$ 方向速度は $v_{1y} = -V_0$ であったから、1回目の衝突直後は $u_{1y}' = e V_0$ である。系 $\mathrm{S}'$ では相対速度 $(0, e V_0)$ で真上に打ち出され、半径 $R_1 = \dfrac{e V_0}{\omega} = e R$ の半円を描いて、2回目の衝突直前には $(0, -e V_0)$ で床に戻ってくる。
これを繰り返すと、**$n$ 回目の衝突直後の系 $\mathrm{S}'$ における相対速度は $(0, e^n V_0)$** となり、粒子は系 $\mathrm{S}'$ において半径

$$
R_n = \frac{e^n V_0}{\omega} = e^n R
$$

の半円（中心角 $\pi$）を描いて $(n+1)$ 回目の衝突に至る。

- **飛行時間 $\Delta T_n$：**  
  円運動の角速度 $\omega = \dfrac{qB}{m}$ は速さに依存しないため、半円を描くのに要する時間は $n$ や $e$ によらず一定となり、
  
  $$
  \mathbf{\Delta T_n = \frac{\pi}{\omega} = \frac{\pi m}{qB}}
  $$

- **水平移動距離 $\Delta X_n$：**  
  時間 $\Delta T_n$ の間に系 $\mathrm{S}'$ は $\pi R$ 進み、系 $\mathrm{S}'$ 内で粒子は半円の直径分 $-2R_n = -2e^n R$ だけ移動するため、
  
  $$
  \mathbf{\Delta X_n = \pi R - 2e^n R = (\pi - 2e^n)\frac{m^2 g}{q^2 B^2}}
  $$

- **十分時間が経過した後の運動（$n \to \infty$）：**  
  $e$ は $0$ より大きく $1$ より小さいため、$n \to \infty$ で $e^n \to 0$ となり、鉛直方向の跳ね返り高さ $R_n = e^n R \to 0$、鉛直方向の速度成分 $v_y \to 0$ に収束する。  
  したがって、十分時間が経過した後は、**床面（$y = -R$）上を $+x$ 向きに一定の速さ $V_0 = \dfrac{mg}{qB}$ で等速直線運動する**。このとき、鉛直上向きのローレンツ力 $q V_0 B = mg$ が重力と完全につり合っているため、**床から受ける垂直抗力の大きさは $0$** となる。

::: tip 🌟 物理的本質のまとめと洞察
1. **重力とローレンツ力の相殺によるドリフト系：**  
   重力 $mg$ と直交磁場 $B$ が存在する空間では、速さ $V_0 = \frac{mg}{qB}$ の水平ドリフト速度で進む慣性系 $\mathrm{S}'$ に乗ると、外見上の重力が完全に打ち消され、単なる「一様磁場中の等速円運動」へと還元されます。
2. **滞空時間 $\Delta T_n$ が一定である理由：**  
   通常の重力下での斜方投射バウンドでは、最高到達高度が $e^{2n}$ で減衰すると滞空時間も $e^n$ で短くなり、有限時間でバウンドが停止します。しかし磁場中では、サイクロトロン角振動数 $\omega = \frac{qB}{m}$ が速さに一切依存しないため、**跳ね返る高さ $e^n R$ がどれほど微小になっても、1回あたりの滞空時間 $\Delta T_n = \frac{\pi m}{qB}$ は永久に変化しません**。
3. **床からの離脱（垂直抗力 $0$）：**  
   跳ね返りが収束した極限（$n \to \infty$）では、粒子は床の上に乗っているように見えますが、上向きのローレンツ力 $q V_0 B$ が重力 $mg$ と完璧にバランスしているため、床をまったく押しません（垂直抗力 $N = 0$）。
:::
