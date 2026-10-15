---
title: 等加速度直線運動の3公式とv-tグラフの読み方【高校物理シミュレーター】
description: 等加速度直線運動の定義、3公式（v = v₀ + at, x = v₀t + ½at², v² - v₀² = 2ax）の完全導出、v-tグラフの傾きと面積の徹底活用法を動くシミュレーションで完全マスター
---

# 🏎️ 等加速度直線運動の3公式とv-tグラフの読み方

高校物理の最初の一歩であり、力学全体の土台となるのが**等加速度直線運動**です。
多くの受験生が「3つの公式を丸暗記しようとして符号ミスや適用ミスで失点」してしまいます。

しかし、**$v$-$t$ グラフ（速度と時間のグラフ）**の仕組みを一度マスターすれば、公式を覚える必要すらなくなります！
リアルタイムシミュレーターで、直線を走る車と $v$-$t$ グラフの連動を体感してみましょう。

---

## 🧪 インタラクティブ実験室

<AccelerationSim />

::: tip 実験のポイント
1. **$v$-$t$ グラフの傾き**:
   * 加速度 $a$ を大きくすると、$v$-$t$ グラフの直線の傾きが急になります。
   * 加速度 $a < 0$（ブレーキ）のときは右下がりの直線になり、やがて速度が $0$（停止）を通過して逆走（マイナス方向）します。
2. **$v$-$t$ グラフの面積**:
   * 時間軸（$v=0$）と直線の間の**水色に塗られた面積**が、そのまま**変位 $x$（移動距離）**になります！
3. **公式③の検証**:
   * 統計カードの「$v^2 - v_0^2$」と「$2ax$」が常に完全に一致していることを確認してください。
:::

---

## 1. 等加速度直線運動の定義

一直線上を、**加速度 $a$（1秒あたりの速度変化量）が常に一定**で進む運動を等加速度直線運動といいます。

* **初速度 $v_0\,[\text{m/s}]$**: 時刻 $t=0$ での速度。
* **加速度 $a\,[\text{m/s}^2]$**: 1秒あたりに速度がどれだけ増えるか（負なら減る）。
* **時刻 $t\,[\text{s}]$ での速度 $v\,[\text{m/s}]$**
* **時刻 $t\,[\text{s}]$ までの変位 $x\,[\text{m}]$**

---

## 2. 等加速度直線運動の3大公式

$$
\begin{aligned}
\text{①} \quad & \boxed{v = v_0 + at} \\
\text{②} \quad & \boxed{x = v_0 t + \frac{1}{2}at^2} \\
\text{③} \quad & \boxed{v^2 - v_0^2 = 2ax}
\end{aligned}
$$

### どの公式を使うかの選び方（判定チャート）
問題文に書かれている値と、求めたい値を書き出し、**「時間 $t$」の有無**に注目します：

| 条件 | 使う公式 | 理由 |
| :--- | :---: | :--- |
| **時間 $t$ が関係し、$x$ が不要** | **公式①** | $x$ を含まない最短の式 |
| **変位 $x$ を求めたい（時間 $t$ あり）** | **公式②** | 変位 $x$ を直接計算できる |
| **時間 $t$ が与えられておらず、不要** | **公式③** | **$t$ を消去したウラ技公式！** |

---

## 3. 最強の武器「v-tグラフ」の2大原則

高校物理・共通テストにおいて、$v$-$t$ グラフは計算を大幅に省略できる最強の解法ツールです。

<div class="vector-graph-card">
<svg viewBox="0 0 540 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="vtGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
    </linearGradient>
    <marker id="arrowVt" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#a1a1aa"/>
    </marker>
    <marker id="arrowCyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#38bdf8"/>
    </marker>
  </defs>

  <!-- 背景方眼 -->
  <line x1="70" y1="50" x2="490" y2="50" stroke="#27272a" stroke-dasharray="3,3"/>
  <line x1="70" y1="110" x2="490" y2="110" stroke="#27272a" stroke-dasharray="3,3"/>
  <line x1="70" y1="170" x2="490" y2="170" stroke="#27272a" stroke-dasharray="3,3"/>
  <line x1="210" y1="30" x2="210" y2="230" stroke="#27272a" stroke-dasharray="3,3"/>
  <line x1="350" y1="30" x2="350" y2="230" stroke="#27272a" stroke-dasharray="3,3"/>

  <!-- 台形面積の塗りつぶし -->
  <polygon points="70,230 70,150 370,60 370,230" fill="url(#vtGrad)"/>

  <!-- 補助点線 -->
  <line x1="70" y1="60" x2="370" y2="60" stroke="#71717a" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="70" y1="150" x2="370" y2="150" stroke="#71717a" stroke-width="1.5" stroke-dasharray="4,4"/>
  <line x1="370" y1="60" x2="370" y2="230" stroke="#71717a" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- 座標軸 -->
  <line x1="50" y1="230" x2="500" y2="230" stroke="#a1a1aa" stroke-width="2" marker-end="url(#arrowVt)"/>
  <line x1="70" y1="250" x2="70" y2="25" stroke="#a1a1aa" stroke-width="2" marker-end="url(#arrowVt)"/>

  <!-- 軸ラベル -->
  <text x="510" y="234" fill="#f4f4f5" font-size="13" font-weight="600" font-family="sans-serif">t [s]</text>
  <text x="70" y="16" fill="#f4f4f5" font-size="13" font-weight="600" font-family="sans-serif" text-anchor="middle">v [m/s]</text>
  <text x="58" y="246" fill="#71717a" font-size="12" font-family="sans-serif">O</text>
  <text x="52" y="154" fill="#38bdf8" font-size="13" font-weight="600" font-family="sans-serif">v₀</text>
  <text x="54" y="64" fill="#38bdf8" font-size="13" font-weight="600" font-family="sans-serif">v</text>
  <text x="370" y="248" fill="#e4e4e7" font-size="13" font-weight="600" font-family="sans-serif" text-anchor="middle">t</text>

  <!-- v-t グラフ直線 -->
  <line x1="70" y1="150" x2="420" y2="45" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>

  <!-- 代表点マーカー -->
  <circle cx="70" cy="150" r="5" fill="#38bdf8"/>
  <circle cx="370" cy="60" r="5" fill="#38bdf8"/>

  <!-- 面積ラベル -->
  <text x="220" y="155" fill="#38bdf8" font-size="14" font-weight="700" font-family="sans-serif" text-anchor="middle">台形の面積 ＝ 変位 x</text>
  <text x="220" y="178" fill="#bae6fd" font-size="12" font-family="sans-serif" text-anchor="middle">x = v₀t + ½at²</text>

  <!-- 傾きラベルと三角ガイド -->
  <polygon points="260,150 370,150 370,60" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="315" y="166" fill="#fbbf24" font-size="11" font-family="sans-serif" text-anchor="middle">Δt = t</text>
  <text x="382" y="110" fill="#fbbf24" font-size="11" font-family="sans-serif">Δv = at</text>
  <path d="M 330,85 Q 360,70 410,75" fill="none" stroke="#fbbf24" stroke-width="1.5" marker-end="url(#arrowCyan)"/>
  <text x="420" y="80" fill="#fbbf24" font-size="12" font-weight="700" font-family="sans-serif">傾き ＝ 加速度 a</text>
  <text x="420" y="96" fill="#a1a1aa" font-size="11" font-family="sans-serif">a = (v - v₀)/t</text>
</svg>
<div class="graph-caption">図: 等加速度直線運動の <strong>v-t グラフ</strong>（傾き＝加速度 $a$、台形面積＝移動距離・変位 $x$）</div>
</div>

### 原則①：直線の傾きは「加速度 $a$」を表す
傾きの定義は「縦の変化量 $\div$ 横の変化量」なので：
$$
\text{傾き} = \frac{v - v_0}{t - 0} = a \quad \implies \quad v = v_0 + at \quad (\text{公式①})
$$

### 原則②：グラフと時間軸で囲まれた面積は「変位 $x$」を表す
時刻 $0$ から $t$ までの台形の面積を計算すると：
$$
\text{台形の面積} = \frac{(\text{上底 } v_0 + \text{下底 } v) \times \text{高さ } t}{2}
$$
ここに公式① $v = v_0 + at$ を代入すると：
$$
x = \frac{(v_0 + (v_0 + at)) \cdot t}{2} = \frac{2v_0 t + at^2}{2} = v_0 t + \frac{1}{2}at^2 \quad (\text{公式②})
$$

::: important 平均の速度 $v_{\text{ave}}$ を使う時短テクニック
等加速度運動では、平均速度は初速と終速の真ん中（相加平均）になります：
$$
v_{\text{ave}} = \frac{v_0 + v}{2}
$$
これを使うと、移動距離は単に **$x = v_{\text{ave}} \times t$** だけで瞬時に計算できます！
:::

---

## 4. 公式③ $v^2 - v_0^2 = 2ax$ の導出

公式① $v = v_0 + at$ より、時間を求めると：
$$
t = \frac{v - v_0}{a}
$$
これを公式② $x = \frac{v_0 + v}{2} t$ に代入します：
$$
x = \left(\frac{v + v_0}{2}\right) \left(\frac{v - v_0}{a}\right) = \frac{v^2 - v_0^2}{2a}
$$
両辺に $2a$ をかけると：
$$
\boxed{v^2 - v_0^2 = 2ax}
$$

::: tip なぜ公式③がこれほど重宝されるのか？
「$10\,\text{m/s}$ で走る車が急ブレーキをかけ、加速度 $-2.0\,\text{m/s}^2$ で停止するまでの制動距離は？」という問題。  
停止するので $v = 0$。公式③にそのまま代入すると：
$$
0^2 - 10^2 = 2(-2.0)x \implies -100 = -4.0x \implies x = 25\,\text{m}
$$
**時間を一切計算することなく、たった1行で解けます！**
:::

---

## 5. 重力による等加速度運動（自由落下・投げ上げ）

鉛直方向の運動では、空気抵抗を無視すると、すべての物体が一定の**重力加速度 $g \approx 9.8\,\text{m/s}^2$** で落下します。

| 運動の種類 | 初速度 | 加速度 | 公式① ($v$) | 公式② ($y$) | 公式③ |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **自由落下**（下向き正） | $v_0 = 0$ | $a = g$ | $v = gt$ | $y = \frac{1}{2}gt^2$ | $v^2 = 2gy$ |
| **鉛直投げ下ろし**（下向き正） | $v_0 > 0$ | $a = g$ | $v = v_0 + gt$ | $y = v_0 t + \frac{1}{2}gt^2$ | $v^2 - v_0^2 = 2gy$ |
| **鉛直投げ上げ**（上向き正） | $v_0 > 0$ | $a = -g$ | $v = v_0 - gt$ | $y = v_0 t - \frac{1}{2}gt^2$ | $v^2 - v_0^2 = -2gy$ |

::: warning 投げ上げの最重要ポイント
1. **最高点**: 一瞬静止するので **$v = 0$**。
   * 最高点到達時間：$0 = v_0 - gt_1 \implies t_1 = \frac{v_0}{g}$
   * 最高点高度：$0^2 - v_0^2 = -2gy_{\max} \implies y_{\max} = \frac{v_0^2}{2g}$
2. **元の高さに戻る時間**: $y = 0$ より $t_2 = \frac{2v_0}{g} = 2t_1$（**上りと下りの時間は完全に対称**）。
:::

---

## 📚 関連テーマ
* 🚀 [斜方投射（放物運動の公式・軌道シミュレーター）](/mechanics/projectile)
* 🔩 [ばねの単振動と力学的エネルギー保存則](/mechanics/spring)
* 💥 [運動量保存則と反発係数](/mechanics/momentum)
