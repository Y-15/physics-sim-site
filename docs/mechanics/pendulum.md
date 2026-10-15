---
title: 単振り子の運動と周期公式の導出
description: 糸の長さとおもりの関係、微小振動近似、力学的エネルギー保存則をシミュレーションと数式で直感的にマスターする
---

# 🕰️ 単振り子の運動と周期公式の導出

単振り子（Simple Pendulum）は、天井に固定された長さ $L$ の糸の先に質量 $m$ のおもりを取り付け、鉛直面内で往復運動させた物理モデルです。

まずは以下の**リアルタイム実験室**で、糸の長さや重力、初期角度を変えたり、**おもりを直接ドラッグ**して揺らしてみましょう！

---

## 🧪 インタラクティブ実験室

<PendulumSim />

::: tip 実験のポイント
1. **質量とおもりの重さ**: おもりの重さ $m$ をスライダーで変えても、周期 $T$ はまったく変化しない（ガリレオの「振り子の等時性」）ことを確かめてみましょう。
2. **大振幅のズレ**: 角度を $80^\circ$ など大きく引き伸ばすと、微小近似の理論周期 $T_0$ より少しだけゆっくり揺れる（周期が伸びる）現象が観察できます。
3. **エネルギーメーター**: 最下点で運動エネルギー $K$ が最大になり、両端の折り返し点で位置エネルギー $U$ が最大になるエネルギーの交換に注目してください。
:::

---

## 1. 単振り子の運動方程式

鉛直線からのおもりの変位角を $\theta$ とし、糸の長さを $L$、重力加速度を $g$、おもりの質量を $m$ とします。

おもりには以下の2つの力が働きます：
1. **重力**: 鉛直下向きに $mg$
2. **糸の張力**: 支点に向かう方向に $S$

<div class="vector-graph-card">
<svg viewBox="0 0 540 330" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- 天井ハッチング -->
    <pattern id="pend-ceiling-hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
      <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="1.2" />
    </pattern>
    <marker id="arr-pend-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="arr-pend-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
    </marker>
    <marker id="arr-pend-rose" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
    <marker id="arr-pend-yellow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
    </marker>
  </defs>
  <!-- 天井と支点 -->
  <rect x="200" y="15" width="140" height="12" fill="url(#pend-ceiling-hatch)"/>
  <line x1="200" y1="27" x2="340" y2="27" stroke="#64748b" stroke-width="3"/>
  <circle cx="270" cy="27" r="4.5" fill="#94a3b8"/>
  <rect x="235" y="8" width="70" height="16" rx="3" fill="#0f172a" stroke="#475569" stroke-width="1"/>
  <text x="270" y="20" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">支点 (Pivot)</text>
  <!-- 鉛直中心線 (点線) -->
  <line x1="270" y1="27" x2="270" y2="295" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>
  <!-- 角度 θ の円弧 -->
  <path d="M 270,90 A 63,63 0 0,1 243,84" fill="none" stroke="#fbbf24" stroke-width="1.8"/>
  <rect x="245" y="93" width="22" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="256" y="106" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">θ</text>
  <!-- 糸 (長さ L) -->
  <line x1="270" y1="27" x2="194" y2="193" stroke="#94a3b8" stroke-width="2"/>
  <rect x="175" y="95" width="60" height="18" rx="3" fill="#0f172a" stroke="#64748b" stroke-width="1"/>
  <text x="205" y="108" fill="#cbd5e1" font-size="11" font-weight="600" text-anchor="middle">長さ L</text>
  <!-- 軌道円弧 (点線) -->
  <path d="M 120,225 A 180,180 0 0,0 270,207" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- おもり (cx=194, cy=193) -->
  <circle cx="194" cy="193" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="194" y="198" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">m</text>
  <!-- 1. 糸の張力 S (支点方向) -->
  <line x1="194" y1="193" x2="232" y2="120" stroke="#10b981" stroke-width="2.5" marker-end="url(#arr-pend-green)"/>
  <rect x="240" y="120" width="55" height="20" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="1"/>
  <text x="267" y="134" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">張力 S</text>
  <!-- 2. 重力 mg (鉛直下向き) -->
  <line x1="194" y1="193" x2="194" y2="280" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pend-blue)"/>
  <rect x="165" y="290" width="60" height="20" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="195" y="304" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">重力 mg</text>
  <!-- 重力の分解成分: 半径外向き mg cos θ -->
  <line x1="194" y1="193" x2="160" y2="267" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-pend-yellow)"/>
  <rect x="25" y="258" width="130" height="20" rx="4" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="90" y="272" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">mg cos θ (動径成分)</text>
  <!-- 重力の分解成分: 接線成分（復元力） -mg sin θ -->
  <line x1="194" y1="193" x2="232" y2="210" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-pend-rose)"/>
  <rect x="245" y="202" width="135" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="312" y="217" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">復元力: −mg sin θ</text>
  <!-- 分解平行四辺形の補助点線 -->
  <line x1="160" y1="267" x2="194" y2="280" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="232" y1="210" x2="194" y2="280" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
</svg>
<div class="graph-caption">図: 単振り子の力と重力分解（動径方向：張力 <i>S</i> と <i>mg</i> cos <i>θ</i>、接線方向：復元力 −<i>mg</i> sin <i>θ</i>）</div>
</div>

おもりは半径 $L$ の円弧上を動くため、円の接線方向（運動方向）の運動方程式を立てます。

接線方向の加速度は $a = L \frac{d^2\theta}{dt^2}$、接線方向にはたらく重力の分力は $-mg \sin\theta$（中心に戻そうとする復元力）となるため、運動方程式は次のようになります：

$$
m L \frac{d^2\theta}{dt^2} = -mg \sin\theta
$$

両辺をおもりの質量 $m$ で割ると：

$$
\frac{d^2\theta}{dt^2} + \frac{g}{L} \sin\theta = 0
$$

::: important 質量 $m$ の消失
式から質量 $m$ が消えました！これは、**振り子の往復運動において、おもりの重さは周期に一切影響を与えない**という劇的な事実を示しています。
:::

---

## 2. 微小振動近似と周期公式

角度 $\theta$ が十分に小さいとき（おおよそ $\theta < 10^\circ \approx 0.17 \text{ rad}$）、マクローリン展開により $\sin\theta$ は次のように近似できます：

$$
\sin\theta \approx \theta
$$

これを先ほどの運動方程式に代入すると：

$$
\frac{d^2\theta}{dt^2} + \frac{g}{L} \theta = 0
$$

ここで $\omega = \sqrt{\frac{g}{L}}$ と置くと、おなじみの**単振動の微分方程式**になります：

$$
\frac{d^2\theta}{dt^2} + \omega^2 \theta = 0
$$

この方程式の一般解は、振幅を $\theta_0$、初期位相を $\phi$ として：

$$
\theta(t) = \theta_0 \cos(\omega t + \phi)
$$

角振動数 $\omega = \sqrt{\frac{g}{L}}$ より、1往復にかかる周期 $T_0$ は以下の有名な公式で求まります：

$$
T_0 = \frac{2\pi}{\omega} = 2\pi \sqrt{\frac{L}{g}}
$$

### 周期の性質まとめ
* **糸の長さ $L$**: 糸を4倍長くすると、周期は $\sqrt{4} = 2$ 倍になります。
* **重力加速度 $g$**: 月面（$g \approx 1.62 \text{ m/s}^2$、地球の約1/6）では、周期は約 $\sqrt{6} \approx 2.45$ 倍遅くなります。

---

## 3. 力学的エネルギー保存則

単振り子では、張力 $S$ は常におもりの速度ベクトルと直交（仕事 $W = 0$）するため、**力学的エネルギーが厳密に保存**されます。

最下点（$\theta = 0$）を基準面（高さ $h = 0$）とすると、角度 $\theta$ での高さ $h$ は：

$$
h = L(1 - \cos\theta)
$$

したがって、全エネルギー $E$ は運動エネルギー $K$ と位置エネルギー $U$ の和として表されます：

$$
E = \frac{1}{2} m v^2 + m g L(1 - \cos\theta) = \text{一定}
$$

最下点での速さ $v_{\max}$ は、初期振幅 $\theta_0$ から離した場合：

$$
\frac{1}{2} m v_{\max}^2 = m g L(1 - \cos\theta_0) \implies v_{\max} = \sqrt{2gL(1 - \cos\theta_0)}
$$

---

## 4. 発展：振幅が大きいときの周期（楕円積分）

微小振動近似 $\sin\theta \approx \theta$ を使わない場合、厳密な周期 $T$ は**第1種完全楕円積分** $K(k)$ を用いて表されます：

$$
T = 4 \sqrt{\frac{L}{g}} \int_0^{\pi/2} \frac{d\phi}{\sqrt{1 - k^2 \sin^2\phi}} \quad \left(k = \sin\frac{\theta_0}{2}\right)
$$

これをテイラー展開して一次の補正項を取り出したものが**ボルダの公式（Borda's formula）**です：

$$
T \approx T_0 \left(1 + \frac{1}{16} \theta_0^2\right) \quad (\theta_0 \text{ はラジアン})
$$

| 初期角度 $\theta_0$ | 理論周期比 $T / T_0$ | ズレの割合 |
| :--- | :--- | :--- |
| **$5^\circ$** | 約 1.0005 | +0.05%（ほぼ完全一致） |
| **$30^\circ$** | 約 1.017 | +1.7% |
| **$60^\circ$** | 約 1.073 | +7.3%（明らかに遅くなる） |
| **$90^\circ$** | 約 1.180 | +18.0% |

上部のシミュレーターは**ルンゲ＝クッタ4次法（RK4）**により厳密な運動方程式をリアルタイム解いているため、角度を大きくしたときの実際の遅れを忠実に再現しています！

---

## 📚 関連テーマ
* 🎯 [斜方投射（放物運動）の軌道計算と理論](/mechanics/projectile)
* 🧲 [ばねの単振動とフックの法則（準備中）](/mechanics/spring)
