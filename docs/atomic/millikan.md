---
title: ミリカンの油滴実験と電気素量測定・電荷量子化の完全導出
description: 高校物理・大学入試超頻出「ミリカンの油滴実験」。ストークスの法則F=6πηrvによる終端速度、電場と重力のつり合い、電気素量e=1.602×10^-19 Cの決定、電荷の量子化q=ne、トムソンの比電荷と連動した電子質量の完全導出をシミュレータと図解で徹底解説！
---

# ミリカンの油滴実験と電気素量の測定

1897年にJ.J.トムソンが電子を発見したものの、測定できたのは比率である「比電荷 $\frac{e}{m}$」だけであり、電子1個の電気量 $e$ や質量 $m$ そのものは依然として謎に包まれていました。

1909年、アメリカの物理学者**ロバート・ミリカン（Robert Millikan）**は、帯電した微小な油滴を平行平板電極の間に漂わせ、顕微鏡でその運動を精密に観測する「**油滴実験（Oil-drop experiment）**」を行いました。

その結果、あらゆる油滴がもつ電気量 $q$ は、必ずある普遍定数 $e$ の**整数倍（$q = ne$）**になっていることを突き止めました。
これにより、**「電気量には最小単位（電気素量）が存在し、電荷は連続量ではなく離散的な粒（量子）である」**という電荷の量子化が決定的に証明されました。

<ClientOnly>
  <MillikanSim />
</ClientOnly>

---

## 1. 実験装置の構造と測定原理

ミリカン実験装置は、間隔 $d$ の水平な平行平板電極、微細な油滴を噴霧するアトマイザー（噴霧器）、および油滴を拡大観察するための対物顕微鏡から構成されています。

<div class="vector-diagram-card">
  <svg viewBox="0 0 560 240" class="academic-svg" aria-label="ミリカン油滴実験装置の構造と観察系">
    <defs>
      <marker id="mil-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="mil-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
    </defs>

    <!-- 噴霧器 (アトマイザー) -->
    <path d="M 60 20 L 95 35 L 75 45 Z" fill="#94a3b8" />
    <circle cx="50" cy="22" r="14" fill="#64748b" />
    <text x="50" y="55" fill="#94a3b8" font-size="11" text-anchor="middle">噴霧器</text>
    <!-- 噴霧スプレー小滴 -->
    <circle cx="105" cy="38" r="2" fill="#fbbf24" opacity="0.8" />
    <circle cx="120" cy="42" r="2.5" fill="#fbbf24" opacity="0.9" />
    <circle cx="135" cy="40" r="2" fill="#fbbf24" opacity="0.7" />

    <!-- 上極板 (+) -->
    <rect x="130" y="55" width="300" height="10" rx="2" fill="#ef4444" opacity="0.8" />
    <!-- ピンホール（小孔） -->
    <rect x="270" y="55" width="20" height="10" fill="#0f172a" />
    <text x="440" y="64" fill="#ef4444" font-size="12" font-weight="bold">上極板（＋電位 V）</text>

    <!-- 下極板 (-) -->
    <rect x="130" y="175" width="300" height="10" rx="2" fill="#38bdf8" opacity="0.8" />
    <text x="440" y="184" fill="#38bdf8" font-size="12" font-weight="bold">下極板（接地 0 V）</text>

    <!-- 極板間隔 d の寸法線 -->
    <line x1="140" y1="65" x2="140" y2="175" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
    <text x="125" y="125" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="end">間隔 d</text>

    <!-- 下向きの一様電場 E = V/d -->
    <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2,2">
      <line x1="180" y1="68" x2="180" y2="168" marker-end="url(#mil-arrow-blue)" />
      <line x1="380" y1="68" x2="380" y2="168" marker-end="url(#mil-arrow-blue)" />
    </g>
    <text x="400" y="125" fill="#38bdf8" font-size="11" font-weight="bold">電場 E = V/d (↓)</text>

    <!-- 帯電油滴（小孔を通過して電場内へ落下） -->
    <circle cx="280" cy="120" r="9" fill="#fbbf24" stroke="#f59e0b" stroke-width="2" />
    <text x="280" y="124" fill="#0f172a" font-size="10" font-weight="bold" text-anchor="middle">−q</text>

    <!-- 油滴に働く力 -->
    <!-- 上向き静電気力 qE -->
    <line x1="280" y1="110" x2="280" y2="80" stroke="#ef4444" stroke-width="2.5" marker-end="url(#mil-arrow-red)" />
    <text x="295" y="92" fill="#ef4444" font-size="11" font-weight="bold">静電気力 qE (↑)</text>
    <!-- 下向き重力 mg -->
    <line x1="280" y1="130" x2="280" y2="160" stroke="#38bdf8" stroke-width="2" marker-end="url(#mil-arrow-blue)" />
    <text x="295" y="152" fill="#38bdf8" font-size="11" font-weight="bold">重力 mg (↓)</text>

    <!-- 右側：対物顕微鏡による観察 -->
    <path d="M 450 110 L 490 100 L 490 140 L 450 130 Z" fill="#334155" stroke="#64748b" stroke-width="1.5" />
    <rect x="490" y="112" width="40" height="16" rx="3" fill="#1e293b" stroke="#64748b" stroke-width="1.5" />
    <text x="490" y="160" fill="#94a3b8" font-size="11" text-anchor="middle">対物顕微鏡</text>
  </svg>
  <div class="diagram-caption">図: ミリカン油滴実験装置の構成と帯電油滴に働く力</div>
</div>

噴霧された油滴は、空気との摩擦やX線の照射によって、数個〜十数個の電子を捕捉して負に帯電（$-q$）します。

---

## 2. 物理法則と数式導出

### ① ストークスの法則（粘性抵抗力）
空気中をゆっくり運動する半径 $r$ の球形微粒子は、空気の粘性係数 $\eta$ に比例する抵抗力（**ストークスの抵抗力**）を受けます。

$$
F_d = 6\pi \eta r v
$$

### ② 第1段階：無電場での自由落下（半径 $r$ と質量 $m$ の決定）
電場をかけない状態（$E = 0$）で油滴を自由落下させると、重力 $mg$ と空気抵抗力 $6\pi\eta r v_1$ がつり合い、一定の終端速度 $v_1$ で落下します（空気の浮力は油の密度 $\rho$ に比べて小さいためここでは無視、または見かけの密度 $\rho - \rho_{air}$ に置換）。

$$
m g = 6\pi \eta r v_1
$$

油滴の質量は $m = \frac{4}{3}\pi r^3 \rho$ なので：

$$
\frac{4}{3}\pi r^3 \rho g = 6\pi \eta r v_1 \implies r = \sqrt{\frac{9\eta v_1}{2\rho g}}
$$

落下の速さ $v_1$ を顕微鏡の目盛りで測定するだけで、目に見えない微小油滴の**「半径 $r$」**と**「質量 $m$」**が正確に求まります！

---

## 3. 電気量 $q$ の測定方法（2つのアプローチ）

### アプローチ A：静止つり合い法（最も直感的）
上極板を正、下極板を負にして電圧 $V$ を印加すると、負に帯電した油滴は上向きの静電気力 $F_E = qE = q\frac{V}{d}$ を受けます。
電圧を精密に調整して、油滴が重力とつり合って**空中でピタリと静止**したとき：

$$
q E = m g \iff q \frac{V}{d} = m g
$$

したがって、油滴の電気量 $q$ は次のように求まります。

$$
q = \frac{m g d}{V}
$$

### アプローチ B：上昇速度測定法（ミリカンが実際に行った方法）
強めの電場をかけて油滴を上向きに一定の終端速度 $v_2$ で上昇させるとき、上向きの静電気力と下向きの重力＋抵抗力がつり合います。

$$
q E = m g + 6\pi \eta r v_2
$$

落下の式 $mg = 6\pi\eta r v_1$ を代入すると：

$$
q E = 6\pi \eta r v_1 + 6\pi \eta r v_2 = 6\pi \eta r (v_1 + v_2)
$$

$$
q = \frac{6\pi \eta r (v_1 + v_2)}{E} = \frac{6\pi \eta r (v_1 + v_2) d}{V}
$$

---

## 4. 電荷の量子化と電気素量 $e$ の発見

ミリカンは数千個に及ぶ油滴について電気量 $q$ を丹念に測定し、それらを比較しました。
得られた電気量は、例えば以下のような離散的な数値の並びでした：

- 油滴 A: $q_A = 3.20 \times 10^{-19}\,\text{C}$
- 油滴 B: $q_B = 4.81 \times 10^{-19}\,\text{C}$
- 油滴 C: $q_C = 1.60 \times 10^{-19}\,\text{C}$
- 油滴 D: $q_D = 8.01 \times 10^{-19}\,\text{C}$
- 油滴 E: $q_E = 6.42 \times 10^{-19}\,\text{C}$

これらの測定値の**最大公約数（Greatest Common Divisor）**を求めると、すべての値が共通の最小単位 $e$ の整数倍になっていることが判明しました！

$$
q = n e \quad (n = 1, 2, 3, 4, 5, \dots)
$$

$$
e \approx 1.602 \times 10^{-19} \quad [\text{C}]
$$

> **歴史的意義**:
> 水滴ではなく蒸発しにくい「時計用高級潤滑油」を用いたミリカンの実験精度は極めて高く、この功績によりミリカンは1923年のノーベル物理学賞を受賞しました。

---

## 5. 電子の質量 $m_e$ の完全決定

ミリカンの電気素量 $e$ の測定により、トムソンの比電荷 $\frac{e}{m}$ と連立することで、ついに**電子1個の質量 $m_e$** が人類史上初めて明らかになりました！

$$
m_e = \frac{e}{\left(\frac{e}{m_e}\right)} = \frac{1.602 \times 10^{-19}\,\text{C}}{1.759 \times 10^{11}\,\text{C/kg}} \approx \mathbf{9.109 \times 10^{-31}\,\text{kg}}
$$

---

## 6. 実戦入試演習問題

### 【問題】
間隔 $d = 1.0 \times 10^{-2}\,\text{m}$ の水平な平行平板電極がある。
電極間に質量 $m = 3.2 \times 10^{-15}\,\text{kg}$ の負に帯電した油滴を導いた。重力加速度を $g = 9.8\,\text{m/s}^2$、電気素量を $e = 1.6 \times 10^{-19}\,\text{C}$ とする。

1. 電極間に電圧 $V = 980\,\text{V}$ を印加したところ、油滴は空中で静止した。上極板の極性（正・負）を答えよ。また、油滴がもつ電気量 $q$ を求めよ。
2. この油滴に過剰に付着している電子の数 $n$ は何個か。
3. 電圧を $V' = 1470\,\text{V}$ に増加させたとき、油滴は一定の終端速度 $v$ で上昇した。空気の粘性係数を $\eta = 1.8 \times 10^{-5}\,\text{Pa}\cdot\text{s}$、油滴の半径を $r = 1.0 \times 10^{-6}\,\text{m}$ とするとき、上昇速度 $v$ を求めよ。

---

### 【解答・解説】

#### 1. 極性と電気量 $q$
負電荷（$-q$）が上向きの静電気力を受けて重力 $mg$（下向き）とつり合うためには、電場は下向きでなければなりません。
したがって、上極板の電位が高くなければならないので、上極板の極性は**正（$+$）**です。

つり合いの式 $q E = mg$ より：

$$
q \frac{V}{d} = mg \implies q = \frac{mgd}{V}
$$

数値を代入すると：

$$
q = \frac{(3.2 \times 10^{-15}\,\text{kg}) \times (9.8\,\text{m/s}^2) \times (1.0 \times 10^{-2}\,\text{m})}{980\,\text{V}} = \mathbf{3.2 \times 10^{-19}\,\text{C}}
$$

#### 2. 付着電子の数 $n$

$$
n = \frac{q}{e} = \frac{3.2 \times 10^{-19}\,\text{C}}{1.6 \times 10^{-19}\,\text{C}} = \mathbf{2\,\text{個}}
$$

#### 3. 上昇終端速度 $v$
電圧 $V' = 1470\,\text{V}$ のときの電場は $E' = \frac{V'}{d} = \frac{1470}{0.010} = 1.47 \times 10^5\,\text{V/m}$。
静電気力は：

$$
F_E = q E' = (3.2 \times 10^{-19}\,\text{C}) \times (1.47 \times 10^5\,\text{V/m}) = 4.704 \times 10^{-14}\,\text{N}
$$

重力は：

$$
mg = (3.2 \times 10^{-15}) \times 9.8 = 3.136 \times 10^{-14}\,\text{N}
$$

上向きの正味の推進力 $\Delta F$ は：

$$
\Delta F = F_E - mg = (4.704 - 3.136) \times 10^{-14} = 1.568 \times 10^{-14}\,\text{N}
$$

これがストークスの抵抗力 $6\pi\eta rv$ とつり合うので：

$$
6\pi \eta r v = \Delta F \implies v = \frac{\Delta F}{6\pi \eta r}
$$

$$
v = \frac{1.568 \times 10^{-14}}{6 \times 3.1416 \times (1.8 \times 10^{-5}) \times (1.0 \times 10^{-6})} = \frac{1.568 \times 10^{-14}}{3.393 \times 10^{-10}} \approx \mathbf{4.62 \times 10^{-5}\,\text{m/s} = 46.2\,\mu\text{m/s}}
$$
