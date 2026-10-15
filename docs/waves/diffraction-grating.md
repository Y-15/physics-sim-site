---
title: 回折格子とスペクトル分析（マルチスリットの鋭い干渉・白色光分光）
description: 高校物理の波動分野・大学入試最頻出「回折格子（Diffraction Grating）」。格子定数dの定義、主極大条件d sinθ=mλの幾何導出、ヤングの実験との鋭さの違い、白色光の分光スペクトルをインタラクティブシミュレーターとベクター図解で徹底解説！
---

# 回折格子とスペクトル分析（マルチスリットの鋭い干渉・白色光分光）

ヤングの実験では2本のスリットを使って光の干渉縞を作りましたが、スリットの数を数百〜数千本に増やした光学素子を**「回折格子（Diffraction Grating）」**と呼びます。

スリット数を極限まで増やすことで、干渉縞は幅の広いぼやけた縞から、**針のように鋭くシャープな輝線（スペクトル線）**へと劇的に進化します。これによって、光の波長を小数点以下まで極めて精密に測定したり、太陽光や星の光を七色の虹に分解して成分元素を特定する「分光分析」が可能になります。

<ClientOnly>
  <GratingSim />
</ClientOnly>

---

## 1. 格子定数 $d$ と回折格子の主極大条件

### ① 格子定数 $d$ の求め方
回折格子には、ガラス板やフィルムの上に $1\,\text{mm}$ あたり数百本の細い筋（スリット）が等間隔に刻まれています。
隣り合うスリットの間隔を**格子定数（Grating Constant: $d$）**と呼びます。

$$
1\,\text{mm} \text{ あたり } N \text{ 本のスリット} \implies d = \frac{1\,\text{mm}}{N} = \frac{10^{-3}\,\text{m}}{N}
$$

たとえば、$1\,\text{mm}$ あたり $500$ 本のスリットが刻まれている場合：

$$
d = \frac{1 \times 10^{-3}\,\text{m}}{500} = 2.0 \times 10^{-6}\,\text{m} = 2.0\,\mu\text{m}
$$

---

## 2. 干渉条件のベクター幾何作図

回折格子に垂直に波長 $\lambda$ の平行光線を入射させたとき、角度 $\theta$ の方向に進む光を考えます。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 340" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridDG" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradDG" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="340" fill="url(#gradDG)" rx="10"/>
    <rect width="760" height="340" fill="url(#gridDG)" rx="10"/>
    <!-- 左側: 回折格子のスリットと幾何経路差 -->
    <g transform="translate(60, 40)">
      <text x="140" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【スリット間の光路差 d sinθ】</text>
      <!-- 回折格子基板 (縦線) -->
      <line x1="80" y1="50" x2="80" y2="250" stroke="#64748b" stroke-width="4"/>
      <!-- スリット穴 A, B, C (間隔 d) -->
      <circle cx="80" cy="90" r="4" fill="#38bdf8"/>
      <text x="65" y="94" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">S₁</text>
      <circle cx="80" cy="150" r="4" fill="#38bdf8"/>
      <text x="65" y="154" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">S₂</text>
      <circle cx="80" cy="210" r="4" fill="#38bdf8"/>
      <text x="65" y="214" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">S₃</text>
      <!-- 格子定数 d の寸法線 -->
      <line x1="45" y1="90" x2="45" y2="150" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="40" y1="90" x2="50" y2="90" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="40" y1="150" x2="50" y2="150" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="35" y="125" fill="#f59e0b" font-size="12" text-anchor="end">d</text>
      <!-- 入射平行光線 (左から) -->
      <line x1="10" y1="90" x2="70" y2="90" stroke="#38bdf8" stroke-width="2"/>
      <line x1="10" y1="150" x2="70" y2="150" stroke="#38bdf8" stroke-width="2"/>
      <line x1="10" y1="210" x2="70" y2="210" stroke="#38bdf8" stroke-width="2"/>
      <!-- 回折光線 (角度 θ で右上へ) -->
      <!-- θ = 25度 -->
      <line x1="80" y1="90" x2="260" y2="6" stroke="#34d399" stroke-width="2.5"/>
      <line x1="80" y1="150" x2="260" y2="66" stroke="#34d399" stroke-width="2.5"/>
      <line x1="80" y1="210" x2="260" y2="126" stroke="#34d399" stroke-width="2.5"/>
      <!-- 垂線の足と経路差 (赤線) -->
      <line x1="80" y1="90" x2="105" y2="144" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
      <!-- S2から垂線までの部分が経路差 d sinθ -->
      <line x1="80" y1="150" x2="105" y2="144" stroke="#ef4444" stroke-width="3.5"/>
      <text x="135" y="160" fill="#ef4444" font-size="12" font-weight="bold">d sinθ</text>
      <!-- 角度 θ の表示 -->
      <line x1="80" y1="90" x2="170" y2="90" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>
      <path d="M 130 90 A 50 50 0 0 0 126 68" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="140" y="80" fill="#f59e0b" font-size="12">θ</text>
    </g>
    <!-- 右側: ヤングの2重スリット vs 回折格子のシャープさ比較 -->
    <g transform="translate(420, 30)">
      <rect x="0" y="0" width="300" height="270" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="150" y="25" fill="#f59e0b" font-size="14" font-weight="bold" text-anchor="middle">【ヤング vs 回折格子のピーク鋭さ】</text>
      <!-- ヤング (2スリット: ブロードなcos^2) -->
      <text x="20" y="55" fill="#94a3b8" font-size="11">● ヤングの二重スリット (N=2): 縞が太くぼやける</text>
      <path d="M 30 110 Q 70 60 110 110 Q 150 60 190 110 Q 230 60 270 110" fill="none" stroke="#64748b" stroke-width="2"/>
      <!-- 回折格子 (N=数千: 針のように鋭いデルタ関数ピーク) -->
      <text x="20" y="145" fill="#38bdf8" font-size="11" font-weight="bold">● 回折格子 (N=数千): 条件から少しでも外れると完全消滅！</text>
      <path d="M 30 220 L 68 220 L 70 160 L 72 220 L 148 220 L 150 160 L 152 220 L 228 220 L 230 160 L 232 220 L 270 220" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <!-- 極大公式まとめ -->
      <text x="150" y="250" fill="#34d399" font-size="15" font-weight="bold" text-anchor="middle">明線条件: d sinθ = m λ</text>
    </g>
  </svg>
</div>

隣り合うスリットからの光路差は幾何学的に **$d\sin\theta$** となります。
この光路差が波長 $\lambda$ の整数倍になるとき、すべてのスリットからの光が同位相で一斉に強め合います！

::: tip 回折格子の明線条件（主極大）
$$
d \sin\theta = m \lambda \quad (m = 0, \pm 1, \pm 2, \dots)
$$
- $m = 0$: **0次光（中央明線）**。回折せず直進する光（波長によらず $\theta=0$）。
- $m = 1$: **1次光（1次回折線）**。
- $m = 2$: **2次光（2次回折線）**。
:::

---

## 3. 白色光の分光スペクトルの並び順（重要！）

太陽光などの白色光を回折格子に入射させると、各波長ごとに回折角 $\theta$ が異なるため、美しい虹色のスペクトルに分光されます。

$$
\sin\theta = \frac{m \lambda}{d}
$$

式から明らかなように、**波長 $\lambda$ が長い光ほど回折角 $\theta$ が大きく**なります！

- **紫色の光（$\lambda \approx 400\,\text{nm}$）**: 波長が短いため、回折角 $\theta$ は小さい（**中央寄り**に現れる）。
- **赤色の光（$\lambda \approx 700\,\text{nm}$）**: 波長が長いため、回折角 $\theta$ は大きい（**外側寄り**に現れる）。

::: warning プリズムの屈折分光との違い（受験生の盲点！）
- **回折格子**: 波長の長い**「赤」が外側（大きく曲がる）**、波長の短い**「紫」が内側**。
- **ガラスプリズム（屈折）**: 紫色の光の方が屈折率 $n$ が大きいため、**「紫」が大きく曲がり外側**、**「赤」が内側**。
**回折格子とプリズムでは、色の並び順が完全に逆**になります！入試の正誤問題で頻出です。
:::

---

## 4. 大学入試 厳選実践例題

### 例題1: 回折格子による波長の精密測定（基本・頻出）

::: info 【問題】
$1\,\text{mm}$ あたり $600$ 本の筋が等間隔に引かれた回折格子に、垂直にある単色レーザー光を入射させた。
回折格子の後方 $L = 1.20\,\text{m}$ の位置にスクリーンを置いたところ、中央の明線（$m=0$）から左右に $x_1 = 45.6\,\text{cm}$ 離れた位置に1次の明線（$m=1$）が観測された。
1. 回折格子の格子定数 $d\,[\text{m}]$ を求めよ。
2. このレーザー光の波長 $\lambda\,[\text{nm}]$ を求めよ。
:::

#### 【解法と解説】

**1. 格子定数 $d$**
$1\,\text{mm} = 10^{-3}\,\text{m}$ に $600$ 本のスリットがあるので：
$$
d = \frac{10^{-3}}{600} = \frac{1}{6} \times 10^{-5} \approx 1.67 \times 10^{-6}\,\text{m}
$$

**2. レーザー光の波長 $\lambda$**
スクリーン上の位置 $x_1 = 0.456\,\text{m}$、距離 $L = 1.20\,\text{m}$ より：
$$
\tan\theta_1 = \frac{x_1}{L} = \frac{0.456}{1.20} = 0.380
$$
$\theta$ が比較的小さいとき、または厳密に三角関数の関係を用いると：
$$
1 + \tan^2\theta_1 = \frac{1}{\cos^2\theta_1} \implies \cos^2\theta_1 = \frac{1}{1 + 0.380^2} = \frac{1}{1 + 0.1444} = \frac{1}{1.1444} \approx 0.8738
$$
$$
\sin\theta_1 = \sqrt{1 - \cos^2\theta_1} = \sqrt{1 - 0.8738} = \sqrt{0.1262} \approx 0.355
$$
（※ $\tan\theta \approx \sin\theta$ の近似を使うと $\sin\theta \approx 0.380$ となり誤差が出るため、角が大きい場合は幾何学的に正しく計算します。）
回折条件 $d \sin\theta_1 = 1 \cdot \lambda$ より：
$$
\lambda = d \sin\theta_1 = \left(\frac{10^{-3}}{600}\right) \times 0.355 \approx 5.92 \times 10^{-7}\,\text{m} = 592\,\text{nm}
$$
（これはナトリウムランプのD線に近い黄色〜橙色の光です。）

---

### 例題2: 高次スペクトルの重なり（難関大レベル）

::: info 【問題】
可視光線（波長範囲 $400\,\text{nm} \sim 700\,\text{nm}$）を回折格子に垂直に入射させた。
1. 2次スペクトル（$m=2$）と3次スペクトル（$m=3$）の一部が重なり合うことを示せ。
2. 重なり合う波長の範囲を求めよ。
:::

#### 【解法と解説】

**1. 重なり合いの証明**
回折角の正弦は $\sin\theta = \frac{m \lambda}{d}$ です。
- 2次スペクトル（$m=2$）の波長範囲：
  - 最短（紫 $400\,\text{nm}$）: $\sin\theta_{2,\text{min}} = \frac{2 \times 400}{d} = \frac{800}{d}$
  - 最長（赤 $700\,\text{nm}$）: $\sin\theta_{2,\text{max}} = \frac{2 \times 700}{d} = \frac{1400}{d}$
- 3次スペクトル（$m=3$）の波長範囲：
  - 最短（紫 $400\,\text{nm}$）: $\sin\theta_{3,\text{min}} = \frac{3 \times 400}{d} = \frac{1200}{d}$
  - 最長（赤 $700\,\text{nm}$）: $\sin\theta_{3,\text{max}} = \frac{3 \times 700}{d} = \frac{2100}{d}$

$\sin\theta_{3,\text{min}} = \frac{1200}{d} < \sin\theta_{2,\text{max}} = \frac{1400}{d}$ であるため、**2次スペクトルの赤側と3次スペクトルの紫側が同じ回折角の領域に重なって観測**されます！

**2. 重なり合う波長の範囲**
同じ角 $\theta$ で重なる条件は：
$$
2 \lambda_2 = 3 \lambda_3
$$
3次スペクトルの紫端 $\lambda_3 = 400\,\text{nm}$ に重なる2次の波長は：
$$
\lambda_2 = \frac{3}{2} \times 400 = 600\,\text{nm}
$$
2次スペクトルの赤端 $\lambda_2 = 700\,\text{nm}$ に重なる3次の波長は：
$$
\lambda_3 = \frac{2}{3} \times 700 \approx 467\,\text{nm}
$$
したがって、2次スペクトルの $600\,\text{nm} \sim 700\,\text{nm}$（橙色〜赤色）の帯域の上に、3次スペクトルの $400\,\text{nm} \sim 467\,\text{nm}$（紫色〜青色）の帯域が美しく重なり合って現れます！
