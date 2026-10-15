---
title: カルノーサイクルと熱機関の熱効率・ポアソンの法則
description: 高校物理の熱力学最重要応用テーマ。熱機関の熱効率 e=(Qin-Qout)/Qin、カルノーサイクルの4工程（等温膨張・断熱膨張・等温圧縮・断熱圧縮）、ポアソンの法則 PV^γ=一定、理論最高効率 e=1-TL/THの完全導出をシミュレーションとオリジナル例題で解説。
---

# カルノーサイクルと熱機関の熱効率・ポアソンの法則

<div class="lead">
自動車のガソリンエンジン、発電所の蒸気タービン、飛行機のジェットエンジン――。<br>
熱エネルギーを「力学的仕事」に変える装置を<strong>熱機関（Heat Engine）</strong>と呼びます。<br>
「投入した熱エネルギーを100%すべて仕事に変える夢のエンジン」は作れるのでしょうか？<br>
答えは<strong>「絶対に不可能（熱力学第2法則）」</strong>です。<br>
1824年、フランスの若き天才物理学者サディ・カルノーが考案した<strong>カルノーサイクル（Carnot Cycle）</strong>は、物理法則が許す「理論上の限界最高効率」を決定づけました。<br>
本ページでは、4つの変化工程の導出からポアソンの法則、入試の熱効率計算までを完全攻略します。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **火力・原子力発電所の冷却塔**: 発電所で電気を作った後、使い終わった蒸気を冷やすために大量の海水を汲み上げたり、巨大な冷却塔から湯気を放出している（低温熱源への放熱 $Q_{\text{out}}$ が絶対に必須な証拠）。
* **車のエンジンが熱くなる理由**: ガソリンが燃えたときの熱エネルギーのうち、車の運動（仕事 $W$）に変わるのはわずか $30\sim 40\%$ であり、残りの $60\sim 70\%$ はラジエーターや排気ガスとして捨てられている。
* **コッヘル（鍋）の断熱膨張**: スプレー缶を一気に噴射すると缶が冷たくなり、自転車のタイヤに急激に空気を入れると空気入れの根本が熱くなる（断熱圧縮・膨張）。

### 学習の到達目標
1. **熱効率の定義式の完全理解**: $e = \frac{W}{Q_{\text{in}}} = 1 - \frac{Q_{\text{out}}}{Q_{\text{in}}}$ を立て、P-Vサイクルの面積から熱効率を正しく計算できる。
2. **カルノーサイクルの4工程の判別**: 等温変化（$\Delta U = 0$）と断熱変化（$Q = 0$）を正しく組み合わせ、各工程の吸放熱と仕事を立式できる。
3. **カルノー効率の導出**: ポアソンの法則を用いて、可逆機関の最高効率が温度だけで決まる $e = 1 - \frac{T_L}{T_H}$ となることを自力で導出できる。

---

## 🧪 インタラクティブ実験室

高温熱源 $T_H$ や低温熱源 $T_L$ を動かして、ピストンの往復運動と $P$-$V$ インジケーター図の閉曲線がどのように連動するか観察してみましょう。

<CarnotSim />

---

## 2. 熱機関の基本構造と熱効率の定義

熱機関は、高温熱源（温度 $T_H$）から熱量 $Q_{\text{in}}$ を受け取り、外部へ正味の力学的仕事 $W$ を行い、残りカスとなった熱量 $Q_{\text{out}}$ を低温熱源（温度 $T_L$）へと捨てる循環システムです。

<div class="vector-graph-card">
<svg viewBox="0 0 540 250" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-car-flow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
    <marker id="arr-car-work" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#fbbf24" />
    </marker>
  </defs>

  <!-- 高温熱源 (上部) -->
  <rect x="180" y="20" width="180" height="40" rx="4" fill="#ef4444"/>
  <text x="270" y="45" fill="#fff" font-size="14" font-weight="700" text-anchor="middle">高温熱源 T_H</text>

  <!-- 熱機関 (中央の丸) -->
  <circle cx="270" cy="130" r="35" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>
  <text x="270" y="135" fill="#f8fafc" font-size="13" font-weight="700" text-anchor="middle">熱機関</text>

  <!-- 低温熱源 (下部) -->
  <rect x="180" y="200" width="180" height="40" rx="4" fill="#3b82f6"/>
  <text x="270" y="225" fill="#fff" font-size="14" font-weight="700" text-anchor="middle">低温熱源 T_L</text>

  <!-- 吸熱矢印 Qin (高温 -> 機関) -->
  <line x1="270" y1="60" x2="270" y2="92" stroke="#ef4444" stroke-width="4" marker-end="url(#arr-car-flow)"/>
  <text x="285" y="80" fill="#ef4444" font-size="13" font-weight="700">吸熱 Q_in</text>

  <!-- 正味の仕事矢印 W (機関 -> 外部右向き) -->
  <line x1="305" y1="130" x2="430" y2="130" stroke="#fbbf24" stroke-width="4" marker-end="url(#arr-car-work)"/>
  <rect x="330" y="105" width="130" height="38" rx="4" fill="#0f172a" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="395" y="122" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">正味の仕事 W</text>
  <text x="395" y="136" fill="#cbd5e1" font-size="10" text-anchor="middle">W ＝ Q_in − Q_out</text>

  <!-- 放熱矢印 Qout (機関 -> 低温) -->
  <line x1="270" y1="165" x2="270" y2="197" stroke="#3b82f6" stroke-width="4" marker-end="url(#arr-car-flow)"/>
  <rect x="285" y="172" width="90" height="20" rx="3" fill="#0f172a" stroke="#3b82f6" stroke-width="1"/>
  <text x="330" y="186" fill="#3b82f6" font-size="11" font-weight="700" text-anchor="middle">放熱 Q_out</text>
</svg>
<div class="graph-caption">図: 熱機関のエネルギーフロー図（投入された熱量 <i>Q</i>_in のうち、一部が仕事 <i>W</i> に変換され、残りは <i>Q</i>_out として捨てられる）</div>
</div>

1サイクル回って気体が元の状態に戻ると、内部エネルギー変化は $\Delta U = 0$ です。  
熱力学第1法則（$Q = \Delta U + W$）より：

$$W = Q_{\text{in}} - Q_{\text{out}}$$

投入した熱エネルギー $Q_{\text{in}}$ のうち、どれだけの割合を仕事 $W$ に変換できたかを表す指標を**熱効率 $e$** と呼びます：

$$
\boxed{e = \frac{W}{Q_{\text{in}}} = \frac{Q_{\text{in}} - Q_{\text{out}}}{Q_{\text{in}}} = 1 - \frac{Q_{\text{out}}}{Q_{\text{in}}}}
$$

---

## 3. カルノーサイクルの4工程

理想気体を封入したシリンダーを用いて、摩擦や熱伝導ロスが一切ない「完全可逆」な状態変化を4段階行います。

<div class="vector-graph-card">
<svg viewBox="0 0 540 290" xmlns="http://www.w3.org/2000/svg">
  <!-- P-V 座標軸 -->
  <line x1="80" y1="250" x2="480" y2="250" stroke="#94a3b8" stroke-width="2"/>
  <line x1="80" y1="250" x2="80" y2="30" stroke="#94a3b8" stroke-width="2"/>
  <text x="485" y="254" fill="#94a3b8" font-size="12">V</text>
  <text x="70" y="25" fill="#94a3b8" font-size="12">P</text>

  <!-- 4つの状態点 -->
  <!-- A: (140, 60), B: (240, 100), C: (380, 210), D: (220, 180) -->
  <path d="M 140,60 Q 190,80 240,100" fill="none" stroke="#ef4444" stroke-width="3"/>
  <rect x="150" y="58" width="130" height="20" rx="3" fill="#0f172a" stroke="#ef4444" stroke-width="1"/>
  <text x="215" y="72" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">① 等温膨張 (T_H, Q_in)</text>

  <path d="M 240,100 Q 320,150 380,210" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <rect x="300" y="132" width="115" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="357" y="146" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">② 断熱膨張 (Q=0)</text>

  <path d="M 380,210 Q 300,195 220,180" fill="none" stroke="#3b82f6" stroke-width="3"/>
  <rect x="250" y="205" width="135" height="20" rx="3" fill="#0f172a" stroke="#3b82f6" stroke-width="1"/>
  <text x="317" y="219" fill="#3b82f6" font-size="10" font-weight="700" text-anchor="middle">③ 等温圧縮 (T_L, Q_out)</text>

  <path d="M 220,180 Q 170,120 140,60" fill="none" stroke="#22d3ee" stroke-width="3"/>
  <rect x="100" y="132" width="115" height="20" rx="3" fill="#0f172a" stroke="#22d3ee" stroke-width="1"/>
  <text x="157" y="146" fill="#22d3ee" font-size="10" font-weight="700" text-anchor="middle">④ 断熱圧縮 (Q=0)</text>

  <!-- 点マーク -->
  <circle cx="140" cy="60" r="5" fill="#ef4444"/>
  <text x="125" y="55" fill="#f8fafc" font-size="12" font-weight="700">A</text>

  <circle cx="240" cy="100" r="5" fill="#ef4444"/>
  <text x="248" y="95" fill="#f8fafc" font-size="12" font-weight="700">B</text>

  <circle cx="380" cy="210" r="5" fill="#3b82f6"/>
  <text x="390" y="215" fill="#f8fafc" font-size="12" font-weight="700">C</text>

  <circle cx="220" cy="180" r="5" fill="#3b82f6"/>
  <text x="205" y="195" fill="#f8fafc" font-size="12" font-weight="700">D</text>

  <!-- サイクル内部の仕事 W -->
  <rect x="175" y="125" width="110" height="24" rx="4" fill="#0f172a" stroke="#fbbf24" stroke-width="1.2"/>
  <text x="230" y="141" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">正味の仕事 W</text>
</svg>
<div class="graph-caption">図: カルノーサイクルの <i>P</i>-<i>V</i> 線図（2本の等温変化曲線と2本の断熱変化曲線で囲まれた面積が1サイクルの仕事 <i>W</i>）</div>
</div>

### 工程 ①：$\text{A} \to \text{B}$ 等温膨張（温度 $T_H$ で一定）
気体を高温熱源に接触させ、温度を $T_H$ に保ったままゆっくり膨張させます。
* $\Delta U_{\text{AB}} = 0$（温度一定）
* 高温熱源から熱量 $Q_{\text{in}} = W_{\text{AB}} = n R T_H \ln \left(\frac{V_B}{V_A}\right)$ を吸収します。

### 工程 ②：$\text{B} \to \text{C}$ 断熱膨張（$Q = 0$）
熱源を離し、シリンダー全体を断熱壁で覆ってさらに気体を膨張させます。
* 気体が外部に仕事をするため内部エネルギーが減少し、**温度が $T_H \to T_L$ へと低下**します。
* ポアソンの法則より: $T_H V_B^{\gamma-1} = T_L V_C^{\gamma-1}$

### 工程 ③：$\text{C} \to \text{D}$ 等温圧縮（温度 $T_L$ で一定）
気体を低温熱源に接触させ、温度を $T_L$ に保ったままゆっくり圧縮します。
* $\Delta U_{\text{CD}} = 0$
* 低温熱源へ熱量 $Q_{\text{out}} = -W_{\text{CD}} = n R T_L \ln \left(\frac{V_C}{V_D}\right)$ を放出します。

### 工程 ④：$\text{D} \to \text{A}$ 断熱圧縮（$Q = 0$）
再び断熱壁で覆い、外部から仕事を加えて気体を最初の状態 A まで圧縮します。
* 気体が仕事をされるため内部エネルギーが増加し、**温度が $T_L \to T_H$ へと回復**して1巡します。
* ポアソンの法則より: $T_L V_D^{\gamma-1} = T_H V_A^{\gamma-1}$

---

## 4. カルノー効率の導出と絶対限界

工程②と④のポアソンの法則の式を辺々割り算すると：

$$\frac{T_H V_B^{\gamma-1}}{T_H V_A^{\gamma-1}} = \frac{T_L V_C^{\gamma-1}}{T_L V_D^{\gamma-1}} \implies \left(\frac{V_B}{V_A}\right)^{\gamma-1} = \left(\frac{V_C}{V_D}\right)^{\gamma-1} \implies \boxed{\frac{V_B}{V_A} = \frac{V_C}{V_D}}$$

なんと、**等温膨張での体積比 $\frac{V_B}{V_A}$ と等温圧縮での体積比 $\frac{V_C}{V_D}$ が完全に一致**します！  
したがって、吸熱量と放熱量の比は対数部分が美しく約分され、**温度の比そのもの**になります：

$$\frac{Q_{\text{out}}}{Q_{\text{in}}} = \frac{n R T_L \ln(V_C / V_D)}{n R T_H \ln(V_B / V_A)} = \frac{T_L}{T_H}$$

これを熱効率の式 $e = 1 - \frac{Q_{\text{out}}}{Q_{\text{in}}}$ に代入すると、歴史的公式が得られます：

$$
\boxed{e_{\text{Carnot}} = 1 - \frac{T_L}{T_H}}
$$

::: important カルノーの定理（熱力学第2法則）
同じ温度 $T_H, T_L$ の熱源の間で働くすべての熱機関の中で、**カルノーサイクルの熱効率を超える機関は宇宙に存在しない**（$e_{\text{実在}} \le e_{\text{Carnot}}$）。
:::

---

## 5. 例題での使い方（完全オリジナル）

### 【例題】発電所タービンの理論限界熱効率

```
ある火力発電所では、超臨界蒸気を用いて高温熱源 T_H = 600 ℃（873 K）で熱機関を動かし、
冷却水（海水）を用いて低温熱源 T_L = 27 ℃（300 K）へ放熱している。

(1) この温度差で動作するカルノーサイクルの理論最高熱効率 e_max を求めよ。
(2) この発電所が毎秒 Q_in = 1.0 × 10⁹ J の熱エネルギーを燃料から受け取るとき、
    理論上得られる最大仕事率（発電出力） P_max [MW] を求めよ。
(3) 実際の発電所の熱効率が e = 42 % であるとき、
    毎秒海水中へ捨てられている排熱量 Q_out [J] を求めよ。
```

#### 【解法ステップ】

**Step 1: (1) カルノー効率を計算する**  
温度を必ず絶対温度 $[\text{K}]$ に換算します：
$$T_H = 600 + 273 = 873\,\text{K}, \quad T_L = 27 + 273 = 300\,\text{K}$$
$$e_{\max} = 1 - \frac{T_L}{T_H} = 1 - \frac{300}{873} \approx 1 - 0.3436 = 0.6564 \implies 65.6\%$$

どんなにロスをなくしても、熱エネルギーの約 $34.4\%$ は絶対に海へ捨てなければなりません。

**Step 2: (2) 最大発電出力を計算する**  
$$P_{\max} = \frac{W_{\max}}{\Delta t} = e_{\max} \frac{Q_{\text{in}}}{\Delta t} = 0.6564 \times (1.0 \times 10^9\,\text{W}) \approx 656\,\text{MW}$$

**Step 3: (3) 実際の排熱量を計算する**  
実効率 $e = 0.42$ より、仕事に変わる割合が $42\%$ なので、排熱に回る割合は $1 - e = 58\%$ です：
$$Q_{\text{out}} = (1 - e) Q_{\text{in}} = (1 - 0.42) \times (1.0 \times 10^9) = 0.58 \times 10^9 = 5.8 \times 10^8\,\text{J}$$

**答**: (1) $65.6\%$、(2) $656\,\text{MW}$、(3) $5.8 \times 10^8\,\text{J}$（毎秒約5.8億ジュール）

---

## 6. 要点まとめ

::: tip 📌 カルノーサイクルと熱効率のマスター公式
* **熱効率の基本式**:
  $$e = \frac{W}{Q_{\text{in}}} = 1 - \frac{Q_{\text{out}}}{Q_{\text{in}}}$$
* **カルノー効率（宇宙の理論限界）**:
  $$e = 1 - \frac{T_L}{T_H}$$
  （※温度は必ず絶対温度 $[\text{K}]$ を代入！）
* **ポアソンの法則（断熱変化）**:
  $$P V^\gamma = \text{一定}, \quad T V^{\gamma-1} = \text{一定} \quad \left(\gamma = \frac{C_p}{C_v} > 1\right)$$
:::

<!--@include: ../parts/notice.md-->
