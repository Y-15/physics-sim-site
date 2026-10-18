---
title: 運動量保存則と反発係数（衝突問題の完全攻略）【高校物理シミュレーター】
description: 運動量 p = mv、力積 I = FΔt、運動量保存則、反発係数 e、弾性衝突・非弾性衝突・完全非弾性衝突、エネルギー損失をインタラクティブCanvasで完全理解
---

# 💥 運動量保存則と反発係数（衝突問題の完全攻略）

高校物理の力学において、 **運動量保存則** は「エネルギー保存則」と並ぶ最重要の保存法則です。
質量や初速度、反発係数（はねかえり係数）$e$ をスライダーで自由に変えて、衝突前後の運動量とエネルギーの変化をリアルタイムに実験してみましょう！

---

## 🧪 インタラクティブ実験室

<MomentumSim />

::: tip 実験のポイント
1. **運動量保存の確認**:
   * 反発係数 $e$ を $0$（完全非弾性）にしても $1$（完全弾性）にしても、 **衝突前の全運動量と衝突後の全運動量は完全に等しい** ことを確認してください。
2. **完全弾性衝突（$e = 1$）**:
   * 質量を同じ（$m_1 = m_2$）にして衝突させると、 **速度が完全に入れ替わります** （$m_1$ がピタッと止まり、$m_2$ がそのままの速度で発進！）。
   * 運動エネルギーは $100\%$ 保存されます（損失 $0\,\text{J}$）。
3. **完全非弾性衝突（$e = 0$）**:
   * 2つの球が衝突後、 **くっついて同じ速度** で進みます。このとき運動エネルギーの損失が最大になります。
:::

---

## 1. 運動量と力積

### 1.1 運動量（Momentum）
質量 $m\,[\text{kg}]$ の物体が速度 $v\,[\text{m/s}]$ で運動しているとき、その物体の運動の勢いを表す物理量を **運動量** $p$ と定義します：

$$
\vec{p} = m\vec{v} \quad [\text{kg}\cdot\text{m/s} = \text{N}\cdot\text{s}]
$$

* 運動量は **向きを持ったベクトル量** です。1次元（直線上の運動）では、 **どちら向きを正とするか** を最初に必ず宣言して符号（$+$ / $-$）をつけます。

### 1.2 力積（Impulse）
物体に力 $\vec{F}$ が時間 $\Delta t$ の間働いたとき、その積を **力積** $\vec{I}$ といいます：

$$
\vec{I} = \vec{F} \Delta t \quad [\text{N}\cdot\text{s}]
$$

運動方程式 $m \frac{\Delta v}{\Delta t} = F$ の両辺に $\Delta t$ をかけると、極めて重要な基本関係式が得られます：

$$
\boxed{m\vec{v} - m\vec{u} = \vec{F}\Delta t} \quad (\text{衝突後の運動量} - \text{衝突前の運動量} = \text{受けた力積})
$$

::: important $F$-$t$ グラフの面積
力が一定でない場合、力と時間の関係を表す $F$-$t$ グラフの **曲線と時間軸で囲まれた面積** が、物体が受けた力積 $I$ に等しくなります。
:::

---

## 2. 運動量保存則の導出

2つの物体 A（質量 $m_1$、初速度 $u_1$）と B（質量 $m_2$、初速度 $u_2$）が衝突し、時間 $\Delta t$ の間互いに力を及ぼし合って速度がそれぞれ $v_1, v_2$ に変化したとします。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 220" class="academic-svg" aria-label="衝突における作用・反作用と運動量保存の図解">
    <defs>
      <marker id="mom-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="mom-arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
      </marker>
      <marker id="mom-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
    </defs>

    <!-- ステージ1: 衝突前 -->
    <text x="30" y="42" fill="#94a3b8" font-size="12" font-weight="bold">【衝突前】</text>
    <circle cx="160" cy="38" r="18" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
    <text x="160" y="43" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">m₁</text>
    <line x1="180" y1="38" x2="230" y2="38" stroke="#38bdf8" stroke-width="2" marker-end="url(#mom-arrow-blue)" />
    <text x="205" y="30" fill="#38bdf8" font-size="11" font-weight="bold">u₁</text>

    <circle cx="360" cy="38" r="22" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" stroke-width="2" />
    <text x="360" y="43" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">m₂</text>
    <line x1="385" y1="38" x2="425" y2="38" stroke="#fbbf24" stroke-width="2" marker-end="url(#mom-arrow-amber)" />
    <text x="405" y="30" fill="#fbbf24" font-size="11" font-weight="bold">u₂</text>

    <!-- 分割点線 -->
    <line x1="30" y1="75" x2="510" y2="75" stroke="#334155" stroke-dasharray="2,2" />

    <!-- ステージ2: 衝突中 (作用・反作用) -->
    <text x="30" y="112" fill="#ef4444" font-size="12" font-weight="bold">【衝突中】</text>
    <!-- 接触する2球 -->
    <circle cx="232" cy="110" r="18" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
    <text x="232" y="115" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">m₁</text>
    <circle cx="272" cy="110" r="22" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" stroke-width="2" />
    <text x="272" y="115" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">m₂</text>

    <!-- 作用・反作用の力ベクトル (内力) -->
    <line x1="220" y1="110" x2="165" y2="110" stroke="#ef4444" stroke-width="2.5" marker-end="url(#mom-arrow-red)" />
    <text x="190" y="100" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">-F (反作用)</text>

    <line x1="285" y1="110" x2="340" y2="110" stroke="#ef4444" stroke-width="2.5" marker-end="url(#mom-arrow-red)" />
    <text x="315" y="100" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">+F (作用)</text>

    <!-- 分割点線 -->
    <line x1="30" y1="148" x2="510" y2="148" stroke="#334155" stroke-dasharray="2,2" />

    <!-- ステージ3: 衝突後 -->
    <text x="30" y="185" fill="#10b981" font-size="12" font-weight="bold">【衝突後】</text>
    <circle cx="160" cy="182" r="18" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" />
    <text x="160" y="187" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">m₁</text>
    <line x1="180" y1="182" x2="220" y2="182" stroke="#38bdf8" stroke-width="2" marker-end="url(#mom-arrow-blue)" />
    <text x="200" y="174" fill="#38bdf8" font-size="11" font-weight="bold">v₁</text>

    <circle cx="360" cy="182" r="22" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" stroke-width="2" />
    <text x="360" y="187" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">m₂</text>
    <line x1="385" y1="182" x2="445" y2="182" stroke="#fbbf24" stroke-width="2" marker-end="url(#mom-arrow-amber)" />
    <text x="415" y="174" fill="#fbbf24" font-size="11" font-weight="bold">v₂</text>
  </svg>
  <div class="diagram-caption">図: 衝突の前後および衝突中の作用・反作用の内力ペア（相殺される撃力）</div>
</div>

作用・反作用の法則より、AがBから受ける力を $-F$ とすると、BがAから受ける力は $+F$ です。
各物体について「運動量変化＝力積」の式を立てると：

* 物体 A: $m_1 v_1 - m_1 u_1 = -F \Delta t$
* 物体 B: $m_2 v_2 - m_2 u_2 = +F \Delta t$

この2式の辺々を足し合わせると、右辺の内力（相互に及ぼし合った力）の力積が **$-F\Delta t + F\Delta t = 0$** となり相殺されます！

$$
(m_1 v_1 - m_1 u_1) + (m_2 v_2 - m_2 u_2) = 0
$$

整理すると：

$$
\boxed{m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2}
$$

::: important 運動量保存則が成り立つ条件
**系（考えたい物体の集まり）の外から外力の力積が働かない限り** 、物体同士がどれだけ激しく衝突・合体・分裂しても、系全体の運動量の総和は常に一定に保たれます。
:::

---

## 3. 反発係数（はねかえり係数）$e$

運動量保存則だけでは未知数 $v_1, v_2$ の2つを決定できません。もう1本の条件式として使われるのが **反発係数** $e$ です。

### 3.1 定義式
衝突前の相対速度に対する、衝突後の相対速度の比（大きさ）を表します：

$$
\boxed{e = -\frac{v_1 - v_2}{u_1 - u_2} = \frac{|v_1 - v_2|}{|u_1 - u_2|}} \quad (0 \le e \le 1)
$$

直感的には：
$$
(\text{衝突後に離れる相対の速さ}) = e \times (\text{衝突前に近づく相対の速さ})
$$

### 3.2 衝突の3つの分類

| 分類 | 反発係数 $e$ | 運動量 | 力学的エネルギー | 具体例 |
| :--- | :--- | :--- | :--- | :--- |
| **完全弾性衝突 **| $e = 1$ |** 保存 **|** 保存** | 原子核・素粒子の衝突、スーパーボール（理想） |
| **非弾性衝突 **| $0 < e < 1$ |** 保存 **|** 減少**（熱・音・変形へ） | 一般のボールの衝突、自動車の衝突 |
| **完全非弾性衝突 **| $e = 0$ |** 保存 **|** 激減**（損失最大） | 粘土の合体、弾丸が木片にめり込む |

---

## 4. 衝突後の速度を求める連立方程式

運動量保存則と反発係数の式を連立させて解くと、衝突後の速度 $v_1, v_2$ は次のように求まります：

$$
v_1 = \frac{(m_1 - e m_2)u_1 + (1 + e)m_2 u_2}{m_1 + m_2}
$$

$$
v_2 = \frac{(1 + e)m_1 u_1 + (m_2 - e m_1)u_2}{m_1 + m_2}
$$

### 超頻出の特例：同質量（$m_1 = m_2$）の完全弾性衝突（$e = 1$）
上式に $m_1 = m_2 = m$ と $e = 1$ を代入すると：

$$
v_1 = u_2, \quad v_2 = u_1
$$

なんと、 **2つの物体の速度がそっくりそのまま入れ替わります！**  
ビリヤードの正面衝突やニュートンのゆりかご（カチカチ玉）がこれに当たります。

---

## 5. 衝突による力学的エネルギーの損失 $\Delta E$

非弾性衝突（$e < 1$）では、衝突によって物体の変形や摩擦熱、音が発生するため、系の運動エネルギーが失われます。
失われた運動エネルギー $\Delta E = K_{\text{before}} - K_{\text{after}}$ は、次のような美しい公式で表されます：

$$
\boxed{\Delta E = \frac{1}{2} \mu (1 - e^2)(u_1 - u_2)^2}
$$

ここで $\mu = \frac{m_1 m_2}{m_1 + m_2}$ は **換算質量（Reduced Mass）** と呼ばれます。

* $e = 1$ のとき：$1 - e^2 = 0$ より $\Delta E = 0$（エネルギー完全保存）。
* $e = 0$ のとき：$\Delta E = \frac{1}{2} \mu (u_1 - u_2)^2$ となり、接近相対運動に関わるエネルギーが全て失われます。

---

## 6. 入試問題を解くための鉄則 5ステップ

::: tip 衝突問題を100%正解する解法フロー
1. **系を決める**: どの物体とどの物体をセットで考えるか確認する。
2. **正の向きを決める**: 水平右向きなどを正と定め、すべての速度をベクトル（符号付き）で表す。
3. **運動量保存則を立てる**: $m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2$
4. **反発係数の式を立てる**: $v_1 - v_2 = -e(u_1 - u_2)$
5. **連立して解く**: 引き算または足し算で片方の未知数を消去して解く。
:::

---

## 7. 実戦入試演習問題

### 【最難関大・発展演習】2つの物体の完全弾性衝突と円周率 $\pi$ の出現（ガルペリンのビリヤード）

高校物理（「物理基礎」・力学の運動量保存則と力学的エネルギー保存則）と高校数学（「数学I・II」の円の方程式・円周角の定理・三角関数の極限）の知識だけで完全に証明できる、数理物理の傑作テーマ **「ガルペリンのビリヤード（2物体の弾性衝突による円周率 $\pi$ の桁数の出現）」** を題材とした難関大入試レベルの記述式難問です。

<div style="text-align: center; margin: 20px 0;">
  <svg viewBox="0 0 700 240" style="max-width: 100%; height: auto; background: #0c0e14; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
    <defs>
      <pattern id="gridPatGalperin" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
      <marker id="arrCyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
      </marker>
      <marker id="arrPink" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899" />
      </marker>
      <marker id="arrAxis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(255,255,255,0.4)" />
      </marker>
    </defs>
    <rect width="700" height="240" fill="url(#gridPatGalperin)" />

    <!-- Split line -->
    <line x1="330" y1="15" x2="330" y2="225" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-dasharray="4,4" />

    <!-- Left side: Real space -->
    <text x="25" y="32" fill="#e4e4e7" font-size="12" font-weight="bold" font-family="sans-serif">【実空間】x軸上の完全弾性衝突</text>
    
    <!-- Wall -->
    <line x1="40" y1="50" x2="40" y2="180" stroke="#f59e0b" stroke-width="4" />
    <text x="20" y="196" fill="#f59e0b" font-size="11" font-weight="bold" font-family="sans-serif">壁 x = 0</text>
    <line x1="40" y1="175" x2="310" y2="175" stroke="rgba(255,255,255,0.4)" stroke-width="2" marker-end="url(#arrAxis)" />
    <text x="312" y="179" fill="#a1a1aa" font-size="11" font-family="sans-serif">x</text>

    <!-- Block A -->
    <rect x="90" y="145" width="30" height="30" fill="#22d3ee" stroke="#38bdf8" stroke-width="1.5" />
    <text x="100" y="165" fill="#0c0e14" font-size="12" font-weight="bold" font-family="sans-serif">A</text>
    <text x="92" y="138" fill="#22d3ee" font-size="11" font-family="sans-serif">m (静止)</text>

    <!-- Block B -->
    <rect x="180" y="125" width="50" height="50" fill="#ec4899" stroke="#f472b6" stroke-width="1.5" />
    <text x="200" y="155" fill="#ffffff" font-size="14" font-weight="bold" font-family="sans-serif">B</text>
    <text x="175" y="118" fill="#ec4899" font-size="11" font-weight="bold" font-family="sans-serif">M = 100ᵏm</text>
    <line x1="205" y1="98" x2="165" y2="98" stroke="#ec4899" stroke-width="2.5" marker-end="url(#arrPink)" />
    <text x="175" y="92" fill="#ec4899" font-size="11" font-family="sans-serif">初速 -v₀</text>

    <!-- Right side: Phase space -->
    <text x="355" y="32" fill="#e4e4e7" font-size="12" font-weight="bold" font-family="sans-serif">【相空間】エネルギー保存円 X² + Y² = R²</text>
    
    <!-- Axes in Phase space -->
    <line x1="360" y1="130" x2="675" y2="130" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" marker-end="url(#arrAxis)" />
    <text x="635" y="122" fill="#a1a1aa" font-size="10" font-family="sans-serif">X = √MV</text>
    <line x1="515" y1="215" x2="515" y2="45" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" marker-end="url(#arrAxis)" />
    <text x="522" y="55" fill="#a1a1aa" font-size="10" font-family="sans-serif">Y = √mv</text>

    <!-- Circle -->
    <circle cx="515" cy="130" r="75" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />

    <!-- Sector (0 <= Y <= X tan theta) -->
    <path d="M 515 130 L 590 130 A 75 75 0 0 0 584 94 Z" fill="rgba(16,185,129,0.25)" stroke="#10b981" stroke-width="1.5" />
    <text x="596" y="112" fill="#10b981" font-size="10" font-weight="bold" font-family="sans-serif">終了領域 (幅 θ)</text>

    <!-- Points and reflection chord -->
    <circle cx="440" cy="130" r="4" fill="#f43f5e" />
    <text x="400" y="125" fill="#f43f5e" font-size="10" font-family="sans-serif">P₀(-R,0)</text>
    <line x1="440" y1="130" x2="465" y2="198" stroke="#38bdf8" stroke-width="2" />
    <circle cx="465" cy="198" r="3.5" fill="#38bdf8" />
    <text x="468" y="212" fill="#38bdf8" font-size="10" font-family="sans-serif">P₁</text>
    <line x1="465" y1="198" x2="465" y2="62" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3" />
    <circle cx="465" cy="62" r="3.5" fill="#38bdf8" />
    <text x="468" y="58" fill="#38bdf8" font-size="10" font-family="sans-serif">P₂</text>

    <!-- Arc 2 theta indicator -->
    <path d="M 440 130 A 75 75 0 0 0 465 198" fill="none" stroke="#fbbf24" stroke-width="2" />
    <text x="415" y="172" fill="#fbbf24" font-size="10" font-weight="bold" font-family="sans-serif">中心角 2θ</text>
  </svg>
</div>

<ClientOnly>
  <GalperinPiSim />
</ClientOnly>

#### 【問題文】
なめらかな水平面上に、右向きに $x$ 軸をとり、原点 $x = 0$ に垂直で堅固な壁が固定されている。
壁の右側（$x$ が正の領域）に、質量 $m$ の小物体 $\mathrm{A}$ と質量 $M$（ただし $M \ge m$）の小物体 $\mathrm{B}$ を、壁に近い側から $\mathrm{A}$、$\mathrm{B}$ の順に $x$ 軸上に並べて置く。

最初、小物体 $\mathrm{A}$ は静止しており、小物体 $\mathrm{B}$ に左向き（$-x$ 向き）の初速度 $-v_0$（$v_0$ は正）を与えて運動を開始させる。これ以降、小物体 $\mathrm{A}$ と $\mathrm{B}$ の間の衝突、および小物体 $\mathrm{A}$ と壁との衝突はすべて **完全弾性衝突（反発係数 $e = 1$）** であるとし、物体の大きさや空気抵抗は無視できるものとする。

ここで、全運動を通じて起こる **「$\mathrm{A}$ と $\mathrm{B}$ の衝突」と「$\mathrm{A}$ と壁との衝突」を合わせた総衝突回数を $N$** とする。

##### 設問 (1)：具体的な質量比における実験と観察
まず、質量比 $\dfrac{M}{m}$ が小さい場合について、運動量保存則と反発係数の式（または力学的エネルギー保存則）を用いて衝突の経過を具体的に調べよ。
- (a) $M = m$ のとき、総衝突回数 $N$ を求めよ。
- (b) $M = 3m$ のとき、各衝突直後の $\mathrm{A}$ と $\mathrm{B}$ の速度（右向きを正とする）を順にすべて求め、それ以上衝突が起こらなくなることを確認して総衝突回数 $N$ を求めよ。

##### 設問 (2)：エネルギー平面（$XY$ 平面）への座標変換と幾何学的解釈
一般の質量 $m, M$ に対して総衝突回数 $N$ を求めるため、ある時点における小物体 $\mathrm{A}$ の速度を $v$、小物体 $\mathrm{B}$ の速度を $V$（ともに右向きを正）とし、次の新しい2つの変数 $(X, Y)$ を定義する。

$$
X = \sqrt{M}\,V, \qquad Y = \sqrt{m}\,v
$$

また、無次元の角度 $\theta$（ただし $\theta$ は $0$ より大きく $\dfrac{\pi}{4}$ 以下の定数）を

$$
\tan\theta = \sqrt{\frac{m}{M}}
$$

によって定める。

- (a) 運動の最初から最後まで力学的エネルギーが保存されることから、点 $\mathrm{P}(X, Y)$ は常に $XY$ 平面上の原点を中心とするある一つの円周上にあることを示し、その円の半径 $R$ を $M, v_0$ を用いて表せ。また、運動開始時（1回目の衝突前）の点 $\mathrm{P}_0$ の座標 $(X_0, Y_0)$ を $R$ を用いて答えよ。
- (b) 小物体 $\mathrm{A}$ と壁が衝突するとき、点 $\mathrm{P}(X, Y)$ は $XY$ 平面上でどのように移動するか答えよ。
- (c) 小物体 $\mathrm{A}$ と $\mathrm{B}$ が衝突するとき、衝突前後の2点 $\mathrm{P}(X, Y)$ と $\mathrm{P}'(X', Y')$ を結ぶ直線は、傾きが $-\sqrt{\dfrac{M}{m}} = -\dfrac{1}{\tan\theta}$ の直線になることを運動量保存則から示せ。さらに、円の幾何学的性質（弦と中心角・円周角の関係）に着目することで、$\mathrm{P}_0(X_0, Y_0)$ から出発して「$\mathrm{A}$ と $\mathrm{B}$ の衝突」と「$\mathrm{A}$ と壁の衝突」を交互に繰り返すたびに、点 $\mathrm{P}$ の位置が円周上を一定の角度 $2\theta$ ずつ規則的に切り取っていく理由を説明せよ。

##### 設問 (3)：衝突の終了条件と総衝突回数 $N$ の一般式
これ以上「$\mathrm{A}$ と $\mathrm{B}$ の衝突」も「$\mathrm{A}$ と壁の衝突」も起こらなくなるための速度の条件は、

$$
0 \le v \le V
$$

である。
- (a) この終了条件 $0 \le v \le V$ を、$XY$ 平面上の点 $\mathrm{P}(X, Y)$ が存在する領域の条件（偏角の範囲）として $\theta$ を用いて表せ。
- (b) 円周角と中心角の関係（または偏角の追跡）を用いて、全運動における総衝突回数 $N$ は、円周率 $\pi$ を $\theta$ で割った値 $\dfrac{\pi}{\theta}$ を超えない最大の整数（ただし $\dfrac{\pi}{\theta}$ がちょうど整数になるときは $\dfrac{\pi}{\theta} - 1$）として与えられることを示せ。

##### 設問 (4)：質量比 $M = 100^k m$ における円周率 $\pi$ の出現
質量を $M = 100^k m$（$k$ は $0$ 以上の整数）と設定する。
設問 (3) の結果と、$\theta$ が十分小さいときの近似式 $\theta = \arctan(10^{-k}) \approx 10^{-k}\left(1 - \dfrac{10^{-2k}}{3} + \cdots\right)$ を用いて、$k = 0, 1, 2, 3, 4$ のときの総衝突回数 $N$ をそれぞれ求めよ。また、なぜ2つの物体の衝突回数から円周率 $\pi = 3.14159265\dots$ の各桁の数字が現れるのか、その物理的・数学的本質を簡潔にまとめよ。

---

<details class="tip">
<summary><strong>💡 思考のヒント・着眼点（クリックして開く）</strong></summary>

1. **設問 (2) の座標変換の意味 ** 運動エネルギーの保存則 $\dfrac{1}{2}M V^2 + \dfrac{1}{2}m v^2 = \dfrac{1}{2}M v_0^2$ を $X = \sqrt{M}\,V, \, Y = \sqrt{m}\,v$ で書き換えると、楕円ではなく**真円 $X^2 + Y^2 = R^2$** になります。これにより、長さや角度の対称性がそのまま使えるようになります。
2. **設問 (2)(c) の円周角の定理 ** 壁との衝突は $X$ 軸に関して対称な移動（垂直な弦）、$\mathrm{A}$ と $\mathrm{B}$ の衝突は傾き $-\dfrac{1}{\tan\theta}$ の弦に沿った円周上の移動です。2本の弦のなす角（円周角）は常に $\theta$ となり、**円周角の定理から切り取られる中心角は $2\theta$** になります。
3. **設問 (3) の終了領域**  
   $0 \le v \le V$ を $X, Y$ に直すと $0 \le Y \le X \tan\theta$ です。これは第1象限の $X$ 軸（偏角 $0$）から直線 $Y = X \tan\theta$（偏角 $\theta$）までの「中心角 $\theta$ の扇形の弧」に対応します。
</details>

---

#### 【解答・完全解説】

##### 設問 (1) の解説
質量 $m$ の $\mathrm{A}$（衝突前の速度 $v$）と質量 $M$ の $\mathrm{B}$（衝突前の速度 $V$）が完全弾性衝突するとき、運動量保存則と反発係数 $e = 1$ の式

$$
m v + M V = m v' + M V', \qquad v' - V' = -(v - V)
$$

を連立して解くと、衝突後の速度 $(v', V')$ の公式は以下のようになる。

$$
v' = \frac{(m - M)v + 2MV}{m + M}, \qquad V' = \frac{2mv + (M - m)V}{m + M}
$$

また、$\mathrm{A}$ が壁と完全弾性衝突するときは、$v$ の符号が反転して $-v$ となる（$V$ は変化しない）。

###### (a) $M = m$ のとき
- **初期状態：** $(v, V) = (0, -v_0)$
- **1回目（$\mathrm{A}$ と $\mathrm{B}$ の衝突）：** 同質量の完全弾性衝突なので速度が交換され、$(v_1, V_1) = (-v_0, 0)$ となる。
- **2回目（$\mathrm{A}$ と壁の衝突）：** $\mathrm{A}$ が壁で跳ね返り、$(v_2, V_2) = (+v_0, 0)$ となる。
- **3回目（$\mathrm{A}$ と $\mathrm{B}$ の衝突）：** 再び速度が交換され、$(v_3, V_3) = (0, +v_0)$ となる。

これ以降、$\mathrm{A}$ は静止し、$\mathrm{B}$ は右向きに速さ $v_0$ で遠ざかるため衝突は起こらない。よって総衝突回数は **$N = 3$** 。

###### (b) $M = 3m$ のとき
上の衝突公式に $M = 3m$ を代入すると、$\mathrm{A}$ と $\mathrm{B}$ の衝突では

$$
v' = \frac{-v + 3V}{2}, \qquad V' = \frac{v + V}{2}
$$

となる。初期状態 $(0, -v_0)$ から順に追跡する。
1. **1回目（$\mathrm{A}$ と $\mathrm{B}$）：** $(v_1, V_1) = \left(-\dfrac{3}{2}v_0, \, -\dfrac{1}{2}v_0\right)$
2. **2回目（$\mathrm{A}$ と壁）：** $\mathrm{A}$ の速度が反転し、$(v_2, V_2) = \left(+\dfrac{3}{2}v_0, \, -\dfrac{1}{2}v_0\right)$
3. **3回目（$\mathrm{A}$ と $\mathrm{B}$）：** 公式より、
   $$v_3 = \frac{-\frac{3}{2}v_0 + 3\left(-\frac{1}{2}v_0\right)}{2} = -\frac{3}{2}v_0, \qquad V_3 = \frac{\frac{3}{2}v_0 - \frac{1}{2}v_0}{2} = +\frac{1}{2}v_0$$
4. **4回目（$\mathrm{A}$ と壁）：** $\mathrm{A}$ の速度が反転し、$(v_4, V_4) = \left(+\dfrac{3}{2}v_0, \, +\dfrac{1}{2}v_0\right)$  
   このとき $v_4 > V_4 > 0$ なので、右向きに逃げる $\mathrm{B}$ に後ろから $\mathrm{A}$ が追いつく。
5. **5回目（$\mathrm{A}$ と $\mathrm{B}$）：** 公式より、
   $$v_5 = \frac{-\frac{3}{2}v_0 + 3\left(\frac{1}{2}v_0\right)}{2} = 0, \qquad V_5 = \frac{\frac{3}{2}v_0 + \frac{1}{2}v_0}{2} = +v_0$$

ここで $0 = v_5 < V_5$ となったため、これ以上衝突は起こらない。よって総衝突回数は **$N = 5$** 。

##### 設問 (2) の解説

###### (a) エネルギー保存則と円の方程式
すべての衝突が完全弾性衝突であるため、運動のどの時点においても力学的エネルギー保存則

$$
\frac{1}{2}M V^2 + \frac{1}{2}m v^2 = \frac{1}{2}M (-v_0)^2
$$

が成り立つ。両辺を $2$ 倍し、$X = \sqrt{M}\,V, \, Y = \sqrt{m}\,v$ を代入すると、

$$
X^2 + Y^2 = M v_0^2
$$

となる。したがって、点 $\mathrm{P}(X, Y)$ は常に原点を中心とする半径

$$
\mathbf{R = \sqrt{M}\,v_0}
$$

の円周上にあり、運動開始時（$v = 0, \, V = -v_0$）の点 $\mathrm{P}_0$ の座標は

$$
\mathbf{\mathrm{P}_0(X_0, Y_0) = (-R, \, 0)}
$$

である。

###### (b) 壁との衝突における点 $\mathrm{P}$ の移動
小物体 $\mathrm{A}$ が壁と衝突する際、$\mathrm{B}$ の速度 $V$ は変わらず（$X' = X$）、$\mathrm{A}$ の速度 $v$ の符号のみが反転する（$Y' = -Y$）。  
したがって、点 $\mathrm{P}(X, Y)$ は **円周上で $X$ 軸に関して対称な点 $(X, -Y)$ へと移動する** （このとき弦 $\mathrm{PP}'$ は $Y$ 軸に平行である）。

###### (c) $\mathrm{A}$ と $\mathrm{B}$ の衝突における傾きと円周上の角度ステップ
$\mathrm{A}$ と $\mathrm{B}$ の衝突前後では運動量が保存されるため、

$$
M V + m v = M V' + m v'
$$

が成り立つ。これを $X = \sqrt{M}\,V, \, Y = \sqrt{m}\,v$ で書き換えると、

$$
\sqrt{M}\,X + \sqrt{m}\,Y = \sqrt{M}\,X' + \sqrt{m}\,Y' \implies \frac{Y' - Y}{X' - X} = -\sqrt{\frac{M}{m}} = -\frac{1}{\tan\theta}
$$

となる。
- 「$\mathrm{A}$ と壁の衝突」の弦は $Y$ 軸に平行な直線（傾き $\infty$）である。
- 「$\mathrm{A}$ と $\mathrm{B}$ の衝突」の弦は、傾き $-\dfrac{1}{\tan\theta}$ の直線である。

したがって、この2本の弦がなす鋭角（円周角）は常に **$\theta$ ** である。** 円周角の定理 **より、円周角 $\theta$ に対する弧の中心角は** $2\theta$** となる。  
これにより、「$\mathrm{A}$・$\mathrm{B}$ 間の衝突」と「壁との衝突」を1サイクル行うごとに、代表点 $\mathrm{P}$ は円周上を中心角 $2\theta$ ずつ規則正しく切り取って進んでいく。

##### 設問 (3) の解説

###### (a) 終了領域の条件
これ以上衝突が起こらない条件 $0 \le v \le V$ の各辺に正の定数を掛けて $X = \sqrt{M}\,V, \, Y = \sqrt{m}\,v$ で表すと、

$$
0 \le \frac{Y}{\sqrt{m}} \le \frac{X}{\sqrt{M}} \implies 0 \le Y \le X \sqrt{\frac{m}{M}} = X \tan\theta
$$

となる。これは、$XY$ 平面の第1象限において、 **偏角 $\phi$ が $0 \le \phi \le \theta$ を満たす扇形の弧（中心角 $\theta$ の領域）** に点 $\mathrm{P}(X, Y)$ が入ることを意味する。

###### (b) 総衝突回数 $N$ の導出
ビリヤードの鏡像法（壁との衝突のたびに座標系を線対称に折り返して直線軌道に展開する手法）を用いると、1回の衝突ごとに光線（代表点）は中心角 $\theta$ の開き角で交わる2枚の鏡の間を反射することと完全に同型になる。  
半周（中心角 $\pi$）の領域を角度ステップ $\theta$ で何回またげるかという問題に帰着されるため、総衝突回数 $N$ は、

$$
\mathbf{N = \left\lfloor \frac{\pi}{\theta} \right\rfloor \quad \left(\frac{\pi}{\theta} \text{が整数のときは } \frac{\pi}{\theta} - 1\right)}
$$

として厳密に与えられる。（証明終）

##### 設問 (4) の解説
$M = 100^k m$ のとき、$\sqrt{\dfrac{m}{M}} = 10^{-k}$ であるから、

$$
\tan\theta = 10^{-k} \implies \theta = \arctan(10^{-k})
$$

となる。マクローリン展開 $\theta = \arctan(10^{-k}) \approx 10^{-k}\left(1 - \dfrac{10^{-2k}}{3}\right)$ より、

$$
\frac{\pi}{\theta} \approx \pi \cdot 10^k \left(1 + \frac{1}{3} 10^{-2k}\right) = \pi \cdot 10^k + \frac{\pi}{3} 10^{-k}
$$

ここで第2項の誤差 $\dfrac{\pi}{3} 10^{-k}$ は、$k \ge 1$ で極めて小さく、$\pi = 3.14159265\dots$ の小数展開に一致する：
- **$k = 0$（$M = m$）： ** $\theta = \dfrac{\pi}{4} \implies N = 4 - 1 =$**$3$ 回 **-** $k = 1$（$M = 100m$）： **$\dfrac{\pi}{\arctan(0.1)} \approx 31.52 \implies$** $31$ 回 **-** $k = 2$（$M = 10000m$）： **$\dfrac{\pi}{\arctan(0.01)} \approx 314.169 \implies$** $314$ 回 **-** $k = 3$（$M = 10^6 m$）： **$\dfrac{\pi}{\arctan(0.001)} \approx 3141.5937 \implies$** $3141$ 回 **-** $k = 4$（$M = 10^8 m$）： **$\dfrac{\pi}{\arctan(0.0001)} \approx 31415.9266 \implies$** $31415$ 回**

::: tip 🌟 なぜ衝突回数から円周率 $\pi$ が現れるのか？（物理的本質のまとめ）
1. **エネルギー保存則が「円」を作る： ** 運動エネルギー保存則 $\frac{1}{2}MV^2 + \frac{1}{2}mv^2 = E$ は、スケール変換 $(X, Y) = (\sqrt{M}V, \sqrt{m}v)$ によって相空間上の**真円（半周で角度 $\pi$）** を創り出します。
2. **運動量保存則が「一定角度 $\theta$ の反射」を作る：**  
   弾性衝突と壁での反転は円周上の弦の反射となり、円周角の定理によって1衝突ごとに位相角が一定の歩幅 $\theta \approx 10^{-k}$ ずつ進む現象になります。
3. **半周 $\pi$ を微小ステップ $10^{-k}$ で割り算する：**  
   物体 B の運動が $-v_0$ から $+v_0$ へ反転する過程は、円周上の半周（角度 $\pi$）を微小角 $\theta \approx 10^{-k}$ の物差しで何回測れるかという割り算 $\frac{\pi}{10^{-k}} = \pi \times 10^k$ に帰着するため、衝突回数 $N$ に円周率 $\pi$ の数字がそのまま現れるのです。
:::

---

## 📚 関連テーマ
* 🔩 [ばねの単振動と力学的エネルギー保存則](/mechanics/spring)
* 🕰️ [単振り子の運動と周期公式の導出](/mechanics/pendulum)
* 🌊 [定常波・重ね合わせ・ドップラー効果](/waves/index)
