---
title: 熱量保存則・比熱・潜熱と相転移加熱曲線の完全攻略
description: 高校物理・共通テスト・二次試験頻出「熱量保存則と相転移」。比熱cと熱容量C、公式Q=mcΔT、潜熱（融解熱334J/g・蒸発熱2260J/g）による温度一定プラトー、熱量保存則Q_得=Q_失、氷と温水の混合における3分岐判定アルゴリズムをシミュレータと図解で徹底解説！
---

# 熱量保存則・比熱・潜熱と相転移加熱曲線

氷に熱を加えていくと、温度が $-20^\circ\text{C}$ から $0^\circ\text{C}$ へと上昇し、やがて水へと溶け始め、さらに加熱すると $100^\circ\text{C}$ で沸騰して水蒸気へと姿を変えます。

この過程で最も興味深いのは、**「氷が水に溶けている最中（融解中）や、水が沸騰している最中（蒸発中）は、いくら熱を加え続けても温度が全く上がらない」**という事実です。

この温度上昇を伴わない熱**「潜熱（Latent heat）」**の正体と、外部と熱の出入りがない閉じた系において成り立つ**「熱量保存則 $Q_{\text{得}} = Q_{\text{失}}$」**は、大学入試の熱力学分野で極めて高い出題頻度を誇る基礎必須テーマです。

<ClientOnly>
  <CalorimetrySim />
</ClientOnly>

---

## 1. 比熱 $c$ と熱容量 $C$（温度を変える熱）

物体に熱量 $Q$ を与えたときの温度変化 $\Delta T$ の関係式です。

### ① 熱容量 $C$ [J/K]
物体全体の温度を $1\,\text{K}$（または $1^\circ\text{C}$）上昇させるのに必要な熱量。

$$
Q = C \Delta T
$$

### ② 比熱 $c$ [J/(g·K) または J/(kg·K)]
その物質 $1\,\text{g}$（または $1\,\text{kg}$）の温度を $1\,\text{K}$ 上昇させるのに必要な熱量。質量 $m$ の物体では $C = mc$ となります。

$$
Q = m c \Delta T
$$

| 物質 | 比熱 $c$ [J/(g·K)] | 特徴 |
| :--- | :--- | :--- |
| **水（液体）** | **$4.18$** | きわめて比熱が大きく、温まりにくく冷めにくい（気候の緩和効果） |
| **氷（固体）** | **$2.10$** | 水の約半分の熱量で温まる |
| **水蒸気（気体）** | **$2.00$** | 氷とほぼ同等の比熱 |
| **鉄・銅などの金属** | **$0.38 \sim 0.45$** | 比熱が小さく、熱を加えると瞬時に温度が上がる |

---

## 2. 状態変化と潜熱（温度を変えない熱）

物質が固体 $\leftrightarrow$ 液体 $\leftrightarrow$ 気体と状態変化（相転移）するときに出入りする熱を**潜熱**と呼びます。

$$
Q = m L
$$

- **融解熱 $L_f$**: 固体 $1\,\text{g}$ を液体に変えるのに必要な熱量（氷の融解熱: $L_f \approx 334\,\text{J/g} = 3.34 \times 10^5\,\text{J/kg}$）。
- **蒸発熱 $L_v$**: 液体 $1\,\text{g}$ を気体に変えるのに必要な熱量（水の蒸発熱: $L_v \approx 2260\,\text{J/g} = 2.26 \times 10^6\,\text{J/kg}$）。

### なぜ融解中・沸騰中は温度が上がらないのか？
温度とは、分子の熱運動の激しさ（平均運動エネルギー）の指標です。
加熱中に加えられた熱エネルギーは、分子の運動速度を増やすためではなく、**「分子間に働く結合（水素結合など）を引き離して位置エネルギーを高めるため」**にすべて消費されます。
結合が解け終わるまでは分子運動の速度は増えないため、**温度は一定（プラトー）**のまま保たれます。

> **蒸発熱が融解熱より圧倒的に大きい理由**:
> 融解は固体の規則的な結晶格子を緩めるだけ（体積変化わずか数%）ですが、蒸発は分子間の引力を完全に断ち切って気体としてバラバラに引き離す（体積が約1700倍に膨張する）ため、**約7倍もの巨大なエネルギー**を必要とします！

---

## 3. 熱量保存則（熱平衡の基礎方程式）

熱の出入りが断絶された容器（断熱熱量計）の中では、高温の物体が放出した熱量と、低温の物体が吸収した熱量は完全に一致します。

$$
Q_{\text{得（低温側が受け取った熱）}} = Q_{\text{失（高温側が放出した熱）}}
$$

あるいは、すべての熱変化の総和をとると：

$$
\sum Q = 0
$$

---

## 4. 氷と温水の混合：入試を完全攻略する「3分岐判定アルゴリズム」

$-T_{ice}^\circ\text{C}$ の氷 $m_{ice}$ [g] と、$T_w^\circ\text{C}$ の温水 $m_w$ [g] を混ぜたとき、最終的にどうなるかを判定する手順です。

<div class="vector-diagram-card">
  <svg viewBox="0 0 620 220" class="academic-svg" aria-label="熱量比較判定フローチャート">
    <defs>
      <marker id="flow-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
      </marker>
    </defs>

    <!-- ルート: 温水が放出可能な熱量 -->
    <rect x="135" y="15" width="350" height="42" rx="8" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2" />
    <text x="310" y="33" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">温水が0℃までに放出可能な最大熱量</text>
    <text x="310" y="49" fill="#e2e8f0" font-size="13" font-family="monospace" text-anchor="middle">Q_avail = m_w · c_w · T_w</text>

    <!-- 分岐線 -->
    <path d="M 310 57 L 310 80" stroke="#94a3b8" stroke-width="2" />
    <path d="M 160 80 L 460 80" stroke="#94a3b8" stroke-width="2" />
    <line x1="160" y1="80" x2="160" y2="105" stroke="#94a3b8" stroke-width="2" marker-end="url(#flow-arrow)" />
    <line x1="460" y1="80" x2="460" y2="105" stroke="#94a3b8" stroke-width="2" marker-end="url(#flow-arrow)" />

    <!-- 左分岐: Q_avail >= Q_melt -->
    <rect x="40" y="105" width="240" height="95" rx="8" fill="rgba(16, 185, 129, 0.12)" stroke="#10b981" stroke-width="2" />
    <text x="160" y="125" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">Q_avail ≥ Q_melt</text>
    <text x="160" y="143" fill="#94a3b8" font-size="11" text-anchor="middle">（氷がすべて完全に融解）</text>
    <line x1="55" y1="152" x2="265" y2="152" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1" />
    <text x="160" y="172" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">【ケース A】すべて水になる</text>
    <text x="160" y="190" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">最終温度: T_f &gt; 0 ℃</text>

    <!-- 右分岐: Q_avail < Q_melt -->
    <rect x="340" y="105" width="240" height="95" rx="8" fill="rgba(251, 191, 36, 0.12)" stroke="#fbbf24" stroke-width="2" />
    <text x="460" y="125" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">Q_avail &lt; Q_melt</text>
    <text x="460" y="143" fill="#94a3b8" font-size="11" text-anchor="middle">（氷をすべて溶かしきれない）</text>
    <line x1="355" y1="152" x2="565" y2="152" stroke="rgba(251, 191, 36, 0.3)" stroke-width="1" />
    <text x="460" y="172" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">【ケース B】氷と水が共存！</text>
    <text x="460" y="190" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">最終温度: T_f = 0.0 ℃ 確定</text>
  </svg>
  <div class="diagram-caption">フローチャート: 氷と水の熱量比較による状態判定アルゴリズム</div>
</div>

### 【ステップ1】基準となる熱量を計算する
1. **氷がすべて融解するのに必要な熱量 $Q_{melt}$**:
   $$
   Q_{melt} = \underbrace{m_{ice} c_{ice} |T_{ice}|}_{\text{氷を0℃まで温める}} + \underbrace{m_{ice} L_f}_{\text{0℃の氷を全て水にする}}
   $$
2. **温水が $0^\circ\text{C}$ まで冷えるときに放出できる最大熱量 $Q_{avail}$**:
   $$
   Q_{avail} = m_w c_w T_w
   $$

### 【ステップ2】大小比較で即座に判定
- **$Q_{avail} > Q_{melt}$ の場合**:
  熱量が余るため、**氷はすべて溶けて全体が水になり、最終温度は $T_f > 0^\circ\text{C}$** になります。
  $$
  Q_{melt} + (m_{ice} + m_w) c_w T_f = Q_{avail}
  $$
- **$Q_{avail} < Q_{melt}$ の場合**:
  熱量が足りず、氷をすべて溶かすことができません。
  このとき、熱のやり取りは途中で停止し、**最終温度は計算するまでもなく「$T_f = 0.0^\circ\text{C}$」で確定**します！
  溶けた氷の質量 $x$ [g] は：
  $$
  m_{ice} c_{ice} |T_{ice}| + x L_f = Q_{avail} \implies x = \frac{Q_{avail} - m_{ice} c_{ice} |T_{ice}|}{L_f}
  $$

---

## 5. 実戦入試演習問題

### 【問題】
熱容量の無視できる断熱容器の中に、$60^\circ\text{C}$ の温水 $200\,\text{g}$ が入っている。
ここに $-10^\circ\text{C}$ の氷 $50\,\text{g}$ を投入して全体をよくかき混ぜた。
水の比熱を $4.2\,\text{J/(g}\cdot\text{K)}$、氷の比熱を $2.1\,\text{J/(g}\cdot\text{K)}$、氷の融解熱を $3.3 \times 10^2\,\text{J/g}$ とする。

1. 投入した氷がすべて $0^\circ\text{C}$ の水になるまでに必要な熱量 $Q_1$ を求めよ。
2. 容器内の温水が $0^\circ\text{C}$ まで冷えるときに放出する熱量 $Q_2$ を求めよ。
3. 最終的な混合液の熱平衡温度 $T_f$ を求めよ。

---

### 【解答・解説】

#### 1. 氷が0℃の水になる熱量 $Q_1$
氷の温度上昇（$-10^\circ\text{C} \to 0^\circ\text{C}$）に必要な熱量:

$$
Q_{1a} = m_{ice} c_{ice} \Delta T = 50\,\text{g} \times 2.1\,\text{J/(g}\cdot\text{K)} \times 10\,\text{K} = 1050\,\text{J}
$$

$0^\circ\text{C}$ の氷が $0^\circ\text{C}$ の水になる融解熱:

$$
Q_{1b} = m_{ice} L_f = 50\,\text{g} \times 3.3 \times 10^2\,\text{J/g} = 16500\,\text{J}
$$

したがって、必要な総熱量は：

$$
Q_1 = Q_{1a} + Q_{1b} = 1050 + 16500 = \mathbf{17550\,\text{J} \approx 1.76 \times 10^4\,\text{J}}
$$

#### 2. 温水が0℃になる熱量 $Q_2$

$$
Q_2 = m_w c_w \Delta T = 200\,\text{g} \times 4.2\,\text{J/(g}\cdot\text{K)} \times 60\,\text{K} = \mathbf{50400\,\text{J} \approx 5.04 \times 10^4\,\text{J}}
$$

#### 3. 最終平衡温度 $T_f$
$Q_2 = 50400\,\text{J} > Q_1 = 17550\,\text{J}$ より、温水の熱量は氷を完全に溶かすのに十分です。
氷はすべて融解し、全体で $m_{tot} = 50 + 200 = 250\,\text{g}$ の水となり、$0^\circ\text{C}$ を超えて $T_f^\circ\text{C}$ まで上昇します。

熱量保存則より：

$$
Q_1 + m_{tot} c_w (T_f - 0) = m_w c_w (60 - T_f)
$$

$$
17550 + 250 \times 4.2 \times T_f = 200 \times 4.2 \times (60 - T_f)
$$

$$
17550 + 1050 T_f = 50400 - 840 T_f
$$

$$
(1050 + 840) T_f = 50400 - 17550
$$

$$
1890 T_f = 32850 \implies T_f = \frac{32850}{1890} \approx \mathbf{17.4^\circ\text{C}}
$$
