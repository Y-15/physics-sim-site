---
title: 斜方投射（放物運動の公式・軌道方程式・45度定理）【高校物理シミュレーター】
description: 水平方向の等速運動と鉛直方向の等加速度運動の分解、放物線の軌道方程式 y = x tanθ - g/(2v₀² cos²θ) x²、最高点・水平到達距離の完全導出、斜面への投射やモンキーハンティングなど大学入試頻出例題を完全攻略。
---

# 🚀 斜方投射（放物運動の公式・軌道方程式・45度定理）

物体を水平面から斜め上方に初速度 $v_0$、角度 $\theta$ で投げ出したときの運動を**斜方投射（放物運動）**と呼びます。
空気抵抗を無視すると、重力は常に鉛直下向きにのみ働くため、**「水平方向には等速直線運動」「鉛直方向には鉛直投げ上げ運動」**という2つの独立した運動の合成として理解できます。

まずは以下の**リアルタイム実験室**で、初速度 $v_0$ や角度 $\theta$、重力 $g$ をスライダーで自由に変更し、物体の描く美しい放物線軌道と速度ベクトルの変化を体感してみましょう！

---

## 🧪 インタラクティブ実験室

スライダーを動かして、初速度や発射角、重力加速度を変えてみましょう。  
「発射！」ボタンを押すと、リアルタイムで放物線を描いて飛びます。

<ProjectileSim />

::: tip 💡 実験のポイント
1. **45°で最大飛距離**: 角度を $45^\circ$ に設定したときに水平到達距離 $R$ が最大になることを確認しましょう（$30^\circ$ と $60^\circ$ では全く同じ距離に落下します！）。
2. **重力の影響（月面 vs 地球）**: 重力を月面（$1.62\text{ m/s}^2$）に設定すると、地球の約6倍遠く、約6倍高く飛ぶダイナミックな運動が観察できます。
3. **最高点での速度ベクトル**: 最高点に達した瞬間でも、速度はゼロになりません。**水平方向の速度 $v_x = v_0\cos\theta$ だけが残る**ことに注目してください。
:::

---

## 1. 運動の分解と初速度ベクトル

斜方投射を解く絶対の鉄則は、**「水平方向（$x$軸）」と「鉛直方向（$y$軸）」に完全に分けて考えること**です。

<div class="vector-graph-card">
<svg viewBox="0 0 540 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="proj-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="proj-arrow-rose" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
    <marker id="proj-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
    </marker>
    <marker id="proj-arrow-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
    </marker>
  </defs>

  <!-- 地面 -->
  <line x1="40" y1="240" x2="500" y2="240" stroke="#475569" stroke-width="2"/>
  <rect x="40" y="240" width="460" height="20" fill="rgba(71, 85, 105, 0.15)"/>

  <!-- 放物線軌道（点線） -->
  <path d="M 60,240 Q 240,40 420,240" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4"/>

  <!-- 座標軸 -->
  <line x1="60" y1="250" x2="60" y2="30" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#proj-arrow-blue)"/>
  <text x="50" y="25" fill="#38bdf8" font-size="13" font-weight="700">y (鉛直)</text>
  <line x1="50" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="1.8" marker-end="url(#proj-arrow-blue)"/>
  <text x="495" y="244" fill="#38bdf8" font-size="13" font-weight="700">x (水平)</text>
  <text x="48" y="256" fill="#94a3b8" font-size="12" font-family="sans-serif">O</text>

  <!-- 原点での小球 -->
  <circle cx="60" cy="240" r="7" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>

  <!-- 初速度ベクトル v0 (合成) -->
  <line x1="60" y1="240" x2="160" y2="120" stroke="#f43f5e" stroke-width="3" marker-end="url(#proj-arrow-rose)"/>
  <rect x="110" y="105" width="85" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="152" y="120" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">初速度 v₀</text>

  <!-- 初速度の水平成分 v0x -->
  <line x1="60" y1="240" x2="160" y2="240" stroke="#10b981" stroke-width="2.5" marker-end="url(#proj-arrow-green)"/>
  <rect x="75" y="248" width="105" height="20" rx="3" fill="#0f172a" stroke="#10b981" stroke-width="1"/>
  <text x="127" y="262" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">v₀ₓ = v₀ cos θ</text>

  <!-- 初速度の鉛直成分 v0y -->
  <line x1="60" y1="240" x2="60" y2="120" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#proj-arrow-yellow)"/>
  <rect x="2" y="170" width="100" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="52" y="184" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">v₀ᵧ = v₀ sin θ</text>

  <!-- 分解平行四辺形 -->
  <line x1="60" y1="120" x2="160" y2="120" stroke="#71717a" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="160" y1="240" x2="160" y2="120" stroke="#71717a" stroke-width="1.2" stroke-dasharray="3,3"/>

  <!-- 角度 θ -->
  <path d="M 100,240 A 40,40 0 0,0 92,201" fill="none" stroke="#fbbf24" stroke-width="2"/>
  <text x="108" y="226" fill="#fbbf24" font-size="13" font-weight="700">θ</text>

  <!-- 最高点 P(x_H, H) -->
  <circle cx="240" cy="90" r="6" fill="#fbbf24"/>
  <line x1="240" y1="90" x2="310" y2="90" stroke="#10b981" stroke-width="2.2" marker-end="url(#proj-arrow-green)"/>
  <text x="315" y="85" fill="#10b981" font-size="11" font-weight="700">vₓ = v₀ cos θ (vᵧ=0)</text>
  <line x1="240" y1="90" x2="240" y2="240" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3,3"/>
  <rect x="200" y="150" width="65" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="232" y="164" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">最高点 H</text>

  <!-- 落下地点 (R, 0) -->
  <circle cx="420" cy="240" r="6" fill="#f43f5e"/>
  <rect x="360" y="248" width="120" height="20" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="420" y="262" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">落下地点 (R, 0)</text>
</svg>
<div class="graph-caption">図: 斜方投射の初速度ベクトル分解と放物線軌道（水平方向は等速、鉛直方向は重力加減速）</div>
</div>

### 1. 初速度の成分分解
初速度 $v_0$、仰角 $\theta$ で投射したとき、直角三角形の三角比より：

$$
\begin{cases}
v_{0x} = v_0 \cos\theta \quad \text{（水平初速度）} \\
v_{0y} = v_0 \sin\theta \quad \text{（鉛直初速度）}
\end{cases}
$$

---

## 2. 時刻 $t$ における速度と位置の完全導出

質量 $m$ の小球に働く力は鉛直下向きの重力 $mg$ のみです。水平方向には外力が働かないため、運動方程式は：

$$
\begin{cases}
m a_x = 0 &\implies a_x = 0 \quad \text{（等速直線運動）} \\
m a_y = -mg &\implies a_y = -g \quad \text{（等加速度運動）}
\end{cases}
$$

これを時間 $t$ で積分することにより、任意の時刻 $t$ における速度と位置が導かれます。

### 速度ベクトル $\vec{v}(t) = (v_x, v_y)$
$$
\begin{cases}
v_x(t) = v_{0x} = v_0 \cos\theta \quad \text{（常に一定！）} \\
v_y(t) = v_{0y} - gt = v_0 \sin\theta - gt
\end{cases}
$$

速度の大きさ（瞬間の速さ）$v(t)$ および速度ベクトルの水平面となす角 $\alpha(t)$ は：

$$
v(t) = \sqrt{v_x(t)^2 + v_y(t)^2}, \quad \tan\alpha(t) = \frac{v_y(t)}{v_x(t)}
$$

### 位置座標 $(x(t), y(t))$
$$
\begin{cases}
x(t) = v_{0x} t = (v_0 \cos\theta) t \\
y(t) = v_{0y} t - \frac{1}{2}gt^2 = (v_0 \sin\theta) t - \frac{1}{2}gt^2
\end{cases}
$$

---

## 3. 放物線の軌道方程式（時間 $t$ の消去）

位置の式から時間 $t$ を消去すると、$x$ と $y$ の関係式（軌道方程式）が得られます。

水平方向の式 $x = (v_0\cos\theta)t$ より：

$$
t = \frac{x}{v_0 \cos\theta}
$$

これを鉛直方向の式 $y = (v_0\sin\theta)t - \frac{1}{2}gt^2$ に代入します：

$$
\begin{aligned}
y &= (v_0 \sin\theta)\left(\frac{x}{v_0 \cos\theta}\right) - \frac{1}{2}g \left(\frac{x}{v_0 \cos\theta}\right)^2 \\
&= x \frac{\sin\theta}{\cos\theta} - \frac{g}{2v_0^2 \cos^2\theta} x^2 \\
&= (\tan\theta) x - \frac{g}{2v_0^2 \cos^2\theta} x^2
\end{aligned}
$$

$x$ の2次方程式（$y = Ax - Bx^2$、ただし $B > 0$）の形をしているため、**軌道は上に凸の放物線**となることが数学的・物理学的に証明されます！

::: tip 💡 三角関数の相互関係を使った発展変形
$\frac{1}{\cos^2\theta} = 1 + \tan^2\theta$ を用いると、軌道方程式は $\tan\theta$ の2次方程式に変形できます：
$$
y = (\tan\theta) x - \frac{g x^2}{2v_0^2}(1 + \tan^2\theta)
$$
この式は、**「ある目標地点 $(x, y)$ に命中させるための発射角 $\theta$ を逆算する問題」**で強力な威力を発揮します（大学入試二次試験の頻出解法）。
:::

---

## 4. 4大重要公式の完全導出ステップ

大学入試で頻出する4つの代表的物理量を、すべて基本原理から導出します。

### ① 最高点到達時刻 $t_H$
最高点では、小球は上昇から下降へと転じるため、**鉛直方向の速度が瞬間的にゼロ（$v_y = 0$）**になります。

$$
v_y(t_H) = v_0 \sin\theta - g t_H = 0 \implies t_H = \frac{v_0 \sin\theta}{g}
$$

### ② 最高点の高さ $H$
時刻 $t_H$ における $y$ 座標が最高点の高さ $H$ です。$y(t_H)$ に代入するか、速度と変位の式 $v_y^2 - v_{0y}^2 = -2gh$ で $v_y = 0$ と置くことで求まります：

$$
0^2 - (v_0 \sin\theta)^2 = -2gH \implies H = \frac{v_0^2 \sin^2\theta}{2g}
$$

### ③ 落下時刻（滞空時間）$T$
同じ高さの地面（$y = 0$）に戻ってくる時刻 $T$ を求めます。$y(T) = 0$ より：

$$
(v_0 \sin\theta)T - \frac{1}{2}gT^2 = 0 \implies T\left(v_0 \sin\theta - \frac{1}{2}gT\right) = 0
$$

$T > 0$ より：

$$
T = \frac{2v_0 \sin\theta}{g} = 2 t_H
$$

::: important 軌道の対称性
上昇にかかる時間 $t_H$ と、最高点から下降して地面に着くまでの時間は完全に等しく、滞空時間はちょうど **$2 t_H$** となります。
:::

### ④ 水平到達距離 $R$
滞空時間 $T$ の間に水平方向に進む距離が水平到達距離 $R$ です：

$$
R = x(T) = (v_0 \cos\theta) \cdot T = (v_0 \cos\theta) \cdot \frac{2v_0 \sin\theta}{g} = \frac{v_0^2 (2\sin\theta\cos\theta)}{g}
$$

ここで三角関数の倍角の公式 $2\sin\theta\cos\theta = \sin 2\theta$ を適用すると：

$$
R = \frac{v_0^2 \sin 2\theta}{g}
$$

---

## 5. 45°最大飛距離の定理と相補角の対称性

### なぜ 45° で最大になるのか？
水平到達距離 $R = \frac{v_0^2 \sin 2\theta}{g}$ において、変数 $\theta$（$0^\circ < \theta < 90^\circ$）に対して $R$ が最大となるのは、$\sin 2\theta$ が最大値 $1$ をとるときです：

$$
\sin 2\theta = 1 \implies 2\theta = 90^\circ \implies \theta = 45^\circ
$$

このときの最大水平到達距離 $R_{\max}$ は：

$$
R_{\max} = \frac{v_0^2}{g}
$$

### 相補角（$\theta$ と $90^\circ - \theta$）の不思議な対称性
発射角度が $\theta$ のときと $90^\circ - \theta$ のときを比べてみましょう。

$$
\sin 2(90^\circ - \theta) = \sin(180^\circ - 2\theta) = \sin 2\theta
$$

なんと、**$\theta = 30^\circ$ で投げても $60^\circ$ で投げても、落下する位置（水平到達距離）は完全に同一**になります！
* **$30^\circ$（低い弾道）**: 滞空時間が短く、ライナー性で素早く到達する。
* **$60^\circ$（高い弾道）**: 高く舞い上がり、滞空時間が長い。

シミュレーターで発射角を $30^\circ$ と $60^\circ$、あるいは $20^\circ$ と $70^\circ$ に設定して、着地点がピッタリ重なることをぜひ試してみてください。

---

## 6. 重要公式一覧まとめ

| 物理量 | 記号 | 厳密な公式 | 導出のキー条件 |
| :--- | :---: | :---: | :--- |
| **初速度ベクトル** | $\vec{v}_0$ | $(v_0 \cos\theta, \; v_0 \sin\theta)$ | 幾何学的三角比による分解 |
| **時刻 $t$ での速度** | $\vec{v}(t)$ | $(v_0 \cos\theta, \; v_0 \sin\theta - gt)$ | $a_x = 0, \; a_y = -g$ |
| **時刻 $t$ での位置** | $\vec{r}(t)$ | $\left((v_0 \cos\theta)t, \; (v_0 \sin\theta)t - \frac{1}{2}gt^2\right)$ | 等速直線運動 ＋ 等加速度運動 |
| **放物線の軌道方程式** | $y(x)$ | $y = (\tan\theta)x - \frac{g}{2v_0^2 \cos^2\theta}x^2$ | $t = \frac{x}{v_0 \cos\theta}$ を消去 |
| **最高点到達時刻** | $t_H$ | $t_H = \frac{v_0 \sin\theta}{g}$ | 鉛直速度 $v_y = 0$ |
| **最高点高度** | $H$ | $H = \frac{v_0^2 \sin^2\theta}{2g}$ | $y(t_H)$ または $0^2 - v_{0y}^2 = -2gH$ |
| **滞空時間（着地時刻）** | $T$ | $T = \frac{2v_0 \sin\theta}{g} = 2t_H$ | $y(T) = 0$（軌道の対称性） |
| **水平到達距離** | $R$ | $R = \frac{v_0^2 \sin 2\theta}{g}$ | $x(T) = v_{0x} T$ （$\theta = 45^\circ$ で最大 $v_0^2/g$） |

---

## 7. 🎯 大学入試 厳選例題演習

### 【例題1】ビル屋上からの斜方投射（基礎〜標準）

::: info 📝 問題
水平な地面から高さ $h = 39.2\text{ m}$ のビルの屋上の端から、水平面に対して仰角 $\theta = 30^\circ$ の向きに初速度 $v_0 = 19.6\text{ m/s}$ で小球を投げ出した。重力加速度の大きさを $g = 9.8\text{ m/s}^2$ とする。
1. 小球が最高点に達する時刻 $t_1$ と、地面からの最高点の高さ $H_{\text{ground}}$ を求めよ。
2. 小球が地面に達する時刻 $t_2$ を求めよ。
3. 地面に落下する直前の小球の水平到達距離 $x_2$ と速さ $v_2$ を求めよ。
:::

::: details 💡 解答と解説（クリックで展開）
#### （1）最高点到達時刻と地面からの最高点
屋上の投射点を原点 $O$、水平右向きを $x$ 軸、鉛直上向きを $y$ 軸とします。
初速度の各成分は：
* $v_{0x} = v_0 \cos 30^\circ = 19.6 \times \frac{\sqrt{3}}{2} = 9.8\sqrt{3}\text{ m/s}$
* $v_{0y} = v_0 \sin 30^\circ = 19.6 \times \frac{1}{2} = 9.8\text{ m/s}$

最高点では鉛直速度が $v_y = 0$ となるため：
$$
v_y(t_1) = v_{0y} - gt_1 = 9.8 - 9.8 t_1 = 0 \implies t_1 = 1.0\text{ s}
$$
屋上からの上昇高さを $h_1$ とすると：
$$
h_1 = v_{0y}t_1 - \frac{1}{2}gt_1^2 = 9.8 \times 1.0 - \frac{1}{2} \times 9.8 \times (1.0)^2 = 4.9\text{ m}
$$
したがって、地面からの最高点の高さは：
$$
H_{\text{ground}} = h + h_1 = 39.2 + 4.9 = 44.1\text{ m}
$$
**答え:** 時刻 $t_1 = 1.0\text{ s}$、地面からの高さ $44.1\text{ m}$

---

#### （2）地面に達する時刻 $t_2$
地面は $y = -h = -39.2\text{ m}$ です。$y(t)$ の式に代入します：
$$
-39.2 = 9.8 t_2 - 4.9 t_2^2
$$
両辺を $4.9$ で割り、整理します：
$$
t_2^2 - 2t_2 - 8 = 0 \implies (t_2 - 4)(t_2 + 2) = 0
$$
$t_2 > 0$ より：
$$
t_2 = 4.0\text{ s}
$$
**答え:** $t_2 = 4.0\text{ s}$

---

#### （3）落下直前の水平到達距離と速さ
水平方向は等速直線運動を続けるため：
$$
x_2 = v_{0x} t_2 = (9.8\sqrt{3}) \times 4.0 \approx 9.8 \times 1.732 \times 4.0 \approx 67.9\text{ m} \quad (39.2\sqrt{3}\text{ m})
$$
落下直前の速さは、**力学的エネルギー保存則**を用いると瞬時に求まります！  
投射点と地面でのエネルギー保存則より：
$$
\frac{1}{2}mv_0^2 + mgh = \frac{1}{2}mv_2^2 + 0
$$
$$
v_2 = \sqrt{v_0^2 + 2gh} = \sqrt{(19.6)^2 + 2 \times 9.8 \times 39.2} = \sqrt{384.16 + 768.32} = \sqrt{1152.48} = 19.6\sqrt{3} \approx 33.9\text{ m/s}
$$
**答え:** 水平距離 $39.2\sqrt{3}\text{ m}$（約 $67.9\text{ m}$）、速さ $19.6\sqrt{3}\text{ m/s}$（約 $33.9\text{ m/s}$）
:::

---

### 【例題2】傾斜角 $\alpha$ の斜面への投射（難関大定番）

::: info 📝 問題
傾斜角 $\alpha$（$0 < \alpha < \frac{\pi}{2}$）のなめらかな斜面の最下点 $O$ から、斜面に対して角度 $\theta$（仰角 $\alpha + \theta < \frac{\pi}{2}$）の向きに初速度 $v_0$ で小球を発射した。重力加速度を $g$ とする。
1. 小球が斜面に再び着地するまでの時間 $t_{\text{slope}}$ を求めよ。
2. 小球が斜面上を滑空して着地した地点の、斜面に沿った距離 $L$ を求めよ。
3. $v_0$ を固定したとき、距離 $L$ を最大にする発射角 $\theta$ を求めよ。
:::

::: details 💡 解答と解説（クリックで展開）
#### 【解法の極意：斜面に平行・垂直な座標軸をとる】
斜面に平行に $X$ 軸（斜面を登る向き）、斜面に垂直に $Y$ 軸（斜面から離れる向き）をとると劇的に見通しが良くなります！
重力加速度 $g$ を斜面に分解すると：
* $X$ 方向の加速度：$-g \sin\alpha$
* $Y$ 方向の加速度：$-g \cos\alpha$

初速度の各成分は：
* $v_{0X} = v_0 \cos\theta$
* $v_{0Y} = v_0 \sin\theta$

---

#### （1）着地までの時間 $t_{\text{slope}}$
着地するとき、$Y = 0$ となります：
$$
Y(t) = (v_0 \sin\theta)t - \frac{1}{2}(g\cos\alpha)t^2 = 0
$$
$t > 0$ より：
$$
t_{\text{slope}} = \frac{2v_0 \sin\theta}{g\cos\alpha}
$$
**答え:** $t_{\text{slope}} = \frac{2v_0 \sin\theta}{g\cos\alpha}$

---

#### （2）斜面に沿った飛距離 $L$
$X$ 方向は初速度 $v_{0X}$、加速度 $-g\sin\alpha$ の等加速度運動です：
$$
\begin{aligned}
L = X(t_{\text{slope}}) &= (v_0\cos\theta) t_{\text{slope}} - \frac{1}{2}(g\sin\alpha) t_{\text{slope}}^2 \\
&= \frac{2v_0^2 \sin\theta\cos\theta}{g\cos\alpha} - \frac{1}{2}g\sin\alpha \cdot \frac{4v_0^2\sin^2\theta}{g^2\cos^2\alpha} \\
&= \frac{2v_0^2 \sin\theta}{g\cos^2\alpha}\left(\cos\theta\cos\alpha - \sin\theta\sin\alpha\right) \\
&= \frac{2v_0^2 \sin\theta \cos(\theta + \alpha)}{g\cos^2\alpha}
\end{aligned}
$$
ここで積和の公式 $2\sin A\cos B = \sin(A+B) + \sin(A-B)$ を適用すると：
$$
2\sin\theta\cos(\theta + \alpha) = \sin(2\theta + \alpha) - \sin\alpha
$$
したがって：
$$
L = \frac{v_0^2}{g\cos^2\alpha}\left[\sin(2\theta + \alpha) - \sin\alpha\right]
$$
**答え:** $L = \frac{v_0^2}{g\cos^2\alpha}\left[\sin(2\theta + \alpha) - \sin\alpha\right]$

---

#### （3）距離 $L$ を最大にする角度 $\theta$
$L$ の式の中で変数 $\theta$ を含むのは $\sin(2\theta + \alpha)$ のみです。これが最大値 $1$ をとるとき $L$ は最大になります：
$$
\sin(2\theta + \alpha) = 1 \implies 2\theta + \alpha = 90^\circ \implies \theta = 45^\circ - \frac{\alpha}{2}
$$
（※ 水平線に対する全発射角 $\Theta = \alpha + \theta = 45^\circ + \frac{\alpha}{2}$）  
斜面の傾きがないとき（$\alpha = 0$）は $\theta = 45^\circ$ となり、通常の45度定理と完全に一致します！

**答え:** $\theta = 45^\circ - \frac{\alpha}{2}$
:::

---

### 【例題3】モンキー・ハンティングの定理（必中条件）

::: info 📝 問題
原点 $O(0, 0)$ にいる猟師が、地点 $(L, H)$ の木の上にいるサルを狙っている。猟師が銃を撃った瞬間にサルが木から手を離して自由落下を始めた。銃弾の初速度を $v_0$、角度をサルの初期位置に向けて $\tan\theta = \frac{H}{L}$ とする。空気抵抗は無視できるものとする。
1. 銃弾の水平座標がサルの落下線 $x = L$ に到達する時刻 $t^*$ を求めよ。
2. 時刻 $t^*$ における銃弾の $y$ 座標 $y_{\text{bullet}}$ とサルの $y$ 座標 $y_{\text{monkey}}$ を求め、銃弾が必ずサルに命中することを証明せよ。
3. 弾がサルに地面（$y = 0$）より上で命中するために必要な初速度 $v_0$ の条件を求めよ。
:::

::: details 💡 解答と解説（クリックで展開）
#### （1）到達時刻 $t^*$
銃弾の水平初速度は $v_{0x} = v_0 \cos\theta$ です。水平方向は等速直線運動をするため：
$$
L = (v_0 \cos\theta) t^* \implies t^* = \frac{L}{v_0 \cos\theta}
$$

---

#### （2）必中の証明
時刻 $t^*$ におけるサルの $y$ 座標は、初期高度 $H$ からの自由落下であるため：
$$
y_{\text{monkey}}(t^*) = H - \frac{1}{2}g(t^*)^2
$$
一方、銃弾の $y$ 座標は：
$$
y_{\text{bullet}}(t^*) = (v_0 \sin\theta) t^* - \frac{1}{2}g(t^*)^2
$$
ここで第1項に $t^* = \frac{L}{v_0 \cos\theta}$ を代入すると：
$$
(v_0 \sin\theta) \cdot \frac{L}{v_0 \cos\theta} = L \tan\theta
$$
猟師はサルの初期位置に向けて銃口を向けていたため、$\tan\theta = \frac{H}{L}$ より $L\tan\theta = H$ です！したがって：
$$
y_{\text{bullet}}(t^*) = H - \frac{1}{2}g(t^*)^2 = y_{\text{monkey}}(t^*)
$$
よって、**初速度 $v_0$ の大きさに関わらず、時刻 $t^*$ で銃弾とサルの $y$ 座標は完全に一致し、弾は必ずサルに命中します！**（証明終わり）

::: tip 💡 物理的直感
重力がない理想の世界を考えると、銃弾は直線で進んでサルのいた場所 $(L, H)$ を通過します。  
現実の世界では重力 $g$ が働くため、銃弾もサルも**同じ時間 $t^*$ の間に全く同じ距離 $\frac{1}{2}g(t^*)^2$ だけ鉛直下方に「落下」する**ため、必ず空中で衝突するのです！
:::

---

#### （3）地上で命中するための初速度の条件
地面に着地する前に命中するためには、$y_{\text{monkey}}(t^*) > 0$ である必要があります：
$$
H - \frac{1}{2}g(t^*)^2 > 0 \implies H > \frac{1}{2}g \left(\frac{L}{v_0 \cos\theta}\right)^2
$$
ここで $\cos^2\theta = \frac{L^2}{L^2 + H^2}$ であるため：
$$
H > \frac{g L^2 (L^2 + H^2)}{2 v_0^2 L^2} = \frac{g(L^2 + H^2)}{2 v_0^2}
$$
整理すると：
$$
v_0 > \sqrt{\frac{g(L^2 + H^2)}{2H}}
$$
**答え:** $v_0 > \sqrt{\frac{g(L^2 + H^2)}{2H}}$
:::

---

## 📚 関連テーマ・シミュレーター
* 🏎️ [等加速度直線運動とv-tグラフの完全攻略](/mechanics/acceleration)
* 📐 [摩擦力と斜面上の運動（摩擦角）](/mechanics/friction)
* 💥 [運動量保存則と反発係数](/mechanics/momentum)
* 🕰️ [単振り子の運動方程式と周期公式](/mechanics/pendulum)
* 📝 [力学 厳選演習問題集（全320問）](/problems/mechanics)
