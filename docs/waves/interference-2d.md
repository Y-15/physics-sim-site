---
title: 2波源の波の干渉と双曲線縞
description: 2つの波源から広がる波の強め合い・弱め合いの条件、経路差、腹線・節線の双曲線の幾何学的導出と本数の求め方を完全網羅。
---

# 2波源の波の干渉と双曲線縞

水面波や音波、電磁波など、同一の波長・振幅をもつ2つの波源から同心円状に広がる波が重なり合うとき、場所によって波が強め合って激しく振動する点（**腹**）と、打ち消し合って全く振動しない点（**節**）が規則正しく並びます。

本項では、2波源からの**経路差**に基づく干渉条件の導出、腹線・節線が**双曲線**を描く数学的理由、および入試頻出である「線分上の節の個数」や「平面全体での線の総本数」の求め方を体系的にマスターします。

---

## 1. 2波源干渉のインタラクティブシミュレーター

波源間隔 $d$ や波長 $\lambda$ を自由に変更し、山と谷の重なり合い、および腹線（水色点線）・節線（赤色点線）の双曲線をリアルタイムに観察できます。画面上にマウスを合わせると、その点 $P$ における経路差と干渉判定が表示されます。

<ClientOnly>
  <Interference2dSim />
</ClientOnly>

---

## 2. 干渉の基本原理と経路差

### 2.1 経路差の定義
平面上の2つの波源を $S_1$、$S_2$ とし、観測点を $P$ とします。
波源 $S_1$ から $P$ までの距離を $r_1$、波源 $S_2$ から $P$ までの距離を $r_2$ とするとき、2つの波の**経路差** $\Delta r$ は次のように定義されます。

$$\Delta r = |r_1 - r_2| = |S_1 P - S_2 P|$$

<div class="vector-graph-card">
  <div class="graph-title">図1：2波源 $S_1, S_2$ と観測点 $P$ の経路差</div>
  <svg viewBox="0 0 540 240" class="vector-svg">
    <defs>
      <!-- 背景グリッド -->
      <pattern id="grid-pattern-wave" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
      <!-- 矢印マーカー -->
      <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8"/>
      </marker>
      <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f43f5e"/>
      </marker>
    </defs>
    
    <rect width="540" height="240" fill="#0f172a" rx="8"/>
    <rect width="540" height="240" fill="url(#grid-pattern-wave)" rx="8"/>

    <!-- 波源 S1 からの同心円波 -->
    <circle cx="160" cy="170" r="40" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.3"/>
    <circle cx="160" cy="170" r="80" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.3"/>
    <circle cx="160" cy="170" r="120" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.3"/>
    <circle cx="160" cy="170" r="160" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-opacity="0.2"/>

    <!-- 波源 S2 からの同心円波 -->
    <circle cx="380" cy="170" r="40" fill="none" stroke="#f43f5e" stroke-width="1.2" stroke-opacity="0.3"/>
    <circle cx="380" cy="170" r="80" fill="none" stroke="#f43f5e" stroke-width="1.2" stroke-opacity="0.3"/>
    <circle cx="380" cy="170" r="120" fill="none" stroke="#f43f5e" stroke-width="1.2" stroke-opacity="0.3"/>
    <circle cx="380" cy="170" r="160" fill="none" stroke="#f43f5e" stroke-width="1.2" stroke-opacity="0.2"/>

    <!-- 経路線 S1 -> P -->
    <line x1="160" y1="170" x2="290" y2="50" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3"/>
    <!-- 経路線 S2 -> P -->
    <line x1="380" y1="170" x2="290" y2="50" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 3"/>

    <!-- 垂直二等分線 (m=0 腹線) -->
    <line x1="270" y1="20" x2="270" y2="220" stroke="#06b6d4" stroke-width="1.5" stroke-dasharray="5 3"/>
    <text x="275" y="215" fill="#06b6d4" font-size="11" font-weight="bold">m=0 腹線 (二等分線)</text>

    <!-- 波源 S1 -->
    <circle cx="160" cy="170" r="6" fill="#38bdf8"/>
    <text x="145" y="195" fill="#38bdf8" font-size="13" font-weight="bold">S₁</text>

    <!-- 波源 S2 -->
    <circle cx="380" cy="170" r="6" fill="#f43f5e"/>
    <text x="385" y="195" fill="#f43f5e" font-size="13" font-weight="bold">S₂</text>

    <!-- 点 P -->
    <circle cx="290" cy="50" r="5" fill="#fbbf24"/>
    <text x="298" y="48" fill="#fbbf24" font-size="13" font-weight="bold">P (観測点)</text>

    <!-- 距離ラベル -->
    <text x="200" y="100" fill="#38bdf8" font-size="12">距離 r₁</text>
    <text x="345" y="100" fill="#f43f5e" font-size="12">距離 r₂</text>

    <!-- 波源間隔 d -->
    <line x1="160" y1="210" x2="380" y2="210" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="160" y1="205" x2="160" y2="215" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="380" y1="205" x2="380" y2="215" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="262" y="226" fill="#94a3b8" font-size="12" text-anchor="middle">波源間隔 d</text>
  </svg>
</div>

### 2.2 同位相で振動する場合の干渉条件
波源 $S_1$ と $S_2$ がまったく同じタイミング（**同位相**）で振動している場合：

1. **強め合う条件（腹）**:
   経路差が波長 $\lambda$ の**整数倍**であるとき、山と山、谷と谷が同時に到達し、振幅は最大（$2A$）になります。
   $$|r_1 - r_2| = m\lambda \quad (m = 0, 1, 2, \dots)$$

2. **弱め合う条件（節）**:
   経路差が半波長 $\frac{\lambda}{2}$ の**奇数倍**（波長の半奇数倍）であるとき、山と谷が重なり合って打ち消し合い、振幅は $0$ になります。
   $$|r_1 - r_2| = \left(m + \frac{1}{2}\right)\lambda \quad (m = 0, 1, 2, \dots)$$

### 2.3 逆位相で振動する場合の干渉条件
一方が山を送り出すときにもう一方が谷を送り出す（**逆位相：位相差 $\pi$**）場合、干渉条件は同位相の場合と**完全に逆転**します。

- **強め合う条件（腹）**:
  $$|r_1 - r_2| = \left(m + \frac{1}{2}\right)\lambda \quad (m = 0, 1, 2, \dots)$$
- **弱め合う条件（節）**:
  $$|r_1 - r_2| = m\lambda \quad (m = 0, 1, 2, \dots)$$

特に、$m = 0$ のとき線分 $S_1 S_2$ の垂直二等分線（$\Delta r = 0$）は、同位相では「腹線」になりますが、**逆位相では「節線」**になります。

---

## 3. なぜ干渉縞は「双曲線」になるのか？

数学における**双曲線（Hyperbola）**の定義は：
> 「平面上の2つの定点（焦点 $F_1, F_2$）からの**距離の差が一定**である点の軌跡」

干渉条件式 $|r_1 - r_2| = \text{const}$ は、まさにこの幾何学的定義そのものです。
2つの波源 $S_1, S_2$ を焦点とする双曲線群が形成され、これが「干渉縞」として観測されます。

### 双曲線の方程式（直交座標系）
$S_1$ を $(-c, 0)$、$S_2$ を $(c, 0)$（波源間隔 $d = 2c$）と原点に対称に置くと、経路差 $|r_1 - r_2| = 2a$（ただし $2a < 2c$）を満たす点 $(x, y)$ の方程式は：

$$\frac{x^2}{a^2} - \frac{y^2}{b^2} = 1 \quad (\text{ただし } b^2 = c^2 - a^2)$$

- $m = 0$（同位相）のときは $2a = 0$ となり、双曲線は退化して $x = 0$（$y$ 軸、すなわち**垂直二等分線**）という直線になります。
- 遠方（$r \gg d$）では、双曲線は漸近線 $y = \pm \frac{b}{a} x$ に近づくため、放射状に広がる直線のように見えます。

---

## 4. 腹線・節線の本数の求め方（入試頻出解法テクニック）

平面全体に存在する腹線や節線の本数を数える問題は、大学入試で極めて高い出題頻度を誇ります。
最も確実でミスを防ぐ解法は、**「線分 $S_1 S_2$ 上にある腹・節の個数を数える」**ことです。

<div class="vector-graph-card">
  <div class="graph-title">図2：線分 $S_1 S_2$ 上における経路差の範囲と交点</div>
  <svg viewBox="0 0 540 160" class="vector-svg">
    <rect width="540" height="160" fill="#0f172a" rx="8"/>
    
    <!-- 数軸ライン -->
    <line x1="60" y1="80" x2="480" y2="80" stroke="#475569" stroke-width="2"/>
    
    <!-- 線分 S1-S2 強調 -->
    <line x1="140" y1="80" x2="400" y2="80" stroke="#38bdf8" stroke-width="4"/>

    <!-- 波源 S1 -->
    <circle cx="140" cy="80" r="7" fill="#38bdf8"/>
    <text x="140" y="60" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">S₁</text>
    <text x="140" y="110" fill="#94a3b8" font-size="11" text-anchor="middle">経路差: -d</text>

    <!-- 波源 S2 -->
    <circle cx="400" cy="80" r="7" fill="#f43f5e"/>
    <text x="400" y="60" fill="#f43f5e" font-size="14" font-weight="bold" text-anchor="middle">S₂</text>
    <text x="400" y="110" fill="#94a3b8" font-size="11" text-anchor="middle">経路差: +d</text>

    <!-- 中点 M -->
    <circle cx="270" cy="80" r="5" fill="#10b981"/>
    <text x="270" y="60" fill="#10b981" font-size="12" font-weight="bold" text-anchor="middle">M (中点)</text>
    <text x="270" y="110" fill="#10b981" font-size="11" text-anchor="middle">経路差: 0</text>

    <!-- 節の位置マーク例 -->
    <line x1="205" y1="72" x2="205" y2="88" stroke="#f43f5e" stroke-width="2.5"/>
    <line x1="335" y1="72" x2="335" y2="88" stroke="#f43f5e" stroke-width="2.5"/>
    <text x="205" y="130" fill="#f43f5e" font-size="11" text-anchor="middle">節 (m=0)</text>
    <text x="335" y="130" fill="#f43f5e" font-size="11" text-anchor="middle">節 (m=0)</text>
  </svg>
</div>

### 手順ステップ
1. **線分 $S_1 S_2$ 上の点の経路差の範囲を把握する**:
   線分 $S_1 S_2$ 上の任意の点 $Q$ について、
   - $Q$ が $S_1$ にあるとき: $S_2 Q - S_1 Q = d - 0 = +d$
   - $Q$ が中点にあるとき: $S_2 Q - S_1 Q = 0$
   - $Q$ が $S_2$ にあるとき: $S_2 Q - S_1 Q = 0 - d = -d$
   したがって、符号付き経路差 $S_2 Q - S_1 Q$ は、$-d$ から $+d$ までの値を連続的にとります。
   波源そのものは除外されるため、開区間となります：
   $$-d < r_2 - r_1 < d \iff |r_1 - r_2| < d$$

2. **条件式を満たす整数 $m$ の個数を求める**:
   同位相の節線の本数を求める場合：
   $$\left(m + \frac{1}{2}\right)\lambda < d \implies m + \frac{1}{2} < \frac{d}{\lambda}$$
   を満たす非負整数 $m = 0, 1, 2, \dots, m_{\max}$ を求めます。
   - $m = 0$ の節線は左右対称に **2本**
   - 一般の $m$ の節線も左右に **2本ずつ**
   したがって、節線の総本数は $2(m_{\max} + 1)$ 本となります。

3. **腹線の本数を求める場合**:
   $$m\lambda < d \implies m < \frac{d}{\lambda}$$
   - $m = 0$（中央の垂直二等分線）は **1本**
   - $m \ge 1$ の腹線は左右対称に **$2 \times m_{\max}$ 本**
   したがって、腹線の総本数は $1 + 2m_{\max}$ 本（必ず奇数）になります。

> **注意：波源の外側（延長線上）**
> 線分 $S_1 S_2$ の外側の延長線上では、常に経路差が最大値 $d$ で一定となります。もし $d = m\lambda$ や $d = (m + 1/2)\lambda$ であっても、延長線全体が1つの線となるため、孤立した双曲線の「本数」としては数えないのが高校物理の共通ルールです。

---

## 5. 大学入試厳選例題

### 例題1：水面波の干渉と節線の総本数（標準）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">国公立大・標準レベル</span>
    <strong>問題：水面波の干渉と節の個数</strong>
  </div>
  <p>
    水面上に $14.0\text{ cm}$ 離して置かれた2つの点波源 $S_1$、$S_2$ が、波長 $\lambda = 4.0\text{ cm}$、等しい振幅で同位相で単振動している。
  </p>
  <ol>
    <li>線分 $S_1 S_2$ 上にある「節（振動しない点）」の個数を求めよ。</li>
    <li>線分 $S_1 S_2$ の中点を $M$ とするとき、$M$ から最も近い節までの距離を求めよ。</li>
    <li>水面全体に生じる「節線」の総本数を求めよ。</li>
    <li>2つの波源を「逆位相」にしたとき、節線の総本数は何本になるか。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 線分 $S_1 S_2$ 上の節の個数**
同位相波源における節の条件は、経路差が半波長の奇数倍となることです。
線分 $S_1 S_2$ 上の任意の点 $P$ において、経路差 $|S_1 P - S_2 P| < d$（$d = 14.0\text{ cm}$）を満たします。
$$|S_1 P - S_2 P| = \left(m + \frac{1}{2}\right)\lambda < 14.0$$
波長 $\lambda = 4.0\text{ cm}$ を代入すると：
$$\left(m + \frac{1}{2}\right) \times 4.0 < 14.0 \implies m + 0.5 < 3.5 \implies m < 3.0$$
$m$ は $0$ 以上の整数なので、$m = 0, 1, 2$ の $3$ 通りが存在します。
各 $m$ に対して、中点の左側（$S_1$ 寄り）と右側（$S_2$ 寄り）にそれぞれ1つずつ節が存在するため：
$$\text{節の個数} = 3 \times 2 = \mathbf{6\text{ 個}}$$

**2. 中点 $M$ から最も近い節までの距離**
線分 $S_1 S_2$ 上で中点 $M$ を原点 $x = 0$ とし、$S_1(-7.0)$、$S_2(+7.0)$ と座標を取ります。
点 $x$ における経路差は：
$$|S_1 P - S_2 P| = |(x + 7.0) - (7.0 - x)| = 2|x|$$
最も中点に近い節は $m = 0$ の節なので：
$$2|x| = \left(0 + \frac{1}{2}\right)\lambda = \frac{1}{2} \times 4.0 = 2.0\text{ cm}$$
$$|x| = \mathbf{1.0\text{ cm}}$$
（※線分上では節と腹、あるいは隣り合う節どうしの間隔は常に $\frac{\lambda}{2} = 2.0\text{ cm}$ で等間隔に並びます）

**3. 水面全体の節線の総本数**
線分 $S_1 S_2$ 上の1つの節につき、そこを通る1本の双曲線の節線が平面全体に伸びます。
したがって、節線の総本数は線分上の節の個数と等しくなります：
$$\text{総本数} = \mathbf{6\text{ 本}}$$

**4. 逆位相にしたときの節線の総本数**
逆位相の場合、節の条件は経路差が波長の整数倍 $|r_1 - r_2| = m\lambda$ となります。
$$m\lambda < d \implies 4.0 m < 14.0 \implies m < 3.5$$
これを満たす整数 $m$ は $m = 0, 1, 2, 3$。
- $m = 0$ のとき：中央の垂直二等分線（中点 $M$ を通る）の **1本**
- $m = 1, 2, 3$ のとき：左右対称にそれぞれ2本ずつ、合計 $3 \times 2 = 6$ 本
したがって、節線の総本数は：
$$1 + 6 = \mathbf{7\text{ 本}}$$

---

### 例題2：2スピーカーによる音波の干渉（難関大レベル）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">難関国公立大・頻出</span>
    <strong>問題：直交軸上を移動するマイクによる音波の干渉測定</strong>
  </div>
  <p>
    図のように、$xy$ 平面上の点 $A(0, d)$ と点 $B(0, -d)$ に同一の周波数 $f$ の音波を同位相で発する小型スピーカーを固定した。音速を $V$ とする。
    点 $C(L, 0)$（ただし $L \gg d$）から $+y$ 方向にマイクをゆっくり移動させたところ、点 $C$ では音が極大（大きく）聞こえた。
  </p>
  <ol>
    <li>点 $C$ から $+y$ 方向に移動させたとき、最初に音が極小（最小）となる点 $P(L, y_1)$ の $y$ 座標 $y_1$ を $L, d, V, f$ を用いて表せ（近似式 $(1+\epsilon)^{1/2} \approx 1 + \frac{1}{2}\epsilon$ を用いよ）。</li>
    <li>周波数 $f = 680\text{ Hz}$、音速 $V = 340\text{ m/s}$、$d = 0.75\text{ m}$、$L = 6.0\text{ m}$ のとき、$y_1$ の数値を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. $y_1$ の数式導出**
波長 $\lambda$ は $\lambda = \frac{V}{f}$ です。
点 $P(L, y)$ におけるスピーカー $A, B$ からの距離 $r_A, r_B$ は：
$$r_A = \sqrt{L^2 + (y - d)^2} = L \left(1 + \frac{(y - d)^2}{L^2}\right)^{1/2}$$
$$r_B = \sqrt{L^2 + (y + d)^2} = L \left(1 + \frac{(y + d)^2}{L^2}\right)^{1/2}$$

$L \gg d, y$ のとき、近似式 $(1+\epsilon)^{1/2} \approx 1 + \frac{1}{2}\epsilon$ を適用すると：
$$r_A \approx L \left(1 + \frac{(y - d)^2}{2L^2}\right) = L + \frac{(y - d)^2}{2L}$$
$$r_B \approx L \left(1 + \frac{(y + d)^2}{2L^2}\right) = L + \frac{(y + d)^2}{2L}$$

したがって、経路差 $\Delta r = r_B - r_A$ は：
$$\Delta r \approx \frac{(y + d)^2 - (y - d)^2}{2L} = \frac{4yd}{2L} = \frac{2yd}{L}$$
（※この関係式はヤングの実験の光路差導出とまったく同一の美しい構造をもちます）

同位相で最初に極小（節）となる条件は、経路差が半波長 $\frac{\lambda}{2}$ に等しくなることです：
$$\frac{2y_1 d}{L} = \frac{\lambda}{2} = \frac{V}{2f}$$
これを $y_1$ について解くと：
$$y_1 = \mathbf{\frac{VL}{4df}}$$

**2. 数値計算**
与えられた数値を代入します：
- $V = 340\text{ m/s}$
- $L = 6.0\text{ m}$
- $d = 0.75\text{ m}$
- $f = 680\text{ Hz}$

$$y_1 = \frac{340 \times 6.0}{4 \times 0.75 \times 680} = \frac{2040}{2040} = \mathbf{1.0\text{ m}}$$

---

## 6. まとめと学習の要点

| 項目 | 同位相 | 逆位相 |
| :--- | :--- | :--- |
| **強め合い（腹）** | $|r_1 - r_2| = m\lambda$ | $|r_1 - r_2| = (m + 1/2)\lambda$ |
| **弱め合い（節）** | $|r_1 - r_2| = (m + 1/2)\lambda$ | $|r_1 - r_2| = m\lambda$ |
| **垂直二等分線** | **腹線**（$m=0$） | **節線**（$m=0$） |
| **線分上の間隔** | 隣り合う腹と腹、節と節の間隔は常に **$\frac{\lambda}{2}$** |
| **幾何学的軌跡** | 2波源を焦点とする**双曲線**（遠方では漸近線に収束） |
