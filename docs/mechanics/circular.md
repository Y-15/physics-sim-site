---
title: 等速円運動・向心加速度・向心力【高校物理シミュレーター】
description: 等速円運動の周期 T = 2π/ω、速度 v = rω、向心加速度 a = rω² = v²/r、向心力、単振動との深い関係（正射影）を動くシミュレーションで完全攻略
---

# 🔄 等速円運動・向心加速度・向心力

**等速円運動**（Uniform Circular Motion）は、スピード（速さ）は一定であるにもかかわらず、**向きが絶えず変化するため常に加速度が生じている**という、高校物理で最も直感と数式をつなぐのが難しい重要テーマです。

速度ベクトル $\vec{v}$（接線方向）と加速度ベクトル $\vec{a}$（中心方向）が常に直交して回転する様子を、リアルタイムシミュレーションで体感しましょう！

---

## 🧪 インタラクティブ実験室

<CircularSim />

::: tip 実験のポイント
1. **速度ベクトルと加速度ベクトルの直交**:
   * 速度 $\vec{v}$ は常に円の**接線方向**を向き、加速度 $\vec{a}$ は常に**円の中心方向**を向きます（両者は常に $\mathbf{90^\circ}$ 直交！）。
2. **半径 $r$ と角速度 $\omega$ の関係**:
   * 角速度 $\omega$ を2倍にすると、速さ $v = r\omega$ は2倍、向心加速度 $a = r\omega^2$ はなんと**4倍**に急増します！カーブでスピードを出しすぎると危険な理由がここにあります。
3. **単振動への正射影（画面下の赤い球）**:
   * 円運動を横（x軸）から見ると、完全に**単振動**（$x = r\cos\omega t$）と一致します。端で速度が $0$、中心で速度最大になる様子を確認してみましょう。
:::

---

## 1. 等速円運動の基本関係式

半径 $r$ の円周上を、一定の速さで回転する運動を**等速円運動**といいます。

### 1.1 角速度 $\omega$ と速度 $v$
* **角速度 $\omega\,[\text{rad/s}]$**: 1秒間に半径が回転する角度（ラジアン）。
* **円周上の速さ $v\,[\text{m/s}]$**: 半径 $r$ に角速度 $\omega$ をかけたもの：

$$
\boxed{v = r\omega}
$$

### 1.2 周期 $T$ と回転数（振動数）$f$
* **周期 $T\,[\text{s}]$**: 円をちょうど1周（$2\pi\,\text{rad}$）するのにかかる時間：

$$
\boxed{T = \frac{2\pi r}{v} = \frac{2\pi}{\omega}}
$$

* **回転数 $f\,[\text{Hz} = 1/\text{s}]$**: 1秒間に何周するか（周期の逆数）：

$$
\boxed{f = \frac{1}{T} = \frac{\omega}{2\pi} \iff \omega = 2\pi f}
$$

---

## 2. 向心加速度 $a$ の導出

「速さが一定なのに、なぜ加速度があるのか？」  
それは、**速度の向きが変わるから**です。加速度は「単位時間あたりの速度ベクトルの変化」$\vec{a} = \frac{\Delta\vec{v}}{\Delta t}$ で定義されます。

<div class="vector-diagram-card">
  <svg viewBox="0 0 520 200" class="academic-svg" aria-label="等速円運動における向心加速度と速度ベクトル変化の導出">
    <defs>
      <marker id="circ-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="circ-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
    </defs>

    <!-- 左側: 円軌道上の2点 -->
    <path d="M 160 170 A 90 90 0 0 0 160 30" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="4,4" />
    <circle cx="160" cy="100" r="4" fill="#64748b" />
    <text x="145" y="105" fill="#94a3b8" font-size="11">O (中心)</text>
    <line x1="160" y1="100" x2="100" y2="100" stroke="#64748b" stroke-width="1.5" />
    <line x1="160" y1="100" x2="115" y2="60" stroke="#64748b" stroke-width="1.5" />
    <text x="135" y="85" fill="#fbbf24" font-size="11">Δθ</text>

    <!-- 位置1における速度 v(t) -->
    <circle cx="100" cy="100" r="5" fill="#38bdf8" />
    <line x1="100" y1="100" x2="100" y2="40" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#circ-arrow-blue)" />
    <text x="75" y="65" fill="#38bdf8" font-size="12" font-weight="bold">v(t)</text>

    <!-- 位置2における速度 v(t+Δt) -->
    <circle cx="115" cy="60" r="5" fill="#38bdf8" />
    <line x1="115" y1="60" x2="65" y2="25" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#circ-arrow-blue)" />
    <text x="60" y="15" fill="#38bdf8" font-size="12" font-weight="bold">v(t+Δt)</text>

    <!-- 右側: 始点をそろえた速度ベクトル三角形 -->
    <g transform="translate(340, 110)">
      <!-- 始点 -->
      <circle cx="0" cy="0" r="4" fill="#e2e8f0" />
      <!-- v(t) -->
      <line x1="0" y1="0" x2="0" y2="-70" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#circ-arrow-blue)" />
      <text x="10" y="-35" fill="#38bdf8" font-size="12" font-weight="bold">v(t)</text>
      <!-- v(t+Δt) -->
      <line x1="0" y1="0" x2="-45" y2="-55" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#circ-arrow-blue)" />
      <text x="-65" y="-35" fill="#38bdf8" font-size="12" font-weight="bold">v(t+Δt)</text>
      <!-- なす角 Δθ -->
      <path d="M 0 -25 A 25 25 0 0 0 -15 -20" fill="none" stroke="#fbbf24" stroke-width="2" />
      <text x="-15" y="-10" fill="#fbbf24" font-size="11" font-weight="bold">Δθ</text>
      <!-- 速度変化ベクトル Δv = v(t+Δt) - v(t) -->
      <line x1="0" y1="-70" x2="-42" y2="-56" stroke="#ef4444" stroke-width="3" marker-end="url(#circ-arrow-red)" />
      <text x="-18" y="-76" fill="#ef4444" font-size="12" font-weight="bold">Δv = a · Δt</text>
    </g>
    <text x="340" y="155" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">Δv は円の中心に向く！（向心加速度）</text>
  </svg>
  <div class="diagram-caption">図: 微小時間 Δt における速度ベクトルの差 Δv と向心加速度の幾何学的導出</div>
</div>

時間 $\Delta t$ の間に回転する角度を $\Delta\theta = \omega\Delta t$ とすると、速度ベクトルの長さはともに $v$ で、そのなす角は $\Delta\theta$ です。
微小角近似により、速度変化の大きさ $|\Delta\vec{v}|$ は：

$$
|\Delta\vec{v}| \approx v \Delta\theta = v (\omega \Delta t)
$$

両辺を $\Delta t$ で割ると、加速度の大きさ $a$ が求まります：

$$
\boxed{a = \frac{|\Delta\vec{v}|}{\Delta t} = v\omega = r\omega^2 = \frac{v^2}{r}}
$$

* **加速度の向き**：常に**円の中心向き**（向心加速度）となります。

---

## 3. 向心力と運動方程式

ニュートンの運動方程式 $m\vec{a} = \vec{F}$ より、円運動を維持するためには、物体に**常に円の中心を向く力（向心力）**が働き続けていなければなりません。

$$
\boxed{F = ma = mr\omega^2 = m\frac{v^2}{r}}
$$

::: important 「向心力」という新しい力は存在しない！
よくある間違いとして「重力、張力、向心力の3つの力が働く」と考えてしまう人がいます。  
**向心力とは、実在する力（重力、張力、垂直抗力、摩擦力など）の中心向き成分の「役割名」にすぎません。**  
* 例1：糸でおもりを回すとき → **糸の張力**が向心力の役割を果たす。
* 例2：月が地球を回るとき → **万有引力**が向心力の役割を果たす。
* 例3：車がカーブを曲がるとき → タイヤと地面の**静止摩擦力**が向心力の役割を果たす。
:::

---

## 4. 単振動と等速円運動の深い関係

等速円運動する物体の位置座標 $(x, y)$ を三角関数で表すと：

$$
x(t) = r\cos(\omega t), \quad y(t) = r\sin(\omega t)
$$

この $x$ 成分に注目して時間微分すると：

* **変位**: $x = r\cos(\omega t)$
* **速度**: $v_x = \frac{dx}{dt} = -r\omega \sin(\omega t)$
* **加速度**: $a_x = \frac{dv_x}{dt} = -r\omega^2 \cos(\omega t) = -\omega^2 x$

これはまさに**振幅 $A = r$、角振動数 $\omega$ の単振動そのもの**です！  
「単振動とは、等速円運動を真横からスクリーンに投影（正射影）した影の動きである」という幾何学的視点を持つと、単振動の公式を丸暗記する必要がなくなります。

---

## 5. 入試頻出の3大典型パターン

### パターン1：円錐振り子
天井から長さ $L$ の糸でつるされた質量 $m$ のおもりが、水平面内で半径 $r$ の等速円運動をする問題。

* 鉛直方向のつり合い：$T\cos\theta = mg$
* 中心方向の運動方程式：$T\sin\theta = m\frac{v^2}{r}$
* 辺々を割ると：$\tan\theta = \frac{v^2}{rg}$（質量 $m$ によらない！）

### パターン2：カーブを曲がる自動車
水平な道路を半径 $r$、速さ $v$ でスリップせずに曲がれる限界速度。

* 向心力は最大静止摩擦力 $\mu N = \mu mg$ が担う：
  $$m\frac{v^2}{r} \le \mu mg \implies v \le \sqrt{\mu g r}$$

### パターン3：鉛直面内の円運動
ひもの先におもりをつけて鉛直面内で1回転させる問題（ループコースター）。
最高点（最下点から高さ $2r$）で糸がたるまない（張力 $T \ge 0$）条件：

* 最高点での運動方程式：$m\frac{v^2}{r} = mg + T$
* $T \ge 0 \implies v \ge \sqrt{gr}$（最高点で必要な最小速度）
* 力学的エネルギー保存則と連立して、最下点で必要な初速度 $v_0 \ge \sqrt{5gr}$ を導きます。

---

## 📚 関連テーマ
* 🔩 [ばねの単振動と力学的エネルギー保存則](/mechanics/spring)
* 🕰️ [単振り子の運動と周期公式の導出](/mechanics/pendulum)
* 💥 [運動量保存則と反発係数](/mechanics/momentum)
