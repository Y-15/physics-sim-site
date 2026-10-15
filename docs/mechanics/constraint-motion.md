---
title: 束縛運動と滑車・動く台上の運動（相対加速度）
description: 動滑車のひもの幾何学的拘束条件、動く斜面台上の小球の運動方程式、水平方向運動量保存則と重心不変則の完全導出、東大・京大レベルの典型例題を網羅。
---

# 束縛運動と滑車・動く台上の運動（相対加速度）

複数の物体がひもで結ばれていたり、動く台の斜面に沿って滑るような運動を**束縛運動（拘束運動：Constraint Motion）**と呼びます。

この分野は、多くの受験生が「どの座標系から見るべきか」「加速度の成分分解で符号を間違える」といった壁にぶつかる**難関大入試力学の最頻出・最難関テーマ**の1つです。本項では、幾何学的な束縛条件の数式化から、動滑車、動く斜面台、水平方向運動量保存則との連立解法までを完全に体系化します。

---

## 1. 動く斜面台と小球のインタラクティブシミュレーター

水平ななめらかな床の上に置かれた質量 $M$ の三角台と、その斜面（傾斜角 $\theta$）を滑り落ちる質量 $m$ の小球の連動運動を観察できます。小球が滑り落ちると同時に台が反動で逆向きに動き、**系全体の水平重心 $X_G$ が完全に静止していること**を確認してください。

<ClientOnly>
  <MovableWedgeSim />
</ClientOnly>

---

## 2. 束縛条件の基本概念と動滑車

### 2.1 幾何学的拘束と微分の関係
束縛条件とは、物体が自由に動けず、**「ひもの長さが一定」「面から離れずに接触し続ける」**といった幾何学的な制約のことです。
位置座標の制約式を時間 $t$ で**2回微分**することで、加速度どうしの関係式が得られます。

<div class="vector-graph-card">
  <div class="graph-title">図1：動滑車におけるひもの幾何学的束縛条件</div>
  <svg viewBox="0 0 540 260" class="vector-svg">
    <rect width="540" height="260" fill="#0f172a" rx="8"/>
    <!-- 天井 -->
    <line x1="100" y1="40" x2="440" y2="40" stroke="#64748b" stroke-width="3"/>
    <!-- 天井ハッチング -->
    <line x1="120" y1="40" x2="110" y2="30" stroke="#475569" stroke-width="1.5"/>
    <line x1="160" y1="40" x2="150" y2="30" stroke="#475569" stroke-width="1.5"/>
    <line x1="200" y1="40" x2="190" y2="30" stroke="#475569" stroke-width="1.5"/>
    <line x1="240" y1="40" x2="230" y2="30" stroke="#475569" stroke-width="1.5"/>
    <line x1="280" y1="40" x2="270" y2="30" stroke="#475569" stroke-width="1.5"/>
    <line x1="320" y1="40" x2="310" y2="30" stroke="#475569" stroke-width="1.5"/>
    <line x1="360" y1="40" x2="350" y2="30" stroke="#475569" stroke-width="1.5"/>
    <!-- 基準面 (天井 y=0) -->
    <text x="50" y="45" fill="#94a3b8" font-size="12">基準 y = 0</text>
    <!-- 定滑車 (天井に固定) -->
    <circle cx="220" cy="70" r="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="220" cy="70" r="3" fill="#38bdf8"/>
    <line x1="220" y1="40" x2="220" y2="54" stroke="#64748b" stroke-width="3"/>
    <!-- 動滑車 (物体Bを吊るす) -->
    <circle cx="340" cy="140" r="16" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
    <circle cx="340" cy="140" r="3" fill="#fbbf24"/>
    <!-- ひも (天井 -> 動滑車 -> 定滑車 -> 物体A) -->
    <path d="M 324 40 L 324 140 A 16 16 0 0 0 356 140 L 356 70 A 16 16 0 0 0 220 70 L 220 180" 
          fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <!-- 物体 A (左側) -->
    <rect x="205" y="180" width="30" height="30" fill="#38bdf8" rx="4"/>
    <text x="220" y="200" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">A</text>
    <text x="245" y="195" fill="#38bdf8" font-size="12">y_A</text>
    <!-- 物体 B (動滑車の下) -->
    <line x1="340" y1="156" x2="340" y2="185" stroke="#fbbf24" stroke-width="2"/>
    <rect x="325" y="185" width="30" height="30" fill="#fbbf24" rx="4"/>
    <text x="340" y="205" fill="#0f172a" font-size="12" font-weight="bold" text-anchor="middle">B</text>
    <text x="365" y="195" fill="#fbbf24" font-size="12">y_B</text>
    <!-- 座標軸と微分関係のテキスト -->
    <text x="400" y="90" fill="#e2e8f0" font-size="12">ひもの長さ L = y_A + 2 y_B + const</text>
    <text x="400" y="120" fill="#38bdf8" font-size="13" font-weight="bold">v_A + 2 v_B = 0</text>
    <text x="400" y="145" fill="#f43f5e" font-size="14" font-weight="bold">a_A + 2 a_B = 0</text>
    <text x="400" y="170" fill="#94a3b8" font-size="11">（Bが1m下がるとAは2m上がる）</text>
  </svg>
</div>

天井を基準（$y = 0$、下向き正）とすると、ひもの全長 $L$ は：
$$L = y_A + 2y_B + (\text{滑車周囲長等の定数})$$

これを時間 $t$ で2回微分すると、定数項はすべて消滅します：
$$\frac{d^2 y_A}{dt^2} + 2\frac{d^2 y_B}{dt^2} = 0 \implies \mathbf{a_A + 2a_B = 0}$$

動滑車につながれた物体 $B$ の加速度を $a$（下向き）と置けば、物体 $A$ の加速度は $-2a$（上向きに $2a$）と直ちに1つの未知数で表すことができます。

---

## 3. なめらかな動く斜面台と小球（入試最頻出）

なめらかな水平床の上に置かれた質量 $M$、傾斜角 $\theta$ の三角台の上を、質量 $m$ の小球が滑走する問題を考えます。

<div class="vector-graph-card">
  <div class="graph-title">図2：動く斜面台（非慣性系）における力のつり合いと慣性力</div>
  <svg viewBox="0 0 540 280" class="vector-svg">
    <rect width="540" height="280" fill="#0f172a" rx="8"/>
    <!-- 床 -->
    <line x1="50" y1="230" x2="490" y2="230" stroke="#64748b" stroke-width="2.5"/>
    <!-- 三角台 -->
    <polygon points="120,230 400,230 400,90" fill="rgba(30, 41, 59, 0.8)" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="320" y="200" fill="#38bdf8" font-size="16" font-weight="bold">M (台)</text>
    <text x="180" y="222" fill="#94a3b8" font-size="12">θ</text>
    <!-- 台の加速度 A (左向き) -->
    <line x1="280" y1="250" x2="220" y2="250" stroke="#38bdf8" stroke-width="2.5"/>
    <polygon points="215,250 225,245 225,255" fill="#38bdf8"/>
    <text x="250" y="270" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">台の加速度 A (左向き)</text>
    <!-- 小球 -->
    <circle cx="280" cy="150" r="14" fill="#f43f5e" stroke="#ffffff" stroke-width="2"/>
    <text x="280" y="154" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">m</text>
    <!-- 斜面に沿う相対加速度 alpha -->
    <line x1="280" y1="150" x2="230" y2="175" stroke="#fbbf24" stroke-width="2"/>
    <polygon points="225,177 236,172 232,181" fill="#fbbf24"/>
    <text x="220" y="165" fill="#fbbf24" font-size="12" font-weight="bold">相対加速度 α</text>
    <!-- 小球に働く力（台から見た非慣性系） -->
    <!-- 重力 mg -->
    <line x1="280" y1="150" x2="280" y2="210" stroke="#94a3b8" stroke-width="1.8"/>
    <polygon points="280,214 276,206 284,206" fill="#94a3b8"/>
    <text x="288" y="205" fill="#94a3b8" font-size="11">mg</text>
    <!-- 垂直抗力 N -->
    <line x1="280" y1="150" x2="315" y2="80" stroke="#38bdf8" stroke-width="2"/>
    <polygon points="318,74 311,81 319,85" fill="#38bdf8"/>
    <text x="325" y="85" fill="#38bdf8" font-size="12" font-weight="bold">垂直抗力 N</text>
    <!-- 慣性力 mA (右向き) -->
    <line x1="280" y1="150" x2="340" y2="150" stroke="#10b981" stroke-width="2"/>
    <polygon points="345,150 337,146 337,154" fill="#10b981"/>
    <text x="350" y="154" fill="#10b981" font-size="12" font-weight="bold">慣性力 mA</text>
  </svg>
</div>

### 3.1 2つの解法アプローチ

#### アプローチA：台に乗った観測者の視点（非慣性系・おすすめ）
台の水平加速度を左向きに $A$（$A > 0$）と置きます。
台に乗った観測者から見ると、小球には右向きに大きさ $mA$ の**慣性力**が働きます。
小球は斜面から離れない（束縛条件）ため、**斜面に垂直な方向の加速度はゼロ（つり合い）**、斜面に平行な方向には加速度 $\alpha$ で運動します。

1. **斜面に垂直な方向（つり合い）**:
   重力 $mg$ の法線成分 $mg\cos\theta$ と、慣性力 $mA$ の法線成分 $mA\sin\theta$ が垂直抗力 $N$ と釣り合います：
   $$N = mg\cos\theta + mA\sin\theta$$

2. **斜面に平行な方向（運動方程式）**:
   $$m\alpha = mg\sin\theta - mA\cos\theta$$

3. **台の水平方向の運動方程式（静止系）**:
   台は小球から垂直抗力の反作用 $N$ を斜め下向きに受けます。その水平成分（左向き）は $N\sin\theta$ です。
   $$MA = N\sin\theta$$

### 3.2 未知数 $A, \alpha, N$ の完全導出
式(1)の $N$ を式(3)に代入します：
$$MA = (mg\cos\theta + mA\sin\theta)\sin\theta = mg\sin\theta\cos\theta + mA\sin^2\theta$$
$$A (M + m\sin^2\theta) = mg\sin\theta\cos\theta$$

$$\mathbf{A = \frac{mg\sin\theta\cos\theta}{M + m\sin^2\theta}}$$

これを垂直抗力の式に代入すると：
$$N = mg\cos\theta + m\left(\frac{mg\sin\theta\cos\theta}{M + m\sin^2\theta}\right)\sin\theta = \mathbf{\frac{Mmg\cos\theta}{M + m\sin^2\theta}}$$

小球の相対加速度 $\alpha$ は：
$$\alpha = g\sin\theta - A\cos\theta = \mathbf{\frac{(M + m)g\sin\theta}{M + m\sin^2\theta}}$$

---

## 4. 水平方向運動量保存則と水平重心不変則

床と台の間に摩擦がないとき、**系全体（台＋小球）に対して水平方向の外力は一切働きません**（重力と床の垂直抗力はともに鉛直方向）。
したがって、次の2つの強力な保存則が成り立ちます。

### 4.1 水平方向の運動量保存則
静止状態からスタートした場合、任意の時刻において水平方向の全運動量は常に $0$ です。
台の水平速度を $V_x$、小球の水平速度を $v_x$ とすると：

$$M V_x + m v_x = 0$$

### 4.2 水平方向の重心不変則
速度の保存式を時間積分すると、**系全体の水平方向の重心座標 $X_G$ は運動中まったく動かない**ことが分かります。

$$M \Delta X + m \Delta x = 0$$

台が左へ $\Delta X$ 移動したとき、小球の水平方向の移動量 $\Delta x$（静止系）は：
$$\Delta X = -\frac{m}{M} \Delta x$$

この重心保存則を用いると、運動方程式を解くことなく、最下点に達したときの台の移動量を一瞬で求めることができます。

---

## 5. 大学入試厳選例題

### 例題1：動滑車と2物体の運動方程式（典型標準）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">国公立大・標準レベル</span>
    <strong>問題：動滑車で吊るされた2物体の加速度と張力</strong>
  </div>
  <p>
    天井に固定された定滑車と、質量を無視できる動滑車がある。
    動滑車には質量 $M$ の物体 $B$ が吊るされており、動滑車と定滑車にかけられた軽くて伸びないひもの一端は天井に固定され、他端には質量 $m$ の物体 $A$ が吊るされている。重力加速度の大きさを $g$ とする。
  </p>
  <ol>
    <li>ひもの張力を $T$ とするとき、物体 $A$ および物体 $B$ の鉛直下向きの運動方程式を立てよ。</li>
    <li>物体 $A$ の加速度 $a_A$、物体 $B$ の加速度 $a_B$、およびひもの張力 $T$ を求めよ。</li>
    <li>物体 $B$ が静止したままつり合うための質量比 $\frac{M}{m}$ を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 運動方程式の立式**
ひもは1本なので張力は至る所で $T$ です。
動滑車には2本のひもが上向きにかかっているため、動滑車（および物体 $B$）を上向きに引く力は $2T$ になります。
鉛直下向きを正として：
- 物体 $A$: $m a_A = mg - T$
- 物体 $B$: $M a_B = Mg - 2T$

**2. 加速度と張力の導出**
束縛条件より、ひもの全長 $L = y_A + 2y_B + \text{const}$ なので、加速度の関係は $a_A + 2a_B = 0 \implies a_A = -2a_B$ です。
物体 $A$ の運動方程式に代入すると：
$$m (-2a_B) = mg - T \implies T = mg + 2m a_B$$
これを物体 $B$ の運動方程式に代入します：
$$M a_B = Mg - 2(mg + 2m a_B) = (M - 2m)g - 4m a_B$$
$$(M + 4m) a_B = (M - 2m)g$$
$$\mathbf{a_B = \frac{M - 2m}{M + 4m} g} \quad (\text{下向き})$$

物体 $A$ の加速度 $a_A$ は：
$$\mathbf{a_A = -2a_B = \frac{2(2m - M)}{M + 4m} g} \quad (\text{下向き})$$

張力 $T$ は：
$$T = mg + 2m \left(\frac{M - 2m}{M + 4m}\right)g = mg \left[ 1 + \frac{2M - 4m}{M + 4m} \right] = \mathbf{\frac{3Mm}{M + 4m} g}$$

**3. つり合いの条件**
物体 $B$ が静止する条件は $a_B = 0$ です。
$$M - 2m = 0 \implies \mathbf{\frac{M}{m} = 2}$$
（※動滑車により力が半分になるため、つり合うには $B$ の質量が $A$ のちょうど2倍である必要があります）

---

### 例題2：なめらかな斜面台と小球の滑走・最下点での速度（東大・難関大レベル）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">東京大・京都大レベル</span>
    <strong>問題：動く斜面台の移動距離と最下点速度</strong>
  </div>
  <p>
    水平な床の上に、傾斜角 $\theta$、質量 $M$、高さ $h$ の三角台が置かれている。
    台の最上端に質量 $m$ の小球を置き、全体を静かに放した。床および台の斜面はともになめらかであるとし、重力加速度を $g$ とする。
  </p>
  <ol>
    <li>小球が斜面を滑り落ちて最下端（床面）に到達するまでの間に、台が水平方向に移動した距離 $X$ を求めよ（斜面の水平幅を $d = \frac{h}{\tan\theta}$ とする）。</li>
    <li>小球が最下端に達した瞬間の台の速さ $V$、および小球の水平成分の速さ $v_x$ を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 台の移動距離 $X$（水平重心保存則の適用）**
床となめらかに接しているため、水平方向の外力はゼロです。
したがって、小球が最下点に達するまでの間、系全体の水平重心の位置は動きません。
台の左向きの移動距離を $X$ とします。
台から見ると、小球は右から左へ斜面を滑り、水平方向に距離 $d = \frac{h}{\tan\theta}$ だけ左へ移動します。
したがって、床から見た小球の水平移動距離 $x_{\text{ball}}$（左向き）は：
$$x_{\text{ball}} = d - X$$
水平重心不変の式 $M X - m x_{\text{ball}} = 0$ より：
$$M X - m (d - X) = 0 \implies (M + m) X = m d$$
$$\mathbf{X = \frac{m}{M + m} d = \frac{m h}{(M + m)\tan\theta}}$$

**2. 最下端に達した瞬間の台の速さ $V$**
最下点に達した瞬間、小球は台の水平面へと滑らかに移行するため、鉛直速度は $0$（$v_y = 0$）となり、速度は水平方向のみ（$v_x$）になります。
- **水平方向の運動量保存則**:
  台が左向きに速さ $V$、小球が右向きに速さ $v_x$ で運動しているとすると：
  $$-M V + m v_x = 0 \implies v_x = \frac{M}{m} V$$

- **力学的エネルギー保存則**:
  小球の位置エネルギー $mgh$ が、台と小球の運動エネルギーにすべて変換されます：
  $$mgh = \frac{1}{2} M V^2 + \frac{1}{2} m v_x^2$$
  $v_x = \frac{M}{m} V$ を代入すると：
  $$mgh = \frac{1}{2} M V^2 + \frac{1}{2} m \left(\frac{M}{m} V\right)^2 = \frac{1}{2} M V^2 \left(1 + \frac{M}{m}\right) = \frac{1}{2} \frac{M(M + m)}{m} V^2$$
  $$V^2 = \frac{2 m^2 g h}{M(M + m)}$$
  $$\mathbf{V = m \sqrt{\frac{2gh}{M(M + m)}}}$$

小球の速さ $v_x$ は：
$$\mathbf{v_x = \frac{M}{m} V = M \sqrt{\frac{2gh}{M(M + m)}} = \sqrt{\frac{2 M g h}{M + m}}}$$

---

## 6. まとめ

| 運動モデル | 幾何学的束縛条件 | 支配方程式 |
| :--- | :--- | :--- |
| **動滑車** | $y_A + 2y_B = \text{const}$ | $\mathbf{a_A + 2a_B = 0}$ |
| **動く斜面台** | 相対加速度 $\vec{\alpha}$ が斜面に平行 | $N = \frac{Mmg\cos\theta}{M + m\sin^2\theta}$ |
| **水平外力ゼロ** | 水平重心 $X_G$ 不変 | $\mathbf{M V_x + m v_x = 0}$ |
| **エネルギー保存** | なめらかな面（仕事ゼロ） | $\frac{1}{2}MV^2 + \frac{1}{2}mv^2 + mgh = \text{const}$ |
