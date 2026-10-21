---
title: 放射平衡と壊変系列（過渡平衡・永続平衡）
description: 放射性同位元素の連続壊変、放射能（ベクレル）の定義、永続平衡と過渡平衡の数理的導出、娘核種が極大となる時刻と入試例題を完全網羅。
---

# 放射平衡と壊変系列（過渡平衡・永続平衡）

ウランやトリウムなどの天然放射性同位元素は、1回の崩壊で安定になるのではなく、$\alpha$崩壊や$\beta$崩壊を何段階も繰り返しながら異なる元素へと移り変わる**壊変系列（Decay Chain）**を形成します。

この連続壊変の過程において、親核種と娘核種の生成と崩壊のバランスが取れた状態を**放射平衡（Radioactive Equilibrium）**と呼びます。本項では、放射能の定義、壊変の微分方程式、「**永続平衡**」と「**過渡平衡**」の数理的導出、および大学入試で頻出する原子数比・極大時刻の解法を徹底的に解き明かします。

---

## 1. 放射平衡のインタラクティブシミュレーター

親核種 $A$（半減期 $T_A$）と娘核種 $B$（半減期 $T_B$）の半減期をスライダーで変更し、原子数 $N(t)$ の時間推移や放射能（$\text{Bq}$）の平衡化の様子をグラフで動的に観察できます。

<ClientOnly>
  <DecayEquilibriumSim />
</ClientOnly>

---

## 2. 壊変の基本方程式と放射能

### 2.1 崩壊の法則と放射能（ベクレル）
ある放射性核種が $N$ 個存在するとき、微小時間 $\Delta t$ の間に崩壊する原子数 $\Delta N$ は、$N$ に比例します。比例定数を<strong>崩壊定数 $\lambda$</strong> とすると：

$$\frac{dN}{dt} = -\lambda N$$

これを初期条件 $t = 0$ で $N(0) = N_0$ として解くと、原子数は指数関数的に減衰します：

$$N(t) = N_0 e^{-\lambda t}$$

原子数が半分（$\frac{1}{2}N_0$）になる時間（<strong>半減期 $T$</strong>）との関係は：
$$\frac{1}{2} = e^{-\lambda T} \implies \mathbf{T = \frac{\ln 2}{\lambda} \approx \frac{0.693}{\lambda}}$$

単位時間（1秒間）あたりに崩壊する原子の個数を<strong>放射能（Activity）$A(t)$</strong> と呼び、単位は<strong>ベクレル $[\text{Bq}]$</strong>（$1\text{ Bq} = 1\text{ 回/秒}$ の崩壊）で表されます：

$$A(t) = \left| \frac{dN}{dt} \right| = \mathbf{\lambda N(t)}$$

---

## 3. 連続壊変の数理モデル（$A \to B \to C$）

親核種 $A$ が崩壊定数 $\lambda_A$ で崩壊して娘核種 $B$ になり、$B$ が崩壊定数 $\lambda_B$ で崩壊して安定核種 $C$ になる系列を考えます。

$$A \xrightarrow{\lambda_A} B \xrightarrow{\lambda_B} C\ (\text{安定})$$

<div class="vector-graph-card">
  <div class="graph-title">図1：2段階連続壊変における原子数と放射能の流れ</div>
  <svg viewBox="0 0 540 180" class="vector-svg">
    <rect width="540" height="180" fill="#090d16" rx="8"/>
    <!-- 核種 A -->
    <rect x="50" y="50" width="100" height="70" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2" rx="8"/>
    <text x="100" y="80" fill="#38bdf8" font-size="16" font-weight="bold" text-anchor="middle">親核種 A</text>
    <text x="100" y="105" fill="#94a3b8" font-size="12" text-anchor="middle">N_A(t), λ_A</text>
    <!-- 矢印 A -> B -->
    <line x1="150" y1="85" x2="210" y2="85" stroke="#38bdf8" stroke-width="2.5"/>
    <polygon points="215,85 205,80 205,90" fill="#38bdf8"/>
    <text x="182" y="75" fill="#38bdf8" font-size="11" text-anchor="middle">λ_A N_A</text>
    <!-- 核種 B -->
    <rect x="220" y="50" width="100" height="70" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="2" rx="8"/>
    <text x="270" y="80" fill="#fbbf24" font-size="16" font-weight="bold" text-anchor="middle">娘核種 B</text>
    <text x="270" y="105" fill="#94a3b8" font-size="12" text-anchor="middle">N_B(t), λ_B</text>
    <!-- 矢印 B -> C -->
    <line x1="320" y1="85" x2="380" y2="85" stroke="#fbbf24" stroke-width="2.5"/>
    <polygon points="385,85 375,80 375,90" fill="#fbbf24"/>
    <text x="352" y="75" fill="#fbbf24" font-size="11" text-anchor="middle">λ_B N_B</text>
    <!-- 核種 C -->
    <rect x="390" y="50" width="100" height="70" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" stroke-width="2" rx="8"/>
    <text x="440" y="80" fill="#10b981" font-size="16" font-weight="bold" text-anchor="middle">孫核種 C</text>
    <text x="440" y="105" fill="#10b981" font-size="12" text-anchor="middle">(安定核種)</text>
    <!-- 微分方程式まとめ -->
    <text x="270" y="155" fill="#94a3b8" font-size="12" text-anchor="middle">dN_B / dt = (Aからの生成速度) - (B自身の崩壊速度) = λ_A N_A - λ_B N_B</text>
  </svg>
</div>

### 3.1 微分方程式の立式
- **親核種 $A$**:
  $$\frac{dN_A}{dt} = -\lambda_A N_A \implies N_A(t) = N_0 e^{-\lambda_A t}$$
- **娘核種 $B$**:
  $A$ の崩壊によって毎秒 $\lambda_A N_A$ 個生成され、自身の崩壊によって毎秒 $\lambda_B N_B$ 個減少します。
  $$\frac{dN_B}{dt} = \lambda_A N_A - \lambda_B N_B = \lambda_A N_0 e^{-\lambda_A t} - \lambda_B N_B$$

### 3.2 娘核種 $N_B(t)$ の一般解
初期状態 $t = 0$ で $N_B(0) = 0$ とすると、この1階線形微分方程式の解は次のようになります（バトラー・ラザフォードの解）：

$$N_B(t) = \frac{\lambda_A N_0}{\lambda_B - \lambda_A} \left( e^{-\lambda_A t} - e^{-\lambda_B t} \right)$$

### 3.3 娘核種が極大となる時刻 $t_{\max}$
娘核種 $B$ の原子数 $N_B(t)$ が最大になる時刻は、$\frac{dN_B}{dt} = 0$ となる瞬間です。
$$\frac{dN_B}{dt} = 0 \implies \lambda_A N_A = \lambda_B N_B$$
すなわち、「**娘核種の原子数が最大になる瞬間、親と娘の放射能（毎秒の崩壊数）が完全に一致する**」という極めて美しい物理的直感が成り立ちます。

微分して $0$ と置くことで：
$$-\lambda_A e^{-\lambda_A t_{\max}} + \lambda_B e^{-\lambda_B t_{\max}} = 0 \implies e^{(\lambda_B - \lambda_A) t_{\max}} = \frac{\lambda_B}{\lambda_A}$$

$$\mathbf{t_{\max} = \frac{\ln(\lambda_B / \lambda_A)}{\lambda_B - \lambda_A} = \frac{\ln(T_A / T_B)}{\frac{\ln 2}{T_B} - \frac{\ln 2}{T_A}}}$$

---

## 4. 2大放射平衡の比較：永続平衡 vs 過渡平衡

<div class="vector-graph-card">
  <div class="graph-title">図2：永続平衡と過渡平衡の放射能減衰特性の比較</div>
  <svg viewBox="0 0 540 240" class="vector-svg">
    <rect width="540" height="240" fill="#090d16" rx="8"/>
    <!-- 左グラフ：永続平衡 -->
    <text x="140" y="30" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">【永続平衡】(T_A ≫ T_B)</text>
    <line x1="40" y1="190" x2="240" y2="190" stroke="#475569" stroke-width="1.5"/>
    <line x1="40" y1="190" x2="40" y2="50" stroke="#475569" stroke-width="1.5"/>
    <!-- 親核種 A の放射能 (ほぼ一定水平線) -->
    <line x1="40" y1="80" x2="230" y2="82" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="180" y="70" fill="#38bdf8" font-size="11">λ_A N_A (ほぼ一定)</text>
    <!-- 娘核種 B の放射能 (急上昇して親と一致) -->
    <path d="M 40 190 Q 70 82 120 82 L 230 82" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
    <text x="120" y="105" fill="#fbbf24" font-size="11">λ_B N_B → λ_A N_A</text>
    <!-- 右グラフ：過渡平衡 -->
    <text x="390" y="30" fill="#10b981" font-size="13" font-weight="bold" text-anchor="middle">【過渡平衡】(T_A > T_B)</text>
    <line x1="290" y1="190" x2="490" y2="190" stroke="#475569" stroke-width="1.5"/>
    <line x1="290" y1="190" x2="290" y2="50" stroke="#475569" stroke-width="1.5"/>
    <!-- 親核種 A の減衰曲線 -->
    <path d="M 290 80 Q 370 110 480 150" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <text x="440" y="135" fill="#38bdf8" font-size="11">λ_A N_A</text>
    <!-- 娘核種 B の曲線 (ピーク後、親より少し上で並走減衰) -->
    <path d="M 290 190 Q 315 55 350 75 Q 410 100 480 140" fill="none" stroke="#fbbf24" stroke-width="2.5"/>
    <text x="350" y="55" fill="#fbbf24" font-size="11">t_max (極大)</text>
  </svg>
</div>

### 4.1 永続平衡（Secular Equilibrium）
親核種の半減期が娘核種に比べて**圧倒的に長い**場合（$T_A \gg T_B \iff \lambda_A \ll \lambda_B$）に生じます。
- 例：ウラン238（$T_A = 45\text{億年}$） $\to$ ラジウム226（$T_B = 1600\text{年}$）

十分な時間（$t \gg T_B$）が経過すると、親核種の減少は無視できるため $e^{-\lambda_A t} \approx 1$、また娘核種の減衰過渡項 $e^{-\lambda_B t} \to 0$ と近似できます。
$$N_B \approx \frac{\lambda_A}{\lambda_B} N_0 = \frac{\lambda_A}{\lambda_B} N_A$$

両辺に $\lambda_B$ をかけると：
$$\mathbf{\lambda_A N_A = \lambda_B N_B}$$

崩壊定数と半減期の関係 $\lambda = \frac{\ln 2}{T}$ を代入すると：
$$\mathbf{\frac{N_A}{T_A} = \frac{N_B}{T_B} \iff \frac{N_A}{N_B} = \frac{T_A}{T_B}}$$

> 💡 **入試最重要法則**：
> 永続平衡に達した鉱石中では、「**各核種の原子数の比は、それぞれの半減期の比に完全に正比例する**」。半減期が長い核種ほど大量に残存し、半減期が短い核種ほどわずかしか存在しません。

### 4.2 過渡平衡（Transient Equilibrium）
親核種の半減期が娘核種より長いものの、同程度のオーダーである場合（$T_A > T_B$）に生じます。
- 例：モリブデン99（$T_A = 66\text{時間}$） $\to$ テクネチウム99m（$T_B = 6.0\text{時間}$）

$t \gg T_B$ において $e^{-\lambda_B t} \ll e^{-\lambda_A t}$ となるため、娘核種は：
$$N_B(t) \approx \frac{\lambda_A}{\lambda_B - \lambda_A} N_A(t)$$

両辺の放射能比は一定となり、娘核種は<strong>自身の半減期 $T_B$ ではなく、親核種の半減期 $T_A$ に引っ張られて一緒に減衰</strong>していきます。

---

## 5. 大学入試厳選例題

### 例題1：ウラン鉱石中の永続平衡と年代測定（標準〜典型）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">国公立大・頻出</span>
    <strong>問題：ウランとラジウムの存在比と半減期の導出</strong>
  </div>
  <p>
    ウラン鉱石中に含まれるウラン238（$^{238}\text{U}$）とラジウム226（$^{226}\text{Ra}$）は永続平衡に達している。ウラン238の半減期は $T_{\text{U}} = 4.5 \times 10^9\text{ 年}$、ラジウム226の半減期は $T_{\text{Ra}} = 1.6 \times 10^3\text{ 年}$ とする。
  </p>
  <ol>
    <li>鉱石中におけるウラン238の原子数 $N_{\text{U}}$ とラジウム226の原子数 $N_{\text{Ra}}$ の比 $\frac{N_{\text{Ra}}}{N_{\text{U}}}$ を求めよ。</li>
    <li>ウラン238が $1.0\text{ kg}$ 含まれる鉱石中に存在するラジウム226の質量 $m_{\text{Ra}}$ [$\text{g}$] を求めよ（質量数はそれぞれの原子量に等しいとする）。</li>
    <li>この鉱石中のウラン238とラジウム226の放射能（単位時間あたりの壊変数）の比を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 原子数比 $\frac{N_{\text{Ra}}}{N_{\text{U}}}$**
ウラン238の半減期は $45\text{億年}$ であり、ラジウム226の $1600\text{年}$ に比べて圧倒的に長いため、永続平衡が成立しています。
永続平衡の条件式 $\frac{N_{\text{Ra}}}{T_{\text{Ra}}} = \frac{N_{\text{U}}}{T_{\text{U}}}$ より：
$$\frac{N_{\text{Ra}}}{N_{\text{U}}} = \frac{T_{\text{Ra}}}{T_{\text{U}}} = \frac{1.6 \times 10^3}{4.5 \times 10^9} = \mathbf{3.6 \times 10^{-7}}$$

**2. ラジウム226の質量 $m_{\text{Ra}}$**
ウラン238の質量 $m_{\text{U}} = 1000\text{ g}$。
ウラン238のモル数は $n_{\text{U}} = \frac{1000}{238}\text{ mol}$。
原子数比が $3.56 \times 10^{-7}$ であるため、ラジウム226のモル数 $n_{\text{Ra}}$ は：
$$n_{\text{Ra}} = n_{\text{U}} \times \frac{N_{\text{Ra}}}{N_{\text{U}}} = \frac{1000}{238} \times \frac{1.6 \times 10^3}{4.5 \times 10^9} \approx 1.49 \times 10^{-6}\text{ mol}$$
ラジウム226のモル質量は $226\text{ g/mol}$ であるため、質量 $m_{\text{Ra}}$ は：
$$m_{\text{Ra}} = 1.49 \times 10^{-6} \times 226 \approx 3.37 \times 10^{-4}\text{ g} = \mathbf{0.34\text{ mg}}$$
（※キュリー夫人が数トンのピッチブレンド（ウラン鉱石）からごく微量のラジウムを苦労して抽出した歴史的背景と一致します）

**3. 放射能の比**
永続平衡の定義より、両者の放射能（毎秒の崩壊数 $\lambda N$）は完全に等しくなります。
$$\frac{\text{Raの放射能}}{\text{Uの放射能}} = \frac{\lambda_{\text{Ra}} N_{\text{Ra}}}{\lambda_{\text{U}} N_{\text{U}}} = \mathbf{1.0}$$

---

### 例題2：医療用放射性同位元素の生成と極大時刻（難関大）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">難関国公立大・発展</span>
    <strong>問題：過渡平衡と娘核種極大時刻の導出</strong>
  </div>
  <p>
    親核種 $A$（半減期 $T_A = 60\text{ 時間}$）が崩壊して娘核種 $B$（半減期 $T_B = 6.0\text{ 時間}$）になり、$B$ は崩壊して安定核種 $C$ になる。
    時刻 $t = 0$ において親核種 $A$ のみが $N_0$ 個存在し、娘核種 $B$ は存在しなかった（$N_B(0) = 0$）。
  </p>
  <ol>
    <li>娘核種 $B$ の原子数 $N_B(t)$ が最大となる時刻 $t_{\max}$ [$\text{時間}$] を求めよ（$\ln 10 = 2.30$、$\ln 2 = 0.693$ とする）。</li>
    <li>$t = t_{\max}$ における娘核種 $B$ と親核種 $A$ の原子数比 $\frac{N_B(t_{\max})}{N_A(t_{\max})}$ を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 極大時刻 $t_{\max}$**
崩壊定数 $\lambda_A, \lambda_B$ は：
$$\lambda_A = \frac{\ln 2}{T_A} = \frac{\ln 2}{60}, \quad \lambda_B = \frac{\ln 2}{T_B} = \frac{\ln 2}{6.0}$$
極大時刻の公式 $t_{\max} = \frac{\ln(\lambda_B / \lambda_A)}{\lambda_B - \lambda_A}$ に代入します。
$$\frac{\lambda_B}{\lambda_A} = \frac{T_A}{T_B} = \frac{60}{6.0} = 10$$
$$\lambda_B - \lambda_A = \ln 2 \left( \frac{1}{6.0} - \frac{1}{60} \right) = \ln 2 \left( \frac{9}{60} \right) = \frac{3 \ln 2}{20}$$
したがって：
$$t_{\max} = \frac{\ln 10}{\frac{3 \ln 2}{20}} = \frac{20 \ln 10}{3 \ln 2} = \frac{20 \times 2.30}{3 \times 0.693} = \frac{46.0}{2.079} \approx \mathbf{22.1\text{ 時間}}$$

**2. $t = t_{\max}$ における原子数比**
極大の瞬間は $\frac{dN_B}{dt} = 0$ なので、生成速度と崩壊速度が一致します：
$$\lambda_A N_A(t_{\max}) = \lambda_B N_B(t_{\max})$$
ここから直ちに原子数比が求まります：
$$\frac{N_B(t_{\max})}{N_A(t_{\max})} = \frac{\lambda_A}{\lambda_B} = \frac{T_B}{T_A} = \frac{6.0}{60} = \mathbf{0.10} \quad \left(\frac{1}{10}\right)$$

---

## 6. まとめ

| 平衡の種類 | 条件 | 成立する関係式 | 物理的特徴 |
| :--- | :--- | :--- | :--- |
| **永続平衡** | $T_A \gg T_B$ | $\lambda_A N_A = \lambda_B N_B \iff \frac{N_A}{T_A} = \frac{N_B}{T_B}$ | 放射能が完全に等しく、原子数は半減期に比例 |
| **過渡平衡** | $T_A > T_B$ | $N_B(t) \approx \frac{\lambda_A}{\lambda_B - \lambda_A} N_A(t)$ | 極大を経た後、娘核種が親の半減期で一緒に減衰 |
| **極大条件** | $\frac{dN_B}{dt} = 0$ | $\lambda_A N_A = \lambda_B N_B$ | **生成速度と崩壊速度の一致** |
