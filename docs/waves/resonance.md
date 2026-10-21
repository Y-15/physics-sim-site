---
title: 気柱の共鳴と開口端補正（閉管・開管の定常波と音速測定）
description: 高校物理の波動分野・最頻出実験テーマ「気柱の共鳴」。閉管と開管の境界条件、固有振動数、開口端補正Δlの厳密な消去法、クントの実験をインタラクティブシミュレーターとベクター図解で徹底解説！
---

# 気柱の共鳴と開口端補正（閉管・開管の定常波と音速測定）

管の中に音波を送り込むと、特定の管の長さや振動数で急激に音が大きく響き渡る現象を **「気柱の共鳴（Acoustic Resonance）」** と呼びます。

大学入試や共通テストでは、水面を上下させて共鳴長さを測定する実験問題が毎年のように出題されます。ポイントは、 **「音波は縦波であり、変位の腹・節と圧力の腹・節が逆になること」**、そして **「管口の外側にはみ出る開口端補正 $\Delta l$」** の正しい理解です。

<ClientOnly>
  <ResonanceSim />
</ClientOnly>

---

## 1. 音波（縦波）の境界条件と定常波のモード

音波は空気分子が前後に揺れる **縦波（疎密波）** です。

1. **閉じた端（閉端・水面など）**:
   - 空気の分子は壁に衝突してこれ以上前へ進めないため、 **「変位の節（動きゼロ）」** になります。
   - 逆に空気分子が激しく壁に衝突・密集するため、 **「圧力変化（粗密）の腹」** になります。
2. **開いた端（開口端）**:
   - 外気と自由に出入りできるため、空気分子は最も自由に大きく振動できます。したがって **「変位の腹（最大振幅）」** になります。
   - 外気圧と等しく保たれるため、 **「圧力変化の節」** になります。

---

## 2. 閉管と開管の定常波モード（ベクター図解）

管の長さ $L$ に対する波長 $\lambda$ と振動数 $f$ の関係をベクター図で比較しましょう。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 440" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridRes" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradRes" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#131d31"/>
      </linearGradient>
    </defs>
    <rect width="760" height="440" fill="url(#gradRes)" rx="10"/>
    <rect width="760" height="440" fill="url(#gridRes)" rx="10"/>
    <!-- 左列: 閉管 (Closed Pipe) -->
    <text x="50" y="35" fill="#38bdf8" font-size="16" font-weight="bold">【閉管（片側閉口）】: 奇数倍振動のみ (m = 1, 3, 5)</text>
    <!-- 閉管 基本振動 (m=1) -->
    <g transform="translate(40, 60)">
      <!-- 管枠 (右側閉端) -->
      <rect x="0" y="0" width="300" height="60" fill="rgba(30, 41, 59, 0.6)" stroke="#64748b" stroke-width="2"/>
      <line x1="300" y1="0" x2="300" y2="60" stroke="#ef4444" stroke-width="4"/>
      <!-- 波形 (L = λ/4) -->
      <path d="M 0 5 Q 150 15 300 30" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M 0 55 Q 150 45 300 30" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="10" y="25" fill="#38bdf8" font-size="11" font-weight="bold">腹 (開)</text>
      <text x="260" y="25" fill="#ef4444" font-size="11" font-weight="bold">節 (閉)</text>
      <text x="0" y="80" fill="#e2e8f0" font-size="13">① 基本振動: L = λ/4  (f₁ = V / 4L)</text>
    </g>
    <!-- 閉管 3倍振動 (m=3) -->
    <g transform="translate(40, 180)">
      <rect x="0" y="0" width="300" height="60" fill="rgba(30, 41, 59, 0.6)" stroke="#64748b" stroke-width="2"/>
      <line x1="300" y1="0" x2="300" y2="60" stroke="#ef4444" stroke-width="4"/>
      <!-- 波形 (L = 3λ/4) -->
      <path d="M 0 5 Q 100 55 200 5 Q 250 5 300 30" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M 0 55 Q 100 5 200 55 Q 250 55 300 30" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="200" cy="30" r="3" fill="#ef4444"/>
      <text x="195" y="45" fill="#ef4444" font-size="10">節</text>
      <text x="0" y="80" fill="#e2e8f0" font-size="13">② 3倍振動: L = 3λ/4  (f₃ = 3V / 4L)</text>
    </g>
    <!-- 閉管 5倍振動 (m=5) -->
    <g transform="translate(40, 300)">
      <rect x="0" y="0" width="300" height="60" fill="rgba(30, 41, 59, 0.6)" stroke="#64748b" stroke-width="2"/>
      <line x1="300" y1="0" x2="300" y2="60" stroke="#ef4444" stroke-width="4"/>
      <!-- 波形 (L = 5λ/4) -->
      <path d="M 0 5 Q 60 55 120 5 Q 180 55 240 5 Q 270 5 300 30" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M 0 55 Q 60 5 120 55 Q 180 5 240 55 Q 270 55 300 30" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <text x="0" y="80" fill="#e2e8f0" font-size="13">③ 5倍振動: L = 5λ/4  (f₅ = 5V / 4L)</text>
    </g>
    <!-- 中央の仕切り線 -->
    <line x1="380" y1="20" x2="380" y2="420" stroke="#334155" stroke-width="1.5" stroke-dasharray="6,4"/>
    <!-- 右列: 開管 (Open Pipe) -->
    <text x="410" y="35" fill="#f59e0b" font-size="16" font-weight="bold">【開管（両側開口）】: 全倍振動 (n = 1, 2, 3)</text>
    <!-- 開管 基本振動 (n=1) -->
    <g transform="translate(410, 60)">
      <rect x="0" y="0" width="300" height="60" fill="rgba(30, 41, 59, 0.6)" stroke="#64748b" stroke-width="2"/>
      <!-- 波形 (L = λ/2: 両端が腹、中央が節) -->
      <path d="M 0 5 Q 150 55 300 5" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <path d="M 0 55 Q 150 5 300 55" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <circle cx="150" cy="30" r="4" fill="#ef4444"/>
      <text x="145" y="48" fill="#ef4444" font-size="11">節</text>
      <text x="0" y="80" fill="#e2e8f0" font-size="13">① 基本振動: L = λ/2  (f₁ = V / 2L)</text>
    </g>
    <!-- 開管 2倍振動 (n=2) -->
    <g transform="translate(410, 180)">
      <rect x="0" y="0" width="300" height="60" fill="rgba(30, 41, 59, 0.6)" stroke="#64748b" stroke-width="2"/>
      <!-- 波形 (L = λ: 両端が腹、腹が計3箇所、節が2箇所) -->
      <path d="M 0 5 Q 75 55 150 5 Q 225 55 300 5" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <path d="M 0 55 Q 75 5 150 55 Q 225 5 300 55" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <circle cx="75" cy="30" r="3" fill="#ef4444"/>
      <circle cx="225" cy="30" r="3" fill="#ef4444"/>
      <text x="0" y="80" fill="#e2e8f0" font-size="13">② 2倍振動: L = λ  (f₂ = 2V / 2L)</text>
    </g>
    <!-- 開管 3倍振動 (n=3) -->
    <g transform="translate(410, 300)">
      <rect x="0" y="0" width="300" height="60" fill="rgba(30, 41, 59, 0.6)" stroke="#64748b" stroke-width="2"/>
      <!-- 波形 (L = 3λ/2) -->
      <path d="M 0 5 Q 50 55 100 5 Q 150 55 200 5 Q 250 55 300 5" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <path d="M 0 55 Q 50 5 100 55 Q 150 5 200 55 Q 250 5 300 55" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
      <text x="0" y="80" fill="#e2e8f0" font-size="13">③ 3倍振動: L = 3λ/2  (f₃ = 3V / 2L)</text>
    </g>
  </svg>
</div>

::: tip 閉管と開管の決定的な違い
- **閉管**: 片端が節、片端が腹のため、波長は必ず $\frac{\lambda}{4}$ の**奇数倍（$1, 3, 5, \dots$ 倍）**になります。偶数倍振動は絶対に存在しません！
- **開管**: 両端が腹のため、波長は $\frac{\lambda}{2}$ の**整数倍（$1, 2, 3, \dots$ 倍）**になります。全倍数振動が可能です。
:::

---

## 3. 開口端補正 $\Delta l$ と水面移動の音速測定法

実際には、空気の分子は管の開口端の外側まで自由にはみ出して運動できるため、 **変位の腹は管口よりわずかに外側（距離 $\Delta l$）に形成されます**。これを**開口端補正（End Correction: $\Delta l$）**と呼びます。

管の内径を $d$ とすると、およそ $\Delta l \approx 0.6 \times \frac{d}{2} = 0.3d$ 程度です。

### 水面移動実験の解法テクニック（$\Delta l$ の相殺消去）

水を入れたガラス管に一定振動数 $f$ の音叉を近づけ、水面を徐々に下げていく実験を考えます。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 260" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <rect width="760" height="260" fill="#0f172a" rx="10"/>
    <!-- 第1共鳴 -->
    <g transform="translate(80, 20)">
      <text x="70" y="20" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【第1共鳴】(管長 l₁)</text>
      <!-- ガラス管 -->
      <rect x="30" y="40" width="80" height="180" fill="none" stroke="#64748b" stroke-width="2"/>
      <!-- 水 (閉端) -->
      <rect x="30" y="100" width="80" height="120" fill="#0284c7" opacity="0.6"/>
      <!-- 気柱長 l1 -->
      <line x1="15" y1="40" x2="15" y2="100" stroke="#f8fafc" stroke-width="1.5"/>
      <text x="5" y="75" fill="#f8fafc" font-size="12">l₁</text>
      <!-- 開口端補正 Δl -->
      <rect x="30" y="25" width="80" height="15" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="120" y="35" fill="#ef4444" font-size="11">Δl</text>
      <!-- 式 -->
      <text x="70" y="235" fill="#e2e8f0" font-size="12" text-anchor="middle">l₁ + Δl = λ/4</text>
    </g>
    <!-- 矢印 -->
    <g transform="translate(270, 110)">
      <line x1="0" y1="0" x2="60" y2="0" stroke="#38bdf8" stroke-width="3"/>
      <polygon points="60,-5 75,0 60,5" fill="#38bdf8"/>
      <text x="35" y="-10" fill="#38bdf8" font-size="11" text-anchor="middle">水面を下げる</text>
    </g>
    <!-- 第2共鳴 -->
    <g transform="translate(420, 20)">
      <text x="70" y="20" fill="#f59e0b" font-size="14" font-weight="bold" text-anchor="middle">【第2共鳴】(管長 l₂)</text>
      <rect x="30" y="40" width="80" height="180" fill="none" stroke="#64748b" stroke-width="2"/>
      <!-- 水 (深くなった) -->
      <rect x="30" y="180" width="80" height="40" fill="#0284c7" opacity="0.6"/>
      <!-- 気柱長 l2 -->
      <line x1="15" y1="40" x2="15" y2="180" stroke="#f8fafc" stroke-width="1.5"/>
      <text x="5" y="115" fill="#f8fafc" font-size="12">l₂</text>
      <!-- 開口端補正 Δl -->
      <rect x="30" y="25" width="80" height="15" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
      <!-- 式 -->
      <text x="70" y="235" fill="#e2e8f0" font-size="12" text-anchor="middle">l₂ + Δl = 3λ/4</text>
    </g>
    <!-- 差分による決定 -->
    <g transform="translate(580, 70)">
      <rect x="0" y="0" width="160" height="120" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="15" y="30" fill="#38bdf8" font-size="13" font-weight="bold">差を取るとΔlが消去！</text>
      <text x="15" y="60" fill="#f8fafc" font-size="13">l₂ - l₁ = λ / 2</text>
      <text x="15" y="85" fill="#f59e0b" font-size="13" font-weight="bold">λ = 2(l₂ - l₁)</text>
      <text x="15" y="105" fill="#94a3b8" font-size="11">V = 2f(l₂ - l₁)</text>
    </g>
  </svg>
</div>

1. **第1共鳴（基本振動）**:
   $$
   l_1 + \Delta l = \frac{1}{4}\lambda
   $$
2. **第2共鳴（3倍振動）**:
   $$
   l_2 + \Delta l = \frac{3}{4}\lambda
   $$

両式の **差（引き算）** をとると、未知数だった開口端補正 $\Delta l$ が見事に相殺されます！

$$
l_2 - l_1 = \frac{3}{4}\lambda - \frac{1}{4}\lambda = \frac{1}{2}\lambda \implies \lambda = 2(l_2 - l_1)
$$

これより、音速 $V$ は直ちに求まります：

$$
V = f \lambda = 2f(l_2 - l_1)
$$

また、第1共鳴の式に代入すれば開口端補正 $\Delta l$ も正確に求められます：

$$
\Delta l = \frac{1}{4}\lambda - l_1 = \frac{l_2 - l_1}{2} - l_1 = \frac{l_2 - 3l_1}{2}
$$

---

## 4. 大学入試 厳選実践例題

### 例題1: 気柱共鳴による音速と開口端補正の精密決定

::: info 【問題】
ガラス管の管口付近で振動数 $f = 600\,\text{Hz}$ の音叉を鳴らしながら、管内の水面を徐々に下げていったところ、水面が管口から $l_1 = 13.0\,\text{cm}$ の位置で最初の共鳴が起こり、$l_2 = 41.0\,\text{cm}$ の位置で2回目の共鳴が起こった。
1. この音波の波長 $\lambda\,[\text{cm}]$ を求めよ。
2. 開口端補正 $\Delta l\,[\text{cm}]$ を求めよ。
3. この実験室における音速 $V\,[\text{m/s}]$ を求めよ。
4. このときの気温 $t\,[^\circ\text{C}]$ を求めよ。ただし、音速と気温の関係式は $V = 331.5 + 0.6t$ とする。
:::

#### 【解法と解説】

**1. 波長 $\lambda$**
隣り合う共鳴位置の間隔は半波長 $\frac{\lambda}{2}$ に等しい。
$$
\frac{\lambda}{2} = l_2 - l_1 = 41.0 - 13.0 = 28.0\,\text{cm}
$$
したがって、
$$
\lambda = 2 \times 28.0 = 56.0\,\text{cm} = 0.56\,\text{m}
$$

**2. 開口端補正 $\Delta l$**
第1共鳴の条件 $l_1 + \Delta l = \frac{\lambda}{4}$ より：
$$
\Delta l = \frac{56.0}{4} - 13.0 = 14.0 - 13.0 = 1.0\,\text{cm}
$$

**3. 音速 $V$**
波の基本公式 $V = f\lambda$ より：
$$
V = 600 \times 0.56 = 336\,\text{m/s}
$$

**4. 気温 $t$**
$$
336 = 331.5 + 0.6t \implies 0.6t = 4.5 \implies t = \frac{4.5}{0.6} = 7.5^\circ\text{C}
$$

---

### 例題2: ピストン付き気柱と音叉の共鳴（応用問題）

::: info 【問題】
両端が開いた長さ $L = 68.0\,\text{cm}$ の管がある。開口端補正を両端ともに $\Delta l = 1.0\,\text{cm}$ とする。
音速を $V = 350\,\text{m/s}$ とするとき：
1. この管が共鳴する基本振動数 $f_1\,[\text{Hz}]$ を求めよ。
2. 管の中央に薄い仕切り板を差し込んで、中央を閉じた。このとき生じる最小の共鳴振動数 $f'_1\,[\text{Hz}]$ はもとの $f_1$ の何倍になるか。
:::

#### 【解法と解説】

**1. 開管の基本振動数 $f_1$**
両側が開いているため、実効管長 $L_{\text{eff}}$ は両側の開口端補正を加えて：
$$
L_{\text{eff}} = L + 2\Delta l = 68.0 + 2 \times 1.0 = 70.0\,\text{cm} = 0.70\,\text{m}
$$
開管の基本振動では $L_{\text{eff}} = \frac{\lambda_1}{2}$ より：
$$
\lambda_1 = 2 L_{\text{eff}} = 2 \times 0.70 = 1.40\,\text{m}
$$
基本振動数 $f_1$ は：
$$
f_1 = \frac{V}{\lambda_1} = \frac{350}{1.40} = 250\,\text{Hz}
$$

**2. 中央を閉じたときの振動数 $f'_1$**  
中央に仕切りを入れると、長さ $L/2 = 34.0\,\text{cm}$ の**閉管** が2つできたことになります。
この閉管の実効管長 $L'_{\text{eff}}$ は、開口端が1箇所だけなので：
$$
L'_{\text{eff}} = \frac{L}{2} + \Delta l = 34.0 + 1.0 = 35.0\,\text{cm} = 0.35\,\text{m}
$$
閉管の基本振動の条件は $L'_{\text{eff}} = \frac{\lambda'_1}{4}$ より：
$$
\lambda'_1 = 4 L'_{\text{eff}} = 4 \times 0.35 = 1.40\,\text{m}
$$
したがって、新しい基本振動数 $f'_1$ は：
$$
f'_1 = \frac{V}{\lambda'_1} = \frac{350}{1.40} = 250\,\text{Hz}
$$
なんと、 **もとの振動数のちょうど $1.0$ 倍（変化なし）** になります！
（開管の基本振動では中央が変位の節になっているため、中央に仕切り壁を入れても定常波の境界条件がまったく妨げられないためです。）
