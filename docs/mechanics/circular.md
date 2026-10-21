---
title: 等速円運動・向心加速度・向心力【高校物理シミュレーター】
description: 等速円運動の周期 T = 2π/ω、速度 v = rω、向心加速度 a = rω² = v²/r、向心力、単振動との深い関係（正射影）を動くシミュレーションで完全攻略
---

# 🔄 等速円運動・向心加速度・向心力

**等速円運動 ** （Uniform Circular Motion）は、スピード（速さ）は一定であるにもかかわらず、**向きが絶えず変化するため常に加速度が生じている** という、高校物理で最も直感と数式をつなぐのが難しい重要テーマです。

速度ベクトル $\vec{v}$（接線方向）と加速度ベクトル $\vec{a}$（中心方向）が常に直交して回転する様子を、リアルタイムシミュレーションで体感しましょう！

---

## 🧪 インタラクティブ実験室

<ClientOnly>
  <CircularSim />
</ClientOnly>

::: tip 実験のポイント
1. **速度ベクトルと加速度ベクトルの直交**:
   * 速度 $\vec{v}$ は常に円の **接線方向** を向き、加速度 $\vec{a}$ は常に **円の中心方向** を向きます（両者は常に $\mathbf{90^\circ}$ 直交！）。
2. **半径 $r$ と角速度 $\omega$ の関係**:
   * 角速度 $\omega$ を2倍にすると、速さ $v = r\omega$ は2倍、向心加速度 $a = r\omega^2$ はなんと **4倍** に急増します！カーブでスピードを出しすぎると危険な理由がここにあります。
3. **単振動への正射影（画面下の赤い球）**:
   * 円運動を横（x軸）から見ると、完全に **単振動** （$x = r\cos\omega t$）と一致します。端で速度が $0$、中心で速度最大になる様子を確認してみましょう。
:::

---

## 1. 等速円運動の基本関係式

半径 $r$ の円周上を、一定の速さで回転する運動を **等速円運動** といいます。

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
それは、 **速度の向きが変わるから** です。加速度は「単位時間あたりの速度ベクトルの変化」$\vec{a} = \frac{\Delta\vec{v}}{\Delta t}$ で定義されます。

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

* **加速度の向き ** ：常に**円の中心向き** （向心加速度）となります。

---

## 3. 向心力と運動方程式

ニュートンの運動方程式 $m\vec{a} = \vec{F}$ より、円運動を維持するためには、物体に **常に円の中心を向く力（向心力）** が働き続けていなければなりません。

$$
\boxed{F = ma = mr\omega^2 = m\frac{v^2}{r}}
$$

::: important 「向心力」という新しい力は存在しない！
よくある間違いとして「重力、張力、向心力の3つの力が働く」と考えてしまう人がいます。  
**向心力とは、実在する力（重力、張力、垂直抗力、摩擦力など）の中心向き成分の「役割名」にすぎません。**  
* 例1：糸でおもりを回すとき → **糸の張力** が向心力の役割を果たす。
* 例2：月が地球を回るとき → **万有引力** が向心力の役割を果たす。
* 例3：車がカーブを曲がるとき → タイヤと地面の **静止摩擦力** が向心力の役割を果たす。
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

これはまさに **振幅 $A = r$、角振動数 $\omega$ の単振動そのもの** です！  
「単振動とは、等速円運動を真横からスクリーンに投影（正射影）した影の動きである」という幾何学的視点を持つと、単振動の公式を丸暗記する必要がなくなります。

---

## 5. 入試頻出の3大典型パターン

### パターン1：円錐振り子
天井から長さ $L$ の糸でつるされた質量 $m$ のおもりが、鉛直となす角 $\theta$ を保ったまま水平面内で等速円運動をする問題。

* 円運動の半径：$r = L\sin\theta$
* 鉛直方向の力のつり合い：$T\cos\theta = mg \implies T = \frac{mg}{\cos\theta}$
* 中心方向の運動方程式：$m r \omega^2 = T\sin\theta \implies m(L\sin\theta)\omega^2 = \frac{mg}{\cos\theta}\sin\theta$
* 周期 $T_{\text{周期}}$：$\omega = \sqrt{\frac{g}{L\cos\theta}} \implies T_{\text{周期}} = \frac{2\pi}{\omega} = 2\pi\sqrt{\frac{L\cos\theta}{g}}$

::: tip 単振り子の周期との美しい対応
鉛直からの振れ角 $\theta$ が微小（$\theta \approx 0 \implies \cos\theta \approx 1$）のとき、円錐振り子の周期は **単振り子の周期 $T = 2\pi\sqrt{L/g}$ と完全に一致** します！
:::

### パターン2：カーブを曲がる自動車とカント（傾斜角）
水平な道路を半径 $r$、速さ $v$ でスリップせずに曲がれる限界速度：

* 水平路面：向心力は最大静止摩擦力 $\mu N = \mu mg$ が担う：
  $$m\frac{v^2}{r} \le \mu mg \implies v \le \sqrt{\mu g r}$$
* カント付き路面（バンク角 $\theta$）：摩擦に頼らず垂直抗力 $N$ の水平成分だけで曲がる理想速度：
  $$N\sin\theta = m\frac{v^2}{r}, \quad N\cos\theta = mg \implies \tan\theta = \frac{v^2}{rg} \implies v = \sqrt{rg\tan\theta}$$

---

## 6. 📝 厳選入試例題演習

### 【例題1】円すい振り子の運動方程式と遠心力

> **問題**  
> 天井の点 $\text{O}$ に固定された長さ $L = 1.0\,\text{m}$ の軽くて伸びない糸の先端に、質量 $m = 0.20\,\text{kg}$ の小球を取り付け、鉛直軸のまわりで水平面内の等速円運動をさせた。  
> 糸と鉛直軸のなす角が $\theta = 60^\circ$ であった。重力加速度の大きさを $g = 9.8\,\text{m/s}^2$ とする。  
> (1) 糸が小球を引く張力の大きさ $T\,[\text{N}]$ を求めよ。  
> (2) 小球の円運動の速さ $v\,[\text{m/s}]$、および1周にかかる周期 $T_0\,[\text{s}]$ を求めよ。

#### 思考のプロセス
* 静止系（外から見る）：中心方向の **向心力** による運動方程式 $m\frac{v^2}{r} = T\sin\theta$ と、鉛直方向のつり合い $T\cos\theta = mg$ を立てる。
* 回転系（小球に乗って見る）：中心から外向きに働く **遠心力** $F_{\text{遠心}} = m\frac{v^2}{r}$ を導入し、水平・鉛直の2方向で力のつり合いを立てる。どちらで解いても全く同じ式になります。

#### 詳細解答
**(1)**  
小球に働く力は、重力 $mg$（鉛直下向き）と糸の張力 $T$（糸に沿って斜め上向き）の2つのみ。  
鉛直方向には小球は動かないので、力のつり合いより：
$$T \cos 60^\circ = mg$$
$$T \times \frac{1}{2} = 0.20 \times 9.8 = 1.96 \implies \mathbf{T = 3.92\,\text{N} \approx 3.9\,\text{N}}$$

**(2)**  
円運動の半径 $r$ は：
$$r = L \sin 60^\circ = 1.0 \times \frac{\sqrt{3}}{2} = \frac{\sqrt{3}}{2}\,\text{m}$$
水平方向（円の中心向き）の運動方程式：
$$m \frac{v^2}{r} = T \sin 60^\circ$$
(1)より $T = \frac{mg}{\cos 60^\circ}$ を代入すると：
$$m \frac{v^2}{r} = mg \tan 60^\circ \implies v^2 = rg \tan 60^\circ$$
数値を代入すると：
$$v^2 = \left(\frac{\sqrt{3}}{2}\right) \times 9.8 \times \sqrt{3} = \frac{3}{2} \times 9.8 = 14.7$$
$$v = \sqrt{14.7} \approx \mathbf{3.8\,\text{m/s}}$$

周期 $T_0$ は：
$$T_0 = \frac{2\pi r}{v} = 2\pi \sqrt{\frac{L\cos 60^\circ}{g}} = 2\pi \sqrt{\frac{1.0 \times 0.5}{9.8}} = 2\pi \sqrt{\frac{1}{19.6}} = \frac{2\pi}{\sqrt{19.6}} \approx \frac{6.283}{4.427} \approx \mathbf{1.4\,\text{s}}$$

---

### 【例題2】鉛直面内の円運動（宙返りコースターと軌道離脱条件）

> **問題**  
> 半径 $R$ のなめらかな円筒形の内面をもつレールが鉛直面内に固定されている。  
> 質量 $m$ の小球が、最下点 $\text{A}$ において水平初速度 $v_0$ を与えられてレール内面を滑り始めた。重力加速度を $g$ とする。  
> (1) 最下点 $\text{A}$ から中心角 $\theta$（鉛直下向きからの角度）の位置 $\text{P}$ における小球の速さ $v$ と、レールから受ける垂直抗力 $N$ を求めよ。  
> (2) 小球がレールから離れることなく最高点（$\theta = 180^\circ$）を通過して1回転するために必要な、最下点での初速度 $v_0$ の最小値を求めよ。

#### 思考のプロセス
* **基本戦略 **: 「** 力学的エネルギー保存則 **」で速度 $v$ を求め、「** 中心方向の運動方程式**」で垂直抗力 $N$ を求めるのが鉛直面内円運動の不変の鉄則です！
* **最高点通過条件 **: レールから離れない $\iff$** 最高点において垂直抗力 $N \ge 0$** が成り立つこと。

#### 詳細解答
**(1)**  
最下点 $\text{A}$ を位置エネルギーの基準面（$h = 0$）とする。  
中心角 $\theta$ の位置 $\text{P}$ の高さは：
$$h = R - R\cos\theta = R(1 - \cos\theta)$$
力学的エネルギー保存則より：
$$\frac{1}{2}m v_0^2 = \frac{1}{2}m v^2 + mgh$$
$$\frac{1}{2}m v_0^2 = \frac{1}{2}m v^2 + mgR(1 - \cos\theta)$$
両辺に $\frac{2}{m}$ をかけて $v^2$ について解くと：
$$\mathbf{v = \sqrt{v_0^2 - 2gR(1 - \cos\theta)}}$$

位置 $\text{P}$ で小球に働く力は、重力 $mg$（鉛直下向き）と垂直抗力 $N$（中心向き）。  
重力の円の中心向き成分は $-mg\cos\theta$（$\theta < 90^\circ$ では外向き、$\theta > 90^\circ$ で中心向き成分が加わる）。  
中心方向の運動方程式：
$$m \frac{v^2}{R} = N - mg\cos\theta$$
$$N = m \frac{v^2}{R} + mg\cos\theta$$
ここに求めた $v^2$ を代入すると：
$$N = \frac{m}{R}[v_0^2 - 2gR(1 - \cos\theta)] + mg\cos\theta$$
$$N = \frac{m v_0^2}{R} - 2mg + 2mg\cos\theta + mg\cos\theta$$
$$\mathbf{N = \frac{m v_0^2}{R} - mg(2 - 3\cos\theta)}$$

**(2)**  
最高点では $\theta = 180^\circ$ なので $\cos 180^\circ = -1$。  
このときの垂直抗力 $N_{\text{top}}$ は：
$$N_{\text{top}} = \frac{m v_0^2}{R} - mg(2 - 3(-1)) = \frac{m v_0^2}{R} - 5mg$$
小球が最高点でレールから離れない条件は $N_{\text{top}} \ge 0$ であるから：
$$\frac{m v_0^2}{R} - 5mg \ge 0 \implies \frac{m v_0^2}{R} \ge 5mg \implies v_0^2 \ge 5gR$$
したがって、必要な最小初速度は：
$$\mathbf{v_{0,\min} = \sqrt{5gR}}$$

> [!CAUTION] 「最高点で速度が $0$ より大きければ通過できる」という大誤解！
> 最高点での速度が $v > 0$ であっても、垂直抗力が $0$ になると小球はレールから離れて放物運動で内側に落ちてしまいます。  
> 実際に $N_{\text{top}} \ge 0$ を満たすとき、最高点での速度は：
> $$v_{\text{top}}^2 = v_0^2 - 4gR \ge 5gR - 4gR = gR \implies v_{\text{top}} \ge \sqrt{gR}$$
> となり、 **最高点で少なくとも $\sqrt{gR}$ のスピードが残っていなければ1回転できません！**

---

## 7. 🎯 遠心力 vs 向心力：受験テクニック

| 視点 | 座標系 | 扱う力 | 使う式 | メリット |
| :--- | :--- | :--- | :--- | :--- |
| **静止系（外から見る） **| 慣性系 | 重力、張力、抗力などの** 実在の力 **|** 運動方程式** $m\frac{v^2}{r} = F_{\text{向心}}$ | 慣性力を考えなくてよいので間違いが起きにくい |
| **回転系（回る物体に乗る） **| 非慣性系 | 実在の力 ＋** 遠心力 **$m\frac{v^2}{r}$（外向き） |** 力のつり合い** $\sum \vec{F} = \vec{0}$ | 静止問題として扱えるため、斜面や多重振り子で計算が劇的に楽になる |

どちらの解法を選んでも、導かれる方程式は数学的に $100\%$ 同値です。  
入試本番では、 **「中心方向の運動方程式」か「回転系での遠心力のつり合い」のどちらか一方を自信を持って使いこなせるように** しておきましょう。

---

## 📚 関連テーマ
* 🏃‍♂️ [等加速度直線運動の3公式とv-tグラフ](/mechanics/acceleration)
* 🚀 [斜方投射（放物運動の公式・軌道シミュレーター）](/mechanics/projectile)
* 🪐 [万有引力とケプラーの法則（人工衛星・楕円軌道）](/mechanics/gravitation)
* 🕰️ [単振り子の運動と周期公式の導出](/mechanics/pendulum)
* 🔩 [ばねの単振動と力学的エネルギー保存則](/mechanics/spring)

