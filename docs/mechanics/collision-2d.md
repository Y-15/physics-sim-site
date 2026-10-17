---
title: 2次元平面衝突・斜め衝突と反発係数の完全攻略
description: 高校物理・難関大学入試最重要テーマ「2次元平面衝突（斜め衝突）」。接触面の法線・接線へのベクトル分解の極意、接線方向の速度保存、法線方向の反発係数式、等質量弾性衝突における「散乱角90°の定理（ビリヤードの定理）」の完全証明と壁面衝突をシミュレータと図解で徹底解説！
---

# 2次元平面衝突・斜め衝突と反発係数

ビリヤードの球の衝突や、カーリングのストーンの弾き合い、原子核・素粒子の散乱実験など、現実の物理現象の多くは**平面内（2次元）での衝突**です。

1次元の直線衝突に比べると一見複雑に見えますが、**「接触面の法線方向（中心線）」**と**「接線方向」**にベクトルを直交分解することで、**「法線方向の1次元衝突」＋「接線方向の等速運動」という極めて単純な問題に帰着**できます。

本稿では、斜め衝突を確実に解き切るベクトル直交分解のアルゴリズム、および難関大で頻出する「等質量弾性衝突における散乱角90°の定理」の美しい証明を解説します。

<ClientOnly>
  <Collision2dSim />
</ClientOnly>

---

## 1. 2次元衝突を解く「黄金の直交分解ルール」

表面がなめらかな球同士の衝突では、衝突の瞬間に及ぼし合う力（撃力 $\vec{N}$）は、**「2球の中心を結ぶ直線（法線方向 $\vec{n}$）」**に沿ってのみ働きます。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 180" class="academic-svg" aria-label="接触面の法線と接線の直交分解">
    <defs>
      <marker id="arrow-n" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
      <marker id="arrow-t" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
      </marker>
    </defs>
    <!-- 接線方向 t -->
    <line x1="270" y1="165" x2="270" y2="15" stroke="#10b981" stroke-width="2.5" stroke-dasharray="4,4" marker-end="url(#arrow-t)" />
    <text x="282" y="24" fill="#10b981" font-size="13" font-weight="bold">接線方向 t（外力ゼロ・速度成分保存）</text>
    
    <!-- 法線方向 n -->
    <line x1="40" y1="90" x2="500" y2="90" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrow-n)" />
    <text x="505" y="94" fill="#ef4444" font-size="13" font-weight="bold">法線方向 n</text>
    
    <!-- 2球の図解 -->
    <circle cx="210" cy="90" r="50" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
    <circle cx="330" cy="90" r="50" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" stroke-width="2" />
    <circle cx="210" cy="90" r="4" fill="#38bdf8" />
    <circle cx="330" cy="90" r="4" fill="#fbbf24" />
    <text x="210" y="95" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">球1 (m₁)</text>
    <text x="330" y="95" fill="#fbbf24" font-size="12" font-weight="bold" text-anchor="middle">球2 (m₂)</text>

    <!-- 撃力ベクトル -->
    <line x1="260" y1="78" x2="190" y2="78" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-n)" />
    <text x="220" y="70" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">撃力 -N</text>
    <line x1="280" y1="78" x2="350" y2="78" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-n)" />
    <text x="320" y="70" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">撃力 +N</text>
  </svg>
  <div class="diagram-caption">図1: 接触点における法線方向（中心線）と接線方向への直交分解</div>
</div>

摩擦のない理想的な球では、接触面に平行な接線方向 $\vec{t}$ には力が一切働きません。
したがって、運動は完全に次の2方向に独立分解されます。

### ① 接線方向（$t$ 軸）の法則
外力が働かない（力積がゼロ）ため、**両球の速度の接線成分は衝突の前後で全く変化しません**！

$$
\begin{aligned}
v'_{1t} &= v_{1t} \\
v'_{2t} &= v_{2t}
\end{aligned}
$$

### ② 法線方向（$n$ 軸）の法則
互いに内力（撃力）を及ぼし合うため、**「通常の1次元衝突」と全く同じ2つの連立方程式**が成り立ちます。

1. **法線方向の運動量保存則**:
   $$
   m_1 v_{1n} + m_2 v_{2n} = m_1 v'_{1n} + m_2 v'_{2n}
   $$
2. **法線方向の反発係数の式**:
   $$
   v'_{1n} - v'_{2n} = -e (v_{1n} - v_{2n})
   $$

> **鉄則**:
> **「反発係数 $e$ の式を立てるときは、必ず『法線方向の速度成分』だけで式を作ること！」**
> 全体の速さ $v$ や接線成分を含めて反発係数の式を立ててしまうのは、受験生が最も陥りやすい致命的な誤答です。

---

## 2. ビリヤードの定理：等質量弾性衝突で散乱角が「90°」になる完全証明

静止している球2に、同じ質量の球1が弾性衝突（$e = 1$、$m_1 = m_2 = m$）するとき、**「衝突後の2球の進行方向は必ず互いに直角（90°）に分かれる」**という驚くべき美しい性質があります。

### 【ベクトルを用いた美しい幾何学的証明】

衝突前の球1の初速ベクトルを $\vec{v}_0$、衝突後の速度ベクトルをそれぞれ $\vec{v}'_1, \vec{v}'_2$ とします。

1. **運動量保存則**（質量 $m$ を約分）:
   $$
   m \vec{v}_0 = m \vec{v}'_1 + m \vec{v}'_2 \implies \vec{v}_0 = \vec{v}'_1 + \vec{v}'_2
   $$
2. **力学的エネルギー保存則**（弾性衝突 $e = 1$ より、$\frac{1}{2}m$ を約分）:
   $$
   v_0^2 = (v'_1)^2 + (v'_2)^2
   $$

ここで、運動量保存則の両辺の自己内積（大きさの2乗）を計算します。

$$
v_0^2 = |\vec{v}'_1 + \vec{v}'_2|^2 = (v'_1)^2 + 2 (\vec{v}'_1 \cdot \vec{v}'_2) + (v'_2)^2
$$

エネルギー保存則の式 $v_0^2 = (v'_1)^2 + (v'_2)^2$ と比較すると：

$$
2 (\vec{v}'_1 \cdot \vec{v}'_2) = 0 \implies \vec{v}'_1 \cdot \vec{v}'_2 = 0
$$

内積がゼロであるため、速度ベクトル $\vec{v}'_1$ と $\vec{v}'_2$ は**直交（散乱角 $\theta_1 + \theta_2 = 90^\circ$）**します！ Q.E.D.

::: tip ビリヤードプレイヤーの直感
ビリヤードで的球に白球を当てたとき、的球は必ず衝突面の法線方向（中心同士を結ぶ線）に飛び出し、手球（白球）はそれと直角（90°）の接線方向に転がっていきます。
この物理法則を知っていると、狙った的球をポケットに落としながら手球のコースを予測することができます。
:::

---

## 3. なめらかな壁面との斜め衝突

質量 $m$ の小球が、なめらかで平らな固定壁に斜めに入射角 $\alpha$ で衝突し、反射角 $\beta$ で跳ね返るケースです（壁との反発係数 $e$）。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 220" class="academic-svg" aria-label="壁面との斜め衝突ベクトル図">
    <defs>
      <marker id="arrow-wall" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="arrow-reflected" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
      </marker>
    </defs>

    <!-- 壁面 -->
    <line x1="40" y1="170" x2="500" y2="170" stroke="#64748b" stroke-width="3" />
    <line x1="40" y1="170" x2="500" y2="170" stroke="#94a3b8" stroke-width="1" />
    <!-- 壁のハッチング -->
    <g stroke="rgba(100, 116, 139, 0.4)" stroke-width="1">
      <line x1="60" y1="170" x2="50" y2="185" />
      <line x1="120" y1="170" x2="110" y2="185" />
      <line x1="180" y1="170" x2="170" y2="185" />
      <line x1="240" y1="170" x2="230" y2="185" />
      <line x1="300" y1="170" x2="290" y2="185" />
      <line x1="360" y1="170" x2="350" y2="185" />
      <line x1="420" y1="170" x2="410" y2="185" />
      <line x1="480" y1="170" x2="470" y2="185" />
    </g>
    <text x="495" y="162" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="end">なめらかな壁面（接線 t 軸）</text>

    <!-- 法線 n -->
    <line x1="270" y1="20" x2="270" y2="170" stroke="#ef4444" stroke-width="1.8" stroke-dasharray="4,4" />
    <text x="278" y="30" fill="#ef4444" font-size="12" font-weight="bold">法線（n 軸）</text>

    <!-- 入射ベクトル v0 -->
    <line x1="160" y1="50" x2="265" y2="165" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-wall)" />
    <circle cx="150" cy="40" r="14" fill="#38bdf8" />
    <text x="150" y="44" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">m</text>
    <text x="195" y="95" fill="#38bdf8" font-size="13" font-weight="bold">初速 v₀</text>

    <!-- 入射角 α の円弧 -->
    <path d="M 235 130 A 50 50 0 0 1 270 120" fill="none" stroke="#38bdf8" stroke-width="1.8" />
    <text x="245" y="112" fill="#38bdf8" font-size="12" font-weight="bold">入射角 α</text>

    <!-- 反射ベクトル v' -->
    <line x1="270" y1="170" x2="410" y2="80" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#arrow-reflected)" />
    <circle cx="420" cy="72" r="14" fill="#fbbf24" />
    <text x="420" y="76" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">m</text>
    <text x="360" y="110" fill="#fbbf24" font-size="13" font-weight="bold">反射速度 v'</text>

    <!-- 反射角 β の円弧 -->
    <path d="M 270 110 A 60 60 0 0 1 315 125" fill="none" stroke="#fbbf24" stroke-width="1.8" />
    <text x="290" y="100" fill="#fbbf24" font-size="12" font-weight="bold">反射角 β</text>
  </svg>
  <div class="diagram-caption">図2: 壁面との斜め衝突における入射角 α と反射角 β の幾何関係</div>
</div>

- **壁に平行な方向（接線成分）**: 力積を受けないため速度不変。
  $$
  v'_t = v_{0t} \implies v' \sin\beta = v_0 \sin\alpha
  $$
- **壁に垂直な方向（法線成分）**: 壁は固定されている（速度ゼロ）ため、反発係数の定義より：
  $$
  v'_n = e v_{0n} \implies v' \cos\beta = e v_0 \cos\alpha
  $$

2式の比をとると：

$$
\frac{v' \sin\beta}{v' \cos\beta} = \frac{v_0 \sin\alpha}{e v_0 \cos\alpha} \implies \tan\beta = \frac{1}{e} \tan\alpha
$$

反発係数 $e < 1$ のとき、$\frac{1}{e} > 1$ となるため：

$$
\tan\beta > \tan\alpha \implies \beta > \alpha
$$

すなわち、**非弾性衝突では反射角 $\beta$ は入射角 $\alpha$ よりも必ず大きく（壁に寝そべるように）跳ね返ります**！

---

## 4. 実戦入試演習問題

### 【問題】
水平でなめらかな床面上に、質量 $m$、半径 $R$ の等しい2つの球 A, B がある。
球 B は静止しており、球 A は速さ $v_0$ で $x$ 軸の正の向きに進み、球 B と斜めに衝突した。
衝突の瞬間、球 A の中心から球 B の中心へ向かうベクトルは $x$ 軸と $\theta = 30^\circ$ の角をなしていた。2球の間の反発係数を $e = 1.0$（完全弾性衝突）とする。

1. 衝突直前の球 A の、中心線（法線）方向の速度成分 $v_{An}$ および中心線と垂直（接線）方向の速度成分 $v_{At}$ を求めよ。
2. 衝突直後の球 A および球 B の速度成分をそれぞれ求めよ。
3. 衝突後の球 A と球 B の進行方向のなす角を求めよ。

---

### 【解答・解説】

#### 1. 衝突直前の速度成分
球 A の初速 $\vec{v}_0$ を、法線（$x$ 軸と $30^\circ$）と接線に分解します。

$$
v_{An} = v_0 \cos 30^\circ = \frac{\sqrt{3}}{2} v_0
$$

$$
v_{At} = -v_0 \sin 30^\circ = -\frac{1}{2} v_0
$$

#### 2. 衝突直後の速度成分
- **接線方向**: 外力を受けないため速度成分は不変です。
  $$
  v'_{At} = v_{At} = -\frac{1}{2} v_0, \quad v'_{Bt} = 0
  $$
- **法線方向**: 同一質量（$m$）で完全弾性衝突（$e = 1$）であるため、**法線方向の速度がそのまま入れ替わります**！
  $$
  v'_{An} = v_{Bn} = 0
  $$
  $$
  v'_{Bn} = v_{An} = \frac{\sqrt{3}}{2} v_0
  $$

したがって：
- **球 A の衝突後速度**: 法線成分がゼロになり、接線成分のみが残るため、速さは $v'_A = \frac{1}{2}v_0$（中心線と垂直な向き）。
- **球 B の衝突後速度**: 接線成分がゼロで法線成分のみをもつため、速さは $v'_B = \frac{\sqrt{3}}{2}v_0$（中心線方向、すなわち $x$ 軸から $30^\circ$ の向き）。

#### 3. 衝突後の2球のなす角
球 A は接線方向、球 B は法線方向に飛び出します。
法線と接線は幾何学的に互いに直交しているため、2球のなす角は計算するまでもなく **$90^\circ$（直角）** です。
（運動エネルギーの和も $\frac{1}{2}m (\frac{1}{2}v_0)^2 + \frac{1}{2}m (\frac{\sqrt{3}}{2}v_0)^2 = \frac{1}{2}mv_0^2(\frac{1}{4} + \frac{3}{4}) = \frac{1}{2}mv_0^2$ となり完全保存されています）。
