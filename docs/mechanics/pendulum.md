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
<svg viewBox="0 0 540 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
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
  <line x1="220" y1="30" x2="320" y2="30" stroke="#64748b" stroke-width="3"/>
  <circle cx="270" cy="30" r="4" fill="#94a3b8"/>
  <text x="270" y="20" fill="#94a3b8" font-size="12" text-anchor="middle">支点 (Pivot)</text>

  <!-- 鉛直中心線 (点線) -->
  <line x1="270" y1="30" x2="270" y2="280" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,4"/>

  <!-- 角度 θ の円弧 (支点中心, 半径 60) -->
  <!-- 支点(270, 30), 角度 25度: x = 270 - 60*sin(25°) = 270 - 25.3 = 244.7, y = 30 + 60*cos(25°) = 30 + 54.4 = 84.4 -->
  <path d="M 270,90 A 60,60 0 0,1 245,84" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="250" y="105" fill="#fbbf24" font-size="13" font-style="italic">θ</text>

  <!-- 糸 (長さ L = 180, 角度 25度) -->
  <!-- おもり中心: x = 270 - 180*sin(25°) = 270 - 76 = 194, y = 30 + 180*cos(25°) = 30 + 163 = 193 -->
  <line x1="270" y1="30" x2="194" y2="193" stroke="#94a3b8" stroke-width="2"/>
  <text x="215" y="105" fill="#94a3b8" font-size="13">糸の長さ L</text>

  <!-- 軌道円弧 (点線) -->
  <path d="M 130,220 A 180,180 0 0,0 270,210" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="3,3"/>

  <!-- おもり (cx=194, cy=193, 半径 14) -->
  <circle cx="194" cy="193" r="14" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="194" y="198" fill="#f8fafc" font-size="12" font-weight="700" text-anchor="middle">m</text>

  <!-- ベクトル描画 (おもり中心 194, 193 から) -->
  <!-- 1. 糸の張力 S (支点方向、長さ 80) -->
  <!-- 単位ベクトル: ( (270-194)/180, (30-193)/180 ) = ( 76/180, -163/180 ) = (0.422, -0.906) -->
  <line x1="194" y1="193" x2="228" y2="120" stroke="#10b981" stroke-width="2.5" marker-end="url(#arr-pend-green)"/>
  <text x="235" y="130" fill="#10b981" font-size="13" font-weight="700">張力 S</text>

  <!-- 2. 重力 mg (真下、長さ 90) -> (194, 283) -->
  <line x1="194" y1="193" x2="194" y2="283" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pend-blue)"/>
  <text x="202" y="275" fill="#38bdf8" font-size="13" font-weight="700">重力 mg</text>

  <!-- 重力の分解成分: -->
  <!-- 半径外向き成分 mg cos θ: ( -0.422, 0.906 ) * 90*cos(25°) = 81.5 * (-0.422, 0.906) = (-34.4, 73.8) -> (160, 267) -->
  <line x1="194" y1="193" x2="160" y2="267" stroke="#fbbf24" stroke-width="2" marker-end="url(#arr-pend-yellow)"/>
  <text x="80" y="275" fill="#fbbf24" font-size="12" font-weight="700">mg cos θ (張力とつり合う)</text>

  <!-- 円弧接線成分（復元力） mg sin θ: (0.906, 0.422) * 90*sin(25°) = 38 * (0.906, 0.422) = (34.4, 16.0) -> (228.4, 209) -->
  <line x1="194" y1="193" x2="228" y2="209" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-pend-rose)"/>
  <text x="238" y="218" fill="#f43f5e" font-size="13" font-weight="700">復元力: -mg sin θ</text>

  <!-- 分解平行四辺形の点線 -->
  <line x1="160" y1="267" x2="194" y2="283" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="228" y1="209" x2="194" y2="283" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3"/>
</svg>
<div class="graph-caption">図: 単振り子の力と重力分解（動径方向：張力 $S$ と $mg\cos\theta$、接線方向：復元力 $-mg\sin\theta$）</div>
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
