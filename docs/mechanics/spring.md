---
title: ばねの単振動と力学的エネルギー保存則【高校物理シミュレーター】
description: フックの法則、復元力、運動方程式、周期公式 T = 2π√(m/k)、変位・速度・加速度の関係、力学的エネルギー保存則を動くシミュレーションで完全理解
---

# 🔩 ばねの単振動と力学的エネルギー保存則

**単振動**（Simple Harmonic Motion: SHM）は、高校物理・大学入試で最頻出の最重要テーマの1つです。
ばねの伸び縮みによって生じる「復元力」と、運動方程式から導かれる周期公式・エネルギー保存則を、リアルタイムシミュレーションで体感してみましょう！

---

## 🧪 インタラクティブ実験室

<SpringSim />

::: tip 実験のポイント
1. **ばね定数 $k$ と質量 $m$**:
   * ばね定数 $k$ を大きく（硬く）すると、周期 $T$ が短く（素早く振動）なります。
   * 質量 $m$ を大きく（重く）すると、周期 $T$ が長く（ゆっくり振動）なります。
2. **振幅 $A$ と周期**:
   * 振幅 $A$ を大きくしても、**周期 $T$ は一切変化しません**（単振動の等時性）。
3. **エネルギーメーターの変化**:
   * **中心（$x = 0$）**: 弾性エネルギー $U = 0$、運動エネルギー $K$ が最大（速度最大）。
   * **両端（$x = \pm A$）**: 速度 $v = 0$、運動エネルギー $K = 0$、弾性エネルギー $U$ が最大。
   * 全エネルギー $E = K + U$ が常に一定に保たれていることを確認しましょう。
:::

---

## 1. 復元力と単振動の運動方程式

### 1.1 フックの法則（復元力）
ばねの自然長からの伸び（または縮み）を $x$ とすると、ばねが物体を自然長へ戻そうとする力（弾性力・復元力）$F$ は**フックの法則**に従います：

$$
F = -kx
$$

* $k$：ばね定数（ばねの硬さ、単位：$\text{N/m}$）
* $x$：自然長（つり合い位置）からの変位（単位：$\text{m}$）
* **負の符号（$-$）**：変位 $x > 0$（伸び）のときは負の向き（縮む向き）に、変位 $x < 0$（縮み）のときは正の向き（伸びる向き）に、**常につり合い位置へ戻そうとする向き**に力が働くことを意味します。

### 1.2 運動方程式と単振動の判定条件
質量 $m$ の物体の加速度を $a$ とすると、運動方程式 $ma = F$ は：

$$
ma = -kx \quad \implies \quad a = -\frac{k}{m} x
$$

ここで、$\omega^2 = \frac{k}{m}$（$\omega = \sqrt{\frac{k}{m}} > 0$）とおくと：

$$
\boxed{a = -\omega^2 x}
$$

::: important 単振動の決定条件
物体の加速度が **$a = -\omega^2 (\text{中心からの変位})$** の形になるとき、その運動は必ず**角振動数 $\omega$ の単振動**になります！  
入試問題で「この運動が単振動であることを示せ」と言われたら、運動方程式を立ててこの形に変形するのが定石です。
:::

---

## 2. 単振動の式・周期・角振動数

### 2.1 変位・速度・加速度の式
時刻 $t=0$ で最大振幅 $x = A$ から静かに手を離した場合の解は：

* **変位**: $x(t) = A \cos(\omega t)$
* **速度**: $v(t) = \frac{dx}{dt} = -A\omega \sin(\omega t)$
* **加速度**: $a(t) = \frac{dv}{dt} = -A\omega^2 \cos(\omega t) = -\omega^2 x(t)$

### 2.2 中心と端点での物理量比較

| 位置 | 変位 $x$ | 速度 $v$ | 加速度 $a$ | 復元力 $F$ |
| :--- | :--- | :--- | :--- | :--- |
| **振動の中心 ($x=0$)** | $0$ | **最大** ($v_{\max} = A\omega$) | $0$ | $0$ |
| **正の端点 ($x=+A$)** | $+A$ | $0$ | **負の最大** ($-A\omega^2$) | 負の最大 ($-kA$) |
| **負の端点 ($x=-A$)** | $-A$ | $0$ | **正の最大** ($+A\omega^2$) | 正の最大 ($+kA$) |

::: warning よくある誤解
「端点では速度が $0$ だから力も $0$」と勘違いしがちですが、**端点では復元力が最大であり、加速度も最大**です！速度が $0$ なのは「進行方向が切り替わる一瞬」だからです。
:::

### 2.3 周期公式の導出
1往復にかかる時間（周期）$T$ は、位相が $2\pi$ 進む時間なので：

$$
\boxed{T = \frac{2\pi}{\omega} = 2\pi \sqrt{\frac{m}{k}}}
$$

* **質量 $m$ が4倍**になると、周期 $T$ は $\sqrt{4} = 2$ 倍（ゆっくり）になります。
* **ばね定数 $k$ が4倍**になると、周期 $T$ は $1/\sqrt{4} = 1/2$ 倍（素早く）になります。
* **振幅 $A$ には一切依存しない**（等時性）。

---

## 3. 力学的エネルギー保存則

摩擦や空気抵抗がない場合、運動エネルギー $K$ と弾性力による位置エネルギー $U$ の和は常に一定です。

$$
E = K + U = \frac{1}{2}mv^2 + \frac{1}{2}kx^2 = \text{一定}
$$

端点（$x = A, v = 0$）では全エネルギーが弾性エネルギーになるため：

$$
E = \frac{1}{2} k A^2
$$

中心（$x = 0, v = v_{\max}$）では全エネルギーが運動エネルギーになるため：

$$
E = \frac{1}{2} m v_{\max}^2 = \frac{1}{2} k A^2 \implies v_{\max} = A \sqrt{\frac{k}{m}} = A\omega
$$

この関係を使えば、微積分を使わなくても最高速度 $v_{\max} = A\omega$ を瞬時に導くことができます。

---

## 4. 入試頻出：鉛直ばね振り子の極意

天井から鉛直にばねをつるし、質量 $m$ のおもりを取り付けた「鉛直ばね振り子」は入試超頻出です。

<div class="vector-graph-card">
<svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-spr-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="arr-spr-rose" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
    <marker id="arr-spr-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
    </marker>
  </defs>

  <!-- 天井 (全幅) -->
  <line x1="30" y1="35" x2="510" y2="35" stroke="#94a3b8" stroke-width="4"/>
  <rect x="30" y="25" width="480" height="10" fill="#334155"/>
  <text x="40" y="20" fill="#94a3b8" font-size="12">天井 (固定面)</text>

  <!-- 3本の基準線 (横点線) -->
  <!-- 1. 自然長位置 y = 110 -->
  <line x1="30" y1="110" x2="510" y2="110" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4"/>
  <text x="420" y="105" fill="#94a3b8" font-size="12">自然長位置</text>

  <!-- 2. つり合い位置 y = 180 -->
  <line x1="30" y1="180" x2="510" y2="180" stroke="#fbbf24" stroke-width="2" stroke-dasharray="6,4"/>
  <text x="360" y="175" fill="#fbbf24" font-size="13" font-weight="700">★ つり合い位置（振動中心 x=0）</text>

  <!-- === 状態A: 自然長 (x = 100) === -->
  <text x="100" y="55" fill="#94a3b8" font-size="12" font-weight="700" text-anchor="middle">① 自然長</text>
  <path d="M 100,35 L 100,50 L 110,55 L 90,65 L 110,75 L 90,85 L 110,95 L 100,100 L 100,110" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
  <circle cx="100" cy="110" r="4" fill="#38bdf8"/>
  <text x="100" y="130" fill="#94a3b8" font-size="11" text-anchor="middle">おもりなし</text>

  <!-- === 状態B: つり合い状態 (x = 240) === -->
  <text x="240" y="55" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">② つり合い状態</text>
  <path d="M 240,35 L 240,48 L 252,56 L 228,70 L 252,84 L 228,98 L 252,112 L 228,126 L 252,140 L 228,154 L 240,162 L 240,170" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
  <!-- おもり (cx=240, cy=185, 幅34, 高さ30) -->
  <rect x="223" y="170" width="34" height="30" rx="4" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="240" y="190" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">m</text>
  <!-- 力のつり合い矢印 -->
  <line x1="240" y1="170" x2="240" y2="135" stroke="#10b981" stroke-width="2.5" marker-end="url(#arr-spr-green)"/>
  <text x="250" y="145" fill="#10b981" font-size="11" font-weight="700">kx₀ (弾性力)</text>
  <line x1="240" y1="200" x2="240" y2="235" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-spr-blue)"/>
  <text x="250" y="230" fill="#38bdf8" font-size="11" font-weight="700">mg (重力)</text>
  <text x="240" y="260" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">mg = kx₀</text>

  <!-- 伸び x0 の寸法矢印 -->
  <line x1="180" y1="110" x2="180" y2="180" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="175" y1="110" x2="185" y2="110" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="175" y1="180" x2="185" y2="180" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="165" y="150" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="end">伸び x₀</text>

  <!-- === 状態C: 任意変位 x (x = 380) === -->
  <text x="380" y="55" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">③ つり合いから変位 x</text>
  <path d="M 380,35 L 380,48 L 394,58 L 366,74 L 394,90 L 366,106 L 394,122 L 366,138 L 394,154 L 366,170 L 394,186 L 366,202 L 380,212 L 380,220" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
  <!-- おもり (cx=380, cy=235) -->
  <rect x="363" y="220" width="34" height="30" rx="4" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="380" y="240" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">m</text>

  <!-- 変位 x の寸法矢印 -->
  <line x1="430" y1="180" x2="430" y2="235" stroke="#f43f5e" stroke-width="1.5"/>
  <line x1="425" y1="180" x2="435" y2="180" stroke="#f43f5e" stroke-width="1.5"/>
  <line x1="425" y1="235" x2="435" y2="235" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="445" y="212" fill="#f43f5e" font-size="12" font-weight="700">変位 x</text>

  <!-- 合力復元力 F = -kx -->
  <line x1="380" y1="220" x2="380" y2="175" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-spr-rose)"/>
  <text x="390" y="195" fill="#f43f5e" font-size="12" font-weight="700">合力 F = -kx (復元力)</text>
  <text x="380" y="280" fill="#94a3b8" font-size="11" text-anchor="middle">F = mg - k(x₀ + x) = -kx</text>
</svg>
<div class="graph-caption">図: 鉛直ばね振り子の3状態（自然長・つり合い位置・任意変位 $x$）と合力 $F = -kx$ による単振動の成立メカニズム</div>
</div>

1. **つり合いの位置（自然長から $x_0$ 伸びた位置）**:
   $$kx_0 = mg \quad \implies \quad x_0 = \frac{mg}{k}$$
2. **つり合い位置からの変位を $x$ としたときの運動方程式**:
   $$ma = mg - k(x_0 + x) = mg - kx_0 - kx = -kx$$
   $$ma = -kx$$

::: important 鉛直ばね振り子の鉄則
つり合い位置からの変位 $x$ で考えると、**重力 $mg$ が相殺されて消え、水平ばね振り子と全く同じ式**になります！  
したがって：
* **振動の中心**: つり合いの位置（自然長から $x_0 = mg/k$ 伸びた点）
* **周期**: 水平と同じ $T = 2\pi\sqrt{m/k}$
* **エネルギー**: つり合い位置を基準にとれば、重力位置エネルギーを考えずに $E = \frac{1}{2}mv^2 + \frac{1}{2}kx^2 = \text{一定}$ と扱えます。
:::

---

## 5. ばねの直列接続と並列接続

2つのばね（ばね定数 $k_1, k_2$）を組み合わせた合成ばね定数 $k$ の公式：

| 接続方法 | 合成ばね定数 $k$ | 特徴 |
| :--- | :--- | :--- |
| **並列接続**（2本並べて支える） | $k = k_1 + k_2$ | ばねが硬くなり、周期は短くなる |
| **直列接続**（縦につなぐ） | $\frac{1}{k} = \frac{1}{k_1} + \frac{1}{k_2} \implies k = \frac{k_1 k_2}{k_1 + k_2}$ | ばねが柔らかくなり、周期は長くなる |

---

## 📚 関連テーマ
* 🕰️ [単振り子の運動と周期公式の導出](/mechanics/pendulum)
* 💥 [運動量保存則と反発係数（衝突問題の完全攻略）](/mechanics/momentum)
* 🚀 [斜方投射の軌道計算と理論](/mechanics/projectile)
