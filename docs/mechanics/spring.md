---
title: ばねの単振動と力学的エネルギー保存則【高校物理シミュレーター】
description: フックの法則、復元力、運動方程式、周期公式 T = 2π√(m/k)、変位・速度・加速度の関係、力学的エネルギー保存則を動くシミュレーションで完全理解
---

# 🔩 ばねの単振動と力学的エネルギー保存則

**単振動** （Simple Harmonic Motion: SHM）は、高校物理・大学入試で最頻出の最重要テーマの1つです。
ばねの伸び縮みによって生じる「復元力」と、運動方程式から導かれる周期公式・エネルギー保存則を、リアルタイムシミュレーションで体感してみましょう！

---

## 🧪 インタラクティブ実験室

<ClientOnly>
  <SpringSim />
</ClientOnly>

::: tip 実験のポイント
1. **ばね定数 $k$ と質量 $m$**:
   * ばね定数 $k$ を大きく（硬く）すると、周期 $T$ が短く（素早く振動）なります。
   * 質量 $m$ を大きく（重く）すると、周期 $T$ が長く（ゆっくり振動）なります。
2. **振幅 $A$ と周期**:
   * 振幅 $A$ を大きくしても、 **周期 $T$ は一切変化しません** （単振動の等時性）。
3. **エネルギーメーターの変化**:
   * **中心（$x = 0$）**: 弾性エネルギー $U = 0$、運動エネルギー $K$ が最大（速度最大）。
   * **両端（$x = \pm A$）**: 速度 $v = 0$、運動エネルギー $K = 0$、弾性エネルギー $U$ が最大。
   * 全エネルギー $E = K + U$ が常に一定に保たれていることを確認しましょう。
:::

---

## 1. 復元力と単振動の運動方程式

### 1.1 フックの法則（復元力）
ばねの自然長からの伸び（または縮み）を $x$ とすると、ばねが物体を自然長へ戻そうとする力（弾性力・復元力）$F$ は **フックの法則** に従います：

$$
F = -kx
$$

* $k$：ばね定数（ばねの硬さ、単位：$\text{N/m}$）
* $x$：自然長（つり合い位置）からの変位（単位：$\text{m}$）
* **負の符号（$-$） ** ：変位 $x > 0$（伸び）のときは負の向き（縮む向き）に、変位 $x < 0$（縮み）のときは正の向き（伸びる向き）に、**常につり合い位置へ戻そうとする向き** に力が働くことを意味します。

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
物体の加速度が **$a = -\omega^2 (\text{中心からの変位})$ ** の形になるとき、その運動は必ず**角振動数 $\omega$ の単振動** になります！  
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
| **振動の中心 ($x=0$) **| $0$ |** 最大** ($v_{\max} = A\omega$) | $0$ | $0$ |
| **正の端点 ($x=+A$) **| $+A$ | $0$ |** 負の最大** ($-A\omega^2$) | 負の最大 ($-kA$) |
| **負の端点 ($x=-A$) **| $-A$ | $0$ |** 正の最大** ($+A\omega^2$) | 正の最大 ($+kA$) |

::: warning よくある誤解
「端点では速度が $0$ だから力も $0$」と勘違いしがちですが、 **端点では復元力が最大であり、加速度も最大** です！速度が $0$ なのは「進行方向が切り替わる一瞬」だからです。
:::

### 2.3 周期公式の導出
1往復にかかる時間（周期）$T$ は、位相が $2\pi$ 進む時間なので：

$$
\boxed{T = \frac{2\pi}{\omega} = 2\pi \sqrt{\frac{m}{k}}}
$$

* **質量 $m$ が4倍** になると、周期 $T$ は $\sqrt{4} = 2$ 倍（ゆっくり）になります。
* **ばね定数 $k$ が4倍** になると、周期 $T$ は $1/\sqrt{4} = 1/2$ 倍（素早く）になります。
* **振幅 $A$ には一切依存しない** （等時性）。

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
<svg viewBox="0 0 680 390" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="spr-ceiling-hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" stroke-width="1.5" />
    </pattern>
    <linearGradient id="spr-mass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <marker id="spr-arr-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="spr-arr-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
    </marker>
    <marker id="spr-arr-rose" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
    <marker id="spr-arr-amber" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
    </marker>
  </defs>
  <rect x="30" y="14" width="620" height="16" fill="url(#spr-ceiling-hatch)"/>
  <line x1="30" y1="30" x2="650" y2="30" stroke="#94a3b8" stroke-width="3"/>
  <rect x="40" y="10" width="90" height="18" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <text x="85" y="23" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">天井 (固定面)</text>
  <line x1="30" y1="125" x2="520" y2="125" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>
  <rect x="530" y="115" width="120" height="20" rx="4" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <text x="590" y="129" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">自然長位置</text>
  <line x1="30" y1="205" x2="510" y2="205" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.8"/>
  <rect x="515" y="194" width="145" height="22" rx="4" fill="#1e293b" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="587" y="209" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">★ つり合い位置 (x = 0)</text>
  <g id="state-natural">
    <rect x="65" y="40" width="90" height="22" rx="11" fill="#1e293b" stroke="#64748b" stroke-width="1"/>
    <text x="110" y="55" fill="#e2e8f0" font-size="11" font-weight="700" text-anchor="middle">① 自然長</text>
    <rect x="106" y="30" width="8" height="6" fill="#64748b"/>
    <path d="M 110,36 L 110,48 L 122,55 L 98,66 L 122,77 L 98,88 L 122,99 L 98,110 L 110,118 L 110,125" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="110" cy="125" r="4" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <rect x="75" y="140" width="70" height="20" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1"/>
    <text x="110" y="154" fill="#94a3b8" font-size="11" text-anchor="middle">おもりなし</text>
  </g>
  <g id="dimension-x0">
    <line x1="190" y1="125" x2="190" y2="205" stroke="#fbbf24" stroke-width="1.5"/>
    <line x1="182" y1="125" x2="198" y2="125" stroke="#fbbf24" stroke-width="1.5"/>
    <line x1="182" y1="205" x2="198" y2="205" stroke="#fbbf24" stroke-width="1.5"/>
    <polygon points="190,125 187,133 193,133" fill="#fbbf24"/>
    <polygon points="190,205 187,197 193,197" fill="#fbbf24"/>
    <rect x="155" y="153" width="70" height="22" rx="4" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
    <text x="190" y="168" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">伸び x₀</text>
  </g>
  <g id="state-equilibrium">
    <rect x="245" y="40" width="110" height="22" rx="11" fill="#1e293b" stroke="#fbbf24" stroke-width="1.2"/>
    <text x="300" y="55" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">② つり合い状態</text>
    <rect x="296" y="30" width="8" height="6" fill="#64748b"/>
    <path d="M 300,36 L 300,46 L 314,55 L 286,69 L 314,83 L 286,97 L 314,111 L 286,125 L 314,139 L 286,153 L 314,167 L 286,177 L 300,181 L 300,185" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="280" y="187" width="40" height="36" rx="5" fill="url(#spr-mass-grad)" stroke="#fbbf24" stroke-width="2"/>
    <text x="300" y="210" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">m</text>
    <line x1="338" y1="205" x2="338" y2="155" stroke="#10b981" stroke-width="2.5" marker-end="url(#spr-arr-green)"/>
    <rect x="348" y="152" width="95" height="20" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="1"/>
    <text x="395" y="166" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">kx₀ (弾性力)</text>
    <line x1="338" y1="205" x2="338" y2="255" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#spr-arr-blue)"/>
    <rect x="348" y="242" width="85" height="20" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
    <text x="390" y="256" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">mg (重力)</text>
    <circle cx="338" cy="205" r="3.5" fill="#fbbf24"/>
    <rect x="245" y="275" width="110" height="24" rx="5" fill="#1e293b" stroke="#fbbf24" stroke-width="1.2"/>
    <text x="300" y="291" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">mg = kx₀ (合力 0)</text>
  </g>
  <g id="state-displacement">
    <rect x="420" y="40" width="125" height="22" rx="11" fill="#1e293b" stroke="#f43f5e" stroke-width="1.2"/>
    <text x="482" y="55" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">③ つり合いから変位 x</text>
    <rect x="478" y="30" width="8" height="6" fill="#64748b"/>
    <path d="M 482,36 L 482,46 L 498,58 L 466,74 L 498,90 L 466,106 L 498,122 L 466,138 L 498,154 L 466,170 L 498,186 L 466,202 L 498,218 L 466,232 L 482,240 L 482,245" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="462" y="245" width="40" height="36" rx="5" fill="url(#spr-mass-grad)" stroke="#f43f5e" stroke-width="2"/>
    <text x="482" y="268" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">m</text>
    <line x1="438" y1="205" x2="438" y2="263" stroke="#f43f5e" stroke-width="1.5"/>
    <line x1="430" y1="205" x2="446" y2="205" stroke="#f43f5e" stroke-width="1.5"/>
    <line x1="430" y1="263" x2="446" y2="263" stroke="#f43f5e" stroke-width="1.5"/>
    <polygon points="438,205 435,213 441,213" fill="#f43f5e"/>
    <polygon points="438,263 435,255 441,255" fill="#f43f5e"/>
    <rect x="400" y="222" width="55" height="20" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
    <text x="427" y="236" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">変位 x</text>
    <circle cx="520" cy="263" r="3.5" fill="#f43f5e"/>
    <line x1="520" y1="263" x2="520" y2="205" stroke="#f43f5e" stroke-width="3" marker-end="url(#spr-arr-rose)"/>
    <rect x="532" y="220" width="135" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
    <text x="599" y="235" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">合力 F = −kx (復元力)</text>
    <rect x="385" y="320" width="235" height="26" rx="5" fill="#1e293b" stroke="#f43f5e" stroke-width="1.2"/>
    <text x="502" y="337" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">F = mg − k(x₀ + x) = −kx</text>
  </g>
</svg>
<div class="graph-caption">図: 鉛直ばね振り子の3状態（自然長・つり合い位置・任意変位 <i>x</i>）と合力 <i>F</i> = −<i>kx</i> による単振動の成立メカニズム</div>
</div>

1. **つり合いの位置（自然長から $x_0$ 伸びた位置）**:
   $$kx_0 = mg \quad \implies \quad x_0 = \frac{mg}{k}$$
2. **つり合い位置からの変位を $x$ としたときの運動方程式**:
   $$ma = mg - k(x_0 + x) = mg - kx_0 - kx = -kx$$
   $$ma = -kx$$

::: important 鉛直ばね振り子の鉄則
つり合い位置からの変位 $x$ で考えると、 **重力 $mg$ が相殺されて消え、水平ばね振り子と全く同じ式** になります！  
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
| **並列接続** （2本並べて支える） | $k = k_1 + k_2$ | ばねが硬くなり、周期は短くなる |
| **直列接続** （縦につなぐ） | $\frac{1}{k} = \frac{1}{k_1} + \frac{1}{k_2} \implies k = \frac{k_1 k_2}{k_1 + k_2}$ | ばねが柔らかくなり、周期は長くなる |

---

## 📚 関連テーマ
* 🕰️ [単振り子の運動と周期公式の導出](/mechanics/pendulum)
* 💥 [運動量保存則と反発係数（衝突問題の完全攻略）](/mechanics/momentum)
* 🚀 [斜方投射の軌道計算と理論](/mechanics/projectile)
