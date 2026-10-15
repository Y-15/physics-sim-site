---
title: LC振動回路と電磁振動（電気振動のエネルギー保存則）
description: 高校物理の電磁気最難関テーマ「LC振動回路」。キルヒホッフ則からの微分方程式導出、固有角振動数ω=1/√(LC)、力学の単振動（ばね）との完全対応、エネルギー保存則をインタラクティブシミュレーターとベクター図解で徹底解説！
---

# LC振動回路と電磁振動（電気振動のエネルギー保存則）

充電されたコンデンサー（電気容量 $C$）にコイル（自己インダクタンス $L$）をつなぐと、電流は一方通行で終わるのではなく、**向きを変えながら周期的に激しく行き来する電気振動（LC振動）**を始めます。

この現象は、力学における**「ばねにつないだ物体の単振動」と数学的に1対1で完全に一致**します。両者の対応関係を理解すると、公式を丸暗記することなく、あらゆる電磁振動の問題を力学の直感で瞬時に解けるようになります。

<ClientOnly>
  <LcSim />
</ClientOnly>

---

## 1. キルヒホッフの法則と単振動の微分方程式

時刻 $t$ におけるコンデンサー上極板の電荷を $Q(t)$、回路を時計回りに流れる電流を $I(t)$ とします。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 300" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridLC" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradLC" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="300" fill="url(#gradLC)" rx="10"/>
    <rect width="760" height="300" fill="url(#gridLC)" rx="10"/>

    <!-- 回路図 -->
    <g transform="translate(60, 40)">
      <!-- 導線 -->
      <path d="M 50 40 L 250 40 L 250 90 M 250 150 L 250 200 L 50 200 L 50 140 M 50 100 L 50 40" fill="none" stroke="#94a3b8" stroke-width="3"/>

      <!-- コンデンサー (左) -->
      <line x1="25" y1="100" x2="75" y2="100" stroke="#38bdf8" stroke-width="4"/>
      <line x1="25" y1="140" x2="75" y2="140" stroke="#38bdf8" stroke-width="4"/>
      <text x="15" y="90" fill="#ef4444" font-size="12" font-weight="bold">+Q</text>
      <text x="15" y="155" fill="#38bdf8" font-size="12" font-weight="bold">-Q</text>
      <text x="50" y="125" fill="#e2e8f0" font-size="12" text-anchor="middle">V = Q/C</text>

      <!-- コイル (右) -->
      <path d="M 250 90 C 270 90 270 105 250 105 C 270 105 270 120 250 120 C 270 120 270 135 250 135 C 270 135 270 150 250 150" fill="none" stroke="#f59e0b" stroke-width="3"/>
      <text x="285" y="125" fill="#f59e0b" font-size="13" font-weight="bold">L</text>
      <text x="290" y="145" fill="#94a3b8" font-size="11">-L(dI/dt)</text>

      <!-- 電流矢印 (時計回り) -->
      <path d="M 130 30 L 170 30" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="170,26 180,30 170,34" fill="#ef4444"/>
      <text x="150" y="22" fill="#ef4444" font-size="12" font-weight="bold">I = - dQ/dt</text>
    </g>

    <!-- 微分方程式の誘導カード -->
    <g transform="translate(400, 30)">
      <rect x="0" y="0" width="320" height="240" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="20" y="30" fill="#38bdf8" font-size="14" font-weight="bold">【キルヒホッフ第2法則】</text>
      <text x="20" y="60" fill="#f8fafc" font-size="13">時計回りに1周電位をたどる:</text>
      <text x="20" y="90" fill="#f59e0b" font-size="14" font-weight="bold">Q/C - L (dI/dt) = 0</text>
      <text x="20" y="120" fill="#94a3b8" font-size="12">上極板から電荷が流れ出るので:</text>
      <text x="20" y="145" fill="#ef4444" font-size="13" font-weight="bold">I = - dQ/dt  ⇒  dI/dt = - d²Q/dt²</text>
      <line x1="20" y1="160" x2="300" y2="160" stroke="#334155"/>
      <text x="20" y="185" fill="#a855f7" font-size="13" font-weight="bold">代入すると単振動の方程式が出現！</text>
      <text x="20" y="215" fill="#38bdf8" font-size="15" font-weight="bold">d²Q/dt² + (1 / LC) Q = 0</text>
    </g>
  </svg>
</div>

単振動の標準方程式 $\frac{d^2 x}{dt^2} + \omega^2 x = 0$ と見比べると、固有角振動数 $\omega$ は次のように決まります。

$$
\omega = \frac{1}{\sqrt{LC}}
$$

したがって、LC振動回路の**固有振動数 $f$** および**固有周期 $T$** は：

::: tip LC回路の周期公式
- 固有角振動数:
  $$
  \omega = \frac{1}{\sqrt{LC}}
  $$
- 固有周期（トムソンの公式）:
  $$
  T = \frac{2\pi}{\omega} = 2\pi\sqrt{LC}
  $$
- 固有振動数:
  $$
  f = \frac{1}{T} = \frac{1}{2\pi\sqrt{LC}}
  $$
:::

---

## 2. 力学の単振動（ばね振り子）との完全対応

電磁気学のLC振動と力学の単振動は、物理量が1対1で驚くほど綺麗に対応しています。

| 概念 | 力学（ばね振り子） | 電磁気（LC振動回路） |
| :--- | :--- | :--- |
| **変位・状態量** | 位置 $x$ | 電荷 $Q$ |
| **変化率（速度）** | 速度 $v = \frac{dx}{dt}$ | 電流 $I = \frac{dQ}{dt}$ |
| **慣性（動きにくさ）** | 質量 $m$ | 自己インダクタンス $L$ |
| **復元力の定数** | ばね定数 $k$ | 容量の逆数 $\frac{1}{C}$ |
| **運動方程式** | $m \frac{d^2 x}{dt^2} = -k x$ | $L \frac{d^2 Q}{dt^2} = -\frac{1}{C} Q$ |
| **角振動数** | $\omega = \sqrt{\frac{k}{m}}$ | $\omega = \sqrt{\frac{1/C}{L}} = \frac{1}{\sqrt{LC}}$ |
| **運動エネルギー** | $\frac{1}{2}m v^2$ | コイルの磁気エネルギー $\frac{1}{2}L I^2$ |
| **位置（弾性）エネルギー** | $\frac{1}{2}k x^2$ | コンデンサーの静電エネルギー $\frac{Q^2}{2C}$ |

::: tip コイル $L$ は「電気の重さ（質量）」である！
自己インダクタンス $L$ は「電流の急激な変化を妨げる性質（誘導起電力 $-L \frac{dI}{dt}$）」を持ちます。
これは力学で「質量の大きな物体ほど、力を加えても速度が急に変わらない（慣性 $m$）」のと全く同じ役割を果たしています。
:::

---

## 3. 電気振動のエネルギー保存則

回路に電気抵抗がない（$R=0$）理想的な場合、外部からエネルギーが散逸しないため、**コンデンサーの静電エネルギー $U_E$** と **コイルの磁気エネルギー $U_B$** の和は常に一定に保たれます。

$$
E = U_E + U_B = \frac{Q(t)^2}{2C} + \frac{1}{2}L I(t)^2 = \text{一定}
$$

### エネルギー交換の1サイクル（周期 $T$ の変化）

<div class="vector-graph-card">
  <svg viewBox="0 0 760 220" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <rect width="760" height="220" fill="#0f172a" rx="10"/>

    <!-- 4つの主要状態 -->
    <!-- t = 0 -->
    <g transform="translate(40, 20)">
      <rect x="0" y="0" width="140" height="170" fill="#1e293b" rx="6" stroke="#38bdf8"/>
      <text x="70" y="25" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">t = 0 (充電直後)</text>
      <text x="70" y="55" fill="#f8fafc" font-size="12" text-anchor="middle">Q = +Q₀ (最大)</text>
      <text x="70" y="75" fill="#94a3b8" font-size="12" text-anchor="middle">I = 0</text>
      <!-- バー -->
      <rect x="20" y="100" width="100" height="15" fill="#0284c7" rx="3"/>
      <text x="70" y="135" fill="#0284c7" font-size="11" text-anchor="middle">UE = 最大</text>
      <text x="70" y="155" fill="#64748b" font-size="11" text-anchor="middle">UB = 0</text>
    </g>

    <!-- t = T/4 -->
    <g transform="translate(220, 20)">
      <rect x="0" y="0" width="140" height="170" fill="#1e293b" rx="6" stroke="#f59e0b"/>
      <text x="70" y="25" fill="#f59e0b" font-size="13" font-weight="bold" text-anchor="middle">t = T/4 (放電完了)</text>
      <text x="70" y="55" fill="#94a3b8" font-size="12" text-anchor="middle">Q = 0</text>
      <text x="70" y="75" fill="#ef4444" font-size="12" text-anchor="middle">I = I₀ (最大)</text>
      <rect x="20" y="100" width="100" height="15" fill="#f59e0b" rx="3"/>
      <text x="70" y="135" fill="#64748b" font-size="11" text-anchor="middle">UE = 0</text>
      <text x="70" y="155" fill="#f59e0b" font-size="11" text-anchor="middle">UB = 最大</text>
    </g>

    <!-- t = T/2 -->
    <g transform="translate(400, 20)">
      <rect x="0" y="0" width="140" height="170" fill="#1e293b" rx="6" stroke="#38bdf8"/>
      <text x="70" y="25" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">t = T/2 (逆充電)</text>
      <text x="70" y="55" fill="#f8fafc" font-size="12" text-anchor="middle">Q = -Q₀ (逆最大)</text>
      <text x="70" y="75" fill="#94a3b8" font-size="12" text-anchor="middle">I = 0</text>
      <rect x="20" y="100" width="100" height="15" fill="#0284c7" rx="3"/>
      <text x="70" y="135" fill="#0284c7" font-size="11" text-anchor="middle">UE = 最大</text>
      <text x="70" y="155" fill="#64748b" font-size="11" text-anchor="middle">UB = 0</text>
    </g>

    <!-- t = 3T/4 -->
    <g transform="translate(580, 20)">
      <rect x="0" y="0" width="140" height="170" fill="#1e293b" rx="6" stroke="#f59e0b"/>
      <text x="70" y="25" fill="#f59e0b" font-size="13" font-weight="bold" text-anchor="middle">t = 3T/4 (逆放電)</text>
      <text x="70" y="55" fill="#94a3b8" font-size="12" text-anchor="middle">Q = 0</text>
      <text x="70" y="75" fill="#ef4444" font-size="12" text-anchor="middle">I = -I₀ (逆最大)</text>
      <rect x="20" y="100" width="100" height="15" fill="#f59e0b" rx="3"/>
      <text x="70" y="135" fill="#64748b" font-size="11" text-anchor="middle">UE = 0</text>
      <text x="70" y="155" fill="#f59e0b" font-size="11" text-anchor="middle">UB = 最大</text>
    </g>
  </svg>
</div>

初期電荷を $Q_0$、初期電圧を $V_0 = \frac{Q_0}{C}$ とすると、全エネルギーは $E = \frac{1}{2}C V_0^2 = \frac{Q_0^2}{2C}$ です。
電流が最大値 $I_{\max}$ に達した瞬間は $Q=0$ なので：

$$
\frac{1}{2}L I_{\max}^2 = \frac{Q_0^2}{2C} \implies I_{\max} = \frac{Q_0}{\sqrt{LC}} = \omega Q_0 = V_0 \sqrt{\frac{C}{L}}
$$

---

## 4. 大学入試 厳選実践例題

### 例題1: LC振動の周期と最大電流（基本・頻出）

::: info 【問題】
電気容量 $C = 2.0\,\mu\text{F}$ のコンデンサーに電圧 $V_0 = 100\,\text{V}$ の直流電源をつないで充電した後、電源を切り離し、自己インダクタンス $L = 50\,\text{mH}$ のコイルにつないで閉回路を作った。スイッチを入れた瞬間を $t=0$ とする。
1. この回路に流れる電流の周期 $T\,[\text{s}]$ を求めよ。
2. 回路を流れる電流の最大値 $I_{\max}\,[\text{A}]$ を求めよ。
3. スイッチを入れてから初めて電流が最大値に達する時刻 $t_1\,[\text{s}]$ を求めよ。
:::

#### 【解法と解説】

**1. 周期 $T$**
トムソンの公式 $T = 2\pi\sqrt{LC}$ より：
$$
\begin{aligned}
LC &= (50 \times 10^{-3}\,\text{H}) \times (2.0 \times 10^{-6}\,\text{F}) = 100 \times 10^{-9} = 1.0 \times 10^{-7}\,\text{s}^2 \\
\sqrt{LC} &= \sqrt{1.0 \times 10^{-7}} = \sqrt{10} \times 10^{-4} \approx 3.16 \times 10^{-4}\,\text{s} \\
T &= 2\pi \times (3.16 \times 10^{-4}) \approx 2.0 \times 10^{-3}\,\text{s} = 2.0\,\text{ms}
\end{aligned}
$$

**2. 最大電流 $I_{\max}$**
エネルギー保存則 $\frac{1}{2}L I_{\max}^2 = \frac{1}{2}C V_0^2$ より：
$$
I_{\max} = V_0 \sqrt{\frac{C}{L}} = 100 \times \sqrt{\frac{2.0 \times 10^{-6}}{50 \times 10^{-3}}} = 100 \times \sqrt{4.0 \times 10^{-5}} = 100 \times (2.0 \times 10^{-2} \times \sqrt{10^{-1}})
$$
分数で正確に計算すると：
$$
\frac{C}{L} = \frac{2 \times 10^{-6}}{5 \times 10^{-2}} = 4 \times 10^{-5} \implies \sqrt{\frac{C}{L}} = \frac{2}{\sqrt{100000}} = \frac{2}{316.2} \approx 6.32 \times 10^{-3}
$$
$$
I_{\max} = 100 \times 6.32 \times 10^{-3} \approx 0.63\,\text{A}
$$

**3. 最大電流到達時刻 $t_1$**
$t=0$ で電荷最大・電流ゼロの状態から、初めて電流が最大になるのは $\frac{1}{4}$ 周期後です。
$$
t_1 = \frac{T}{4} = \frac{2.0 \times 10^{-3}}{4} = 5.0 \times 10^{-4}\,\text{s} = 0.50\,\text{ms}
$$

---

### 例題2: スイッチ切り替えとLC振動（思考力問題）

::: info 【問題】
自己インダクタンス $L$ のコイル、電気容量 $C$ のコンデンサー、起電力 $E$ の電池、およびスイッチSからなる回路がある。
はじめコンデンサーには電荷はなく、スイッチを電池側に入れて十分に時間が経過した。
その後、スイッチをコイル側へ瞬時に切り替えた。
1. 切り替え直後のコイルに流れる電流 $I_0$ を求めよ。
2. その後、コンデンサーの極板間に蓄えられる最大電荷 $Q_{\max}$ を求めよ。
:::

#### 【解法と解説】

**1. 切り替え直後の電流 $I_0$**
電池とコイルを直列につないで十分に時間が経過すると、コイルの両端の誘導起電力は $0$（単なる導線）となり、抵抗がない場合は電流が無限大に向かって増加してしまいますが、内部抵抗 $r$ がある場合は $I_0 = E/r$ となります。
本問で理想コイルと電池のみをつないだ場合（あるいは電流 $I_0$ が流れている状態からの切り替え）、コイルの自己誘導作用により**「電流は急激に変化できない」**ため、切り替え直後も直前と同じ電流 $I_0$ が流れ続けます。

**2. 最大電荷 $Q_{\max}$**
コイルに流れていた電流 $I_0$ による磁気エネルギー $\frac{1}{2}L I_0^2$ が、すべてコンデンサーの静電エネルギー $\frac{Q_{\max}^2}{2C}$ に変換されます。
$$
\frac{Q_{\max}^2}{2C} = \frac{1}{2}L I_0^2 \implies Q_{\max} = \sqrt{LC}\, I_0
$$
電磁エネルギー保存則を使えば、微分方程式を解くことなく瞬時に答えが得られます！
