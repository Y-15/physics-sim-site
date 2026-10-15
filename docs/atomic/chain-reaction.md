---
title: 原子核分裂と連鎖反応（臨界条件と原子炉）
description: ウラン235の熱中性子核分裂、質量欠損と200 MeVの解放、中性子増倍率 k、減速材と制御棒、遅発中性子による制御原理と入試頻出例題を完全網羅。
---

# 原子核分裂と連鎖反応（臨界条件と原子炉）

1938年、ドイツのオットー・ハーンとフリッツ・シュトラウスマンがウランに中性子を照射してバリウムを発見し、亡命中のリーゼ・マイトナーがそれを**「原子核が真っ二つに割れる核分裂（Nuclear Fission）」**であると理論的に解明しました。

この反応では、1回の核分裂で石炭燃焼の数百万倍に達する約 $200\text{ MeV}$ という驚異的なエネルギーが解放されると同時に、新たな中性子が2〜3個放出され、次なる核分裂を引き起こす**連鎖反応（Chain Reaction）**が起こります。本項では、核分裂の反応機構、中性子増倍率 $k$、原子炉の制御原理、および入試頻出の計算問題を完全解説します。

---

## 1. 核分裂連鎖反応のインタラクティブシミュレーター

制御棒の挿入率（中性子吸収）やウラン235の濃縮度を調整し、連鎖反応が収束する「未臨界（$k < 1$）」、一定出力を保つ「臨界（$k = 1$）」、急激に暴走する「臨界超過（$k > 1$）」の挙動をリアルタイムに体験できます。

<ClientOnly>
  <FissionChainSim />
</ClientOnly>

---

## 2. ウラン235の核分裂反応とエネルギー収支

### 2.1 代表的な核分裂反応式
天然ウラン中に約 $0.7\%$ しか含まれない**ウラン235（$^{235}\text{U}$）**は、運動エネルギーの低いゆっくりとした中性子（**熱中性子**）を極めて吸収しやすい性質を持ちます。熱中性子を1個吸収して複合核 $^{236}\text{U}^*$ となった直後、激しい振動によって2つの原子核にちぎれます。

$$^{235}_{92}\text{U} + ^1_0n \longrightarrow ^{141}_{56}\text{Ba} + ^{92}_{36}\text{Kr} + 3\ ^1_0n + Q$$

<div class="vector-graph-card">
  <div class="graph-title">図1：ウラン235の熱中性子吸収による核分裂と中性子の倍増</div>
  <svg viewBox="0 0 540 240" class="vector-svg">
    <rect width="540" height="240" fill="#090d16" rx="8"/>

    <!-- 入射中性子 n -->
    <circle cx="50" cy="120" r="4" fill="#ffffff"/>
    <line x1="50" y1="120" x2="130" y2="120" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="3 3"/>
    <text x="50" y="105" fill="#ffffff" font-size="12" font-weight="bold">熱中性子 n</text>

    <!-- ウラン235 原子核 -->
    <circle cx="150" cy="120" r="22" fill="#10b981" stroke="#34d399" stroke-width="2"/>
    <text x="150" y="125" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">²³⁵U</text>

    <!-- 複合核のくびれ振動 -->
    <path d="M 230 100 Q 250 120 230 140 Q 270 140 290 120 Q 270 100 230 100 Z" 
          fill="rgba(251, 191, 36, 0.4)" stroke="#fbbf24" stroke-width="2"/>
    <text x="260" y="85" fill="#fbbf24" font-size="11" text-anchor="middle">複合核 ²³⁶U* (励起)</text>

    <!-- 分裂後の核 (バリウム Ba) -->
    <circle cx="380" cy="65" r="16" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
    <text x="380" y="70" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">¹⁴¹Ba</text>

    <!-- 分裂後の核 (クリプトン Kr) -->
    <circle cx="380" cy="175" r="14" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
    <text x="380" y="180" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">⁹²Kr</text>

    <!-- 放出される3個の高速中性子 -->
    <g fill="#ffffff">
      <circle cx="450" cy="100" r="3.5"/>
      <circle cx="470" cy="120" r="3.5"/>
      <circle cx="450" cy="140" r="3.5"/>
    </g>
    <text x="460" y="85" fill="#ffffff" font-size="11">高速中性子 (2〜3個)</text>

    <!-- エネルギー放出表記 -->
    <rect x="330" y="105" width="90" height="30" fill="rgba(244, 63, 94, 0.2)" stroke="#f43f5e" rx="4"/>
    <text x="375" y="125" fill="#f43f5e" font-size="12" font-weight="bold" text-anchor="middle">約 200 MeV</text>
  </svg>
</div>

### 2.2 質量欠損と発生エネルギー
反応前の全質量 $M_{\text{before}}$ と、反応後の全質量 $M_{\text{after}}$ を精密に比較すると、反応後の方がわずかに軽くなっています（**質量欠損 $\Delta m$**）。
アインシュタインの特殊相対性理論 $E = \Delta m \cdot c^2$ より、失われた質量が莫大な運動エネルギーや $\gamma$ 線として放出されます。

$$1\text{回の核分裂で放出されるエネルギー } Q \approx \mathbf{200\text{ MeV}} \approx 3.2 \times 10^{-11}\text{ J}$$

ウラン235がわずか $1\text{ g}$ 完全分裂したときの発生エネルギーは：
$$E_{1\text{g}} \approx \left(\frac{1.0\text{ g}}{235\text{ g/mol}} \times 6.02 \times 10^{23}\right) \times (3.2 \times 10^{-11}\text{ J}) \approx \mathbf{8.2 \times 10^{10}\text{ J}}$$
これは**標準的な石炭約 $3\text{ トン}$（あるいはガソリン約 $2000\text{ リットル}$）を燃焼させた熱量に匹敵**します。

---

## 3. 中性子増倍率 $k$ と臨界条件

連鎖反応が継続するかどうかは、ある世代の中性子数 $N_n$ に対する、次の世代で核分裂を引き起こす中性子数 $N_{n+1}$ の比である**実効増倍率（増倍係数）$k$** で決定されます。

$$\mathbf{k = \frac{\text{次の世代の中性子数}}{\text{現在の世代の中性子数}}}$$

<div class="vector-graph-card">
  <div class="graph-title">図2：中性子増倍率 k による連鎖反応の3つの状態</div>
  <svg viewBox="0 0 540 160" class="vector-svg">
    <rect width="540" height="160" fill="#090d16" rx="8"/>

    <!-- 未臨界 -->
    <rect x="30" y="30" width="145" height="100" fill="rgba(56, 189, 248, 0.1)" stroke="#38bdf8" stroke-width="1.5" rx="6"/>
    <text x="102" y="55" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">未臨界 (k &lt; 1)</text>
    <text x="102" y="80" fill="#cbd5e1" font-size="11" text-anchor="middle">中性子数が徐々に減少</text>
    <text x="102" y="105" fill="#94a3b8" font-size="11" text-anchor="middle">反応は自然停止する</text>

    <!-- 臨界 -->
    <rect x="195" y="30" width="150" height="100" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2" rx="6"/>
    <text x="270" y="55" fill="#10b981" font-size="14" font-weight="bold" text-anchor="middle">臨界 (k = 1.000)</text>
    <text x="270" y="80" fill="#f1f5f9" font-size="11" font-weight="bold" text-anchor="middle">中性子数が一定に保持</text>
    <text x="270" y="105" fill="#10b981" font-size="11" text-anchor="middle">原子炉の定常運転状態</text>

    <!-- 臨界超過 -->
    <rect x="365" y="30" width="145" height="100" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" stroke-width="1.5" rx="6"/>
    <text x="437" y="55" fill="#f43f5e" font-size="14" font-weight="bold" text-anchor="middle">臨界超過 (k &gt; 1)</text>
    <text x="437" y="80" fill="#cbd5e1" font-size="11" text-anchor="middle">指数関数的に急増</text>
    <text x="437" y="105" fill="#f43f5e" font-size="11" text-anchor="middle">出力急上昇・核爆発</text>
  </svg>
</div>

1. **未臨界（$k < 1$）**:
   中性子が系外へ漏れたり制御棒に吸収されたりして、核分裂を起こす中性子が減っていき、連鎖反応は停止します。
2. **臨界（$k = 1$）**:
   1回の核分裂で生まれた中性子のうち、ちょうど1個だけが次のウラン235に命中して核分裂を起こします。中性子数および核分裂速度（出力）が時間的に一定に保たれ、**原子力発電所の安全運転状態**となります。
3. **臨界超過（$k > 1$）**:
   中性子数が世代ごとに $k$ 倍（$k^n$）と幾何級数的に急増します。原子炉の出力を上げるときは $k$ をわずかに $1.001$ などに引き上げ、目標出力に達したら $k = 1.000$ に戻します。

---

## 4. 原子炉の3大構成要素と制御の物理

### 4.1 燃料（ウラン燃料）
天然ウランは、核分裂しやすい $^{235}\text{U}$ がわずか $0.7\%$ で、残りの $99.3\%$ は高速中性子を吸収して分裂しにくい $^{238}\text{U}$ です。
軽水炉では、ウラン235の比率を **$3\sim 5\%$ 程度に高めた「低濃縮ウラン」**を二酸化ウラン（$\text{UO}_2$）ペレットにして使用します。

### 4.2 減速材（Moderator）
核分裂の瞬間に飛び出す中性子は、運動エネルギーが約 $2\text{ MeV}$ もある**高速中性子**です。
しかし、ウラン235が中性子を吸収する確率（核分裂断面積）は、中性子のエネルギーが常温の熱運動と同程度（約 $0.025\text{ eV}$）まで落ちた**熱中性子**の方が**約1000倍も高い**という特性があります。
そのため、中性子と質量が近い原子核（陽子を含む軽水 $\text{H}_2\text{O}$、重水 $\text{D}_2\text{O}$、黒鉛 $\text{C}$）と弾性衝突を繰り返させて、**速度を落とす「減速材」**が不可欠です。

### 4.3 制御棒（Control Rods）
中性子を極めて吸収しやすい元素である**ホウ素（$^{10}\text{B}$）**や**カドミウム（$^{113}\text{Cd}$）**で作られた棒です。
炉心に出し入れすることで中性子の吸収量を調整し、増倍率 $k$ を精密に $1.000$ に制御します。緊急時には制御棒を全挿入（**スクラム：SCRAM**）して $k \ll 1$ とし、即座に連鎖反応を停止させます。

### 4.4 遅発中性子の決定的な役割
核分裂の瞬間（$10^{-14}\text{秒}$以内）に放出される中性子を**即発中性子**と呼びます。もし即発中性子だけで連鎖反応が起きていると、中性子の1世代の時間間隔は $10^{-4}\text{秒}$（$0.1\text{ミリ秒}$）程度と極めて短いため、$k$ がわずか $1.001$ になっただけでも瞬時に暴走し、機械や人間による制御が不可能です。

しかし幸いなことに、核分裂片の一部（ヨウ素137など）が$\beta$崩壊した後に数秒〜数十秒遅れて放出される**遅発中性子（全体の約 $0.65\%$）**が存在します。
原子炉はこの遅発中性子を含めて初めて $k = 1$ になるよう設計されているため、**炉の時定数は数十秒オーダーまで引き伸ばされ、人間や自動制御装置が安全に制御できる**のです。

---

## 5. 大学入試厳選例題

### 例題1：ウラン235の核分裂エネルギーと発電出力（標準〜典型）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">国公立大・標準レベル</span>
    <strong>問題：核分裂による質量欠損と燃料消費率</strong>
  </div>
  <p>
    電気出力 $1.0 \times 10^6\text{ kW}$（$100\text{万 kW}$）、熱効率 $33\%$ の原子力発電所がある。
    ウラン235（$^{235}\text{U}$）の1回の核分裂で解放されるエネルギーを $200\text{ MeV}$、アボガドロ定数を $N_A = 6.0 \times 10^{23}\text{ /mol}$、素電荷を $e = 1.6 \times 10^{-19}\text{ C}$ とする。
  </p>
  <ol>
    <li>ウラン235が1回の核分裂を起こすときに失われる質量欠損 $\Delta m$ [$\text{kg}$] を求めよ（光速 $c = 3.0 \times 10^8\text{ m/s}$ とする）。</li>
    <li>この発電所が1秒間に発生させる熱エネルギー $Q_{\text{thermal}}$ [$\text{J}$] を求めよ。</li>
    <li>この発電所で1日（$24\text{時間}$）あたりに核分裂するウラン235の質量 $m_{\text{day}}$ [$\text{kg}$] を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 質量欠損 $\Delta m$**
$1\text{回の核分裂エネルギー}$ $E = 200\text{ MeV} = 200 \times 10^6 \times 1.6 \times 10^{-19}\text{ J} = 3.2 \times 10^{-11}\text{ J}$。
アインシュタインの関係式 $E = \Delta m \cdot c^2$ より：
$$\Delta m = \frac{E}{c^2} = \frac{3.2 \times 10^{-11}}{(3.0 \times 10^8)^2} = \frac{3.2 \times 10^{-11}}{9.0 \times 10^{16}} \approx \mathbf{3.6 \times 10^{-28}\text{ kg}}$$
（※ウラン235の質量の約 $0.09\%$ が純粋なエネルギーに変換されます）

**2. 毎秒の発生熱エネルギー $Q_{\text{thermal}}$**
電気出力 $P_{\text{electric}} = 1.0 \times 10^6\text{ kW} = 1.0 \times 10^9\text{ W} = 1.0 \times 10^9\text{ J/s}$。
熱効率が $\eta = 0.33$ であるため、必要な熱出力は：
$$Q_{\text{thermal}} = \frac{P_{\text{electric}}}{\eta} = \frac{1.0 \times 10^9}{0.33} \approx \mathbf{3.03 \times 10^9\text{ J/s}} \quad (3.0 \times 10^9\text{ J})$$

**3. 1日あたりに核分裂するウラン235の質量 $m_{\text{day}}$**
1日は $24 \times 3600 = 86400\text{ 秒}$ です。
1日に必要な全熱エネルギーは：
$$Q_{\text{day}} = 3.03 \times 10^9 \times 86400 \approx 2.62 \times 10^{14}\text{ J}$$
ウラン235が $1\text{ mol}$（$235\text{ g}$）核分裂したときに生じるエネルギーは：
$$E_{\text{mol}} = 6.0 \times 10^{23} \times (3.2 \times 10^{-11}\text{ J}) = 1.92 \times 10^{13}\text{ J/mol}$$
1日に核分裂するモル数 $n_{\text{day}}$ は：
$$n_{\text{day}} = \frac{Q_{\text{day}}}{E_{\text{mol}}} = \frac{2.62 \times 10^{14}}{1.92 \times 10^{13}} \approx 13.6\text{ mol}$$
したがって、核分裂するウラン235の質量は：
$$m_{\text{day}} = 13.6 \times 235\text{ g} \approx 3196\text{ g} \approx \mathbf{3.2\text{ kg}}$$
（※わずか約 $3.2\text{ kg}$ のウラン235で、巨大都市の大電力を1日中まかなえることが分かります）

---

### 例題2：中性子増倍率と連鎖反応の世代進行（難関大）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">難関国公立大・頻出</span>
    <strong>問題：臨界超過における中性子の指数関数的増殖</strong>
  </div>
  <p>
    ある原子炉において、中性子の1世代の時間間隔（核分裂で放出されてから次の核分裂を起こすまでの平均時間）を $\tau = 1.0 \times 10^{-4}\text{ s}$（$0.1\text{ ms}$）とする。
    時刻 $t = 0$ において中性子の数が $N_0$ であった。
  </p>
  <ol>
    <li>実効増倍率が $k$ で一定のとき、$n$ 世代後（時刻 $t = n\tau$）の中性子数 $N(t)$ を表す式を導け。</li>
    <li>$k = 1.005$ のわずかな臨界超過になったとする。中性子数（および原子炉出力）が最初の $1000$ 倍になるまでの所要時間 $t$ [$\text{s}$] を求めよ（$\ln 10 = 2.30$、近似式 $\ln(1+\epsilon) \approx \epsilon$ を用いよ）。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. $n$ 世代後の中性子数 $N(t)$**
1世代進むごとに中性子数は $k$ 倍になります：
- 第1世代: $N_1 = k N_0$
- 第2世代: $N_2 = k N_1 = k^2 N_0$
- 第$n$世代: $N_n = k^n N_0$
時間 $t = n\tau \implies n = \frac{t}{\tau}$ なので：
$$N(t) = N_0 k^{t / \tau} = \mathbf{N_0 e^{\frac{t}{\tau} \ln k}}$$

**2. 1000倍になるまでの所要時間 $t$**
$\frac{N(t)}{N_0} = 1000 = 10^3$ となる時間 $t$ を求めます。
両辺の自然対数をとると：
$$\frac{t}{\tau} \ln k = \ln(10^3) = 3 \ln 10$$
$$t = \frac{3 \tau \ln 10}{\ln k}$$
ここで $k = 1.005 = 1 + 0.005$ なので、近似式より $\ln k \approx 0.005$ です。
与えられた数値を代入すると：
$$t = \frac{3 \times (1.0 \times 10^{-4}) \times 2.30}{0.005} = \frac{6.90 \times 10^{-4}}{5.0 \times 10^{-3}} = \mathbf{0.138\text{ s}} \quad (約 0.14\text{ 秒})$$

> 💡 **考察：遅発中性子のありがたみ**
> もし即発中性子だけだと、$k$ がたった $0.5\%$ 増えただけで、わずか $0.14\text{秒}$ で出力が1000倍に達して物理的な制御が不可能な大暴走に至ります。遅発中性子があることで、実効的な $\tau$ が数秒から数十秒へと引き伸ばされ、安全な出力制御が可能となっています。

---

## 6. まとめ

| 構成・指標 | 役割・定義 | 物理的ポイント |
| :--- | :--- | :--- |
| **核分裂** | $^{235}\text{U} + n \to \text{核分裂片} + (2\sim 3)n + Q$ | 1回あたり約 $200\text{ MeV}$ 放出 |
| **増倍率 $k$** | $k = N_{n+1} / N_n$ | **$k=1$（臨界）で一定出力を維持** |
| **減速材** | 高速中性子を熱中性子に減速（水・黒鉛） | ウラン235の吸収確率を1000倍に高める |
| **制御棒** | 余分な中性子を吸収（ホウ素・カドミウム） | $k=1$ に維持、緊急時全挿入で停止 |
| **遅発中性子** | 分裂片から数秒〜数十秒遅れて放出 | 制御の応答時間を稼ぎ暴走を防ぐ |
