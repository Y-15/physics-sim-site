---
title: コンプトン効果と光子の運動量・エネルギー保存則
description: 高校物理の原子物理最頻出テーマ。光子の運動量 p=h/λ、X線散乱による波長の伸び Δλ=h/(mc)(1-cosθ)の完全導出、運動量保存則とエネルギー保存則の連立計算、反跳電子の運動エネルギーをシミュレーションとオリジナル例題で完全攻略。
---

# コンプトン効果と光子の運動量・エネルギー保存則

<div class="lead">
「光電効果」によって、光がエネルギー <i>E</i> = <i>h</i>ν を持った粒子（光子）であることが証明されました。<br>
では、<strong>光の粒には「運動量」もあるのでしょうか？</strong><br>
質量がゼロであるはずの光子が、静止している電子にビリヤード球のように衝突し、電子を弾き飛ばして自らは波長を伸ばして散乱される――。<br>
1923年、アーサー・コンプトンが発見したこの<strong>コンプトン効果（Compton Effect）</strong>は、光がまぎれもなく「運動量 <i>p</i> = (<i>h</i> / λ)」を持った実体であることを決定づけました。<br>
本ページでは、入試で頻出する保存則の連立導出から、波長変化の幾何学的解法までを完全攻略します。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象・先端科学
* **CTスキャン・放射線治療**: 医療用高エネルギーX線が体内の生体組織（水やタンパク質の電子）を通過するとき、コンプトン散乱を起こして散乱線を発生させる（被爆線量計算の基礎物理）。
* **宇宙からのガンマ線天文学**: ブラックホールや超新星残骸から飛来する超高エネルギーガンマ線を観測する「コンプトン望遠鏡」の検出原理。
* **宇宙船のソーラーセイル（宇宙ヨット）**: 太陽光の光子が巨大な反射帆に衝突したときの運動量変化（力積）だけで、燃料を使わずに惑星間を航行する技術。

### 学習の到達目標
1. **光子の運動量の公式**: $E = pc$ より $p = \frac{E}{c} = \frac{h}{\lambda}$ であることを理解し、ベクトルとして扱える。
2. **コンプトン散乱公式の自力導出**: $x$ 方向・$y$ 方向の運動量保存則とエネルギー保存則から、波長の伸び $\lambda' - \lambda_0 = \frac{h}{m_e c}(1 - \cos\theta)$ を自力で導出できる。
3. **反跳電子のエネルギー計算**: エネルギー保存則 $h\frac{c}{\lambda_0} = h\frac{c}{\lambda'} + K_e$ から、弾き飛ばされた電子の運動エネルギーを瞬時に求められる。

---

## 🧪 インタラクティブ実験室

散乱角 $\theta$ や入射X線の波長 $\lambda_0$ をスライダーで動かし、散乱光子の波長の伸びや反跳電子の飛ぶ向き（角 $\phi$）をリアルタイムに観察してみましょう。

<ComptonSim />

---

## 2. 光子の運動量と散乱モデル

### (1) 光子の運動量 $p = \frac{h}{\lambda}$
アインシュタインの特殊相対性理論において、エネルギー $E$ と運動量 $p$、静止質量 $m_0$ の間には次の関係があります：

$$E^2 = (pc)^2 + (m_0 c^2)^2$$

光子は**静止質量がゼロ（$m_0 = 0$）**であるため：

$$E = pc \implies p = \frac{E}{c}$$

光子のエネルギーは $E = h\nu = \frac{hc}{\lambda}$ なので、代入すると：

$$
\boxed{p = \frac{h}{\lambda}}
$$

* $h$: プランク定数（$h \approx 6.63 \times 10^{-34}\,\text{J}\cdot\text{s}$）
* $\lambda$: 光の波長 $[\text{m}]$

波長が短い光（X線やガンマ線）ほど、光子1個の運動量は巨大になります。

---

## 3. コンプトン散乱公式の完全導出（入試頻出！）

静止している電子（質量 $m_e$）に、波長 $\lambda_0$ のX線光子が衝突し、角度 $\theta$ で波長 $\lambda'$ の光子が散乱され、電子が角度 $\phi$、速さ $v$（運動量 $p_e = m_e v$）で弾き飛ばされたとします。

<div class="vector-graph-card">
<svg viewBox="0 0 540 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-cp-ray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="arr-cp-scat" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#22d3ee" />
    </marker>
    <marker id="arr-cp-elec" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
  </defs>
  <!-- 水平衝突軸 (x 軸) -->
  <line x1="30" y1="140" x2="510" y2="140" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <text x="515" y="144" fill="#94a3b8" font-size="12">x</text>
  <!-- 入射光子 (p0 = h / lambda0) -->
  <line x1="60" y1="140" x2="200" y2="140" stroke="#38bdf8" stroke-width="3" marker-end="url(#arr-cp-ray)"/>
  <rect x="50" y="112" width="145" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="122" y="126" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">入射光子: p₀ ＝ h / λ₀</text>
  <!-- 衝突点 (電子 e-) cx = 210, cy = 140 -->
  <circle cx="210" cy="140" r="7" fill="#fbbf24"/>
  <rect x="155" y="152" width="110" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="210" y="166" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">静止電子 m_e</text>
  <!-- 散乱光子 (角度 θ = 40度, 長さ 160) -->
  <line x1="210" y1="140" x2="332" y2="37" stroke="#22d3ee" stroke-width="2.5" marker-end="url(#arr-cp-scat)"/>
  <rect x="340" y="30" width="170" height="38" rx="4" fill="#0f172a" stroke="#22d3ee" stroke-width="1.2"/>
  <text x="425" y="46" fill="#22d3ee" font-size="11" font-weight="700" text-anchor="middle">散乱光子: p' ＝ h / λ'</text>
  <text x="425" y="60" fill="#cbd5e1" font-size="9" text-anchor="middle">波長が伸びる (λ' > λ₀)</text>
  <!-- 散乱角 θ の弧 -->
  <path d="M 270,140 A 60,60 0 0,0 256,101" fill="none" stroke="#22d3ee" stroke-width="1.5"/>
  <text x="270" y="120" fill="#22d3ee" font-size="13" font-style="italic">θ</text>
  <!-- 反跳電子 (角度 φ = -30度, 長さ 140) -->
  <line x1="210" y1="140" x2="331" y2="210" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-cp-elec)"/>
  <rect x="340" y="200" width="150" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="415" y="215" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">反跳電子: p_e ＝ m_e v</text>
  <!-- 反跳角 φ の弧 -->
  <path d="M 270,140 A 60,60 0 0,1 262,170" fill="none" stroke="#f43f5e" stroke-width="1.5"/>
  <text x="270" y="165" fill="#f43f5e" font-size="13" font-style="italic">φ</text>
</svg>
<div class="graph-caption">図: コンプトン散乱の運動量ベクトル分解（入射光子 <i>p</i>₀、散乱光子 <i>p</i>'、反跳電子 <i>p_e</i> による2次元完全弾性衝突）</div>
</div>

### ステップ 1：運動量保存則を立てる
運動量はベクトル量なので、$x$ 方向（進行方向）と $y$ 方向（垂直方向）に分解します：

* **$x$ 方向**:
  $$\frac{h}{\lambda_0} = \frac{h}{\lambda'} \cos\theta + m_e v \cos\phi \quad \implies \quad m_e v \cos\phi = \frac{h}{\lambda_0} - \frac{h}{\lambda'} \cos\theta \quad \cdots \text{①}$$
* **$y$ 方向**:
  $$0 = \frac{h}{\lambda'} \sin\theta - m_e v \sin\phi \quad \implies \quad m_e v \sin\phi = \frac{h}{\lambda'} \sin\theta \quad \cdots \text{②}$$

両辺を2乗して足し合わせ、未知の電子角 $\phi$（$\cos^2\phi + \sin^2\phi = 1$）を消去します：

$$(m_e v)^2 = \left(\frac{h}{\lambda_0} - \frac{h}{\lambda'} \cos\theta\right)^2 + \left(\frac{h}{\lambda'} \sin\theta\right)^2$$
$$(m_e v)^2 = h^2 \left[ \frac{1}{\lambda_0^2} - \frac{2\cos\theta}{\lambda_0 \lambda'} + \frac{1}{\lambda'^2} \right] \quad \cdots \text{③}$$

---

### ステップ 2：エネルギー保存則を立てる
衝突の前後で全エネルギーは保存されます（電子の速さ $v \ll c$ の非相対論近似）：

$$\frac{hc}{\lambda_0} = \frac{hc}{\lambda'} + \frac{1}{2}m_e v^2 \iff m_e v^2 = 2hc \left( \frac{1}{\lambda_0} - \frac{1}{\lambda'} \right) = 2hc \frac{\lambda' - \lambda_0}{\lambda_0 \lambda'}$$

両辺に $m_e$ をかけると：
$$(m_e v)^2 = 2 m_e hc \frac{\lambda' - \lambda_0}{\lambda_0 \lambda'} \quad \cdots \text{④}$$

---

### ステップ 3：③と④を合体させて波長差を導く
③と④の左辺はともに $(m_e v)^2$ なので等置します。近似的に $\lambda_0 \approx \lambda'$（$\lambda_0^2 \approx \lambda'^2 \approx \lambda_0 \lambda'$）と整理すると、美しい公式が導かれます：

$$
\boxed{\lambda' - \lambda_0 = \frac{h}{m_e c} (1 - \cos\theta)}
$$

ここで現れる定数 $\frac{h}{m_e c}$ は**コンプトン波長（Compton Wavelength）**と呼ばれ、電子の質量と物理定数だけで決まる普遍的な値です：

$$
\lambda_C = \frac{h}{m_e c} \approx 2.43 \times 10^{-12}\,\text{m} = 2.43\,\text{pm}
$$

---

## 4. 散乱角 $\theta$ による波長変化の性質

波長の伸び $\Delta \lambda = \lambda_C (1 - \cos\theta)$ は、**入射光の波長 $\lambda_0$ には一切依存せず、散乱角 $\theta$ だけで決まります**：

1. **前方散乱（$\theta = 0^\circ$）**:
   $\cos 0^\circ = 1$ より $\Delta \lambda = 0$（衝突せずすり抜けるため波長は不変）。
2. **直角散乱（$\theta = 90^\circ$）**:
   $\cos 90^\circ = 0$ より $\Delta \lambda = \lambda_C \approx 2.43\,\text{pm}$（コンプトン波長とちょうど一致）。
3. **後方後退散乱（$\theta = 180^\circ$）**:
   $\cos 180^\circ = -1$ より $\Delta \lambda = 2\lambda_C \approx 4.85\,\text{pm}$（**波長の伸びが最大！**）。

::: tip なぜ可視光ではコンプトン効果が観察できないのか？
* 可視光の波長: $\lambda \approx 500\,\text{nm} = 500,000\,\text{pm}$
* 最大の波長の伸び: $\Delta \lambda \approx 4.85\,\text{pm}$
* 変化率: $\frac{\Delta \lambda}{\lambda} \approx \frac{4.85}{500,000} \approx 0.001\%$（測定不能なほど微小！）

これに対し、**X線の波長は数十〜数百 pm** なので、数 pm の波長変化は測定機器ではっきりと検出できるのです。
:::

---

## 5. 例題での使い方（完全オリジナル）

### 【例題】後方散乱されたX線光子と反跳電子の運動エネルギー

``::: info 📖 【問題設定】
波長 λ₀ = 2.43 × 10⁻¹¹ m の単色 X 線を静止している電子に照射したところ、
入射方向の真後ろ（散乱角 θ = 180°）に光子が散乱された。
プランク定数を h = 6.63 × 10⁻³⁴ J·s、光速を c = 3.00 × 10⁸ m/s、
電子の質量を m_e = 9.11 × 10⁻³¹ kg、コンプトン波長を h/(m_e c) = 2.43 × 10⁻¹² m とする。

(1) 散乱された光子の波長 λ' [m] を求めよ。
(2) はね飛ばされた反跳電子の運動エネルギー K_e [J] を求めよ。
:::``

#### 【解法ステップ】

**Step 1: (1) 散乱光子の波長 $\lambda'$ を求める**  
コンプトン効果の公式に $\theta = 180^\circ$（$\cos 180^\circ = -1$）を代入：
$$\lambda' - \lambda_0 = \frac{h}{m_e c}(1 - \cos 180^\circ) = \frac{h}{m_e c} \times (1 - (-1)) = 2 \frac{h}{m_e c}$$

数値を代入：
$$\Delta \lambda = 2 \times (2.43 \times 10^{-12}\,\text{m}) = 4.86 \times 10^{-12}\,\text{m}$$
$$\lambda' = \lambda_0 + \Delta \lambda = 24.30 \times 10^{-12} + 4.86 \times 10^{-12} = 2.916 \times 10^{-11}\,\text{m} \approx 2.92 \times 10^{-11}\,\text{m}$$

**Step 2: (2) 反跳電子の運動エネルギー $K_e$ を求める**  
エネルギー保存則より、電子が得た運動エネルギーは「光子が失ったエネルギー」と等しい：
$$K_e = h\nu_0 - h\nu' = hc \left( \frac{1}{\lambda_0} - \frac{1}{\lambda'} \right) = hc \frac{\lambda' - \lambda_0}{\lambda_0 \lambda'}$$

各値を代入：
$$hc = (6.63 \times 10^{-34}) \times (3.00 \times 10^8) = 1.989 \times 10^{-25}\,\text{J}\cdot\text{m}$$
$$K_e = (1.989 \times 10^{-25}) \times \frac{4.86 \times 10^{-12}}{(2.43 \times 10^{-11}) \times (2.916 \times 10^{-11})}$$
分母: $2.43 \times 2.916 \times 10^{-22} \approx 7.086 \times 10^{-22}$  
分子: $1.989 \times 4.86 \times 10^{-37} \approx 9.667 \times 10^{-37}$  
$$K_e = \frac{9.667 \times 10^{-37}}{7.086 \times 10^{-22}} \approx 1.36 \times 10^{-15}\,\text{J}$$

**答**: (1) $2.92 \times 10^{-11}\,\text{m}$、(2) $1.36 \times 10^{-15}\,\text{J}$（約 $8.5\,\text{keV}$）

---

## 6. 要点まとめ

::: tip 📌 コンプトン効果の公式総まとめ
* **光子の運動量**:
  $$p = \frac{h}{\lambda} = \frac{E}{c}$$
* **波長の伸びの公式**:
  $$\lambda' - \lambda_0 = \frac{h}{m_e c}(1 - \cos\theta)$$
* **コンプトン波長**:
  $$\lambda_C = \frac{h}{m_e c} \approx 2.43\,\text{pm}$$
* **最大伸び（$\theta = 180^\circ$ の真後ろ散乱）**:
  $$\Delta \lambda_{\max} = 2\lambda_C \approx 4.85\,\text{pm}$$
:::

<!--@include: ../parts/notice.md-->
