---
title: 空気抵抗を受ける物体の運動と終端速度（雨滴・パラシュート）
description: 高校物理の発展・共通テスト・難関大頻出「空気抵抗と終端速度」。粘性抵抗（速さに比例）と慣性抵抗（速さの2乗に比例）、微分方程式による速度の時間変化導出、v-tグラフの漸近線をインタラクティブシミュレーターとベクター図解で徹底解説！
---

# 空気抵抗を受ける物体の運動と終端速度（雨滴・パラシュート）

教科書の初等的な力学では「空気抵抗は無視できるものとする」と仮定されますが、現実世界では **空気抵抗（流体抵抗）が決定的な役割** を果たします。

もし空気抵抗がなければ、上空数千メートルから落下してくる雨粒はピストルの弾丸並みの猛スピード（秒速数百メートル）に達し、地上のあらゆるものを破壊してしまいます。雨粒が痛くないのは、落下中に空気抵抗と重力がつり合い、 **「終端速度（Terminal Velocity）」** と呼ばれる一定速度に頭打ちになるためです。

<ClientOnly>
  <TerminalVelocitySim />
</ClientOnly>

---

## 1. 2つの空気抵抗モデル

流体（空気）中を動く物体が受ける抵抗力には、速度の領域によって2つの物理的メカニズムが存在します。

| 種類 | 粘性抵抗（層流抵抗） | 慣性抵抗（乱流抵抗） |
| :--- | :--- | :--- |
| **比例関係 **|** 速さ $v$ に比例 **($f = k v$) |** 速さの2乗 $v^2$ に比例** ($f = \kappa v^2$) |
| **適用範囲** | 低速運動、微小な球（霧雨、グリセリン中の小球など） | 高速運動、日常サイズの物体（野球ボール、雨滴、人間、車など） |
| **物理的起源** | 流体の分子粘性摩擦（ストークスの法則） | 前方の空気を押しのけて加速させる慣性反作用・後方の渦（圧力抵抗） |
| **抵抗係数** | $k = 6\pi \eta r$（球の場合、$\eta$: 粘性率） | $\kappa = \frac{1}{2} C_D \rho A$（$C_D$: 抗力係数、$A$: 断面積） |

---

## 2. 粘性抵抗（$f = kv$）における運動方程式と終端速度の導出

鉛直下向きを正の向きとし、質量 $m$ の物体が静止状態（$t=0, v=0$）から落下を始める場合を考えます。

重力 $mg$（下向き）と空気抵抗 $kv$（上向き）がはたらくので、運動方程式は：

$$
m \frac{dv}{dt} = mg - kv
$$

両辺を $m$ で割ると：

$$
\frac{dv}{dt} = g - \frac{k}{m}v = -\frac{k}{m}\left(v - \frac{mg}{k}\right)
$$

### ① 終端速度 $v_{\text{term}}$ の決定
速度が増加すると抵抗力 $kv$ も増大し、やがて **重力と空気抵抗が完全につり合って加速度がゼロ（$\frac{dv}{dt} = 0$）** になります。
このときの速度を **終端速度（Terminal Velocity: $v_{\text{term}}$）** と呼びます。

$$
mg - kv_{\text{term}} = 0 \iff v_{\text{term}} = \frac{mg}{k}
$$

### ② 微分方程式の積分（速度 $v(t)$ の厳密解）
変数分離形にして両辺を積分します：

$$
\int \frac{dv}{v - v_{\text{term}}} = -\frac{k}{m} \int dt \implies \ln|v - v_{\text{term}}| = -\frac{k}{m}t + C
$$

初期条件 $t=0$ で $v=0$ より、$\ln|-v_{\text{term}}| = C$ ですから：

$$
\ln\left(\frac{v_{\text{term}} - v}{v_{\text{term}}}\right) = -\frac{k}{m}t \implies 1 - \frac{v}{v_{\text{term}}} = e^{-\frac{k}{m}t}
$$

よって、落下速度 $v(t)$ の理論式が得られます！

::: tip 粘性抵抗における速度 $v(t)$ の式
$$
v(t) = v_{\text{term}} \left(1 - e^{-\frac{k}{m}t}\right) = \frac{mg}{k} \left(1 - e^{-\frac{k}{m}t}\right)
$$
- $t=0$ のとき: $v(0) = 0$、初期加速度は $\left.\frac{dv}{dt}\right|_{t=0} = g$（自由落下と同じ）
- $t \to \infty$ のとき: $e^{-\infty} = 0$ となり、$v \to v_{\text{term}} = \frac{mg}{k}$（水平漸近線）
:::

---

## 3. 力のつり合いと $v$-$t$ グラフのベクター図解

空気抵抗を受ける物体の運動と、$v$-$t$ グラフの幾何学的特徴をベクター図で確認しましょう。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 320" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridTV" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradTV" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="320" fill="url(#gradTV)" rx="10"/>
    <rect width="760" height="320" fill="url(#gridTV)" rx="10"/>
    <!-- 左側: 力の矢印推移 (3段階) -->
    <g transform="translate(40, 30)">
      <text x="140" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【速度の増加と力のつり合い推移】</text>
      <!-- 段階1: t = 0 -->
      <g transform="translate(20, 60)">
        <circle cx="20" cy="50" r="14" fill="#38bdf8"/>
        <line x1="20" y1="64" x2="20" y2="124" stroke="#34d399" stroke-width="3"/>
        <polygon points="17,124 20,132 23,124" fill="#34d399"/>
        <text x="20" y="150" fill="#34d399" font-size="11" text-anchor="middle">mg</text>
        <text x="20" y="30" fill="#94a3b8" font-size="10" text-anchor="middle">v = 0 (f=0)</text>
        <text x="20" y="175" fill="#e2e8f0" font-size="12" text-anchor="middle">① 落下開始</text>
        <text x="20" y="195" fill="#38bdf8" font-size="11" text-anchor="middle">a = g</text>
      </g>
      <!-- 段階2: 加速中 -->
      <g transform="translate(130, 60)">
        <circle cx="20" cy="50" r="14" fill="#38bdf8"/>
        <!-- mg -->
        <line x1="20" y1="64" x2="20" y2="124" stroke="#34d399" stroke-width="3"/>
        <polygon points="17,124 20,132 23,124" fill="#34d399"/>
        <!-- f -->
        <line x1="20" y1="36" x2="20" y2="6" stroke="#f43f5e" stroke-width="3"/>
        <polygon points="17,6 20,-2 23,6" fill="#f43f5e"/>
        <text x="35" y="18" fill="#f43f5e" font-size="11">f=kv</text>
        <text x="20" y="175" fill="#e2e8f0" font-size="12" text-anchor="middle">② 加速中</text>
        <text x="20" y="195" fill="#38bdf8" font-size="11" text-anchor="middle">0 &lt; a &lt; g</text>
      </g>
      <!-- 段階3: 終端速度 -->
      <g transform="translate(240, 60)">
        <circle cx="20" cy="50" r="14" fill="#38bdf8"/>
        <!-- mg -->
        <line x1="20" y1="64" x2="20" y2="124" stroke="#34d399" stroke-width="3"/>
        <polygon points="17,124 20,132 23,124" fill="#34d399"/>
        <!-- f = mg (同じ長さ) -->
        <line x1="20" y1="36" x2="20" y2="-24" stroke="#f43f5e" stroke-width="3"/>
        <polygon points="17,-24 20,-32 23,-24" fill="#f43f5e"/>
        <text x="35" y="-10" fill="#f43f5e" font-size="11">f=mg</text>
        <text x="20" y="175" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">③ 終端速度到達</text>
        <text x="20" y="195" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">a = 0 (等速)</text>
      </g>
    </g>
    <!-- 右側: v-t グラフ -->
    <g transform="translate(380, 40)">
      <rect x="0" y="0" width="340" height="240" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="170" y="25" fill="#f59e0b" font-size="14" font-weight="bold" text-anchor="middle">【v-t グラフの比較】</text>
      <!-- 軸 -->
      <line x1="40" y1="200" x2="310" y2="200" stroke="#94a3b8" stroke-width="2"/>
      <line x1="40" y1="200" x2="40" y2="50" stroke="#94a3b8" stroke-width="2"/>
      <text x="35" y="45" fill="#94a3b8" font-size="11" text-anchor="end">v</text>
      <text x="315" y="215" fill="#94a3b8" font-size="11">t</text>
      <!-- 自由落下 (直線: 傾きg) -->
      <line x1="40" y1="200" x2="160" y2="50" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="165" y="65" fill="#64748b" font-size="10">自由落下 (v = gt)</text>
      <!-- 終端速度漸近線 (赤) -->
      <line x1="40" y1="90" x2="310" y2="90" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="250" y="82" fill="#ef4444" font-size="11" font-weight="bold">v_term = mg/k</text>
      <!-- 実際の速度曲線 (青) -->
      <path d="M 40 200 Q 100 100 180 93 T 310 90" fill="none" stroke="#38bdf8" stroke-width="3"/>
      <text x="190" y="125" fill="#38bdf8" font-size="11" font-weight="bold">v(t) = v_term(1 - e^{-kt/m})</text>
      <!-- 原点での接線 (傾きg) -->
      <text x="60" y="180" fill="#34d399" font-size="10">初期傾き = g</text>
    </g>
  </svg>
</div>

---

## 4. 慣性抵抗（$f = \kappa v^2$）の終端速度

高速で落下する雨滴（直径数mm）やスカイダイバーの場合、空気の抵抗力は速さの2乗に比例する慣性抵抗 $f = \kappa v^2 = \frac{1}{2}\rho C_D A v^2$ となります。

終端速度では重力とつり合うため：

$$
mg = \kappa v_{\text{term}}^2 \implies v_{\text{term}} = \sqrt{\frac{mg}{\kappa}} = \sqrt{\frac{2mg}{\rho C_D A}}
$$

### 雨滴の大きさと終端速度の関係
球形の雨滴（半径 $r$、密度 $\rho_w$）を考えると：
- 質量: $m = \frac{4}{3}\pi r^3 \rho_w \propto r^3$
- 断面積: $A = \pi r^2 \propto r^2$

これを代入すると、終端速度は半径の平方根に比例します！

$$
v_{\text{term}} \propto \sqrt{\frac{r^3}{r^2}} = \sqrt{r}
$$

- **霧雨（$r \approx 0.05\,\text{mm}$）**: 終端速度はわずか約 $0.3\,\text{m/s}$（ふわふわと舞うように落下）
- **普通の雨（$r \approx 1\,\text{mm}$）**: 終端速度は約 $6\sim 9\,\text{m/s}$（時速約 $20\sim 30\,\text{km/h}$）
- **スカイダイビング（大の字人間）**: 終端速度は約 $50\,\text{m/s}$（時速約 $180\,\text{km/h}$）
- **パラシュート開傘時**: 終端速度は約 $5\,\text{m/s}$（時速約 $18\,\text{km/h}$、安全に着地可能）

---

## 5. 大学入試 厳選実践例題

### 例題1: 粘性抵抗を受ける小球の運動（東大・難関国立大レベル）

::: info 【問題】
粘性率 $\eta$ の液体中に、密度 $\rho$、半径 $r$ の小さな球を静かに放した。液体の密度を $\rho_0$（$\rho > \rho_0$）、重力加速度を $g$ とする。
小球が速さ $v$ で運動するとき、受ける粘性抵抗力の大きさはストークスの法則より $f = 6\pi \eta r v$ である。
1. 小球にはたらく浮力の大きさ $F_B$ を求めよ。
2. 小球の終端速度 $v_{\text{term}}$ を求めよ。
:::

#### 【解法と解説】

**1. 浮力 $F_B$**
小球の体積は $V = \frac{4}{3}\pi r^3$ です。アルキメデスの原理より、排除した液体の重さに等しい浮力を受けます。
$$
F_B = \rho_0 V g = \frac{4}{3}\pi r^3 \rho_0 g
$$

**2. 終端速度 $v_{\text{term}}$**
小球の質量は $m = \rho V = \frac{4}{3}\pi r^3 \rho$ です。
終端速度に達したとき、下向きの重力と、上向きの浮力および粘性抵抗力がつり合います。
$$
mg = F_B + f \implies \frac{4}{3}\pi r^3 \rho g = \frac{4}{3}\pi r^3 \rho_0 g + 6\pi \eta r v_{\text{term}}
$$
移項して整理すると：
$$
6\pi \eta r v_{\text{term}} = \frac{4}{3}\pi r^3 (\rho - \rho_0) g
$$
両辺を $6\pi \eta r$ で割ると：
$$
v_{\text{term}} = \frac{2 r^2 (\rho - \rho_0) g}{9 \eta}
$$
終端速度 $v_{\text{term}}$ は球の半径の2乗 $r^2$ に比例します！（この原理はミリカンによる電気素量測定実験でも活用されています。）

---

### 例題2: パラシュート降下と速度変化（共通テスト・思考力問題）

::: info 【問題】
質量 $M = 70\,\text{kg}$ のスカイダイバーが上空で大の字になって自由落下し、終端速度 $v_1 = 50\,\text{m/s}$ に達した。
その後、パラシュートを開いたところ、空気抵抗係数が元の $16$ 倍になった。空気抵抗は速さの2乗に比例する（$f = \kappa v^2$）ものとする。重力加速度を $g = 9.8\,\text{m/s}^2$ とする。
1. パラシュートを開いた直後のスカイダイバーの加速度 $a$ の大きさと向きを求めよ。
2. パラシュート開傘後の新たな終端速度 $v_2\,[\text{m/s}]$ を求めよ。
:::

#### 【解法と解説】

**1. 開傘直後の加速度**
開傘前の終端速度 $v_1 = 50\,\text{m/s}$ では重力と空気抵抗がつり合っていたので：
$$
Mg = \kappa v_1^2
$$
パラシュートを開いた瞬間、抵抗係数が $\kappa' = 16\kappa$ に急増しますが、速度は瞬間的には $v_1$ のままです。
したがって、開傘直後の抵抗力は：
$$
f' = \kappa' v_1^2 = 16 (\kappa v_1^2) = 16 Mg
$$
鉛直下向きを正とすると、運動方程式は：
$$
M a = Mg - f' = Mg - 16 Mg = -15 Mg \implies a = -15 g = -15 \times 9.8 = -147\,\text{m/s}^2
$$
スカイダイバーは **上向きに約 $15G$（$147\,\text{m/s}^2$）の強烈な減速加速度** を受けます！ **2. 新たな終端速度 $v_2$**
十分に時間が経つと、再び重力と新しい抵抗力 $16\kappa v_2^2$ がつり合います。
$$
Mg = 16 \kappa v_2^2
$$
前の式 $Mg = \kappa v_1^2$ と連立すると：
$$
\kappa v_1^2 = 16 \kappa v_2^2 \implies v_2^2 = \frac{v_1^2}{16} \implies v_2 = \frac{v_1}{4}
$$
したがって、
$$
v_2 = \frac{50}{4} = 12.5\,\text{m/s}
$$
終端速度は元の $\frac{1}{\sqrt{16}} = \frac{1}{4}$ である $12.5\,\text{m/s}$（時速 $45\,\text{km/h}$）まで大幅に減速されます。
