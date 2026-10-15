---
title: ホール効果と半導体のキャリア判定（ローレンツ力とホール電圧）
description: 高校物理の電磁気最難関テーマ「ホール効果（Hall Effect）」。ローレンツ力と静電力のつり合い、ホール電圧VH=IB/(nqt)の完全導出、電子（n型）と正孔（p型）の極性逆転判定をシミュレーターとベクター図解で徹底解説！
---

# ホール効果と半導体のキャリア判定（ローレンツ力とホール電圧）

磁場の中におかれた導体や半導体に電流を流すと、**電流と磁場の両方に垂直な方向に電位差（電圧）が発生**します。これを1879年にエドウィン・ホールが発見した**「ホール効果（Hall Effect）」**と呼びます。

大学入試（東大、京大、旧帝大、早慶など）では、ローレンツ力と電場による力のつり合いを立式させる頻出テーマです。さらに、**「電流を担うキャリアが電子（$-e$）なのか正孔（$+e$）なのかを判定できる」**という半導体工学の根幹をなす物理現象です。

<ClientOnly>
  <HallEffectSim />
</ClientOnly>

---

## 1. ホール効果のメカニズムとホール電圧の導出

幅 $d$、厚さ $t$ の直方体導体ブロックを考えます。
- $x$ 軸正の向き（右向き）に電流 $I$ を流す。
- $z$ 軸正の向き（手前から奥の向き $\otimes$）に一様な磁場 $B$ を加える。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 340" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridHE" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradHE" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="340" fill="url(#gradHE)" rx="10"/>
    <rect width="760" height="340" fill="url(#gridHE)" rx="10"/>

    <!-- 直方体導体の立体配置図 -->
    <g transform="translate(60, 40)">
      <text x="140" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【電子キャリア（金属・n型）の場合】</text>

      <!-- 導体ブロック -->
      <rect x="40" y="70" width="240" height="120" fill="rgba(30, 41, 59, 0.85)" stroke="#94a3b8" stroke-width="2"/>

      <!-- 寸法線: 幅 d (縦), 厚さ t (奥行き) -->
      <line x1="25" y1="70" x2="25" y2="190" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="20" y1="70" x2="30" y2="70" stroke="#f59e0b" stroke-width="1.5"/>
      <line x1="20" y1="190" x2="30" y2="190" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="15" y="135" fill="#f59e0b" font-size="12" text-anchor="end">幅 d</text>

      <!-- 電流 I (右向き) -->
      <line x1="10" y1="130" x2="35" y2="130" stroke="#f59e0b" stroke-width="3"/>
      <polygon points="35,126 43,130 35,134" fill="#f59e0b"/>
      <text x="10" y="115" fill="#f59e0b" font-size="11" font-weight="bold">電流 I</text>

      <!-- 電子 e- (左向きにドリフト vd) -->
      <circle cx="160" cy="130" r="10" fill="#38bdf8"/>
      <text x="160" y="134" fill="#0f172a" font-size="11" font-weight="bold" text-anchor="middle">-e</text>
      <!-- 速度ベクトル vd (左向き) -->
      <line x1="150" y1="130" x2="110" y2="130" stroke="#38bdf8" stroke-width="2.5"/>
      <polygon points="110,127 102,130 110,133" fill="#38bdf8"/>
      <text x="125" y="120" fill="#38bdf8" font-size="11">v_d</text>

      <!-- ローレンツ力 fL (上向き！) -->
      <!-- 左向き速度(-x) × 奥向き磁場(-z) = 上向き(+y)。電荷が-eなので力は上向き！ -->
      <line x1="160" y1="120" x2="160" y2="80" stroke="#f43f5e" stroke-width="3"/>
      <polygon points="156,80 160,72 164,80" fill="#f43f5e"/>
      <text x="175" y="90" fill="#f43f5e" font-size="11" font-weight="bold">f_L = e v_d B (上向き)</text>

      <!-- 上面に電子が蓄積（負極）、下面に正電荷（正極） -->
      <text x="160" y="62" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">ーーーーー (上面: 負極)</text>
      <text x="160" y="210" fill="#ef4444" font-size="14" font-weight="bold" text-anchor="middle">＋＋＋＋＋ (下面: 正極)</text>

      <!-- ホール電場 EH (下から上へ) -->
      <line x1="220" y1="170" x2="220" y2="100" stroke="#a855f7" stroke-width="2" stroke-dasharray="3,3"/>
      <polygon points="217,100 220,92 223,100" fill="#a855f7"/>
      <text x="235" y="135" fill="#a855f7" font-size="11" font-weight="bold">E_H</text>

      <!-- 判定結論 -->
      <text x="160" y="245" fill="#ef4444" font-size="13" font-weight="bold" text-anchor="middle">金属・n型: 下面の電位が高い (V_下面 &gt; V_上面)</text>
    </g>

    <!-- 右側: 正孔キャリア（p型半導体）の場合 -->
    <g transform="translate(420, 40)">
      <text x="140" y="25" fill="#ef4444" font-size="14" font-weight="bold" text-anchor="middle">【正孔キャリア（p型半導体）の場合】</text>

      <rect x="40" y="70" width="240" height="120" fill="rgba(30, 41, 59, 0.85)" stroke="#94a3b8" stroke-width="2"/>

      <!-- 正孔 +e (右向きにドリフト vd) -->
      <circle cx="160" cy="130" r="10" fill="#ef4444"/>
      <text x="160" y="134" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">+e</text>
      <!-- 速度ベクトル vd (右向き) -->
      <line x1="170" y1="130" x2="210" y2="130" stroke="#ef4444" stroke-width="2.5"/>
      <polygon points="210,127 218,130 210,133" fill="#ef4444"/>
      <text x="190" y="120" fill="#ef4444" font-size="11">v_d</text>

      <!-- ローレンツ力 fL (上向き！) -->
      <!-- 右向き速度(+x) × 奥向き磁場(-z) = 上向き(+y)。電荷が+eなので力も上向き！ -->
      <line x1="160" y1="120" x2="160" y2="80" stroke="#f43f5e" stroke-width="3"/>
      <polygon points="156,80 160,72 164,80" fill="#f43f5e"/>
      <text x="175" y="90" fill="#f43f5e" font-size="11" font-weight="bold">f_L = e v_d B (上向き)</text>

      <!-- 上面に正孔が蓄積（正極）、下面に負極 -->
      <text x="160" y="62" fill="#ef4444" font-size="14" font-weight="bold" text-anchor="middle">＋＋＋＋＋ (上面: 正極)</text>
      <text x="160" y="210" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">ーーーーー (下面: 負極)</text>

      <text x="160" y="245" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle">p型: 上面の電位が高い (V_上面 &gt; V_下面)</text>
    </g>
  </svg>
</div>

### ① ドリフト速度 $v_d$ と電流 $I$ の関係
キャリアの電荷を $q$、数密度を $n$、平均ドリフト速度を $v_d$ とすると、断面積 $S = d \cdot t$ を通過する電流 $I$ は：

$$
I = n |q| v_d S = n |q| v_d (d \cdot t) \implies v_d = \frac{I}{n |q| d t}
$$

### ② 力のつり合いとホール電場 $E_H$
キャリアは磁場 $B$ からローレンツ力 $f_L = |q| v_d B$ を受けて側面に集積します。
蓄積された電荷によって導体内部に横向きの電場（**ホール電場 $E_H$**）が生じ、静電力 $f_E = |q| E_H$ が逆向きにはたらきます。
やがて両者がつり合って定常状態に達します：

$$
|q| E_H = |q| v_d B \implies E_H = v_d B
$$

### ③ ホール電圧 $V_H$ の公式
幅 $d$ の両端に生じる電位差（ホール電圧 $V_H$）は、$V_H = E_H d$ ですから：

$$
V_H = v_d B d
$$

これに $v_d = \frac{I}{n |q| d t}$ を代入すると、幅 $d$ が見事に相殺されて消去されます！

::: tip ホール電圧のマスター公式
$$
V_H = \frac{I B}{n |q| t}
$$
- 電圧 $V_H$ は、電流 $I$ および磁場 $B$ に**比例**する。
- キャリア密度 $n$ および厚さ $t$ に**反比例**する。
- 試料の幅 $d$ には**依存しない**！
:::

ここで、$R_H = \frac{1}{n q}$ を**ホール係数（Hall Coefficient）**と呼びます。

---

## 2. なぜキャリアの符号（電子か正孔か）が判定できるのか？

ここが入試で最も差がつく**最重要思考ポイント**です！

### 驚くべき事実：どちらのキャリアも「同じ上面」に曲げられる！
- **電子キャリア（$q = -e$）**:
  電流が右向きのとき、電子は**左向き（$-x$）**に走ります。
  フレミングの左手の法則（または外積 $\vec{v} \times \vec{B}$）を適用すると、負電荷が受けるローレンツ力は**「上向き」**になります。
- **正孔キャリア（$q = +e$）**:
  電流が右向きのとき、正孔は**右向き（$+x$）**に走ります。
  正電荷が受けるローレンツ力もまた**「上向き」**になります！

### しかし、溜まった電荷の符号が逆になる！
- 上面に電子が溜まると $\implies$ **上面が「ー極」、下面が「＋極」**になる！（$V_{\text{上面}} < V_{\text{下面}}$）
- 上面に正孔が溜まると $\implies$ **上面が「＋極」、下面が「ー極」**になる！（$V_{\text{上面}} > V_{\text{下面}}$）

::: tip キャリア判定の結論
どちらのキャリアであってもローレンツ力で吹き飛ばされる面（集積面）は同一ですが、**「電位の高い極（プラス極）が上面か下面か」を電圧計で測るだけで、電流の主役が電子（金属・n型）か正孔（p型）かを100%確実に判定できる**のです！
:::

---

## 3. なぜ金属よりも半導体でホール効果が使われるのか？

ホール電圧の式 $V_H = \frac{IB}{nqt}$ より、ホール電圧はキャリア密度 $n$ に反比例します。

- **金属（銅など）**:
  自由電子密度が極めて高い（$n \approx 10^{28}\,\text{m}^{-3}$）ため、ホール電圧はマイクロボルト（$\mu\text{V}$）級の極めて微小な値になり、測定が困難です。
- **半導体（Si, InSb, GaAsなど）**:
  キャリア密度が金属の数千分の一〜数万分の一（$n \approx 10^{21}\sim 10^{24}\,\text{m}^{-3}$）と適度に低いため、**ミリボルト（$\text{mV}$）〜ボルト（$\text{V}$）級の大きなホール電圧**が簡単に得られます！

このため、スマートフォンや自動車の磁気センサー、ブラシレスモーターの回転検出器（ホール素子）には、すべて半導体が使われています。

---

## 4. 大学入試 厳選実践例題

### 例題1: 銅薄膜のホール効果と電子密度の算出（標準・頻出）

::: info 【問題】
厚さ $t = 0.10\,\text{mm}$、幅 $d = 1.0\,\text{cm}$ の薄い長方形の銅板がある。
これに垂直に $B = 1.5\,\text{T}$ の一様な磁場をかけ、$I = 10\,\text{A}$ の電流を流したところ、幅方向の両端の間に $V_H = 1.1\,\mu\text{V}$ のホール電圧が観測された。電気素量を $e = 1.6 \times 10^{-19}\,\text{C}$ とする。
1. 銅板内部の電子のドリフト速度 $v_d\,[\text{m/s}]$ を求めよ。
2. 銅の単位体積あたりの自由電子数（電子密度）$n\,[\text{m}^{-3}]$ を求めよ。
:::

#### 【解法と解説】

**1. ドリフト速度 $v_d$**
ホール電圧とホール電場の関係式 $V_H = E_H d = v_d B d$ より：
$$
v_d = \frac{V_H}{B d} = \frac{1.1 \times 10^{-6}\,\text{V}}{1.5\,\text{T} \times (1.0 \times 10^{-2}\,\text{m})} = \frac{1.1 \times 10^{-6}}{1.5 \times 10^{-2}} \approx 7.3 \times 10^{-5}\,\text{m/s} = 0.073\,\text{mm/s}
$$
（自由電子の移動速度は、カタツムリよりも遥かに遅い毎秒 $0.07\,\text{mm}$ 程度であることが分かります！）

**2. 電子密度 $n$**
ホール電圧の公式 $V_H = \frac{IB}{n e t}$ より、$n$ について解くと：
$$
n = \frac{I B}{e t V_H} = \frac{10 \times 1.5}{(1.6 \times 10^{-19}) \times (1.0 \times 10^{-4}) \times (1.1 \times 10^{-6})}
$$
分母を計算すると：
$$
1.6 \times 1.0 \times 1.1 \times 10^{-29} = 1.76 \times 10^{-29}
$$
したがって、
$$
n = \frac{15}{1.76 \times 10^{-29}} \approx 8.5 \times 10^{28}\,\text{m}^{-3}
$$
これは銅の原子密度（約 $8.5 \times 10^{28}\,\text{m}^{-3}$）と見事に一致し、銅原子1個あたりおよそ1個の自由電子を放出していることが実験的に証明されます！

---

### 例題2: 未知の半導体試料のキャリア判定（難関大・思考力問題）

::: info 【問題】
直方体の未知の半導体試料（縦 $x$、横 $y$、高さ $z$）に、図のように $+x$ 方向に電流 $I$ を流し、$+z$ 方向に磁場 $B$ を印加した。
$y$ 軸方向の2つの側面P（$+y$側）とQ（$-y$側）の電位を測定したところ、側面Pの方が側面Qよりも電位が高かった。
この半導体のキャリアは電子（n型）か、それとも正孔（p型）か。理由とともに答えよ。
:::

#### 【解法と解説】

**【判定ステップ】**
1. 電流は $+x$ 向きに流れている。
2. 磁場は $+z$ 向き（上向き）に印加されている。
3. もしキャリアが**正孔（電荷 $+e$）**の場合：
   - ドリフト速度 $\vec{v}$ は電流と同方向の $+x$ 向き。
   - ローレンツ力 $\vec{f} = q(\vec{v} \times \vec{B})$ の向きを調べると、$(+x) \times (+z) = -y$ 向き。
   - したがって、正孔は側面Q（$-y$側）に偏り、**側面Qが正（高電位）、側面Pが負（低電位）**になるはずである。
4. もしキャリアが**電子（電荷 $-e$）**の場合：
   - ドリフト速度 $\vec{v}$ は電流と逆方向の $-x$ 向き。
   - ローレンツ力は $\vec{f} = (-e)(\vec{v} \times \vec{B})$ より、$(-e)[(-x) \times (+z)] = (-e)(+y) = -y$ 向き。
   - したがって、電子も側面Q（$-y$側）に集積する！
   - 側面Qに負電荷が溜まるため、**側面Qは負（低電位）、相対的に側面Pが高電位**になる！

測定結果は「側面Pの方が電位が高い」ため、集積した側面Qに負電荷が集まったことを意味します。
したがって、この半導体のキャリアは**電子（n型半導体）**であると結論づけられます！
