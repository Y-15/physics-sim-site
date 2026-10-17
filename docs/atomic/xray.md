---
title: X線の発生とX線スペクトル（デュアン＝ハント則・特性X線・モーズリー則）
description: 高校物理の原子物理・大学入試超頻出「X線の発生とスペクトル」。クーリッジ管、制動放射による連続X線と最短波長λ0=hc/eV、内殻電子遷移による特性X線（Ka, Kb）、モーズリーの法則をインタラクティブシミュレーターとベクター図解で徹底解説！
---

# X線の発生とX線スペクトル（デュアン＝ハント則・特性X線・モーズリー則）

1895年、ヴィルヘルム・レントゲンによって未知の放射線として発見された**「X線（X-rays）」**は、可視光線よりも波長が $1000$ 倍ほど短い（波長 $0.01\,\text{nm} \sim 10\,\text{nm}$ 程度）電磁波です。

大学入試や共通テストでは、**「電圧 $V$ だけで決まる最短波長 $\lambda_0$（連続X線）」** と **「ターゲット金属の元素の種類だけで決まる固有波長（特性X線）」** という2つの対照的な発生メカニズムが必ず問われます。

<ClientOnly>
  <XraySim />
</ClientOnly>

---

## 1. クーリッジ管とX線の発生機構

高真空に保たれたガラス管（クーリッジ管）の中で、加熱されたフィラメント（陰極）から放出された熱電子を、数万ボルト（$\text{kV}$）の高電圧 $V$ で加速して対陰極（ターゲット金属：Mo, W, Cuなど）に猛スピードで衝突させます。

電子が衝突したとき、次の2つの全く異なるプロセスによってX線が放射されます。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 340" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridXR" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradXR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="340" fill="url(#gradXR)" rx="10"/>
    <rect width="760" height="340" fill="url(#gridXR)" rx="10"/>
    <!-- 左側: 2つの発生機構の模式図 -->
    <!-- ① 連続X線 (制動放射) -->
    <g transform="translate(40, 30)">
      <rect x="0" y="0" width="320" height="135" fill="#1e293b" rx="6" stroke="#38bdf8"/>
      <text x="15" y="25" fill="#38bdf8" font-size="13" font-weight="bold">① 連続X線（制動放射: Bremsstrahlung）</text>
      <!-- 原子核 -->
      <circle cx="160" cy="80" r="14" fill="#ef4444"/>
      <text x="160" y="84" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">+Ze</text>
      <!-- 入射電子が軌道を曲げられて減速 -->
      <path d="M 30 110 Q 140 110 160 100 Q 180 80 280 50" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      <circle cx="50" cy="110" r="4" fill="#38bdf8"/>
      <text x="50" y="125" fill="#38bdf8" font-size="10">入射電子 (eV)</text>
      <!-- X線光子の放出 (波線) -->
      <path d="M 160 100 Q 170 120 180 100 T 200 100 T 220 100" fill="none" stroke="#f43f5e" stroke-width="2"/>
      <polygon points="220,96 228,100 220,104" fill="#f43f5e"/>
      <text x="210" y="125" fill="#f43f5e" font-size="11" font-weight="bold">X線光子 (hν)</text>
    </g>
    <!-- ② 特性X線 (内殻電子遷移) -->
    <g transform="translate(40, 180)">
      <rect x="0" y="0" width="320" height="140" fill="#1e293b" rx="6" stroke="#f59e0b"/>
      <text x="15" y="25" fill="#f59e0b" font-size="13" font-weight="bold">② 特性X線（内殻電子の電離と外殻からの遷移）</text>
      <!-- 原子核と軌道 -->
      <circle cx="160" cy="80" r="10" fill="#ef4444"/>
      <circle cx="160" cy="80" r="28" fill="none" stroke="#64748b" stroke-dasharray="3,3"/>
      <text x="195" y="80" fill="#64748b" font-size="10">K殻</text>
      <circle cx="160" cy="80" r="48" fill="none" stroke="#64748b" stroke-dasharray="3,3"/>
      <text x="215" y="80" fill="#64748b" font-size="10">L殻</text>
      <!-- 弾き飛ばされたK殻電子 -->
      <line x1="160" y1="52" x2="220" y2="25" stroke="#38bdf8" stroke-width="2"/>
      <text x="230" y="30" fill="#38bdf8" font-size="10">弾出電子</text>
      <!-- L殻からK殻への落ち込み遷移矢印 -->
      <line x1="160" y1="32" x2="160" y2="52" stroke="#f59e0b" stroke-width="3"/>
      <polygon points="156,48 160,56 164,48" fill="#f59e0b"/>
      <text x="145" y="45" fill="#f59e0b" font-size="10" font-weight="bold" text-anchor="end">Kα遷移</text>
    </g>
    <!-- 右側: X線スペクトルのグラフ解説 -->
    <g transform="translate(390, 30)">
      <rect x="0" y="0" width="330" height="290" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="165" y="25" fill="#f8fafc" font-size="14" font-weight="bold" text-anchor="middle">【X線スペクトルの2大特徴】</text>
      <!-- グラフ軸 -->
      <line x1="30" y1="230" x2="300" y2="230" stroke="#94a3b8" stroke-width="2"/>
      <line x1="30" y1="230" x2="30" y2="50" stroke="#94a3b8" stroke-width="2"/>
      <text x="25" y="45" fill="#94a3b8" font-size="10" text-anchor="end">強度 I</text>
      <text x="305" y="245" fill="#94a3b8" font-size="10">波長 λ</text>
      <!-- 最短波長 λ0 (破線) -->
      <line x1="80" y1="230" x2="80" y2="60" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3"/>
      <text x="80" y="245" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">λ₀</text>
      <!-- スペクトル曲線 (連続曲線 + 鋭いピーク) -->
      <!-- 連続山 -->
      <path d="M 80 230 Q 130 110 180 150 Q 230 190 280 220" fill="none" stroke="#ef4444" stroke-width="2"/>
      <!-- Kβ ピーク -->
      <line x1="140" y1="130" x2="140" y2="85" stroke="#34d399" stroke-width="3"/>
      <text x="140" y="78" fill="#34d399" font-size="10" font-weight="bold" text-anchor="middle">Kβ</text>
      <!-- Kα ピーク -->
      <line x1="160" y1="138" x2="160" y2="65" stroke="#f59e0b" stroke-width="3.5"/>
      <text x="160" y="58" fill="#f59e0b" font-size="11" font-weight="bold" text-anchor="middle">Kα (強)</text>
      <!-- 公式注記 -->
      <text x="165" y="270" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">デュアン=ハントの式: λ₀ = hc / (eV)</text>
    </g>
  </svg>
</div>

---

## 2. 連続X線と最短波長 $\lambda_0$（デュアン＝ハントの法則）

加速電圧 $V$ で加速された電子の運動エネルギーは $E_k = eV$ です。

電子が対陰極の原子核の静電場で急激にブレーキをかけられる（減速される）とき、失われた運動エネルギーの一部または全部が電磁波（X線光子）として放出されます（**制動放射**）。

失うエネルギーの割合は衝突の浅さ・深さによって千差万別なため、放出されるX線は**あらゆる波長を含む連続的な山形のスペクトル（連続X線）**になります。

### 最大エネルギーの光子 $\implies$ 最短波長 $\lambda_0$
電子がたった1回の衝突で**全運動エネルギー $eV$ をすべて1個の光子に変換したとき**、発生する光子のエネルギーは最大となり、その波長は**最も短く（最短波長 $\lambda_0$）**なります！

$$
h \nu_{\max} = h \frac{c}{\lambda_0} = e V
$$

これより、有名な**デュアン＝ハントの法則（Duane-Hunt Law）**が導かれます。

::: tip デュアン＝ハントの法則
$$
\lambda_0 = \frac{hc}{eV}
$$
- 最短波長 $\lambda_0$ は、**加速電圧 $V$ に反比例**する！
- 電圧 $V$ を上げると、$\lambda_0$ は**短波長側（左側）へシフト**する。
- **対陰極の材質（タングステンでも銅でもモリブデンでも）には一切依存しない！**
:::

---

## 3. 特性X線（固有X線）とモーズリーの法則

高速電子のエネルギーが十分に大きいとき、対陰極のターゲット原子の最も深い内殻（**K殻**）にある電子を衝突によって外へ弾き飛ばします。

するとK殻に「空席（空孔）」が生じ、この空席を埋めるために外側の殻から電子が瞬時に飛び込んできます（遷移）。このとき、**2つの電子殻のエネルギー準位の差に等しい光子**が放出されます。

これが**特性X線（固有X線）**です！

- **$K_\alpha$ 線**: **L殻 $\to$ K殻** の遷移で生じるX線（最も強度が大きい）。
- **$K_\beta$ 線**: **M殻 $\to$ K殻** の遷移で生じるX線（エネルギー差が大きいため、$K_\alpha$ より波長が短い）。

$$
h \nu_{K\alpha} = h \frac{c}{\lambda_{K\alpha}} = E_L - E_K
$$

::: tip 特性X線の超重要性質
- 波長 $\lambda_{K\alpha}$ は、ターゲット原子のエネルギー準位差だけで決まるため、**対陰極の金属固有の値**である！
- 加速電圧 $V$ をどれほど上げても、**特性X線の波長（ピークの位置）は1ミリも動かない**！（ピークの高さ＝強度だけが増加する）
:::

### モーズリーの法則（Moseley's Law）
1913年、イギリスのモーズリーは様々な金属の特性X線の振動数 $\nu$ を測定し、原子番号 $Z$ との間に次の美しい直線関係が成立することを発見しました。

$$
\sqrt{\nu} = a (Z - b)
$$

（$a, b$ は定数、$K_\alpha$ 線では $b \approx 1$）

この発見により、当時「原子量順」に並べられて混乱していた周期表（テルルとヨウ素の逆転など）が、**「原子番号（陽子数）$Z$ こそが元素の本質である」**ことが初めて実験的に証明されました。

---

## 4. 大学入試 厳選実践例題

### 例題1: デュアン＝ハント則による最短波長計算（共通テスト・標準）

::: info 【問題】
クーリッジ管に加速電圧 $V = 50\,\text{kV}$ をかけてX線を発生させた。
プランク定数を $h = 6.6 \times 10^{-34}\,\text{J}\cdot\text{s}$、光速を $c = 3.0 \times 10^8\,\text{m/s}$、電気素量を $e = 1.6 \times 10^{-19}\,\text{C}$ とする。
1. 発生する連続X線の最短波長 $\lambda_0\,[\text{pm}]$ を求めよ（$1\,\text{pm} = 10^{-12}\,\text{m}$）。
2. 加速電圧を $V' = 25\,\text{kV}$ に下げたとき、最短波長 $\lambda'_0$ はいくらになるか。
:::

#### 【解法と解説】

**1. 最短波長 $\lambda_0$**
$$
\begin{aligned}
\lambda_0 &= \frac{(6.6 \times 10^{-34}) \times (3.0 \times 10^8)}{(1.6 \times 10^{-19}) \times (50 \times 10^3)} \\
&= \frac{1.98 \times 10^{-25}}{8.0 \times 10^{-15}} = 0.2475 \times 10^{-10}\,\text{m} = \mathbf{24.8\,\text{pm}}
\end{aligned}
$$

**2. 電圧を半減させたとき**
$\lambda_0 \propto \frac{1}{V}$ ですから、電圧が半分になれば波長はちょうど **2倍** に伸びます！
$$
\lambda'_0 = 2 \times \lambda_0 = 2 \times 24.8 = 49.6\,\text{pm}
$$

---

### 例題2: 特性X線のエネルギー準位差（難関国立大レベル）

::: info 【問題】
モリブデン（Mo）を対陰極とするX線管から放出される $K_\alpha$ 線の波長は $\lambda = 7.1 \times 10^{-11}\,\text{m}$ である。
$hc = 2.0 \times 10^{-25}\,\text{J}\cdot\text{m}$、$1\,\text{eV} = 1.6 \times 10^{-19}\,\text{J}$ とする。
1. $K_\alpha$ 線光子1個のエネルギーは何 $\text{keV}$ か。
2. モリブデン原子のK殻の電子のエネルギー準位が $E_K = -20.0\,\text{keV}$ であるとき、L殻の電子のエネルギー準位 $E_L\,[\text{keV}]$ を求めよ。
:::

#### 【解法と解説】

**1. 光子のエネルギー**
光子のエネルギー $E$ は：
$$
E = h\nu = \frac{hc}{\lambda} = \frac{2.0 \times 10^{-25}\,\text{J}\cdot\text{m}}{7.1 \times 10^{-11}\,\text{m}} \approx 2.82 \times 10^{-15}\,\text{J}
$$
$\text{eV}$ 単位に変換すると：
$$
E = \frac{2.82 \times 10^{-15}}{1.6 \times 10^{-19}} \approx 1.76 \times 10^4\,\text{eV} = 17.6\,\text{keV}
$$

**2. L殻のエネルギー準位 $E_L$**
$K_\alpha$ 線は L殻からK殻への電子遷移によって生じるため、放出エネルギーは両準位の差に等しい。
$$
E_L - E_K = 17.6\,\text{keV}
$$
$E_K = -20.0\,\text{keV}$ を代入すると：
$$
E_L - (-20.0) = 17.6 \implies E_L = 17.6 - 20.0 = -2.4\,\text{keV}
$$
L殻のエネルギー準位は **$-2.4\,\text{keV}$** と求まります！
