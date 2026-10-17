---
title: 2体問題・重心運動と相対運動（ばね連結2物体の単振動）
description: 高校物理の難関大頻出テーマ「2体問題」。重心座標の定義、重心運動方程式、相対座標と換算質量、重心系から見た逆位相単振動、力学的エネルギーの内訳をインタラクティブシミュレータとベクター図解で完全攻略！
---

# 2体問題・重心運動と相対運動（ばね連結2物体の単振動）

ばねで連結された2物体がなめらかな床の上を動く問題や、動く台の上を滑る物体の問題は、**難関大学（東大・京大・旧帝大など）の入試で極めて頻出**する最高峰テーマです。

一見すると互いに力を及ぼし合って複雑に揺れ動いているように見えますが、**「重心の運動（全体の並進）」** と **「重心から見た相対運動（内部の振動）」** の2つに分解することで、驚くほど美しく見通しよく解くことができます。

<ClientOnly>
  <TwoBodySim />
</ClientOnly>

---

## 1. 重心座標と重心の運動方程式

質量 $m_1$ の物体1が位置 $x_1$ に、質量 $m_2$ の物体2が位置 $x_2$ にあるとき、2物体の**重心（Center of Mass: G）**の位置 $x_G$ は次のように定義されます。

$$
x_G = \frac{m_1 x_1 + m_2 x_2}{m_1 + m_2}
$$

両辺を時間 $t$ で微分すると、**重心速度 $v_G$** が得られます。

$$
v_G = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}
$$

分母を払うと、分子は**全運動量 $P = m_1 v_1 + m_2 v_2$** そのものです。

$$
(m_1 + m_2) v_G = m_1 v_1 + m_2 v_2
$$

さらに時間微分すると、**重心の加速度 $a_G$** と運動方程式が得られます。

$$
(m_1 + m_2) a_G = m_1 a_1 + m_2 a_2
$$

各物体に外力 $F_{\text{ext}}$ と内力 $f$（ばねの弾性力など、互いに及ぼし合う作用反作用の力 $f_{12} = -f_{21}$）がはたらく場合：

$$
m_1 a_1 = F_1^{\text{ext}} + f_{12}, \quad m_2 a_2 = F_2^{\text{ext}} + f_{21}
$$

両式を足し合わせると、内力は作用反作用の法則（$f_{12} + f_{21} = 0$）によって完全に相殺されます！

$$
(m_1 + m_2) a_G = F_1^{\text{ext}} + F_2^{\text{ext}} = F_{\text{ext, total}}
$$

::: tip 重心の運動に関する大定理
外力が一切はたらかない系（水平方向になめらかな床面など）では、$F_{\text{ext, total}} = 0$ となり、
$$
a_G = 0 \iff v_G = \text{一定}
$$
**系全体の重心 G は、外力がない限り、等速直線運動（初速度がゼロなら静止）し続けます。**
内力であるばねの力がいかに激しく伸び縮みしても、重心の等速運動には一切影響を与えません！
:::

---

## 2. 実験室系と重心系のベクター作図

2体問題を明快に理解するために、実験室系（床から見た視点）と重心系（重心Gと一緒に動く観測者から見た視点）の比較をベクター図で確認しましょう。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 380" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <!-- 背景グリッド -->
    <defs>
      <pattern id="grid2" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradLab" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="760" height="380" fill="url(#gradLab)" rx="10"/>
    <rect width="760" height="380" fill="url(#grid2)" rx="10"/>
    <!-- 上段: 実験室系 (Lab frame) -->
    <text x="30" y="35" fill="#38bdf8" font-size="16" font-weight="bold">【実験室系 (床から見た視点)】: 重心Gが右へ速度 v_G で等速運動しながら振動</text>
    <line x1="40" y1="130" x2="720" y2="130" stroke="#64748b" stroke-width="2"/>
    <!-- 物体1 -->
    <rect x="140" y="80" width="50" height="50" fill="#38bdf8" rx="6" stroke="#0284c7" stroke-width="2"/>
    <text x="165" y="110" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">m₁</text>
    <!-- ばね -->
    <path d="M 190 105 L 210 95 L 230 115 L 250 95 L 270 115 L 290 95 L 310 115 L 330 95 L 350 105" fill="none" stroke="#94a3b8" stroke-width="3"/>
    <!-- 物体2 -->
    <rect x="350" y="70" width="70" height="60" fill="#f59e0b" rx="6" stroke="#d97706" stroke-width="2"/>
    <text x="385" y="105" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">m₂</text>
    <!-- 重心G表示 -->
    <line x1="280" y1="50" x2="280" y2="150" stroke="#a855f7" stroke-width="2" stroke-dasharray="4,4"/>
    <circle cx="280" cy="50" r="10" fill="#a855f7"/>
    <text x="280" y="54" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">G</text>
    <!-- 重心速度矢印 -->
    <line x1="280" y1="30" x2="360" y2="30" stroke="#a855f7" stroke-width="3"/>
    <polygon points="360,26 370,30 360,34" fill="#a855f7"/>
    <text x="375" y="34" fill="#a855f7" font-size="13" font-weight="bold">v_G (一定)</text>
    <!-- 距離比 m2 : m1 -->
    <line x1="165" y1="145" x2="280" y2="145" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="280" y1="145" x2="385" y2="145" stroke="#f59e0b" stroke-width="1.5"/>
    <text x="220" y="162" fill="#38bdf8" font-size="12" text-anchor="middle">距離比 m₂</text>
    <text x="330" y="162" fill="#f59e0b" font-size="12" text-anchor="middle">距離比 m₁</text>
    <!-- 区切り線 -->
    <line x1="40" y1="190" x2="720" y2="190" stroke="#334155" stroke-width="1.5" stroke-dasharray="8,4"/>
    <!-- 下段: 重心静止系 (Center of Mass Frame) -->
    <text x="30" y="225" fill="#c084fc" font-size="16" font-weight="bold">【重心静止系 (Gに乗った視点)】: Gは完全に不動！2物体が逆位相で単振動</text>
    <line x1="40" y1="330" x2="720" y2="330" stroke="#64748b" stroke-width="2"/>
    <!-- G固定点 -->
    <line x1="380" y1="240" x2="380" y2="340" stroke="#a855f7" stroke-width="3"/>
    <circle cx="380" cy="240" r="10" fill="#a855f7"/>
    <text x="380" y="244" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">G</text>
    <text x="380" y="360" fill="#c084fc" font-size="13" font-weight="bold" text-anchor="middle">不動点 (壁と同じ)</text>
    <!-- 左のばね (定数 k1 = k(m1+m2)/m2) -->
    <path d="M 230 305 L 250 295 L 270 315 L 290 295 L 310 315 L 330 295 L 350 315 L 380 305" fill="none" stroke="#38bdf8" stroke-width="3"/>
    <!-- 右のばね (定数 k2 = k(m1+m2)/m1) -->
    <path d="M 380 305 L 410 315 L 430 295 L 450 315 L 470 295 L 490 315 L 510 295 L 530 305" fill="none" stroke="#f59e0b" stroke-width="3"/>
    <!-- 物体1 (重心系) -->
    <rect x="180" y="280" width="50" height="50" fill="#38bdf8" rx="6" stroke="#0284c7" stroke-width="2"/>
    <text x="205" y="310" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">m₁</text>
    <!-- 速度矢印1 (左向き) -->
    <line x1="180" y1="265" x2="130" y2="265" stroke="#38bdf8" stroke-width="3"/>
    <polygon points="130,261 120,265 130,269" fill="#38bdf8"/>
    <text x="145" y="255" fill="#38bdf8" font-size="12" font-weight="bold">v₁ - v_G</text>
    <!-- 物体2 (重心系) -->
    <rect x="530" y="270" width="70" height="60" fill="#f59e0b" rx="6" stroke="#d97706" stroke-width="2"/>
    <text x="565" y="305" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">m₂</text>
    <!-- 速度矢印2 (右向き) -->
    <line x1="600" y1="265" x2="650" y2="265" stroke="#f59e0b" stroke-width="3"/>
    <polygon points="650,261 660,265 650,269" fill="#f59e0b"/>
    <text x="615" y="255" fill="#f59e0b" font-size="12" font-weight="bold">v₂ - v_G</text>
  </svg>
</div>

---

## 3. 相対運動方程式と換算質量 $\mu$

物体2から物体1を見た相対座標を $r = x_2 - x_1$、ばねの自然長を $l_0$ とすると、ばねの伸びは $x = r - l_0 = (x_2 - x_1) - l_0$ です。

2物体の運動方程式は：

$$
m_1 \frac{d^2 x_1}{dt^2} = k x, \qquad m_2 \frac{d^2 x_2}{dt^2} = -k x
$$

それぞれの式を質量で割ると：

$$
\frac{d^2 x_1}{dt^2} = \frac{k}{m_1} x, \qquad \frac{d^2 x_2}{dt^2} = -\frac{k}{m_2} x
$$

下の式から上の式を引いて、**相対加速度 $\frac{d^2 r}{dt^2} = \frac{d^2 x_2}{dt^2} - \frac{d^2 x_1}{dt^2} = \frac{d^2 x}{dt^2}$** を作ります。

$$
\frac{d^2 x}{dt^2} = -\left(\frac{1}{m_1} + \frac{1}{m_2}\right) k x
$$

両辺に $\frac{m_1 m_2}{m_1 + m_2}$ を掛けると：

$$
\left(\frac{m_1 m_2}{m_1 + m_2}\right) \frac{d^2 x}{dt^2} = -k x
$$

ここで、**換算質量（Reduced Mass: $\mu$）** を定義します：

$$
\mu = \frac{m_1 m_2}{m_1 + m_2} \iff \frac{1}{\mu} = \frac{1}{m_1} + \frac{1}{m_2}
$$

すると、相対運動の方程式は**たった1つの物体の単振動の方程式**になります！

$$
\mu \frac{d^2 x}{dt^2} = -k x
$$

::: tip 相対運動の単振動の周期と角振動数
換算質量 $\mu$ の物体がばね定数 $k$ のばねにつながれて単振動しているのと全く同等です。
- 固有角振動数:
  $$
  \omega = \sqrt{\frac{k}{\mu}} = \sqrt{\frac{k(m_1 + m_2)}{m_1 m_2}}
  $$
- 固有周期:
  $$
  T = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{\mu}{k}} = 2\pi\sqrt{\frac{m_1 m_2}{(m_1 + m_2)k}}
  $$
:::

---

## 4. ケーニッヒの定理（エネルギーの分解）

系全体の運動エネルギー $K = \frac{1}{2}m_1 v_1^2 + \frac{1}{2}m_2 v_2^2$ は、**「重心並進の運動エネルギー」** と **「相対運動の運動エネルギー」** の和に厳密に分離できます（ケーニッヒの定理）。

$$
K = \frac{1}{2}(m_1 + m_2) v_G^2 + \frac{1}{2}\mu (v_2 - v_1)^2
$$

したがって、ばねの弾性エネルギー $\frac{1}{2}kx^2$ を含めた全エネルギー $E$ は：

$$
E = \frac{1}{2}(m_1 + m_2) v_G^2 + \left[\frac{1}{2}\mu v_{\text{rel}}^2 + \frac{1}{2}kx^2\right]
$$

* **第1項（重心並進エネルギー）**: $\frac{1}{2}(m_1 + m_2) v_G^2$（外力が働かない限り常に一定）
* **第2項（内部振動エネルギー）**: $\frac{1}{2}\mu v_{\text{rel}}^2 + \frac{1}{2}kx^2$（相対運動の力学的エネルギーとして保存）

### 最大圧縮・最大伸長時の超重要性質
ばねが最も縮んだ（または最も伸びた）瞬間、**2物体の相対速度は $v_{\text{rel}} = v_2 - v_1 = 0$** となります。
すなわち、**2物体の速度が完全に等しくなり、ともに重心速度 $v_1 = v_2 = v_G$ となる瞬間**です！

このとき相対運動エネルギーは $0$ となり、その分がすべてばねの弾性エネルギー $\frac{1}{2}kx_{\max}^2$ に変換されます。

---

## 5. 大学入試 厳選実践例題

### 例題1: ばね連結物体への衝突と最大圧縮量（超頻出）

::: info 【問題】
なめらかな水平面上に、質量 $m_1$ の小球Aと質量 $m_2$ の小球Bが、ばね定数 $k$、自然長 $l_0$ の軽いばねで結ばれて静止している。
時刻 $t=0$ に、小球Aに右向きの初速度 $v_0$ を与えた。
1. 系全体の重心速度 $v_G$ を求めよ。
2. ばねの縮みの最大値 $x_{\max}$ を求めよ。
3. ばねの縮みが最大になるまでの時間 $t_1$ を求めよ。
:::

#### 【解法と解説】

**1. 重心速度 $v_G$**
水平方向に外力ははたらかないため、全運動量が保存されます。
$$
(m_1 + m_2) v_G = m_1 v_0 + m_2 \cdot 0 \implies v_G = \frac{m_1}{m_1 + m_2} v_0
$$

**2. ばねの最大縮み $x_{\max}$**
ばねの縮みが最大となる瞬間、AとBの速度は一致してともに $v_G$ となります。
力学的エネルギー保存則より：
$$
\frac{1}{2}m_1 v_0^2 = \frac{1}{2}(m_1 + m_2) v_G^2 + \frac{1}{2}k x_{\max}^2
$$
$v_G = \frac{m_1}{m_1+m_2}v_0$ を代入すると：
$$
\frac{1}{2}k x_{\max}^2 = \frac{1}{2}m_1 v_0^2 - \frac{1}{2}\frac{m_1^2}{m_1 + m_2} v_0^2 = \frac{1}{2}\left(\frac{m_1 m_2}{m_1 + m_2}\right) v_0^2 = \frac{1}{2}\mu v_0^2
$$
よって、最大縮みは：
$$
x_{\max} = \sqrt{\frac{\mu}{k}} v_0 = \sqrt{\frac{m_1 m_2}{(m_1 + m_2)k}} v_0
$$

**3. 最大縮みまでの時間 $t_1$**
相対運動方程式 $\mu \ddot{x} = -kx$ より、相対運動の周期は $T = 2\pi\sqrt{\frac{\mu}{k}}$ です。
初速度 $v_0$（自然長・振動中心）から出発して、最も縮む（振幅最大）までの時間は、単振動の $\frac{1}{4}$ 周期です。
$$
t_1 = \frac{T}{4} = \frac{\pi}{2}\sqrt{\frac{\mu}{k}} = \frac{\pi}{2}\sqrt{\frac{m_1 m_2}{(m_1 + m_2)k}}
$$

---

### 例題2: 動く台車と小球の2体問題（東大・難関国立レベル）

::: info 【問題】
質量 $M$ のなめらかな曲面をもつ台車が、なめらかな水平面上に静止している。
台車の最下点から測った高さ $h$ の位置から、質量 $m$ の小球を静かに離した。重力加速度を $g$ とする。
1. 小球が台車の最下点を通過するときの、台車の速度 $V$ および小球の速度 $v$ を求めよ（右向きを正とする）。
2. 小球が反対側の斜面を駆け上がって到達する最高点の高さ $h'$ を求めよ。
:::

#### 【解法と解説】

**1. 最下点通過時の速度**
水平方向には外力（摩擦や外枠からの力）がはたらかないため、**水平方向の運動量保存則**が成立します（台車は左へ、小球は右へ動く）。
$$
m v + M V = 0 \implies V = -\frac{m}{M} v
$$
系全体で力学的エネルギーが保存されるため：
$$
mgh = \frac{1}{2}m v^2 + \frac{1}{2}M V^2
$$
$V = -\frac{m}{M}v$ を代入すると：
$$
mgh = \frac{1}{2}m v^2 + \frac{1}{2}M \left(-\frac{m}{M}v\right)^2 = \frac{1}{2}m v^2 \left(1 + \frac{m}{M}\right) = \frac{1}{2}\frac{m(M + m)}{M} v^2
$$
これを $v$ について解くと：
$$
v = \sqrt{\frac{2Mgh}{M + m}}
$$
台車の速度 $V$ は：
$$
V = -\frac{m}{M}\sqrt{\frac{2Mgh}{M + m}} = -\sqrt{\frac{2m^2 gh}{M(M + m)}}
$$

**2. 最高点での高さ $h'$**
小球が最高点に達した瞬間、小球の台車に対する相対速度は $0$ になります。
すなわち、台車と小球は同じ水平速度 $u$ で運動しています。
水平方向の運動量保存則より：
$$
(M + m) u = 0 \implies u = 0
$$
したがって、最高点では小球も台車も水平速度が $0$（運動エネルギーがともに $0$）となります。
エネルギー保存則より：
$$
mgh' = mgh \implies h' = h
$$
小球は元の高さ $h$ とまったく同じ高さまで駆け上がります！
