---
title: 気球の浮力と大気の高度・熱気球の浮上条件
description: 気体の状態方程式による空気密度の温度依存性 ρ = PM/RT、アルキメデスの原理、熱気球の浮上条件と最低必要温度の導出、入試頻出例題を完全網羅。
---

# 気球の浮力と大気の高度・熱気球の浮上条件

1783年、フランスのモンゴルフィエ兄弟が人類初の有人飛行を成功させた「熱気球」は、高校物理において「**気体の状態方程式（ボイル・シャルルの法則）**」と「**力学の浮力（アルキメデスの原理）**」が完璧に融合する代表的な総合入試問題です。

本項では、熱気球の内部気圧が外気圧と等しく保たれる理由、空気密度 $\rho$ と絶対温度 $T$ の反比例関係、浮上に必要な最低内部温度の導出、および上空での大気圧低下に伴う最高到達高度の定石解法を体系的に解説します。

---

## 1. 熱気球の浮力と温度平衡のインタラクティブシミュレーター

内部の加熱温度 $T_{\text{in}}$、外気温度 $T_{\text{out}}$、気球の体積 $V$、本体質量 $M$ をスライダーで調整し、内部空気の密度低下によって浮力（上向き）が全重力（下向き）に打ち勝ち、気球が空へと浮上する様子を観察できます。

<ClientOnly>
  <HotAirBalloonSim />
</ClientOnly>

---

## 2. 熱気球の物理原理と空気密度

### 2.1 気球の下部が「開いている」ことの物理的意味
熱気球はゴム風船のように密閉されておらず、 **下部に大きな開口部** があり、そこからバーナーで炎を吹き込みます。
したがって、「**気球内部の気圧 $P_{\text{in}}$ は、外部の大気圧 $P_{\text{out}} = P_0$ と常に等しい**」という極めて重要な前提が成り立ちます。

$$P_{\text{in}} = P_{\text{out}} = P_0$$

<div class="vector-graph-card">
  <div class="graph-title">図1：熱気球に働く浮力と重力のつり合いモデル</div>
  <svg viewBox="0 0 540 280" class="vector-svg">
    <rect width="540" height="280" fill="#0f172a" rx="8"/>
    <!-- 熱気球のエンベロープ -->
    <path d="M 270 50 A 60 60 0 0 1 320 120 L 285 170 L 255 170 L 220 120 A 60 60 0 0 1 270 50 Z" 
          fill="rgba(251, 146, 60, 0.2)" stroke="#fb923c" stroke-width="2.5"/>
    <text x="270" y="100" fill="#fb923c" font-size="13" font-weight="bold" text-anchor="middle">内部空気 (高温 T_in)</text>
    <text x="270" y="118" fill="#fed7aa" font-size="11" text-anchor="middle">低密度 ρ_in = P₀M / RT_in</text>
    <!-- バーナー炎 -->
    <polygon points="265,170 270,150 275,170" fill="#fbbf24"/>
    <!-- カゴ (ゴンドラ) -->
    <rect x="260" y="185" width="20" height="15" fill="#78350f" stroke="#b45309" stroke-width="1.5"/>
    <line x1="255" y1="170" x2="260" y2="185" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="285" y1="170" x2="280" y2="185" stroke="#94a3b8" stroke-width="1.2"/>
    <text x="270" y="215" fill="#94a3b8" font-size="11" text-anchor="middle">本体質量 M</text>
    <!-- 外気の表記 -->
    <text x="80" y="100" fill="#38bdf8" font-size="13" font-weight="bold">外気 (低温 T_out)</text>
    <text x="80" y="118" fill="#94a3b8" font-size="11">高密度 ρ_out = P₀M / RT_out</text>
    <!-- 浮力ベクトル F_B (上向き) -->
    <line x1="390" y1="150" x2="390" y2="60" stroke="#22c55e" stroke-width="3"/>
    <polygon points="390,52 384,65 396,65" fill="#22c55e"/>
    <text x="402" y="90" fill="#22c55e" font-size="13" font-weight="bold">浮力 F_B = ρ_out V g</text>
    <text x="402" y="108" fill="#94a3b8" font-size="10">（排除した外気の重さ）</text>
    <!-- 重力ベクトル (下向き) -->
    <line x1="390" y1="150" x2="390" y2="230" stroke="#f43f5e" stroke-width="3"/>
    <polygon points="390,238 384,225 396,225" fill="#f43f5e"/>
    <text x="402" y="180" fill="#f43f5e" font-size="13" font-weight="bold">全重力 W</text>
    <text x="402" y="198" fill="#f43f5e" font-size="11">= (M + ρ_in V) g</text>
  </svg>
</div>

### 2.2 気体の状態方程式と密度の関係
空気の平均モル質量を $M_{\text{mol}}$（$\approx 28.8 \times 10^{-3}\text{ kg/mol}$）、気体定数を $R$ とします。
体積 $V$、質量 $m$、絶対温度 $T$ の空気の状態方程式は：

$$P_0 V = n R T = \left( \frac{m}{M_{\text{mol}}} \right) R T$$

ここから、空気の密度 $\rho = \frac{m}{V}$ を求めると：

$$\mathbf{\rho(T) = \frac{P_0 M_{\text{mol}}}{R T}}$$

大気圧 $P_0$ が一定であるとき、 **気体の密度 $\rho$ は絶対温度 $T$ に反比例します**。
内部の空気を加熱して温度を $T_{\text{in}} > T_{\text{out}}$ に引き上げると、余分な空気が下部の開口部から外へと逃げ出し、気球内の空気密度が外気よりも低くなります（$\rho_{\text{in}} < \rho_{\text{out}}$）。

---

## 3. 浮上条件と最低内部温度の導出

### 3.1 力のつり合いとアルキメデスの原理
気球全体の体積を $V$、気球本体（皮膜・カゴ・バーナー・乗員・積載物）の合計質量を $M_{\text{balloon}}$ とします。

1. **浮力 $F_B$（アルキメデスの原理）**:
   気球が押しのけた外気（体積 $V$、密度 $\rho_{\text{out}}$）の重さに等しい上向きの力を受けます。
   $$F_B = \rho_{\text{out}} V g$$

2. **系全体の全重力 $W$**:
   気球本体の重力と、気球内部に入っている熱い空気（体積 $V$、密度 $\rho_{\text{in}}$）の重力の和です。
   $$W = M_{\text{balloon}} g + \rho_{\text{in}} V g = (M_{\text{balloon}} + \rho_{\text{in}} V) g$$

### 3.2 浮上するための必要十分条件
気球が上向きに浮上するためには、浮力が全重力以上でなければなりません：

$$F_B \ge W \iff \rho_{\text{out}} V g \ge (M_{\text{balloon}} + \rho_{\text{in}} V) g$$

両辺を $g$ で割り整理すると：

$$\mathbf{(\rho_{\text{out}} - \rho_{\text{in}}) V \ge M_{\text{balloon}}}$$

> 💡 **物理的意味** ：
> 「内外の空気の密度差 $\Delta \rho = \rho_{\text{out}} - \rho_{\text{in}}$ に体積 $V$ をかけた正味の揚力」が、気球本体の質量 $M_{\text{balloon}}$ を超えた瞬間に気球は浮上します。

### 3.3 最低内部温度 $T_{\text{in}}$ の導出
密度式 $\rho = \frac{P_0 M_{\text{mol}}}{R T}$ を代入します：

$$\frac{P_0 M_{\text{mol}} V}{R} \left( \frac{1}{T_{\text{out}}} - \frac{1}{T_{\text{in}}} \right) \ge M_{\text{balloon}}$$

$$\frac{1}{T_{\text{out}}} - \frac{1}{T_{\text{in}}} \ge \frac{R M_{\text{balloon}}}{P_0 M_{\text{mol}} V}$$

$$\mathbf{\frac{1}{T_{\text{in}}} \le \frac{1}{T_{\text{out}}} - \frac{R M_{\text{balloon}}}{P_0 M_{\text{mol}} V}}$$

外気温度 $T_{\text{out}}$ が低い（冬の早朝など）ほど、右辺第1項 $\frac{1}{T_{\text{out}}}$ が大きくなるため、より低い内部温度で簡単に浮上できます（気球競技が冬や朝凪に行われる理由です）。

---

## 4. 大学入試厳選例題

### 例題1：熱気球の浮上に必要な最低温度（標準〜典型）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">国公立大・標準レベル</span>
    <strong>問題：熱気球の浮上と温度計算</strong>
  </div>
  <p>
    大気圧 $P_0 = 1.0 \times 10^5\text{ Pa}$、外気温度 $t_{\text{out}} = 17^\circ\text{C}$（絶対温度 $T_{\text{out}} = 290\text{ K}$）の平地において、体積 $V = 2.4 \times 10^3\text{ m}^3$ の熱気球を浮上させたい。
    気球本体（皮膜・カゴ・乗員）の総質量は $M = 480\text{ kg}$ である。
    気体定数を $R = 8.3\text{ J/(mol}\cdot\text{K)}$、空気の平均モル質量を $M_{\text{mol}} = 29\text{ g/mol} = 2.9 \times 10^{-2}\text{ kg/mol}$、重力加速度を $g = 9.8\text{ m/s}^2$ とする。
  </p>
  <ol>
    <li>外気の密度 $\rho_{\text{out}}$ [$\text{kg/m}^3$] を求めよ。</li>
    <li>気球が浮上するために必要な気球内部の空気の最大密度 $\rho_{\text{in}}$ [$\text{kg/m}^3$] を求めよ。</li>
    <li>気球が浮上するために必要な内部空気の最低絶対温度 $T_{\text{in}}$ [$\text{K}$] およびセルシウス温度 $t_{\text{in}}$ [$^\circ\text{C}$] を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 外気の密度 $\rho_{\text{out}}$**
状態方程式より：
$$
\begin{aligned}
\rho_{\text{out}} &= \frac{P_0 M_{\text{mol}}}{R T_{\text{out}}} = \frac{1.0 \times 10^5 \times 2.9 \times 10^{-2}}{8.3 \times 290} \\
&= \frac{2900}{2407} \approx \mathbf{1.20\text{ kg/m}^3}
\end{aligned}
$$

**2. 浮上時の内部空気の最大密度 $\rho_{\text{in}}$**
浮上条件式 $(\rho_{\text{out}} - \rho_{\text{in}}) V \ge M$ より：
$$\rho_{\text{out}} - \rho_{\text{in}} \ge \frac{M}{V} = \frac{480}{2400} = 0.20\text{ kg/m}^3$$
$$\rho_{\text{in}} \le \rho_{\text{out}} - 0.20 = 1.20 - 0.20 = \mathbf{1.00\text{ kg/m}^3}$$

**3. 最低内部温度 $T_{\text{in}}$**
内部の圧力は大気圧 $P_0$ と等しいため：
$$\rho_{\text{in}} = \frac{P_0 M_{\text{mol}}}{R T_{\text{in}}} \le 1.00$$
$$
\begin{aligned}
T_{\text{in}} &\ge \frac{P_0 M_{\text{mol}}}{R \times 1.00} = \frac{1.0 \times 10^5 \times 2.9 \times 10^{-2}}{8.3 \times 1.00} \\
&= \frac{2900}{8.3} \approx \mathbf{349.4\text{ K}} \quad (350\text{ K})
\end{aligned}
$$
セルシウス温度に換算すると：
$$t_{\text{in}} = 349.4 - 273.15 \approx \mathbf{76.3^\circ\text{C}} \quad (約 76^\circ\text{C})$$

---

### 例題2：気球の最高到達高度（難関大・大気減衰モデル）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">難関国公立大・発展</span>
    <strong>問題：高度に伴う大気圧変化と気球の静止高度</strong>
  </div>
  <p>
    地表（高度 $z = 0$）での大気圧を $P_0$、温度を $T_0$ とする。
    大気の温度は高度によらず一定（等温大気 $T = T_0$）と仮定すると、高度 $z$ における大気圧 $P(z)$ は次式で表される：<br>
    <span style="display:block;text-align:center;margin:8px 0;">$\displaystyle P(z) = P_0 e^{-z / H} \quad \left(H = \frac{RT_0}{M_{\text{mol}} g} \approx 8.0\text{ km}\right)$</span>
    体積 $V$（一定）、本体質量 $M$ の熱気球の内部空気を一定の温度 $T_{\text{in}}$（ただし $T_{\text{in}} > T_0$）に保ちながら上昇させた。
  </p>
  <ol>
    <li>高度 $z$ における外気密度 $\rho_{\text{out}}(z)$ および気球内空気の密度 $\rho_{\text{in}}(z)$ を $P(z), M_{\text{mol}}, R, T_0, T_{\text{in}}$ を用いて表せ。</li>
    <li>この気球が浮力を失って静止する最高到達高度 $z_{\max}$ を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 高度 $z$ における空気密度**
高度 $z$ における大気圧は $P(z)$ です。
気球の下部は開いているため、内部の圧力も $P(z)$ に等しく保たれます。
- 外気密度: $\rho_{\text{out}}(z) = \mathbf{\frac{P(z) M_{\text{mol}}}{R T_0}}$
- 内部密度: $\rho_{\text{in}}(z) = \mathbf{\frac{P(z) M_{\text{mol}}}{R T_{\text{in}}}}$

**2. 最高到達高度 $z_{\max}$ の導出**
最高到達高度では、浮力と重力が完全に釣り合って静止します（揚力が $0$）。
$$(\rho_{\text{out}}(z_{\max}) - \rho_{\text{in}}(z_{\max})) V = M$$
密度式を代入すると：
$$\frac{P(z_{\max}) M_{\text{mol}}}{R} \left( \frac{1}{T_0} - \frac{1}{T_{\text{in}}} \right) V = M$$
$$P(z_{\max}) = \frac{M R}{M_{\text{mol}} V \left( \frac{1}{T_0} - \frac{1}{T_{\text{in}}} \right)}$$

気圧の高度分布式 $P(z_{\max}) = P_0 e^{-z_{\max} / H}$ より：
$$e^{-z_{\max} / H} = \frac{M R}{P_0 M_{\text{mol}} V \left( \frac{1}{T_0} - \frac{1}{T_{\text{in}}} \right)}$$
両辺の自然対数をとると：
$$-\frac{z_{\max}}{H} = \ln \left[ \frac{M R}{P_0 M_{\text{mol}} V \left( \frac{1}{T_0} - \frac{1}{T_{\text{in}}} \right)} \right]$$

$$\mathbf{z_{\max} = H \ln \left[ \frac{P_0 M_{\text{mol}} V}{M R} \left( \frac{1}{T_0} - \frac{1}{T_{\text{in}}} \right) \right]}$$

---

## 5. まとめ

| 物理法則 | 関係式 | 特記事項 |
| :--- | :--- | :--- |
| **圧力の平衡** | $P_{\text{in}} = P_{\text{out}} = P_0$ | 下部開口部により内外圧が等しい |
| **気体密度** | $\rho = \frac{P_0 M_{\text{mol}}}{RT}$ | 温度 $T$ に反比例して軽くなる |
| **浮上条件** | $(\rho_{\text{out}} - \rho_{\text{in}}) V \ge M_{\text{balloon}}$ | 密度差による正味浮力が本体質量を上回る |
| **最低浮上温度** | $\frac{1}{T_{\text{in}}} \le \frac{1}{T_{\text{out}}} - \frac{R M}{P_0 M_{\text{mol}} V}$ | 外気温が低いほど簡単に浮上できる |
