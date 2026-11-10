---
title: サイクロトロン（粒子加速器）とローレンツ力
description: 一様な磁場による等速円運動の「等時性」と高周波交流電場を融合したサイクロトロンの動作原理、最大運動エネルギーの導出、入試頻出例題を完全解説。
---

# サイクロトロン（粒子加速器）とローレンツ力

**サイクロトロン（Cyclotron）** は、1930年代にアメリカの物理学者アーネスト・ローレンスによって発明された円形粒子加速器です。ノーベル物理学賞を受賞したこの画期的な装置は、「**磁場中での荷電粒子の回転周期が速度によらない（等時性）**」という極めて美しい物理的性質を利用しています。

本項では、サイクロトロンの内部構造、静電遮蔽、等時性の原理、最大運動エネルギーの導出、および大学入試における定型問題の解法を徹底解説します。

---

## 1. サイクロトロンのインタラクティブシミュレーター

磁束密度 $B$ や加速電圧 $V$、ディー半径 $R$ を変更して、荷電粒子（陽子・$\alpha$粒子）がギャップを通過するたびに加速され、スパイラル状に軌道を広げながら高エネルギービームとして取り出される様子を観察できます。

<ClientOnly>
  <CyclotronSim />
</ClientOnly>

---

## 2. サイクロトロンの構造と基本原理

サイクロトロンは、アルファベットの「D」の形をした2つの中空半円形金属容器（**ディー：$D_1, D_2$**）を、わずかな隙間（**ギャップ**）を空けて対向配置した構造をしています。

<div class="vector-graph-card">
  <div class="graph-title">図1：サイクロトロンの全体構造と粒子のスパイラル加速軌道</div>
  <svg viewBox="0 0 640 365" class="vector-svg" aria-label="サイクロトロンのD1・D2電極、ギャップ、高周波電源、スパイラル軌道、取り出しビームの構造図">
    <defs>
      <pattern id="cyc-grid-bg" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
      <marker id="cyc-arr-path" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
      <marker id="cyc-arr-beam" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#22c55e" />
      </marker>
      <marker id="cyc-arr-lead" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 2 L 10 5 L 0 8 z" fill="#94a3b8" />
      </marker>
    </defs>
    <!-- 背景 -->
    <rect width="640" height="365" fill="#090d16" rx="8"/>
    <rect width="640" height="365" fill="url(#cyc-grid-bg)" rx="8"/>
    <!-- 一様磁場 B (紙面手前向き ⊙) 外周マーク -->
    <g fill="none" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1.2">
      <circle cx="55" cy="70" r="6"/><circle cx="55" cy="70" r="2" fill="#38bdf8" stroke="none"/>
      <circle cx="115" cy="70" r="6"/><circle cx="115" cy="70" r="2" fill="#38bdf8" stroke="none"/>
      <circle cx="55" cy="285" r="6"/><circle cx="55" cy="285" r="2" fill="#38bdf8" stroke="none"/>
      <circle cx="120" cy="285" r="6"/><circle cx="120" cy="285" r="2" fill="#38bdf8" stroke="none"/>
      <circle cx="545" cy="70" r="6"/><circle cx="545" cy="70" r="2" fill="#38bdf8" stroke="none"/>
      <circle cx="585" cy="285" r="6"/><circle cx="585" cy="285" r="2" fill="#38bdf8" stroke="none"/>
    </g>
    <text x="24" y="32" fill="#38bdf8" font-size="13" font-weight="700">一様な磁場 B（紙面手前向き ⊙）</text>
    <!-- ギャップ領域の背景（加速領域：電場 E の発生区間 x=289..311, y=55..285） -->
    <rect x="289" y="55" width="22" height="230" fill="rgba(251, 191, 36, 0.10)" />
    <text x="300" y="28" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">加速ギャップ（高周波電場 E）</text>
    <line x1="300" y1="34" x2="300" y2="53" stroke="#fbbf24" stroke-width="1.4" stroke-dasharray="3,2" />
    <!-- 左ディー D1（中心 (289, 170), 半径 R=115） -->
    <path d="M 289 55 A 115 115 0 0 0 289 285 Z"
          fill="rgba(30, 41, 59, 0.65)" stroke="#38bdf8" stroke-width="2.5" />
    <!-- 右ディー D2（中心 (311, 170), 半径 R=115, 取り出し口スリット -32°〜-13° を開ける） -->
    <path d="M 311 55 A 115 115 0 0 1 311 285 Z"
          fill="rgba(30, 41, 59, 0.65)" stroke="none" />
    <path d="M 311 55 A 115 115 0 0 1 408.5 109.1"
          fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 423.1 144.1 A 115 115 0 0 1 311 285 L 311 55"
          fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" />
    <!-- 左右ディーの説明コールアウト -->
    <text x="155" y="138" fill="#38bdf8" font-size="18" font-weight="700" text-anchor="end">D₁</text>
    <text x="155" y="158" fill="#cbd5e1" font-size="12" text-anchor="end">内部電場 E = 0</text>
    <text x="155" y="175" fill="#94a3b8" font-size="11" text-anchor="end">（静電遮蔽・等速円運動）</text>
    <line x1="162" y1="150" x2="188" y2="150" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="3,2" marker-end="url(#cyc-arr-lead)" />
    <text x="458" y="218" fill="#38bdf8" font-size="18" font-weight="700">D₂</text>
    <text x="458" y="238" fill="#cbd5e1" font-size="12">内部電場 E = 0</text>
    <text x="458" y="255" fill="#94a3b8" font-size="11">（静電遮蔽・等速円運動）</text>
    <line x1="452" y1="226" x2="416" y2="218" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="3,2" marker-end="url(#cyc-arr-lead)" />
    <!-- 偏向板（デフレクター電極）：ビーム取り出し口外側を沿う電極板 -->
    <path d="M 378 86 Q 402 100 422 114" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />
    <text x="432" y="88" fill="#fbbf24" font-size="12" font-weight="700">偏向板（デフレクター）</text>
    <line x1="430" y1="90" x2="410" y2="103" stroke="#fbbf24" stroke-width="1.2" stroke-dasharray="2,2" />
    <!-- 高周波交流電源の配線（D1, D2の下端から下方中央の電源へ接続） -->
    <polyline points="289,285 289,332 284,332" fill="none" stroke="#94a3b8" stroke-width="1.8" />
    <polyline points="311,285 311,332 316,332" fill="none" stroke="#94a3b8" stroke-width="1.8" />
    <circle cx="300" cy="332" r="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <path d="M 291 332 Q 295.5 324 300 332 T 309 332" fill="none" stroke="#38bdf8" stroke-width="2" />
    <text x="326" y="330" fill="#e2e8f0" font-size="12" font-weight="700">高周波交流電源</text>
    <text x="326" y="346" fill="#94a3b8" font-size="11">（半周期 T/2 ごとに極性が反転）</text>
    <!-- 粒子のスパイラル加速軌道（B=⊙ に対して +q は時計回り・同心半円の連結） -->
    <path d="M 300 165
             L 311 165
             A 11 11 0 0 1 311 187 L 289 187
             A 22 22 0 0 1 289 143 L 311 143
             A 33 33 0 0 1 311 209 L 289 209
             A 44 44 0 0 1 289 121 L 311 121
             A 55 55 0 0 1 311 231 L 289 231
             A 66 66 0 0 1 289 99 L 311 99
             A 77 77 0 0 1 311 253 L 289 253
             A 88 88 0 0 1 289 77 L 311 77
             A 99 99 0 0 1 372.0 98.0
             C 387.7 110.3, 401.1 118.4, 419.5 126.2"
          fill="none" stroke="#f43f5e" stroke-width="2.2" stroke-linecap="round" />
    <!-- 軌道進行方向の小矢印（時計回りを明示） -->
    <line x1="201" y1="170" x2="201" y2="160" stroke="#f43f5e" stroke-width="2" marker-end="url(#cyc-arr-path)" />
    <line x1="388" y1="172" x2="388" y2="182" stroke="#f43f5e" stroke-width="2" marker-end="url(#cyc-arr-path)" />
    <line x1="292" y1="77" x2="306" y2="77" stroke="#fbbf24" stroke-width="2.4" marker-end="url(#cyc-arr-path)" />
    <!-- 取り出しビーム（スリットから接線方向へ直進放出） -->
    <line x1="419.5" y1="126.2" x2="532" y2="174" stroke="#22c55e" stroke-width="3.5" marker-end="url(#cyc-arr-beam)" />
    <text x="488" y="140" fill="#4ade80" font-size="13" font-weight="700">取り出しビーム</text>
    <text x="492" y="192" fill="#86efac" font-size="11">最大運動エネルギー</text>
    <!-- 中心イオン源 S (+q) -->
    <circle cx="300" cy="165" r="5" fill="#fbbf24" stroke="#ffffff" stroke-width="1.5" />
    <text x="155" y="294" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="end">S（●）：中心イオン源（+q）</text>
  </svg>
</div>

### 2つの領域の明確な役割分担
1. **D字電極（ディー）の内部（磁場のみ・偏向領域）**:
   ディーは金属で囲まれているため、外部からの電場は **静電遮蔽** によって遮断され、内部の電場は完全にゼロ（$E = 0$）です。
   したがって、粒子は磁場による **ローレンツ力（偏向力）のみ** を受け、仕事はされず（速度の大きさは不変）、半円周の **等速円運動** を行います。
2. **電極間の隙間（ギャップ・電場のみ・加速領域）**:
   隙間には高周波の交流電圧 $V$ が印加されており、粒子がここを横切る瞬間に電場による静電気力 $F = qE$ を受けて **加速** され、運動エネルギーが増加します。

---

## 3. 数式導出と「等時性」の証明

### 3.1 電極内での等速円運動
質量 $m$、電荷 $q$（$q > 0$）の荷電粒子が、磁束密度 $B$ の一様な磁場に垂直に速さ $v$ で入射したとき、進行方向と垂直に大きさ $f = qvB$ のローレンツ力を受けます。
円運動の半径を $r$ とすると、運動方程式は：

$$m \frac{v^2}{r} = qvB$$

ここから、軌道半径 $r$ は：

$$r = \frac{mv}{qB}$$

半径 $r$ は粒子の速さ $v$ に正比例して大きくなります。

### 3.2 回転周期の等時性（最重要）
粒子がディー内を半周（あるいは1周）するのに要する時間（周期 $T$）を求めます。
1周の長さは $2\pi r$ であるため、周期 $T$ は：

$$T = \frac{2\pi r}{v} = \frac{2\pi}{v} \left(\frac{mv}{qB}\right) = \mathbf{\frac{2\pi m}{qB}}$$

> 💡 **驚くべき結論：周期 $T$ は粒子の速さ $v$ や半径 $r$ にまったく依存しない！**  
> 粒子が加速されて速さ $v$ が2倍、3倍になっても、それに完全に比例して回る円周の長さも2倍、3倍になるため、**1周（および半周）する時間は常に完全に一定** です。これを **サイクロトロン周期の等時性** と呼びます。

### 3.3 交流電源の周波数（サイクロトロン周波数）
粒子は半周する時間 $\frac{T}{2}$ ごとに隙間（ギャップ）に到達します。
そのたびに常に加速されるためには、電場の向きが時間 $\frac{T}{2}$ ごとに反転しなければなりません。
すなわち、交流電源の周期 $T_{ac}$ は粒子の回転周期 $T$ と完全に一致していなければなりません。

$$f_{ac} = \frac{1}{T} = \mathbf{\frac{qB}{2\pi m}}$$

この周波数 $f_{ac}$ を **サイクロトロン周波数（サイクロトロン共鳴周波数）** と呼びます。

---

## 4. 到達する最大エネルギー

### 4.1 最大速度 $v_{\max}$
粒子は加速されるたびに半径 $r$ が広がり、最終的にディーの最大外半径 $R$ に達したところで、偏向板等によって外部に取り出されます。
外半径 $R$ での粒子の速さ $v_{\max}$ は：

$$R = \frac{m v_{\max}}{qB} \implies v_{\max} = \frac{qBR}{m}$$

### 4.2 最大運動エネルギー $E_{\max}$
このときの最大運動エネルギー $E_{\max}$ は：

$$E_{\max} = \frac{1}{2} m v_{\max}^2 = \frac{1}{2} m \left(\frac{qBR}{m}\right)^2 = \mathbf{\frac{q^2 B^2 R^2}{2m}}$$

### 考察：電圧 $V$ に依存しない！
最大運動エネルギーの式の中に、加速電圧 $V$ が含まれていないことに注目してください。
- 粒子の最終エネルギーは、 **磁場 $B$ の強さ** と **装置の大きさ（ディー半径 $R$）** だけで決定されます。
- 加速電圧 $V$ が小さくても、周回数を増やせば同じ最大エネルギーに到達できます（$V$ は周回数と加速所要時間にのみ影響します）。

### 4.3 必要な周回数 $N$
電極間のギャップを1回通過するごとに、電場からされる仕事は $W = qV$ です。
1周する間にギャップを2回横切るため、1周あたりのエネルギー増加量は $\Delta E = 2qV$ となります。
初速度を $0$ とみなすと、最大エネルギー $E_{\max}$ に達するまでに必要な周回数 $N$ は：

$$2qV \times N = E_{\max} \implies N = \frac{E_{\max}}{2qV} = \mathbf{\frac{q B^2 R^2}{4m V}}$$

---

## 5. 相対論的限界とシンクロトロン

サイクロトロンは陽子を数十 $\text{MeV}$ 程度まで加速できますが、これ以上の高エネルギーになると限界に直面します。
アインシュタインの特殊相対性理論によると、粒子の速さ $v$ が光速 $c$ に近づくと、物体の相対論的質量 $m$ は次のように増加します。

$$m = \frac{m_0}{\sqrt{1 - \frac{v^2}{c^2}}}$$

質量 $m$ が増加すると、回転周期 $T = \frac{2\pi m}{qB}$ が長くなってしまい、 **一定周波数の交流電場との同期が外れて（位相がずれて）加速できなくなります**。
この問題を解決するために、粒子のエネルギー増加に合わせて磁場 $B(t)$ や高周波の周波数 $f(t)$ を精密に変化させる **シンクロトロン（Synchrotron）** が開発されました。

---

## 6. 大学入試厳選例題

### 例題1：サイクロトロンによる陽子の加速（典型標準）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">国公立大・標準レベル</span>
    <strong>問題：陽子の加速と所要時間の計算</strong>
  </div>
  <p>
    ディーの半径 $R = 0.50\text{ m}$、磁束密度 $B = 1.6\text{ T}$ のサイクロトロンを用いて、陽子（質量 $m = 1.6 \times 10^{-27}\text{ kg}$、電荷 $q = 1.6 \times 10^{-19}\text{ C}$）を中心付近から加速する。電極間の加速電圧を $V = 4.0 \times 10^4\text{ V}$（$40\text{ kV}$）とし、電極間の隙間の通過時間は無視できるものとする。
  </p>
  <ol>
    <li>交流電源の周波数 $f$ [$\text{Hz}$] を求めよ。</li>
    <li>取り出される陽子の最大運動エネルギー $E_{\max}$ を、$[\text{J}]$ および $[\text{MeV}]$ の単位で求めよ（$1\text{ eV} = 1.6 \times 10^{-19}\text{ J}$）。</li>
    <li>陽子が最大エネルギーに達するまでの電極間隙間の通過回数 $n$ および必要な周回数 $N$ を求めよ。</li>
    <li>中心から加速を開始して取り出されるまでの全所要時間 $t$ [$\text{s}$] を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 交流電源の周波数 $f$**
サイクロトロン周波数の公式より：
$$f = \frac{qB}{2\pi m} = \frac{1.6 \times 10^{-19} \times 1.6}{2 \times 3.14 \times 1.6 \times 10^{-27}} = \frac{1.6 \times 10^8}{6.28} \approx \mathbf{2.5 \times 10^7\text{ Hz}} \quad (25\text{ MHz})$$

**2. 最大運動エネルギー $E_{\max}$**
最大運動エネルギーの公式より：
$$E_{\max} = \frac{q^2 B^2 R^2}{2m} = \frac{(1.6 \times 10^{-19})^2 \times (1.6)^2 \times (0.50)^2}{2 \times (1.6 \times 10^{-27})}$$
$$E_{\max} = \frac{2.56 \times 10^{-38} \times 2.56 \times 0.25}{3.2 \times 10^{-27}} = \frac{1.6384 \times 10^{-38}}{3.2 \times 10^{-27}} = \mathbf{5.1 \times 10^{-12}\text{ J}}$$

これを $\text{eV}$ に換算すると：
$$E_{\max} = \frac{5.12 \times 10^{-12}\text{ J}}{1.6 \times 10^{-19}\text{ J/eV}} = 3.2 \times 10^7\text{ eV} = \mathbf{32\text{ MeV}}$$

**3. 隙間の通過回数 $n$ と周回数 $N$**
隙間を1回通過するごとに得る運動エネルギーは $\Delta E_1 = qV = 1.6 \times 10^{-19} \times 4.0 \times 10^4 = 6.4 \times 10^{-15}\text{ J}$（すなわち $40\text{ keV}$）。
通過回数 $n$ は：
$$n = \frac{E_{\max}}{qV} = \frac{3.2 \times 10^7\text{ eV}}{4.0 \times 10^4\text{ eV}} = \mathbf{800\text{ 回}}$$
1周につき2回通過するため、周回数 $N$ は：
$$N = \frac{n}{2} = \mathbf{400\text{ 周}}$$

**4. 全所要時間 $t$**
周期 $T = \frac{1}{f} = \frac{1}{2.54 \times 10^7} \approx 3.93 \times 10^{-8}\text{ s}$。
$400$ 周するのに要する時間 $t$ は：
$$t = N \times T = 400 \times \frac{2\pi m}{qB} = 400 \times 3.93 \times 10^{-8}\text{ s} \approx \mathbf{1.6 \times 10^{-5}\text{ s}} \quad (16\ \mu\text{s})$$

---

### 例題2：α粒子と重陽子の加速条件（難関大発展）

<div class="problem-card">
  <div class="problem-header">
    <span class="badge-exam">難関国公立大・頻出</span>
    <strong>問題：異なる荷電粒子の加速と電源周波数の調整</strong>
  </div>
  <p>
    あるサイクロトロンは、磁束密度 $B$ の磁場中で陽子（質量 $m$、電荷 $+e$）を周波数 $f_0$ の交流電場で加速するように設計されている。
  </p>
  <ol>
    <li>この装置の磁場 $B$ を変えずに、重陽子（質量 $2m$、電荷 $+e$）を加速したい。交流電源の周波数は $f_0$ の何倍に調整すべきか。</li>
    <li>同様に磁場 $B$ を変えずに、$\alpha$粒子（質量 $4m$、電荷 $+2e$）を加速したい。交流電源の周波数は $f_0$ の何倍に調整すべきか。</li>
    <li>ディー半径を $R$ とするとき、取り出される陽子、重陽子、$\alpha$粒子の最大運動エネルギーの比 $E_p : E_d : E_\alpha$ を求めよ。</li>
  </ol>
</div>

#### 【思考プロセス・完全解答】

**1. 重陽子の交流周波数 $f_d$**
周波数の式は $f = \frac{qB}{2\pi m}$ です。
陽子の場合：$f_0 = \frac{eB}{2\pi m}$
重陽子の場合：電荷 $q = e$、質量 $2m$ なので：
$$f_d = \frac{eB}{2\pi (2m)} = \frac{1}{2} \left(\frac{eB}{2\pi m}\right) = \mathbf{\frac{1}{2}\text{ 倍}} \quad (0.50 f_0)$$

**2. $\alpha$粒子の交流周波数 $f_\alpha$**
$\alpha$粒子の場合：電荷 $q = 2e$、質量 $4m$ なので、比電荷 $\frac{q}{m}$ は：
$$\frac{q_\alpha}{m_\alpha} = \frac{2e}{4m} = \frac{e}{2m}$$
したがって：
$$f_\alpha = \frac{(2e)B}{2\pi (4m)} = \frac{1}{2} \left(\frac{eB}{2\pi m}\right) = \mathbf{\frac{1}{2}\text{ 倍}} \quad (0.50 f_0)$$
（※重陽子と$\alpha$粒子は比電荷 $\frac{q}{m}$ が等しいため、まったく同一の周波数で共鳴加速できます）

**3. 最大運動エネルギーの比**
最大運動エネルギーの一般式 $E_{\max} = \frac{q^2 B^2 R^2}{2m}$ より、$B$ と $R$ が共通なので、比例関係は：
$$E_{\max} \propto \frac{q^2}{m}$$
それぞれの粒子について計算すると：
- 陽子 $p$: $\frac{e^2}{m} = 1 \cdot \frac{e^2}{m}$
- 重陽子 $d$: $\frac{e^2}{2m} = \frac{1}{2} \cdot \frac{e^2}{m}$
- $\alpha$粒子: $\frac{(2e)^2}{4m} = \frac{4e^2}{4m} = 1 \cdot \frac{e^2}{m}$

したがって、エネルギーの比は：
$$E_p : E_d : E_\alpha = 1 : \frac{1}{2} : 1 = \mathbf{2 : 1 : 2}$$

---

## 7. 重要公式まとめ

| 物理量 | 記号 | 公式 | 備考 |
| :--- | :--- | :--- | :--- |
| **等速円運動半径** | $r$ | $r = \frac{mv}{qB}$ | 速度 $v$ に比例して拡大 |
| **回転周期** | $T$ | $T = \frac{2\pi m}{qB}$ | **速度 $v$・半径 $r$ に無関係で一定（等時性）** |
| **サイクロトロン周波数** | $f_{ac}$ | $f_{ac} = \frac{qB}{2\pi m}$ | 交流電源と同調させる |
| **最大運動エネルギー** | $E_{\max}$ | $E_{\max} = \frac{q^2 B^2 R^2}{2m}$ | **加速電圧 $V$ に依存しない** |
| **必要な周回数** | $N$ | $N = \frac{E_{\max}}{2qV}$ | 電圧 $V$ が高いほど少ない周回で到達 |
