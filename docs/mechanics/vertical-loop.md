---
title: 鉛直面内の円運動と宙返り・軌道離脱条件（ジェットコースター）
description: 高校物理の力学分野・最難関入試大問の王道「鉛直面内の円運動」。力学的エネルギー保存則と法線方向の運動方程式、一周成功の必要十分条件v0≧√(5gR)、最高点での垂直抗力N≧0、途中で糸がたるんで放物運動へ離脱する条件をシミュレーターとベクター図解で徹底解説！
---

# 鉛直面内の円運動と宙返り・軌道離脱条件（ジェットコースター）

ジェットコースターの宙返りループや、糸でおもりをつけて鉛直面内でぐるぐる振り回す運動は、 **大学入試の力学大問で極めて高い頻度で出題される最重要テーマ** です。

水平面内の円運動とは異なり、重力の影響で 「**位置が高くなるほどスピードが落ちる**」 ため、速さが刻一刻と変化します。一周しきれるか、それとも途中で糸がたるんで（あるいはレールから浮き上がって）放物運動で落下してしまうかの境界条件を、力学の2大法則から完全に解き明かしましょう。

<ClientOnly>
  <VerticalLoopSim />
</ClientOnly>

---

## 1. 任意の位置における速度と運動方程式

半径 $R$ のなめらかな鉛直円軌道（または長さ $R$ の軽い糸）の最下点で、質量 $m$ の小球に水平初速度 $v_0$ を与えます。

最下点を基準（$\theta = 0$）とし、反時計回りに角度 $\theta$ 回転した位置を考えます。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 360" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridVL" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradVL" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="360" fill="url(#gradVL)" rx="10"/>
    <rect width="760" height="360" fill="url(#gridVL)" rx="10"/>
    <!-- 円軌道と力の幾何作図 -->
    <g transform="translate(60, 30)">
      <text x="140" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【任意の位置 θ における力の分解】</text>
      <!-- 中心 O -->
      <circle cx="160" cy="170" r="110" fill="none" stroke="#64748b" stroke-width="2"/>
      <circle cx="160" cy="170" r="4" fill="#94a3b8"/>
      <text x="175" y="175" fill="#94a3b8" font-size="12">O</text>
      <!-- 鉛直下向き基準軸 (θ = 0) -->
      <line x1="160" y1="170" x2="160" y2="280" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="160" y="300" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">最下点 (θ=0, v₀)</text>
      <!-- θ = 120度の位置 P (左上側) -->
      <!-- cos(120) = -0.5, sin(120) = 0.866 -->
      <!-- x = 160 - 110*0.866 = 160 - 95.3 = 64.7 -->
      <!-- y = 170 - 110*0.5 = 170 - 55 = 115 -->
      <line x1="160" y1="170" x2="65" y2="115" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="65" cy="115" r="10" fill="#38bdf8"/>
      <text x="50" y="105" fill="#38bdf8" font-size="12" font-weight="bold">P (θ)</text>
      <!-- 角度 θ の弧 -->
      <path d="M 160 210 A 40 40 0 0 1 125 190" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="145" y="225" fill="#f59e0b" font-size="12">θ</text>
      <!-- 重力 mg (真下) -->
      <line x1="65" y1="115" x2="65" y2="175" stroke="#34d399" stroke-width="2.5"/>
      <polygon points="62,175 65,183 68,175" fill="#34d399"/>
      <text x="75" y="170" fill="#34d399" font-size="11" font-weight="bold">mg</text>
      <!-- 垂直抗力 / 張力 N (中心向き) -->
      <line x1="65" y1="115" x2="112" y2="142" stroke="#f59e0b" stroke-width="2.5"/>
      <polygon points="112,137 118,146 109,144" fill="#f59e0b"/>
      <text x="115" y="135" fill="#f59e0b" font-size="11" font-weight="bold">N</text>
      <!-- 速度ベクトル v (接線方向) -->
      <line x1="65" y1="115" x2="35" y2="167" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="32,162 31,173 39,166" fill="#38bdf8"/>
      <text x="20" y="155" fill="#38bdf8" font-size="11" font-weight="bold">v</text>
      <!-- 高さ h = R(1 - cosθ) -->
      <line x1="190" y1="280" x2="190" y2="115" stroke="#ef4444" stroke-width="1.5"/>
      <line x1="185" y1="280" x2="195" y2="280" stroke="#ef4444" stroke-width="1.5"/>
      <line x1="185" y1="115" x2="195" y2="115" stroke="#ef4444" stroke-width="1.5"/>
      <text x="200" y="200" fill="#ef4444" font-size="12">h = R(1 - cosθ)</text>
    </g>
    <!-- 右側: 2大方程式まとめカード -->
    <g transform="translate(420, 30)">
      <rect x="0" y="0" width="300" height="290" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="150" y="25" fill="#f59e0b" font-size="14" font-weight="bold" text-anchor="middle">【円運動を支配する2大方程式】</text>
      <text x="20" y="55" fill="#38bdf8" font-size="12" font-weight="bold">① 力学的エネルギー保存則:</text>
      <text x="30" y="80" fill="#f8fafc" font-size="12">½m v₀² = ½m v² + mg R(1 - cosθ)</text>
      <text x="30" y="105" fill="#34d399" font-size="13" font-weight="bold">⇒ v² = v₀² - 2gR(1 - cosθ)</text>
      <line x1="20" y1="120" x2="280" y2="120" stroke="#334155"/>
      <text x="20" y="145" fill="#f59e0b" font-size="12" font-weight="bold">② 円の中心方向（法線）の運動方程式:</text>
      <text x="30" y="170" fill="#f8fafc" font-size="12">m (v² / R) = N + mg cosθ</text>
      <text x="30" y="195" fill="#a855f7" font-size="13" font-weight="bold">⇒ N = m (v² / R) - mg cosθ</text>
      <line x1="20" y1="210" x2="280" y2="210" stroke="#334155"/>
      <text x="20" y="235" fill="#ef4444" font-size="12" font-weight="bold">③ v² を消去して抗力 N を一元化:</text>
      <text x="150" y="265" fill="#ef4444" font-size="13" font-weight="bold" text-anchor="middle">N = m [v₀²/R - g(2 - 3cosθ)]</text>
    </g>
  </svg>
</div>

### ① 力学的エネルギー保存則
最下点を重力による位置エネルギーの基準面（$U=0$）とすると、角度 $\theta$ における高さは $h = R(1 - \cos\theta)$ です。

$$
\frac{1}{2}m v_0^2 = \frac{1}{2}m v^2 + mg R(1 - \cos\theta)
$$

これより、任意の位置における速さの2乗 $v^2$ は：

$$
v^2 = v_0^2 - 2gR(1 - \cos\theta)
$$

### ② 円の中心方向の運動方程式
小球にはたらく力は、軌道からの垂直抗力（または糸の張力）$N$ と、重力 $mg$ です。
中心方向（向心方向）の成分を取り出すと、重力の中心向き成分は $-mg\cos\theta$（$\theta > \pi/2$ の上面側では下向き＝中心向き）となります。

$$
m \frac{v^2}{R} = N + mg\cos\theta \implies N = m \frac{v^2}{R} - mg\cos\theta
$$

①の $v^2$ を代入すると、垂直抗力 $N$ の角度依存性が完全に決定されます！

$$
N(\theta) = \frac{m}{R}\left[ v_0^2 - 2gR(1 - \cos\theta) \right] - mg\cos\theta = \frac{m}{R}\left[ v_0^2 - gR(2 - 3\cos\theta) \right]
$$

---

## 2. 宙返り完全一周の必要十分条件

小球が途中で落ちることなく、円軌道を完全に一周するための条件は、 「**最高点（$\theta = \pi$）を通過する瞬間も垂直抗力（張力）がゼロ以上であること（$N \ge 0$）**」 です！

最高点（$\theta = \pi, \cos\pi = -1$）では：

$$
N_{\text{top}} = \frac{m}{R}\left[ v_0^2 - gR(2 - 3(-1)) \right] = \frac{m}{R}(v_0^2 - 5gR)
$$

一周できる条件 $N_{\text{top}} \ge 0$ より：

$$
v_0^2 - 5gR \ge 0 \iff v_0 \ge \sqrt{5gR}
$$

また、最高点での速さ $v_{\text{top}}$ は：

$$
v_{\text{top}}^2 = v_0^2 - 2gR(1 - (-1)) = v_0^2 - 4gR \ge 5gR - 4gR = gR \implies v_{\text{top}} \ge \sqrt{gR}
$$

::: tip 宙返り一周のゴールデンルール
- **最下点で必要な初速度**:
  $$
  v_0 \ge \sqrt{5gR}
  $$
- **最高点で必要な最低速度**:
  $$
  v_{\text{top}} \ge \sqrt{gR}
  $$
（最高点では遠心力 $\frac{m v_{\text{top}}^2}{R}$ が重力 $mg$ 以上でなければ下へ落ちてしまいます！）
:::

---

## 3. 初速度 $v_0$ による運動パターンの完全分類

最下点初速度 $v_0$ の大きさによって、小球の運命は3つの領域に明確に分かれます。

| 初速度 $v_0$ の範囲 | 運動の挙動 | 物理的理由 |
| :--- | :--- | :--- |
| **$v_0 \le \sqrt{2gR}$ **|** 最下点付近での単振り子振動** | 水平位置（$\theta = \pi/2, h=R$）に届く前に速度が $0$ となり、折り返して往復振動する。常に $N > 0$ で糸はたるまない。 |
| **$\sqrt{2gR} < v_0 < \sqrt{5gR}$ **|** 途中で軌道離脱し放物運動へ遷移！ **| 水平位置を超えた領域（$\pi/2 < \theta < \pi$）で、速度が $0$ になる前に先に** 張力 $N$ が $0$ になる**。糸がたるんで放物落下する。 |
| **$v_0 \ge \sqrt{5gR}$ **|** 完全な円運動（宙返り一周成功！）** | 最高点でも $N \ge 0$ が維持され、安全に一周をクリアする。 |

### 軌道離脱角 $\theta_0$ の決定
$N = 0$ となる離脱角 $\theta_0$ は：

$$
v_0^2 - gR(2 - 3\cos\theta_0) = 0 \iff \cos\theta_0 = \frac{2gR - v_0^2}{3gR}
$$

この瞬間から小球は円運動を外れ、そのときの接線速度 $\vec{v}$ を初速度とする 「**斜方投射（放物運動）**」 へと移行します。

---

## 4. 大学入試 厳選実践例題

### 例題1: レールからの小球の打ち出しと宙返り（標準・典型）

::: info 【問題】
なめらかな斜面レールと、それに滑らかにつながる半径 $R$ の円形垂直ループ軌道がある。
高さ $h$ の位置から質量 $m$ の小球を静かに離した。重力加速度を $g$ とする。
1. ループの最下点を通過するときの小球の速さ $v_0$ を求めよ。
2. 小球がループ軌道を途中で離脱することなく一周するために必要な、スタート地点の最小の高さ $h_{\min}$ を求めよ。
3. $h = 3R$ の位置から離したとき、ループの最高点を通過する瞬間に小球がレールから受ける垂直抗力 $N_{\text{top}}$ の大きさを求めよ。
:::

#### 【解法と解説】

**1. 最下点での速さ $v_0$**
斜面最上点と最下点での力学的エネルギー保存則より：
$$
mgh = \frac{1}{2}m v_0^2 \implies v_0 = \sqrt{2gh}
$$

**2. 一周に必要な最小の高さ $h_{\min}$**
ループを一周するための最下点初速度の条件は $v_0 \ge \sqrt{5gR}$ です。
$$
\sqrt{2gh_{\min}} = \sqrt{5gR} \implies 2gh_{\min} = 5gR \implies h_{\min} = \frac{5}{2}R = 2.5R
$$
最高点の高さ $2R$ よりも、さらに半径の半分 $0.5R$ だけ高い位置からスタートしなければ、最高点での速度 $\sqrt{gR}$ を維持できません！

**3. $h = 3R$ のときの最高点垂直抗力 $N_{\text{top}}$**
スタート地点の高さ $3R$ と最高点（高さ $2R$）でのエネルギー保存則より：
$$
mg(3R) = mg(2R) + \frac{1}{2}m v_{\text{top}}^2 \implies \frac{1}{2}m v_{\text{top}}^2 = mgR \implies v_{\text{top}}^2 = 2gR
$$
最高点における中心方向の運動方程式は：
$$
m \frac{v_{\text{top}}^2}{R} = N_{\text{top}} + mg
$$
$v_{\text{top}}^2 = 2gR$ を代入すると：
$$
m \frac{2gR}{R} = N_{\text{top}} + mg \implies 2mg = N_{\text{top}} + mg \implies N_{\text{top}} = mg
$$
小球は重力と同じ大きさ $mg$ の力でレール上面を押し返しながら安定して通過します。

---

### 例題2: 糸のたるみと軌道離脱角の決定（難関大レベル）

::: info 【問題】
長さ $R$ の軽い糸の一端を固定点Oに結び、他端に質量 $m$ の小球をつけて最下点から水平初速度 $v_0 = \sqrt{4gR}$ を与えた。
1. 小球が鉛直上方となす角が $\phi$ の位置で糸がたるんだ。$\cos\phi$ の値を求めよ。
2. 糸がたるんだ瞬間の小球の速さ $v_1$ を求めよ。
3. 糸がたるんだ後、小球はどのような運動をするか簡潔に答えよ。
:::

#### 【解法と解説】

**1. 離脱角 $\phi$**
鉛直上方からの角を $\phi$ とすると、最下点基準の角 $\theta$ とは $\phi = \pi - \theta \implies \cos\theta = -\cos\phi$ の関係があります。
垂直抗力（張力）の式：
$$
\begin{aligned}
N &= \frac{m}{R}[v_0^2 - gR(2 - 3\cos\theta)] \\
  &= \frac{m}{R}[4gR - gR(2 + 3\cos\phi)] \\
  &= mg(2 - 3\cos\phi)
\end{aligned}
$$
糸がたるむ瞬間は $N = 0$ ですから：
$$
2 - 3\cos\phi = 0 \implies \cos\phi = \frac{2}{3}
$$
（$\phi \approx 48.2^\circ$ の位置で糸がたるみます！）

**2. 離脱時の速さ $v_1$**  
力学的エネルギー保存則より：
$$
\begin{aligned}
v_1^2 &= v_0^2 - 2gR(1 - \cos\theta) \\
      &= 4gR - 2gR(1 + \cos\phi) \\
      &= 4gR - 2gR\left(1 + \frac{2}{3}\right) \\
      &= 4gR - \frac{10}{3}gR = \frac{2}{3}gR
\end{aligned}
$$
したがって、
$$
v_1 = \sqrt{\frac{2}{3}gR}
$$

**3. その後の運動 ** 糸の張力が $0$ になった瞬間、小球には重力のみがはたらくため、接線方向の初速度 $v_1$ をもつ**斜方投射（放物運動）** を行い、円軌道の内側へと落下していきます。
