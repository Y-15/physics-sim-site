---
title: 気体のモル比熱とマイヤーの関係式・断熱変化（ポアソンの法則）
description: 高校物理の熱力学分野・最重要理論「気体のモル比熱」。定積モル比熱Cvと定圧モル比熱Cp、マイヤーの関係式Cp=Cv+Rの熱力学第1法則による完全導出、断熱変化のポアソンの法則をインタラクティブシミュレーターとベクター図解で徹底解説！
---

# 気体のモル比熱とマイヤーの関係式・断熱変化（ポアソンの法則）

物質 $1\,\text{g}$ あたりの温度を $1\,\text{K}$ 上げるのに必要な熱量を「比熱 $c$」と呼びますが、気体の場合は質量よりも **物質量 $n\,[\text{mol}]$** で考える方がはるかに本質的です。

気体 $1\,\text{mol}$ あたりの温度を $1\,\text{K}$ 上げる熱量を「**モル比熱 $C$**」と呼びます。気体は加熱中に「膨張して外に仕事をするかどうか」によって必要な熱量が激変するため、「**定積モル比熱 $C_V$**」と「**定圧モル比熱 $C_P$**」を厳密に区別する必要があります。

<ClientOnly>
  <HeatCapacitySim />
</ClientOnly>

---

## 1. モル比熱の定義と定積モル比熱 $C_V$

物質量 $n\,[\text{mol}]$ の気体に熱量 $Q$ を与えて、温度が $\Delta T$ 上昇したとき、モル比熱 $C$ は次のように定義されます。

$$
Q = n C \Delta T \iff C = \frac{Q}{n \Delta T}
$$

### ① 定積変化（体積一定: $\Delta V = 0$）
体積が変化しないため、気体が外部にする仕事はゼロです（$W = 0$）。
熱力学第1法則 $Q = \Delta U + W$ より：

$$
Q_V = \Delta U
$$

与えた熱量は $100\%$ すべて内部エネルギーの増加（温度上昇）に使われます！
気体の定積モル比熱を $C_V$ と置くと、$Q_V = n C_V \Delta T$ ですから：

$$
\Delta U = n C_V \Delta T
$$

::: tip 超重要！内部エネルギーの公式は「どんな変化でも」成立する
内部エネルギー $U$ は温度 $T$ だけで決まる状態量です。
したがって、 **等圧変化・等温変化・断熱変化など、いかなる状態変化であっても、内部エネルギー変化は常に $\Delta U = n C_V \Delta T$ で計算できます！**
- 単原子分子理想気体（He, Ne, Ar）:
  $$
  U = \frac{3}{2}nRT \implies C_V = \frac{3}{2}R
  $$
- 2原子分子理想気体（$\text{N}_2, \text{O}_2$）:
  回転運動の2自由度が加わり：
  $$
  U = \frac{5}{2}nRT \implies C_V = \frac{5}{2}R
  $$
:::

---

## 2. 定圧モル比熱 $C_P$ とマイヤーの関係式の導出

### ② 定圧変化（圧力一定: $P = \text{一定}$）
気体が加熱されて膨張するとき、ピストンを押して外部に正の仕事 $W = P\Delta V$ を行います。
理想気体の状態方程式 $P V = n R T$ より、圧力一定のもとで両辺の微小変化をとると：

$$
P \Delta V = n R \Delta T
$$

したがって、気体が外部にする仕事は $W = n R \Delta T$ です。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 320" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridHC" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradHC" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="760" height="320" fill="url(#gradHC)" rx="10"/>
    <rect width="760" height="320" fill="url(#gridHC)" rx="10"/>
    <!-- 定積加熱 -->
    <g transform="translate(60, 40)">
      <rect x="0" y="0" width="280" height="240" fill="#1e293b" rx="8" stroke="#38bdf8"/>
      <text x="140" y="30" fill="#38bdf8" font-size="15" font-weight="bold" text-anchor="middle">【定積変化】体積固定 (W = 0)</text>
      <!-- シリンダー -->
      <rect x="50" y="60" width="180" height="80" fill="none" stroke="#64748b" stroke-width="2"/>
      <line x1="180" y1="60" x2="180" y2="140" stroke="#f59e0b" stroke-width="6"/>
      <text x="210" y="105" fill="#ef4444" font-size="11">固定</text>
      <!-- 熱量 Qv -->
      <text x="140" y="170" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">Q_V = ΔU + 0</text>
      <text x="140" y="200" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">Q_V = n C_V ΔT</text>
      <text x="140" y="225" fill="#94a3b8" font-size="12" text-anchor="middle">熱は100%温度上昇に使われる</text>
    </g>
    <!-- 定圧加熱 -->
    <g transform="translate(420, 40)">
      <rect x="0" y="0" width="280" height="240" fill="#1e293b" rx="8" stroke="#f59e0b"/>
      <text x="140" y="30" fill="#f59e0b" font-size="15" font-weight="bold" text-anchor="middle">【定圧変化】ピストン膨張 (W > 0)</text>
      <!-- シリンダー -->
      <rect x="30" y="60" width="200" height="80" fill="none" stroke="#64748b" stroke-width="2"/>
      <line x1="190" y1="60" x2="190" y2="140" stroke="#f59e0b" stroke-width="6"/>
      <!-- 仕事矢印 -->
      <line x1="195" y1="100" x2="245" y2="100" stroke="#f59e0b" stroke-width="3"/>
      <polygon points="245,96 255,100 245,104" fill="#f59e0b"/>
      <text x="220" y="90" fill="#f59e0b" font-size="11">W</text>
      <!-- 式 -->
      <text x="140" y="170" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">Q_P = ΔU + W</text>
      <text x="140" y="200" fill="#f59e0b" font-size="14" font-weight="bold" text-anchor="middle">n C_P ΔT = n C_V ΔT + n R ΔT</text>
      <text x="140" y="225" fill="#a855f7" font-size="13" font-weight="bold" text-anchor="middle">C_P = C_V + R （マイヤーの式）</text>
    </g>
  </svg>
</div>

熱力学第1法則に $\Delta U = n C_V \Delta T$ と $W = n R \Delta T$ を代入すると：

$$
Q_P = \Delta U + W = n C_V \Delta T + n R \Delta T = n (C_V + R) \Delta T
$$

定圧モル比熱の定義 $Q_P = n C_P \Delta T$ と比較すると、両辺の $n \Delta T$ を割ることで、熱力学史上に輝く有名な **マイヤーの関係式（Mayer's relation）** が導かれます！

$$
C_P = C_V + R
$$

::: tip マイヤーの関係式の直観的意味
定圧加熱では、温度を上げるためのエネルギー（$C_V$）に加えて、「**ピストンを押して大気圧に打ち勝つ仕事をするための余分なエネルギー（$R$）**」が必要になるため、必ず $C_P > C_V$ となります。その差額がちょうど気体定数 $R$ です！
:::

---

## 3. 比熱比 $\gamma$ と断熱変化（ポアソンの法則）

定圧モル比熱と定積モル比熱の比を **比熱比（Heat Capacity Ratio: $\gamma$）** と定義します。

$$
\gamma = \frac{C_P}{C_V} = \frac{C_V + R}{C_V} = 1 + \frac{R}{C_V} > 1
$$

- **単原子分子**: $C_V = \frac{3}{2}R, \quad C_P = \frac{5}{2}R \implies \gamma = \frac{5}{3} \approx 1.67$
- **2原子分子**: $C_V = \frac{5}{2}R, \quad C_P = \frac{7}{2}R \implies \gamma = \frac{7}{5} = 1.40$

### 断熱変化におけるポアソンの法則（微積分による厳密導出）
外部との熱の出入りを遮断した状態（$dQ = 0$）で気体を変化させると、第1法則より：

$$
0 = dU + dW = n C_V dT + P dV
$$

理想気体の状態方程式 $PV = nRT$ を全微分すると、$P dV + V dP = n R dT$ ですから、$n dT = \frac{P dV + V dP}{R}$ です。これを代入すると：

$$
C_V \left(\frac{P dV + V dP}{R}\right) + P dV = 0
$$

両辺に $R$ を掛けて整理し、$C_V + R = C_P$ を使うと：

$$
C_V V dP + (C_V + R) P dV = 0 \iff C_V V dP + C_P P dV = 0
$$

両辺を $C_V P V$ で割ると：

$$
\frac{dP}{P} + \left(\frac{C_P}{C_V}\right) \frac{dV}{V} = 0 \iff \frac{dP}{P} + \gamma \frac{dV}{V} = 0
$$

両辺を積分すると：

$$
\ln P + \gamma \ln V = \text{一定} \iff \ln(P V^\gamma) = \text{一定}
$$

::: tip ポアソンの法則（Poisson's Law）
準静的断熱変化において、次の関係が常に成立します。
$$
P V^\gamma = \text{一定}
$$
状態方程式 $P = \frac{nRT}{V}$ を用いて $P$ を消去すると：
$$
T V^{\gamma - 1} = \text{一定}
$$
$V = \frac{nRT}{P}$ を用いて $V$ を消去すると：
$$
\frac{T^\gamma}{P^{\gamma - 1}} = \text{一定}
$$
:::

---

## 4. 大学入試 厳選実践例題

### 例題1: 定圧膨張における仕事と熱量の比率（共通テスト・私大頻出）

::: info 【問題】
単原子分子理想気体 $1\,\text{mol}$ を、圧力を一定に保ったまま加熱したところ、気体の温度が $\Delta T$ 上昇した。気体定数を $R$ とする。
1. 気体に加えた熱量 $Q$ を求めよ。
2. 気体が外部にした仕事 $W$ を求めよ。
3. 気体の内部エネルギーの増加 $\Delta U$ を求めよ。
4. 加えた熱量 $Q$ のうち、外部への仕事 $W$ に使われた割合 $\frac{W}{Q}$、および内部エネルギー増加 $\Delta U$ に使われた割合 $\frac{\Delta U}{Q}$ をそれぞれ求めよ。
:::

#### 【解法と解説】

**1. 熱量 $Q$**
単原子分子の定圧モル比熱は $C_P = \frac{5}{2}R$ です。
$$
Q = n C_P \Delta T = \frac{5}{2}R \Delta T
$$

**2. 外部にした仕事 $W$**
定圧変化における仕事は状態方程式より：
$$
W = P\Delta V = n R \Delta T = R \Delta T
$$

**3. 内部エネルギー増加 $\Delta U$**
定積モル比熱 $C_V = \frac{3}{2}R$ より：
$$
\Delta U = n C_V \Delta T = \frac{3}{2}R \Delta T
$$
（検算: $Q = \Delta U + W = \frac{3}{2}R\Delta T + R\Delta T = \frac{5}{2}R\Delta T$ で完全に成立）

**4. 使われた割合**
$$
\frac{W}{Q} = \frac{R\Delta T}{\frac{5}{2}R\Delta T} = \frac{2}{5} = 40\%
$$
$$
\frac{\Delta U}{Q} = \frac{\frac{3}{2}R\Delta T}{\frac{5}{2}R\Delta T} = \frac{3}{5} = 60\%
$$
単原子分子の定圧加熱では、 **投入した熱量の $60\%$ が温度上昇に、$40\%$ がピストンを押し広げる仕事に使われる** という比率は、温度や体積に関わらず常に一定です！

---

### 例題2: 断熱圧縮による気体の温度上昇（難関国立大レベル）

::: info 【問題】
シリンダー内に温度 $T_0 = 300\,\text{K}$、体積 $V_0$ の単原子分子理想気体（比熱比 $\gamma = 5/3$）が封入されている。
シリンダーの外壁は断熱材で覆われており、ピストンを素早く押し込んで気体の体積を初めの $\frac{1}{8}$ に断熱圧縮した。
1. 圧縮後の気体の圧力は、圧縮前の何倍になるか。
2. 圧縮後の気体の絶対温度 $T_1\,[\text{K}]$ を求めよ。
:::

#### 【解法と解説】

**1. 圧縮後の圧力比**
ポアソンの法則 $P_0 V_0^\gamma = P_1 V_1^\gamma$ より：
$$
\frac{P_1}{P_0} = \left(\frac{V_0}{V_1}\right)^\gamma = \left(\frac{V_0}{\frac{1}{8}V_0}\right)^{5/3} = 8^{5/3}
$$
$8 = 2^3$ なので：
$$
8^{5/3} = (2^3)^{5/3} = 2^5 = 32
$$
したがって、圧力は初めの **32倍** に跳ね上がります！

**2. 圧縮後の温度 $T_1$**
断熱変化における温度と体積の関係式 $T_0 V_0^{\gamma - 1} = T_1 V_1^{\gamma - 1}$ より：
$$
T_1 = T_0 \left(\frac{V_0}{V_1}\right)^{\gamma - 1} = 300 \times 8^{(5/3 - 1)} = 300 \times 8^{2/3}
$$
$8^{2/3} = (2^3)^{2/3} = 2^2 = 4$ なので：
$$
T_1 = 300 \times 4 = 1200\,\text{K}
$$
体積を $\frac{1}{8}$ に断熱圧縮するだけで、気体の温度は $300\,\text{K}$（約$27^\circ\text{C}$）から一気に **$1200\,\text{K}$（約$927^\circ\text{C}$）** まで急上昇します！（これはディーゼルエンジンで燃料を自己着火させる原理そのものです。）
