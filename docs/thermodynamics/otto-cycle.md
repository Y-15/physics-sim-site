---
title: オットーサイクルと4行程内燃機関の熱効率完全導出
description: 高校物理・難関大二次試験頻出「オットーサイクルと熱機関」。ガソリンエンジンの4行程（断熱圧縮・定積加熱・断熱膨張・定積冷却）、P-V図の正味仕事、圧縮比ε=V1/V2による理論熱効率η=1-1/ε^(γ-1)の厳密導出、カルノーサイクルとの比較をシミュレータと図解で徹底解説！
---

# オットーサイクルと4行程内燃機関の熱効率

自動車やバイクに広く使われているガソリンエンジン（4ストローク内燃機関）の基本作動原理を熱力学的にモデル化した理想サイクルを「**オットーサイクル（Otto cycle）**」と呼びます。

1876年にドイツの技術者ニコラウス・オットー（Nikolaus Otto）によって考案されたこのサイクルは、
1. **断熱圧縮** （混合気の急速圧縮）
2. **定積加熱** （点火プラグによる瞬間燃焼）
3. **断熱膨張** （高圧ガスがピストンを押し下げる仕事工程）
4. **定積冷却** （排気弁の開放と排熱）

という4つの理想化された状態変化で構成されています。
大学入試では、ポアソンの法則 $P V^\gamma = \text{一定}$ を用いた断熱変化の計算と、「**圧縮比 $\varepsilon$ だけで熱効率が決まる**」という美しい数式導出が頻出します。

<ClientOnly>
  <OttoCycleSim />
</ClientOnly>

---

## 1. オットーサイクルの4つの行程（P-V線図）

シリンダー内の理想気体（モル数 $n$、定積モル比熱 $C_v$、比熱比 $\gamma = C_p/C_v$）を考えます。
シリンダーの最大体積を下死点（BDC）の $V_1$、最小体積を上死点（TDC）の $V_2$ とし、 **圧縮比（Compression ratio）** を次のように定義します。

$$
\varepsilon = \frac{V_1}{V_2} \quad (\varepsilon > 1)
$$

一般的な乗用車のガソリンエンジンでは、圧縮比は $\varepsilon \approx 8 \sim 11$ 程度です。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 280" class="academic-svg" aria-label="オットーサイクルのP-V線図">
    <defs>
      <marker id="arrow-axis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
      </marker>
      <marker id="arrow-path" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
    </defs>

    <!-- 座標軸 -->
    <line x1="70" y1="240" x2="490" y2="240" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow-axis)" />
    <text x="500" y="244" fill="#94a3b8" font-size="13" font-weight="bold">体積 V</text>
    <line x1="70" y1="240" x2="70" y2="20" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrow-axis)" />
    <text x="70" y="14" fill="#94a3b8" font-size="13" font-weight="bold" text-anchor="middle">圧力 P</text>

    <!-- 体積補助線 V2 (上死点), V1 (下死点) -->
    <line x1="170" y1="240" x2="170" y2="40" stroke="rgba(148, 163, 184, 0.25)" stroke-dasharray="3,3" />
    <text x="170" y="258" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">V₂（上死点）</text>
    <line x1="400" y1="240" x2="400" y2="120" stroke="rgba(148, 163, 184, 0.25)" stroke-dasharray="3,3" />
    <text x="400" y="258" fill="#94a3b8" font-size="12" font-weight="bold" text-anchor="middle">V₁（下死点）</text>

    <!-- サイクル閉領域（塗りつぶし・正味の仕事） -->
    <path d="M 400 220 C 300 200, 210 150, 170 120 L 170 45 C 230 75, 330 130, 400 155 Z" fill="rgba(56, 189, 248, 0.15)" stroke="none" />
    <text x="280" y="135" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">正味の仕事 W_net</text>

    <!-- ① -> ② 断熱圧縮 -->
    <path d="M 400 220 C 300 200, 210 150, 170 120" fill="none" stroke="#38bdf8" stroke-width="2.5" />
    <text x="260" y="195" fill="#38bdf8" font-size="11" font-weight="bold">①→② 断熱圧縮 (Win)</text>

    <!-- ② -> ③ 定積加熱 (吸熱 Qin) -->
    <line x1="170" y1="120" x2="170" y2="45" stroke="#ef4444" stroke-width="3" />
    <line x1="125" y1="82" x2="160" y2="82" stroke="#ef4444" stroke-width="2" marker-end="url(#arrow-path)" />
    <text x="120" y="86" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="end">吸熱 Q_in (燃焼)</text>

    <!-- ③ -> ④ 断熱膨張 (仕事 Wout) -->
    <path d="M 170 45 C 230 75, 330 130, 400 155" fill="none" stroke="#10b981" stroke-width="2.5" />
    <text x="310" y="90" fill="#10b981" font-size="11" font-weight="bold">③→④ 断熱膨張 (Wout)</text>

    <!-- ④ -> ① 定積冷却 (放熱 Qout) -->
    <line x1="400" y1="155" x2="400" y2="220" stroke="#3b82f6" stroke-width="3" />
    <line x1="400" y1="187" x2="445" y2="187" stroke="#3b82f6" stroke-width="2" marker-end="url(#arrow-path)" />
    <text x="450" y="191" fill="#3b82f6" font-size="12" font-weight="bold">放熱 Q_out (排気)</text>

    <!-- 各状態点 ①, ②, ③, ④ -->
    <circle cx="400" cy="220" r="5" fill="#38bdf8" />
    <text x="412" y="226" fill="#38bdf8" font-size="12" font-weight="bold">① (V₁, P₁, T₁)</text>

    <circle cx="170" cy="120" r="5" fill="#38bdf8" />
    <text x="158" y="125" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="end">② (V₂, P₂, T₂)</text>

    <circle cx="170" cy="45" r="5" fill="#ef4444" />
    <text x="158" y="48" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="end">③ (V₂, P₃, T₃)</text>

    <circle cx="400" cy="155" r="5" fill="#10b981" />
    <text x="412" y="152" fill="#10b981" font-size="12" font-weight="bold">④ (V₁, P₄, T₄)</text>
  </svg>
  <div class="diagram-caption">図: オットーサイクルの P-V 線図（定積加熱・定積冷却と断熱変化）</div>
</div>

### ① 行程 $1 \to 2$：断熱圧縮（Adiabatic Compression）
ピストンが下死点 $V_1$ から上死点 $V_2$ へ急激に上昇し、気体を断熱的に圧縮します。
ポアソンの法則 $T V^{\gamma-1} = \text{一定}$ より：

$$
T_1 V_1^{\gamma-1} = T_2 V_2^{\gamma-1} \implies T_2 = T_1 \left(\frac{V_1}{V_2}\right)^{\gamma-1} = T_1 \varepsilon^{\gamma-1}
$$

### ② 行程 $2 \to 3$：定積加熱（Isochoric Heat Addition）
上死点に達した瞬間、点火プラグが放電し、ピストンが動く間もない極めて短い時間で燃料が爆発的に燃焼します（体積 $V_2$ 一定）。
燃焼によって気体が吸収した熱量 $Q_{in}$ は：

$$
Q_{in} = n C_v (T_3 - T_2)
$$

### ③ 行程 $3 \to 4$：断熱膨張（Adiabatic Expansion：パワーストローク）
高温・高圧の燃焼ガスがピストンを力強く押し下げ、外部へ力学的仕事を取り出します（$V_2 \to V_1$）。
再びポアソンの法則より：

$$
T_3 V_2^{\gamma-1} = T_4 V_1^{\gamma-1} \implies T_4 = T_3 \left(\frac{V_2}{V_1}\right)^{\gamma-1} = \frac{T_3}{\varepsilon^{\gamma-1}}
$$

### ④ 行程 $4 \to 1$：定積冷却（Isochoric Heat Rejection）
下死点で排気弁が開き、高温ガスが排気されてシリンダー内の圧力が急降下します（体積 $V_1$ 一定で冷却）。
外部へ放出した熱量 $Q_{out}$ は：

$$
Q_{out} = n C_v (T_4 - T_1)
$$

---

## 2. 理論熱効率 $\eta$ の完全導出

熱機関の熱効率 $\eta$ の定義は、「吸収した熱量 $Q_{in}$ のうち、何割を正味の仕事 $W_{net}$ に変換できたか」です。

$$
\eta = \frac{W_{net}}{Q_{in}} = \frac{Q_{in} - Q_{out}}{Q_{in}} = 1 - \frac{Q_{out}}{Q_{in}}
$$

ここに、$Q_{in} = n C_v (T_3 - T_2)$ および $Q_{out} = n C_v (T_4 - T_1)$ を代入します。

$$
\eta = 1 - \frac{n C_v (T_4 - T_1)}{n C_v (T_3 - T_2)} = 1 - \frac{T_4 - T_1}{T_3 - T_2}
$$

ここで、行程 $1 \to 2$ および $3 \to 4$ の断熱変化の関係式を用います。

$$
T_2 = T_1 \varepsilon^{\gamma-1}, \quad T_3 = T_4 \varepsilon^{\gamma-1}
$$

分母の $(T_3 - T_2)$ に代入すると：

$$
T_3 - T_2 = T_4 \varepsilon^{\gamma-1} - T_1 \varepsilon^{\gamma-1} = (T_4 - T_1) \varepsilon^{\gamma-1}
$$

これを熱効率の式に戻すと、分子の $(T_4 - T_1)$ が見事に **完全に約分** されます！

$$
\eta = 1 - \frac{T_4 - T_1}{(T_4 - T_1) \varepsilon^{\gamma-1}} = 1 - \frac{1}{\varepsilon^{\gamma-1}}
$$

::: tip オットーサイクルの熱効率公式
$$
\eta = 1 - \frac{1}{\varepsilon^{\gamma-1}}
$$
- オットーサイクルの熱効率は、最高燃焼温度 $T_3$ には依存せず、 **「圧縮比 $\varepsilon$」と「作動気体の比熱比 $\gamma$」の2つだけで決定** されます！
- 圧縮比 $\varepsilon$ を大きくするほど、分母が大きくなって熱効率 $\eta$ は向上します。
:::

### 数値例（空気 $\gamma = 1.4$ の場合）
- $\varepsilon = 6$: $\eta = 1 - \frac{1}{6^{0.4}} \approx 1 - 0.488 = 51.2\%$
- $\varepsilon = 8$: $\eta = 1 - \frac{1}{8^{0.4}} \approx 1 - 0.435 = \mathbf{56.5\%}$
- $\varepsilon = 10$: $\eta = 1 - \frac{1}{10^{0.4}} \approx 1 - 0.398 = \mathbf{60.2\%}$

---

## 3. なぜ現実のガソリンエンジンは圧縮比を際限なく上げられないのか？（ノッキング現象）

理論上は圧縮比 $\varepsilon$ を $15$ や $20$ に上げれば熱効率は $65\%$ 以上に高まりますが、ガソリンエンジンでは通常 $\varepsilon \approx 10$ 前後に抑えられています。

### 【原因：異常燃焼（ノッキング）】
気体を過度に断熱圧縮すると、点火プラグが火花を散らす前に、圧縮熱によって混合気の温度がガソリンの発火点を超えてしまい、 **自発着火（早期着火）** を起こしてしまいます。
この衝撃波によってエンジンが破損する現象を「**ノッキング（Knocking）**」と呼びます。

（※なお、空気だけを限界まで断熱圧縮（$\varepsilon \approx 16 \sim 22$）して超高温にし、そこに軽油を直接吹き込んで自発着火させるのが **ディーゼルエンジン（ディーゼルサイクル）** です）。

---

## 4. 実戦入試演習問題

### 【問題】
単原子分子理想気体（比熱比 $\gamma = \frac{5}{3}$、定積モル比熱 $C_v = \frac{3}{2}R$）$1.0\,\text{mol}$ を作動流体とするオットーサイクルがある。
状態①での体積は $V_1 = 8.0 \times 10^{-3}\,\text{m}^3$、温度は $T_1 = 300\,\text{K}$ であり、圧縮比は $\varepsilon = 8.0$ である。
点火燃焼（状態② $\to$ ③）で加えた熱量を $Q_{in} = 6.0 \times 10^3\,\text{J}$ とする。気体定数を $R = 8.3\,\text{J/(mol}\cdot\text{K)}$ とする。

1. このサイクルの理論熱効率 $\eta$ を求めよ。
2. 状態②（断熱圧縮後）の温度 $T_2$ を求めよ。
3. 1サイクルあたりに気体が外部へなす正味の仕事 $W_{net}$ を求めよ。

---

### 【解答・解説】

#### 1. 理論熱効率 $\eta$
$\gamma - 1 = \frac{5}{3} - 1 = \frac{2}{3}$ です。

$$
\eta = 1 - \frac{1}{\varepsilon^{\gamma-1}} = 1 - \frac{1}{8.0^{2/3}}
$$

ここで $8.0^{2/3} = (2^3)^{2/3} = 2^2 = 4$ です！

$$
\eta = 1 - \frac{1}{4} = \frac{3}{4} = \mathbf{0.75 \quad (75\%)}
$$

単原子分子気体を用いると、比熱比が高いため $75\%$ という極めて高い理論効率が得られます。

#### 2. 断熱圧縮後の温度 $T_2$
$T_2 = T_1 \varepsilon^{\gamma-1}$ より：

$$
T_2 = 300\,\text{K} \times 8.0^{2/3} = 300 \times 4 = \mathbf{1200\,\text{K} \quad (927^\circ\text{C})}
$$

断熱圧縮だけで温度が $900^\circ\text{C}$ 以上まで跳ね上がることがわかります。

#### 3. 正味の仕事 $W_{net}$
熱効率の定義 $\eta = \frac{W_{net}}{Q_{in}}$ より：

$$
W_{net} = \eta \times Q_{in} = 0.75 \times (6.0 \times 10^3\,\text{J}) = \mathbf{4.5 \times 10^3\,\text{J}}
$$

投入された熱エネルギー $6000\,\text{J}$ のうち、実に $4500\,\text{J}$ が車の推進力（力学的仕事）に変換され、残りの $1500\,\text{J}$ が排気ガスとして外部へ放出されます。
