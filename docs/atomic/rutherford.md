---
title: ラザフォード散乱実験と原子核の発見・クーロン散乱の完全導出
description: 高校物理・大学入試最重要「ラザフォード散乱実験と原子核の発見」。トムソンのブドウパン模型の破綻、α粒子の金箔散乱、クーロン反発力による双曲線軌道、正面衝突の最接近距離r_min=2Ze^2/(4πε0 Ek)の導出、散乱公式N(θ)∝1/sin^4(θ/2)とボーア模型への架け橋をシミュレータと図解で徹底解説！
---

# ラザフォード散乱実験と原子核の発見

20世紀初頭まで、科学者たちは原子を「正の電荷が球状にぼんやり広がり、その中に小さな電子がブドウのように散らばっている」というJ.J.トムソンの「**ブドウパン模型（Plum pudding model）**」で捉えていました。

しかし1909年〜1911年、イギリスの**アーネスト・ラザフォード（Ernest Rutherford）**とその弟子ガイガー、マースデンが行った画期的な実験によって、この常識は根底から覆されました。

薄い金箔に高速の $\alpha$ 粒子（ヘリウム原子核）を衝突させたところ、大半は何事もなく素通りしたものの、**約8000個に1個の割合で $90^\circ$ 以上の大角度で弾き飛ばされ、中にはほぼ真後ろ（$180^\circ$）に跳ね返ってくる粒子が存在した**のです。

ラザフォードはこの驚きを後にこう語っています：
「**それはまるで、ティッシュペーパーに向けて撃った15インチ（約38cm）砲弾が、跳ね返って自分自身に命中したかのような衝撃であった！**」

<ClientOnly>
  <RutherfordSim />
</ClientOnly>

---

## 1. トムソン模型の破綻とラザフォードの着想

もしトムソンのブドウパン模型が正しければ、正電荷は原子全体（直径約 $10^{-10}\,\text{m}$）に薄く均一に広がっているはずです。
この場合、電場の強さは極めて微弱であり、質量が電子の約7300倍もある超重量級の高速 $\alpha$ 粒子が受ける静電力はごくわずかで、散乱角は最大でも $1^\circ$ 未満にしかなり得ません。

約8000個に1個もの粒子を真後ろに跳ね返すためには、「**正電荷のすべてと、原子のほぼ全質量が、原子の中心のごくごく小さな1点に猛烈な超高密度で集中していなければならない**」とラザフォードは喝破しました。

これが、原子の中心に存在する「**原子核（Atomic nucleus）**」の発見です。

---

## 2. 正面衝突における最接近距離 $r_{min}$ の完全導出

運動エネルギー $E_k = \frac{1}{2}m_\alpha v^2$ をもつ $\alpha$ 粒子（電気量 $q_1 = +2e$）が、金箔の原子核（原子番号 $Z = 79$、電気量 $q_2 = +Ze$）に向かって**正面衝突（ヘッドオン衝突）**するケースを考えます。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 200" class="academic-svg" aria-label="α粒子の正面衝突と最接近距離の図解">
    <defs>
      <marker id="ruth-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="ruth-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
      <marker id="ruth-dim" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
      </marker>
    </defs>
    <!-- 中心軸（衝突線） -->
    <line x1="30" y1="100" x2="510" y2="100" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4" />
    <!-- α粒子 (無限遠〜接近中) -->
    <circle cx="80" cy="100" r="12" fill="rgba(56, 189, 248, 0.25)" stroke="#38bdf8" stroke-width="2" />
    <text x="80" y="104" fill="#38bdf8" font-size="11" font-weight="bold" text-anchor="middle">+2e</text>
    <text x="80" y="75" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">α粒子（m_α）</text>
    <line x1="95" y1="100" x2="160" y2="100" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#ruth-arrow-blue)" />
    <text x="130" y="90" fill="#38bdf8" font-size="11" font-weight="bold">初速 v₀</text>
    <!-- 最接近点 (v = 0, 一瞬静止) -->
    <circle cx="320" cy="100" r="12" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3" />
    <text x="320" y="75" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">最接近点（v = 0）</text>
    <!-- クーロン反発力 F_c -->
    <line x1="305" y1="100" x2="235" y2="100" stroke="#ef4444" stroke-width="2.5" marker-end="url(#ruth-arrow-red)" />
    <text x="270" y="90" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">クーロン反発力 F_c</text>
    <!-- 金箔原子核 (+Ze) -->
    <circle cx="450" cy="100" r="24" fill="rgba(251, 191, 36, 0.25)" stroke="#fbbf24" stroke-width="3" />
    <circle cx="450" cy="100" r="6" fill="#fbbf24" />
    <text x="450" y="105" fill="#fbbf24" font-size="13" font-weight="bold" text-anchor="middle">+Ze</text>
    <text x="450" y="65" fill="#fbbf24" font-size="12" font-weight="bold" text-anchor="middle">金箔原子核（Z = 79）</text>
    <!-- 最接近距離 r_min の寸法線 -->
    <line x1="320" y1="140" x2="450" y2="140" stroke="#fbbf24" stroke-width="1.5" />
    <line x1="320" y1="130" x2="320" y2="150" stroke="#fbbf24" stroke-width="1.5" />
    <line x1="450" y1="130" x2="450" y2="150" stroke="#fbbf24" stroke-width="1.5" />
    <line x1="320" y1="140" x2="340" y2="140" stroke="#fbbf24" stroke-width="1.5" marker-end="url(#ruth-dim)" />
    <line x1="450" y1="140" x2="430" y2="140" stroke="#fbbf24" stroke-width="1.5" marker-end="url(#ruth-dim)" />
    <text x="385" y="160" fill="#fbbf24" font-size="12" font-weight="bold" text-anchor="middle">最接近距離 r_min</text>
  </svg>
  <div class="diagram-caption">図: α粒子の正面衝突におけるクーロン反発力と最接近距離 r_min</div>
</div>

無限遠から近づくにつれて、同種電荷同士のクーロン反発力によって $\alpha$ 粒子は減速し、最も近づいた点（距離 $r_{min}$）で一瞬だけ静止（速さ $v = 0$）して逆向きに跳ね返ります。

力学的エネルギー保存則より：

$$
\text{無限遠での運動エネルギー } E_k = \text{最接近点での静電ポテンシャルエネルギー } U(r_{min})
$$

$$
E_k = \frac{1}{4\pi\varepsilon_0} \frac{q_1 q_2}{r_{min}} = \frac{1}{4\pi\varepsilon_0} \frac{(2e)(Ze)}{r_{min}}
$$

この式を最接近距離 $r_{min}$ について解きます。

$$
r_{min} = \frac{1}{4\pi\varepsilon_0} \frac{2 Z e^2}{E_k}
$$

### 【実際の数値計算】原子核の大きさの推定
金箔（$Z = 79$）に、典型的な天然放射性崩壊から得られる $E_k = 5.0\,\text{MeV} = 5.0 \times 10^6 \times (1.60 \times 10^{-19})\,\text{J} = 8.0 \times 10^{-13}\,\text{J}$ の $\alpha$ 粒子を衝突させた場合：

- $\frac{1}{4\pi\varepsilon_0} \approx 9.0 \times 10^9\,\text{N}\cdot\text{m}^2/\text{C}^2$
- $e = 1.60 \times 10^{-19}\,\text{C}$

$$
r_{min} = \frac{(9.0 \times 10^9) \times 2 \times 79 \times (1.60 \times 10^{-19})^2}{8.0 \times 10^{-13}} \approx \mathbf{4.5 \times 10^{-14}\,\text{m} = 45\,\text{fm}}
$$

> **歴史的結論**:
> $\alpha$ 粒子がクーロンの逆2乗則に従って純粋に跳ね返ったということは、**原子核の半径は少なくとも $4.5 \times 10^{-14}\,\text{m}$ よりも小さい**ことを意味します！
> 原子全体の大きさ（約 $10^{-10}\,\text{m}$）と比較すると、原子核はその**約1万分の1〜10万分の1**しかありません。
>
> （原子を「野球場のグラウンド全体」に例えれば、原子核は「マウンド中央に置かれたパチンコ玉1個」のサイズであり、**原子の内部はほぼ完全な真空（空っぽ）**であることが判明しました）。

---

## 3. ラザフォードの散乱公式と角度分布

衝突パラメータ $b$（芯から外れたズレ距離）をもって入射した $\alpha$ 粒子は、原子核のまわりで**双曲線軌道（Hyperbolic orbit）**を描いて散乱されます。

ラザフォードがニュートン力学とクーロンの法則から数学的に導出した、散乱角 $\theta$ の方向に散乱される粒子数 $N(\theta)$ の理論式です。

$$
N(\theta) \propto \frac{Z^2}{E_k^2 \sin^4\left(\frac{\theta}{2}\right)}
$$

この公式の最大の特徴は、分母に <strong>$\sin^4(\theta/2)$</strong> があることです！

- $\theta \approx 0^\circ$（直進方向）: $\sin(\theta/2) \to 0$ となるため、$N(\theta)$ は爆発的に巨大（大半の粒子はそのまま素通り）。
- $\theta = 180^\circ$（真後ろ後方散乱）: $\sin(90^\circ) = 1$ となり最小値をとりますが、**ゼロではなく有限の確率で確実に跳ね返ってくる**。

ガイガーとマースデンが数万個の蛍光発光（シンチレーション）を目視カウントして得た実験データは、この理論曲線と**完全無欠に一致**しました。

---

## 4. ラザフォード模型の限界とボーア模型への架け橋

ラザフォードの「中心の原子核のまわりを電子が惑星のように回っている」という太陽系型原子模型は偉大でしたが、**古典電磁気学と致命的な矛盾**を抱えていました。

### 【古典物理学のパラドックス】
円運動する電子は向心加速度をもつため、マクスウェルの電磁気学によれば**電磁波（光）を放出してエネルギーを失い、わずか $10^{-11}$ 秒で原子核に墜落して原子が崩壊してしまう**はずでした。

なぜ電子はエネルギーを失わずに安定して回り続けられるのか？
この謎を解決するために、1913年にニールス・ボーア（Niels Bohr）がプランクの量子仮説を取り入れ、「<strong>ボーアの量子条件 $2\pi r p = nh$</strong>」を提唱することになります。

---

## 5. 実戦入試演習問題

### 【問題】
静止している金原子核（原子番号 $Z = 79$）に向けて、質量 $m = 6.6 \times 10^{-27}\,\text{kg}$、電気量 $q = 2e = 3.2 \times 10^{-19}\,\text{C}$ の $\alpha$ 粒子を速さ $v_0 = 1.6 \times 10^7\,\text{m/s}$ で一直線上に正面衝突させた。
クーロンの法則の比例定数を $k_0 = 9.0 \times 10^9\,\text{N}\cdot\text{m}^2/\text{C}^2$、電気素量を $e = 1.6 \times 10^{-19}\,\text{C}$ とする。金原子核は固定されているものとする。

1. 入射時の $\alpha$ 粒子の運動エネルギー $E_k$ を求めよ（$\text{J}$ および $\text{MeV}$ で答えよ）。
2. $\alpha$ 粒子が金原子核に最も近づいたときの距離 $r_{min}$ を求めよ。
3. 最接近距離 $r_{min}$ を半分にするには、$\alpha$ 粒子の初速 $v_0$ を何倍にすればよいか。

---

### 【解答・解説】

#### 1. 運動エネルギー $E_k$

$$
E_k = \frac{1}{2} m v_0^2 = \frac{1}{2} \times (6.6 \times 10^{-27}\,\text{kg}) \times (1.6 \times 10^7\,\text{m/s})^2
$$

$$
E_k = 3.3 \times 10^{-27} \times 2.56 \times 10^{14} = \mathbf{8.45 \times 10^{-13}\,\text{J}}
$$

$\text{MeV}$ 換算（$1\,\text{eV} = 1.6 \times 10^{-19}\,\text{J}$）:

$$
E_k = \frac{8.45 \times 10^{-13}}{1.6 \times 10^{-13}} \approx \mathbf{5.28\,\text{MeV}}
$$

#### 2. 最接近距離 $r_{min}$
力学的エネルギー保存則 $E_k = \frac{k_0 (2e)(Ze)}{r_{min}}$ より：

$$
r_{min} = \frac{2 k_0 Z e^2}{E_k}
$$

数値を代入すると：

$$
r_{min} = \frac{2 \times (9.0 \times 10^9) \times 79 \times (1.6 \times 10^{-19})^2}{8.45 \times 10^{-13}}
$$

$$
r_{min} = \frac{1.422 \times 10^{12} \times 2.56 \times 10^{-38}}{8.45 \times 10^{-13}} = \frac{3.64 \times 10^{-26}}{8.45 \times 10^{-13}} \approx \mathbf{4.3 \times 10^{-14}\,\text{m} = 43\,\text{fm}}
$$

#### 3. 初速 $v_0$ の倍率
$r_{min} = \frac{2 k_0 Z e^2}{\frac{1}{2} m v_0^2} \propto \frac{1}{v_0^2}$ です。
したがって、最接近距離を $\frac{1}{2}$ 倍にするためには：

$$
\frac{1}{v'^2} = \frac{1}{2} \frac{1}{v_0^2} \implies v'^2 = 2 v_0^2 \implies v' = \mathbf{\sqrt{2}\,\text{倍} \approx 1.41\,\text{倍}}
$$

速さを $\sqrt{2}$ 倍（約 $1.41$ 倍）に加速すれば、運動エネルギーが2倍になり、原子核の2倍深くまで突入できることがわかります。
