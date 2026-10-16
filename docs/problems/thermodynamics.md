---
title: 熱力学（Thermodynamics） 厳選演習問題集（全21問）
description: 高校物理「熱力学（Thermodynamics）」の実践問題・オリジナル解説。比熱・熱量保存、状態方程式、分子運動論、熱力学第一法則、P-V図サイクル・熱効率まで完全網羅。
---

# 📚 熱力学（Thermodynamics） 厳選演習問題集（全21問）

熱量保存則、ボイル・シャルル・状態方程式、気体分子運動論、熱力学第一法則、P-Vグラフとカルノーサイクルを自力で解き切る問題集。

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順・全21問）

### 第1問: 熱量

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
質量 200 g の水の温度を 15°C 上昇させる。

水の比熱を 4.2 J/(g· K) として、必要な熱量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

温度差はセルシウス温度でもケルビンでも同じ数値になる。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.26×10⁴ J

**【詳しい解説】**  
Q=mcΔ T

Q=200×4.2×15

Q=12600 J

間違えやすいポイント: 温度そのものではなく、温度変化を使う。

**【立式と計算ステップ】**

**Step 1: 熱量の使用公式**
$$
Q=mc\Delta T
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/heat-capacity.html">比熱・熱容量と熱量保存則</a> で現象を確認してみよう
</div>

</div>

---

### 第2問: ボイルの法則

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
一定温度で、気体の体積を 6.0 L から 2.0 L にした。

最初の圧力が 1.0×10⁵ Pa のとき、変化後の圧力を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

温度一定なので、ボイルの法則を使う。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
3.0×10⁵ Pa

**【詳しい解説】**  
P₁V₁=P₂V₂

1.0×10⁵×6.0=P₂×2.0

P₂=3.0×10⁵ Pa

間違えやすいポイント: 体積が小さくなると圧力は大きくなる。

**【立式と計算ステップ】**

**Step 1: ボイルの法則の使用公式**
$$
PV=\text{一定}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第3問: 気体の圧力と体積

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
温度一定の気体を、圧力1.0×10^5 Pa、体積2.0×10^-2 m^3から体積1.0×10^-2 m^3へ圧縮します。圧力を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

温度一定ならボイルの法則P_1V_1=P_2V_2です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
圧力は2.0×10^5 Paです。

**【詳しい解説】**  
P_2=P_1V_1/V_2=1.0×10^5×2.0×10^-2/(1.0×10^-2)=2.0×10^5 Paです。

**【立式と計算ステップ】**

**Step 1: ボイルの法則**
$$
P_1V_1=P_2V_2  →  P_2=2.0×10^5 Pa
$$
*※ 温度と物質量が一定の変化です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第4問: 比熱

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
質量 300 g の金属に 3600 J の熱を与えたところ、温度が 30°C 上昇した。

金属の比熱を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

熱量の公式を比熱について変形する。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
0.40 J/(g· K)

**【詳しい解説】**  
c=(Q)/(mΔ T)

c=(3600)/(300×30)

c=0.40 J/(g· K)

間違えやすいポイント: 質量の単位と比熱の単位を合わせる。

**【立式と計算ステップ】**

**Step 1: 比熱の使用公式**
$$
Q=mc\Delta T
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第5問: 熱力学第一法則

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
気体が外部から 700 J の熱を受け取り、外部に 250 J の仕事をした。

気体の内部エネルギーの変化を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

気体が外部にした仕事を正とする。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
450 J増加

**【詳しい解説】**  
Δ U=Q-W

Δ U=700-250

Δ U=450 J

間違えやすいポイント: 仕事の符号の定義を確認する。

**【立式と計算ステップ】**

**Step 1: 熱力学第一法則の使用公式**
$$
\Delta U=Q-W
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第6問: 気体の状態方程式

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
物質量 1.0 mol の理想気体が、温度 300 K、体積 0.025 m³ の状態にある。

気体定数を

R=8.3 J/(mol· K)

として、気体の圧力を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

理想気体の状態方程式を使う。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.0×10⁵ Pa

**【詳しい解説】**  
PV=nRT

より、

P=(nRT)/(V)

P= (1.0×8.3×300)/(0.025)

P=9.96×10⁴ Pa

有効数字を考えて、

P=1.0×10⁵ Pa

間違えやすいポイント: 温度はセルシウス温度ではなく絶対温度を使う。

**【立式と計算ステップ】**

**Step 1: 気体の状態方程式の使用公式**
$$
PV=nRT
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第7問: 融解熱

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
0°C の氷 50 g を、すべて 0°C の水にする。

氷の融解熱を 334 J/g として、必要な熱量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

温度は変化せず、状態だけが変化するため、潜熱を使う。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.67×10⁴ J

**【詳しい解説】**  
Q=mL

Q=50×334

Q=16700 J

間違えやすいポイント: 融解中は温度が上昇しない。

**【立式と計算ステップ】**

**Step 1: 融解熱の使用公式**
$$
Q=mL
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第8問: 分子の平均運動エネルギー

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
温度300 Kの理想気体分子1個の平均運動エネルギーを求めなさい。ボルツマン定数を1.38×10^-23 J/Kとします。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体分子運動論と圧力・平均運動エネルギー</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-g-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="80" y="30" width="180" height="100" fill="rgba(30,41,59,0.4)" stroke="#64748b" stroke-width="2"/>
  <circle cx="120" cy="65" r="5" fill="#38bdf8"/>
  <line x1="120" y1="65" x2="150" y2="50" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arr-g-cyan)"/>
  <circle cx="170" cy="100" r="5" fill="#38bdf8"/>
  <line x1="170" y1="100" x2="200" y2="115" stroke="#38bdf8" stroke-width="1.5" marker-end="url(#arr-g-cyan)"/>
  <circle cx="210" cy="60" r="5" fill="#f43f5e"/>
  <line x1="210" y1="60" x2="255" y2="60" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-g-cyan)"/>
  <rect x="290" y="45" width="180" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="380" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">平均運動E: ½ m(v²) ＝ 3/2 kT</text>
  <text x="380" y="82" fill="#fbbf24" font-size="9" text-anchor="middle">二乗平均速度: v_rms ＝ √(3RT/M)</text>
</svg>
  <div class="graph-caption">立方体容器の壁への分子衝突から、気体分子の平均運動エネルギーが絶対温度 T に比例します。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

平均運動エネルギーは $\frac{3}{2}k_B T$ です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
平均運動エネルギーは $6.21 \times 10^{-21}\text{ J}$ です。

**【詳しい解説】**  
$\frac{3}{2} \times 1.38 \times 10^{-23} \times 300 = 6.21 \times 10^{-21}\text{ J}$ です。

**【立式と計算ステップ】**

**Step 1: 平均運動エネルギー**
$$
K = \frac{3}{2} k_B T = \frac{3}{2} \times 1.38 \times 10^{-23} \times 300 = 6.21 \times 10^{-21}\text{ J}
$$
*※ 温度が高いほど分子の平均運動エネルギーは大きくなります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/kinetic-theory.html">気体分子運動論と内部エネルギー</a> で現象を確認してみよう
</div>

</div>

---

### 第9問: 水の混合

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 3/9)</div>

**【問題】**  
80°C の水 100 g と、 20°C の水 200 g を混ぜた。

外部との熱の出入りを無視して、混合後の温度を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

高温の水が失う熱量と、低温の水が得る熱量が等しい。

混合後の温度を T とする。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
40°C

**【詳しい解説】**  
100c(80-T)=200c(T-20)

両辺の c を消す。

100(80-T)=200(T-20)

8000-100T=200T-4000

12000=300T

T=40°C

間違えやすいポイント: 二つの水の温度を単純平均しない。質量が異なる。

**【立式と計算ステップ】**

**Step 1: 水の混合の使用する関係**
$$
\text{失った熱量}=\text{得た熱量}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第10問: 電熱と温度上昇

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 3/9)</div>

**【問題】**  
抵抗 10 の電熱線に 2.0 A の電流を 100 s 流した。

発生した熱がすべて質量 200 g の水に与えられたとする。水の比熱を 4.2 J/(g· K) として、水の温度上昇を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

まずジュール熱を求め、それを水が受け取った熱量とする。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
4.8°C

**【詳しい解説】**  
ジュール熱は、

Q=I²Rt

Q=(2.0)²×10×100

Q=4000 J

水について、

Q=mcΔ T

より、

Δ T=(4000)/(200×4.2)

Δ T=4.76…

Δ T≈4.8°C

間違えやすいポイント: 電熱線で発生した熱量と、水が得た熱量を等しいと置く。

**【立式と計算ステップ】**

**Step 1: 電熱と温度上昇の使用公式 1**
$$
Q=I^2Rt
$$
*※ 問題で使用する関係式です。*

**Step 2: 電熱と温度上昇の使用公式 2**
$$
Q=mc\Delta T
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/heat-capacity.html">比熱・熱容量と熱量保存則</a> で現象を確認してみよう
</div>

</div>

---

### 第11問: 熱力学第一法則

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 3/9)</div>

**【問題】**  
気体が500 Jの熱を受け取り、外部に200 Jの仕事をしました。気体の内部エネルギーの変化を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

気体が外部へした仕事をWとすると、Q=ΔU+Wです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
内部エネルギーは300 J増加します。

**【詳しい解説】**  
ΔU=Q-W=500-200=300 Jです。受け取った熱の一部が仕事に使われました。

**【立式と計算ステップ】**

**Step 1: 熱力学第一法則**
$$
ΔU=Q-W=500-200=300 J
$$
*※ Wは気体が外部へした仕事として正に取っています。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第12問: 単原子分子理想気体の状態変化

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
単原子分子理想気体が、次の状態Aから状態B、状態Cへ順に変化した。

- 状態A：圧力 P₀、体積 V₀
- 状態B：圧力 P₀、体積 2V₀
- 状態C：圧力 2P₀、体積 2V₀

AからBは定圧変化、BからCは定積変化である。

P₀=1.0×10⁵ Pa

V₀=2.0×10⁻² m³

とする。気体が外部にした仕事を正とする。

1. 各状態の絶対温度を T_A を用いて表しなさい。
2. AからBで気体がした仕事、内部エネルギーの変化、気体が受け取った熱量を求めなさい。
3. BからCでの内部エネルギーの変化と、気体が受け取った熱量を求めなさい。
4. AからCまでの全過程で気体が受け取った熱量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

一定量の理想気体では、

T∝ PV

である。

単原子分子理想気体の内部エネルギーは、

U=(3)/(2)nRT=(3)/(2)PV

である。

熱力学第一法則は、

Δ U=Q-W

すなわち、

Q=Δ U+W

である。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1. T_B=2T_A, T_C=4T_A
2. W_AB=2.0×10³ J

Δ U_AB=3.0×10³ J

Q_AB=5.0×10³ J

3. Δ U_BC=Q_BC=6.0×10³ J
4. 1.1×10⁴ J

**【詳しい解説】**  
まず、

P₀V₀ = 1.0×10⁵×2.0×10⁻²

P₀V₀=2.0×10³ J

である。

状態方程式より、

T_A:T_B:T_C = P₀V₀:P₀(2V₀):(2P₀)(2V₀)

=1:2:4

したがって、

T_B=2T_A, T_C=4T_A

である。

AからBで気体がした仕事は、

W_AB=P₀(2V₀-V₀)

W_AB=P₀V₀

W_AB=2.0×10³ J

内部エネルギーの変化は、

Δ U_AB = (3)/(2)(P_BV_B-P_AV_A)

= (3)/(2)(2P₀V₀-P₀V₀)

=(3)/(2)P₀V₀

Δ U_AB=3.0×10³ J

よって、

Q_AB=Δ U_AB+W_AB

Q_AB=3.0×10³+2.0×10³

Q_AB=5.0×10³ J

BからCは定積変化なので、

W_BC=0

である。

内部エネルギーの変化は、

Δ U_BC = (3)/(2)(P_CV_C-P_BV_B)

= (3)/(2)(4P₀V₀-2P₀V₀)

=3P₀V₀

Δ U_BC=6.0×10³ J

したがって、

Q_BC=6.0×10³ J

全過程で受け取った熱量は、

Q_全 = Q_AB+Q_BC

=5.0×10³+6.0×10³

Q_全 = 1.1×10⁴ J

である。

間違えやすいポイント: - 定積変化では仕事は0だが、熱量や内部エネルギー変化は0とは限らない。
- 内部エネルギーは温度だけで決まる。
- PV の値にはエネルギーと同じ単位がある。

**【立式と計算ステップ】**

**Step 1: 単原子分子理想気体の状態変化の使用公式 1**
$$
PV=nRT
$$
*※ 問題で使用する関係式です。*

**Step 2: 単原子分子理想気体の状態変化の使用公式 2**
$$
U=\frac{3}{2}nRT=\frac{3}{2}PV
$$
*※ 問題で使用する関係式です。*

**Step 3: 単原子分子理想気体の状態変化の使用公式 3**
$$
W=P\Delta V
$$
*※ 問題で使用する関係式です。*

**Step 4: 単原子分子理想気体の状態変化の使用公式 4**
$$
Q=\Delta U+W
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第13問: 理想気体の二段階変化

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
一定量の単原子分子理想気体が、次の状態変化をした。

- 状態A：圧力 P₀、体積 V₀
- AからB：圧力を P₀ に保ち、体積を 2V₀ にする
- BからC：体積を 2V₀ に保ち、圧力を 2P₀ にする

P₀V₀=2.0×10³ J

とする。

気体が外部にした仕事を正とする。

1. T_A:T_B:T_C を求めなさい。
2. AからBで気体がした仕事を求めなさい。
3. AからBでの内部エネルギーの変化を求めなさい。
4. AからBで気体が受け取った熱量を求めなさい。
5. BからCで気体が受け取った熱量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

一定量の気体では、

T∝ PV

単原子分子理想気体の内部エネルギーは、

U=(3)/(2)PV

である。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1. 1:2:4
2. 2.0×10³ J
3. 3.0×10³ J
4. 5.0×10³ J
5. 6.0×10³ J

**【詳しい解説】**  
1．温度比

P_AV_A=P₀V₀

P_BV_B=2P₀V₀

P_CV_C=4P₀V₀

したがって、

T_A:T_B:T_C=1:2:4

2．AからBの仕事

W_AB=P₀(2V₀-V₀)

W_AB=P₀V₀

W_AB=2.0×10³ J

3．AからBの内部エネルギー変化

Δ U_AB = (3)/(2)(2P₀V₀-P₀V₀)

Δ U_AB=3.0×10³ J

4．AからBの熱量

Q_AB=Δ U_AB+W_AB

Q_AB=5.0×10³ J

5．BからCの熱量

定積変化なので、

W_BC=0

Q_BC=Δ U_BC

Q_BC = (3)/(2)(4P₀V₀-2P₀V₀)

Q_BC=6.0×10³ J

間違えやすいポイント: 定積変化では仕事は0だが、熱量や内部エネルギー変化まで0になるわけではない。

**【立式と計算ステップ】**

**Step 1: 理想気体の二段階変化の解法で使用する式 1**
$$
T\propto PV
$$
*※ 問題で使用する関係式です。*

**Step 2: 理想気体の二段階変化の解法で使用する式 2**
$$
U=\frac{3}{2}PV
$$
*※ 問題で使用する関係式です。*

**Step 3: 理想気体の二段階変化の解法で使用する式 3**
$$
P_AV_A=P_0V_0
$$
*※ 問題で使用する関係式です。*

**Step 4: 理想気体の二段階変化の解法で使用する式 4**
$$
P_BV_B=2P_0V_0
$$
*※ 問題で使用する関係式です。*

**Step 5: 理想気体の二段階変化の解法で使用する式 5**
$$
P_CV_C=4P_0V_0
$$
*※ 問題で使用する関係式です。*

**Step 6: 理想気体の二段階変化の解法で使用する式 6**
$$
T_A:T_B:T_C=1:2:4
$$
*※ 問題で使用する関係式です。*

**Step 7: 理想気体の二段階変化の解法で使用する式 7**
$$
W_{AB}=P_0(2V_0-V_0)
$$
*※ 問題で使用する関係式です。*

**Step 8: 理想気体の二段階変化の解法で使用する式 8**
$$
W_{AB}=P_0V_0
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第14問: 熱機関の効率

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
熱機関が高温熱源から1000 Jを受け取り、低温熱源へ600 Jを捨てます。仕事と熱効率を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 熱機関のエネルギーの流れと熱効率</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-he-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-he-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="80" y="15" width="120" height="24" rx="4" fill="#f43f5e"/>
  <text x="140" y="31" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">高温熱源 (T_H)</text>
  <circle cx="140" cy="80" r="22" fill="#1e293b" stroke="#fbbf24" stroke-width="2"/>
  <text x="140" y="84" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">機関</text>
  <rect x="80" y="125" width="120" height="24" rx="4" fill="#0284c7"/>
  <text x="140" y="141" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">低温熱源 (T_L)</text>
  <line x1="140" y1="39" x2="140" y2="58" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-he-rose)"/>
  <text x="155" y="52" fill="#f43f5e" font-size="9" font-weight="700">Q₁</text>
  <line x1="140" y1="102" x2="140" y2="125" stroke="#0284c7" stroke-width="3" marker-end="url(#arr-he-cyan)"/>
  <text x="155" y="118" fill="#38bdf8" font-size="9" font-weight="700">Q₂</text>
  <line x1="162" y1="80" x2="225" y2="80" stroke="#fbbf24" stroke-width="3" marker-end="url(#arr-he-cyan)"/>
  <rect x="230" y="70" width="70" height="20" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="265" y="84" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">仕事 W ＝ Q₁−Q₂</text>
  <rect x="315" y="50" width="160" height="42" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="395" y="68" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱効率: e ＝ W / Q₁</text>
  <text x="395" y="84" fill="#cbd5e1" font-size="9" text-anchor="middle">e ＝ (Q₁ − Q₂) / Q₁</text>
</svg>
  <div class="graph-caption">高温熱源から受け取った熱 Q₁ の一部を仕事 W に変え、残りの熱 Q₂ を低温熱源へ放出します。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

仕事W=Q_h-Q_c、熱効率e=W/Q_hです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
仕事は400 J、熱効率は0.40です。

**【詳しい解説】**  
W=1000-600=400 J、e=400/1000=0.40です。百分率では40%です。

**【立式と計算ステップ】**

**Step 1: 仕事**
$$
W=Q_h-Q_c=1000-600=400 J
$$
*※ 受け取った熱のうち、捨てなかった分が仕事になります。*

**Step 2: 熱効率**
$$
e=W/Q_h=400/1000=0.40=40%
$$
*※ 熱効率は1を超えません。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第15問: 水を温める熱量

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
20 ℃の水0.20 kgを80 ℃まで温めるのに必要な熱量を求めなさい。水の比熱を4.2×10³ J/(kg·K)、容器の熱容量と熱損失は無視する。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

温度差は60 Kです。Q=mcΔTへ質量、比熱、温度差を代入します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
必要な熱量は5.04×10⁴ Jです。

**【詳しい解説】**  
温度差は80-20=60 Kです。水だけを考えるので、熱量の公式Q=mcΔTへ質量0.20 kg、比熱4.2×10³ J/(kg·K)、温度差60 Kを代入します。

**【立式と計算ステップ】**

**Step 1: 温度差**
$$
ΔT=80-20=60 K
$$
*※ 温度差は摂氏でもケルビンでも数値が同じです。*

**Step 2: 熱量**
$$
Q=mcΔT=0.20×4.2×10³×60=5.04×10⁴ J
$$
*※ 熱損失と容器の熱容量は無視しています。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/heat-capacity.html">比熱・熱容量と熱量保存則</a> で現象を確認してみよう
</div>

</div>

---

### 第16問: 断熱変化と定積加熱

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
単原子分子理想気体が、初め圧力

P₀=1.0×10⁵ Pa

体積

V₀=2.4×10⁻² m³

の状態Aにある。

気体をゆっくり断熱膨張させ、体積が 2V₀ となった状態をBとする。その後、体積を 2V₀ に保ったまま加熱し、圧力が再び P₀ となった状態をCとする。

単原子分子理想気体について、

γ=(5)/(3)

とし、断熱変化では、

PV^γ=一定

が成り立つものとする。

1. 状態Bの圧力を求めなさい。
2. T_B/T_A を求めなさい。
3. AからBで気体が外部にした仕事を求めなさい。
4. BからCで気体が受け取った熱量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

断熱変化では、

P_AV_A^γ=P_BV_B^γ

を使う。

また、

T∝ PV

である。

断熱変化で気体がした仕事は、

W_AB = (P_AV_A-P_BV_B)/(γ-1)

で求められる。

定積変化では仕事が0なので、

Q_BC=Δ U_BC

である。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.
P_B=P₀ 2^(-5/3) =3.15×10⁴ Pa

2.
(T_B)/(T_A)=2^(-2/3)≈0.630

3.
1.33×10³ J

4.
4.93×10³ J

**【詳しい解説】**  
状態Bでは、

P₀V₀^(5/3) = P_B(2V₀)^(5/3)

したがって、

P_B=P₀((1)/(2))^(5/3)

P_B = 1.0×10⁵×2^(-5/3)

2^(-5/3)≈0.315

より、

P_B=3.15×10⁴ Pa

である。

温度比は、

(T_B)/(T_A) = (P_BV_B)/(P_AV_A)

= 2^(-5/3)×2

=2^(-2/3)

(T_B)/(T_A)≈0.630

となる。

まず、

P₀V₀ = 1.0×10⁵ × 2.4×10⁻²

P₀V₀=2.4×10³ J

状態Bでは、

P_BV_B = P₀V₀ 2^(-2/3)

P_BV_B = 2.4×10³×0.630

P_BV_B=1.51×10³ J

したがって、断熱膨張で気体がした仕事は、

W_AB = (2.4×10³-1.51×10³)/(5/3-1)

= (8.88×10²)/(2/3)

W_AB=1.33×10³ J

となる。

BからCは定積変化である。

状態Cでは、

P_CV_C = P₀(2V₀)

P_CV_C=2P₀V₀

P_CV_C=4.8×10³ J

単原子分子理想気体の内部エネルギーは、

U=(3)/(2)PV

なので、

Q_BC = Δ U_BC

= (3)/(2)(P_CV_C-P_BV_B)

= (3)/(2) (4.8×10³-1.51×10³)

Q_BC=4.93×10³ J

である。

間違えやすいポイント: - 断熱変化は温度一定の変化ではない。
- 断熱膨張では、気体が仕事をするため内部エネルギーと温度が下がる。
- BからCは定積変化なので、受け取った熱量はすべて内部エネルギーの増加になる。

**【立式と計算ステップ】**

**Step 1: 断熱変化と定積加熱の使用公式 1**
$$
PV^\gamma=\text{一定}
$$
*※ 問題で使用する関係式です。*

**Step 2: 断熱変化と定積加熱の使用公式 2**
$$
PV=nRT
$$
*※ 問題で使用する関係式です。*

**Step 3: 断熱変化と定積加熱の使用公式 3**
$$
W= \frac{P_1V_1-P_2V_2}{\gamma-1}
$$
*※ 問題で使用する関係式です。*

**Step 4: 断熱変化と定積加熱の使用公式 4**
$$
U=\frac{3}{2}PV
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第17問: おもり付きピストン

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
鉛直な円筒内に、なめらかに動く断面積

S=1.0×10⁻² m²

質量 20 kg のピストンがある。

ピストンの下には1.0 molの単原子分子理想気体が封入され、上側は大気に接している。

大気圧を

P₀=1.0×10⁵ Pa

気体定数を

R=8.3 J/(mol· K)

重力加速度を

g=10 m/s²

とする。

初めの気体温度は 300 K である。気体をゆっくり加熱し、温度を 450 K にした。

1. 気体の圧力を求めなさい。
2. 加熱前の気体の体積を求めなさい。
3. 加熱後の気体の体積を求めなさい。
4. ピストンの上昇距離を求めなさい。
5. 気体が外部にした仕事を求めなさい。
6. 気体が受け取った熱量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 比熱・熱容量と熱量保存の法則</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-hc-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <rect x="80" y="45" width="130" height="85" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
  <text x="145" y="75" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">物質 (質量 m)</text>
  <text x="145" y="95" fill="#94a3b8" font-size="9" text-anchor="middle">比熱 c [J/(g・K)]</text>
  <text x="145" y="112" fill="#fbbf24" font-size="9" text-anchor="middle">熱容量 C ＝ mc</text>
  <line x1="30" y1="87" x2="75" y2="87" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-hc-rose)"/>
  <rect x="25" y="60" width="45" height="16" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="47" y="72" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">熱量 Q</text>
  <rect x="250" y="35" width="225" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="362" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">熱量: Q ＝ mcΔT ＝ CΔT</text>
  <text x="362" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">熱容量: C ＝ mc [J/K]</text>
  <text x="362" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">熱量保存: 高温側放熱 ＝ 低温側吸熱</text>
</svg>
  <div class="graph-caption">物体が得た熱量 Q は、質量 m、比熱 c、温度変化 ΔT に比例します（Q = mcΔT = CΔT）。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

ピストンの力のつり合いより、

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1. 1.2×10⁵ Pa
2. 2.08×10⁻² m³
3. 3.11×10⁻² m³
4. 1.04 m
5. 1.25×10³ J
6. 3.11×10³ J

**【詳しい解説】**  
ピストンの力のつり合いより、

PS=P₀S+Mg

P=P₀+(Mg)/(S)

P=1.0×10⁵+(20×10)/(1.0×10⁻²)

P=1.2×10⁵ Pa

初めの体積は、

V₁=(nRT₁)/(P)

V₁ = (1.0×8.3×300)/(1.2×10⁵)

V₁=2.075×10⁻² m³

加熱後は、

V₂ = (8.3×450)/(1.2×10⁵)

V₂=3.1125×10⁻² m³

体積変化は、

Δ V=1.0375×10⁻² m³

したがって、上昇距離は、

h=(Δ V)/(S)

h=1.04 m

仕事は、

W=PΔ V

W=1.245×10³ J

内部エネルギー変化は、

Δ U=(3)/(2)nRΔ T

Δ U = (3)/(2)×8.3×150

Δ U=1.87×10³ J

したがって、

Q=Δ U+W

Q=3.11×10³ J

**【立式と計算ステップ】**

**Step 1: おもり付きピストンの解法で使用する式 1**
$$
PS=P_0S+Mg
$$
*※ 問題で使用する関係式です。*

**Step 2: おもり付きピストンの解法で使用する式 2**
$$
P=P_0+\frac{Mg}{S}
$$
*※ 問題で使用する関係式です。*

**Step 3: おもり付きピストンの解法で使用する式 3**
$$
P=1.0\times10^5+\frac{20\times10}{1.0\times10^{-2}}
$$
*※ 問題で使用する関係式です。*

**Step 4: おもり付きピストンの解法で使用する式 4**
$$
P=1.2\times10^5\ \mathrm{Pa}
$$
*※ 問題で使用する関係式です。*

**Step 5: おもり付きピストンの解法で使用する式 5**
$$
V_1=\frac{nRT_1}{P}
$$
*※ 問題で使用する関係式です。*

**Step 6: おもり付きピストンの解法で使用する式 6**
$$
V_1 = \frac{1.0\times8.3\times300}{1.2\times10^5}
$$
*※ 問題で使用する関係式です。*

**Step 7: おもり付きピストンの解法で使用する式 7**
$$
V_1=2.075\times10^{-2}\ \mathrm{m^3}
$$
*※ 問題で使用する関係式です。*

**Step 8: おもり付きピストンの解法で使用する式 8**
$$
V_2 = \frac{8.3\times450}{1.2\times10^5}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第18問: 剛体棒で連結された2つのピストン

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
断面積 3S の大きなピストンと、断面積 S の小さなピストンが、軽い剛体棒で連結されている。

大きなピストンの左側には1 molの単原子分子理想気体A、小さなピストンの右側には1 molの単原子分子理想気体Bが入っている。

大きなピストンの右側、および小さなピストンの左側には外気圧 p₀ がはたらく。

初め、AとBはともに圧力 p₀、温度 T₁ であり、体積は、

V_A1=3V₁

V_B1=V₁

であった。

気体Bをゆっくり断熱圧縮し、

V_B2=(V₁)/(2)

とした。

Bは単原子分子理想気体であり、

γ=(5)/(3)

とする。

1. ピストン系の力のつり合いから、気体AとBの圧力の関係を求めなさい。
2. 圧縮後のBの圧力 p_B2 を求めなさい。
3. 圧縮後のAの圧力 p_A2 を求めなさい。
4. 圧縮後のBの温度 T_B2 を求めなさい。
5. 圧縮後のAの体積 V_A2 を求めなさい。
6. 圧縮後のAの温度 T_A2 を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

2つのピストンと剛体棒を一つの物体として、左右方向の力のつり合いを立てる。

Bは断熱変化するので、

pV^γ=一定

を使う。

2つのピストンは同じ距離だけ動くが、断面積が異なるため、AとBの体積変化は異なる。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.
3p_A-p_B=2p₀

2.
p_B2=2^(5/3)p₀

3.
p_A2 = (2^(5/3)+2)/(3)p₀

4.
T_B2=2^(2/3)T₁

5.
V_A2=(9)/(2)V₁

6.
T_A2 = (1+2^(2/3))T₁

**【詳しい解説】**  
右向きにはたらく力は、

- 気体Aによる力：3Sp_A
- 小ピストン左側の外気圧による力：Sp₀

である。

左向きにはたらく力は、

- 大ピストン右側の外気圧による力：3Sp₀
- 気体Bによる力：Sp_B

である。

力のつり合いより、

3Sp_A+Sp₀ = 3Sp₀+Sp_B

両辺を S で割る。

3p_A+p₀=3p₀+p_B

したがって、

3p_A-p_B=2p₀

である。

Bは断熱変化するので、

p₀V₁^(5/3) = p_B2 ((V₁)/(2))^(5/3)

したがって、

p_B2 = 2^(5/3)p₀

である。

力のつり合いの関係より、

3p_A2-p_B2=2p₀

なので、

p_A2 = (p_B2+2p₀)/(3)

p_A2 = (2^(5/3)+2)/(3)p₀

となる。

Bの温度は、状態方程式より、

(T_B2)/(T₁) = (p_B2V_B2)/(p₀V₁)

である。

(T_B2)/(T₁) = 2^(5/3)×(1)/(2)

(T_B2)/(T₁) = 2^(2/3)

したがって、

T_B2=2^(2/3)T₁

である。

次に、Aの体積を求める。

Bの体積は、

V₁-(V₁)/(2) = (V₁)/(2)

だけ減少した。

小ピストンの移動距離を Δ x とすると、

SΔ x=(V₁)/(2)

である。

大ピストンも同じ距離だけ動くため、Aの体積増加は、

3SΔ x = (3V₁)/(2)

である。

したがって、

V_A2 = 3V₁+(3V₁)/(2)

V_A2 = (9V₁)/(2)

となる。

Aについて状態方程式を用いる。

(T_A2)/(T₁) = (p_A2V_A2)/(p₀V_A1)

(T_A2)/(T₁) = (2^(5/3)+2)/(3) × ((9/2)V₁)/(3V₁)

(T_A2)/(T₁) = (2^(5/3)+2)/(2)

ここで、

(2^(5/3))/(2)=2^(2/3)

なので、

(T_A2)/(T₁) = 1+2^(2/3)

したがって、

T_A2 = (1+2^(2/3))T₁

となる。

間違えやすいポイント: 2つのピストンの移動距離は同じだが、断面積が異なるため、AとBの体積変化は同じではない。

**【立式と計算ステップ】**

**Step 1: 剛体棒で連結された2つのピストンの使用公式 1**
$$
pV=nRT
$$
*※ 問題で使用する関係式です。*

**Step 2: 剛体棒で連結された2つのピストンの使用公式 2**
$$
pV^\gamma=\text{一定}
$$
*※ 問題で使用する関係式です。*

**Step 3: 剛体棒で連結された2つのピストンの使用公式 3**
$$
\Delta V=S\Delta x
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第19問: 理想気体の状態方程式

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
1.0 molの気体が300 K、体積0.0246 m^3にあります。気体定数R=8.31 J/(mol・K)として圧力を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

PV=nRTからP=nRT/Vを作ります。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
圧力は約1.01×10^5 Paです。

**【詳しい解説】**  
P=1.0×8.31×300/0.0246≈1.01×10^5 Paです。

**【立式と計算ステップ】**

**Step 1: 理想気体の状態方程式**
$$
P=nRT/V=1.0×8.31×300/0.0246≈1.01×10^5 Pa
$$
*※ 体積はm^3、温度はKで代入します。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第20問: 単原子分子気体の内部エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 6/9)</div>

**【問題】**  
単原子分子理想気体2.0 molを300 Kから450 Kへ変化させます。内部エネルギーの変化を求めなさい。R=8.31 J/(mol・K)とします。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

単原子分子気体ではΔU=3/2 nRΔTです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
内部エネルギーは3.74×10^3 J増加します。

**【詳しい解説】**  
ΔT=150 Kなので、ΔU=3/2×2.0×8.31×150=3.74×10^3 Jです。

**【立式と計算ステップ】**

**Step 1: 内部エネルギーの変化**
$$
ΔU=3/2 nRΔT=3/2×2.0×8.31×150=3.74×10^3 J
$$
*※ 理想気体の内部エネルギーは温度だけで決まります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/kinetic-theory.html">気体分子運動論と内部エネルギー</a> で現象を確認してみよう
</div>

</div>

---

### 第21問: P-V図と熱力学第一法則

<div class="problem-card">

<div class="level-tag">⭐⭐⭐⭐ 発展・入試 (Level 8/9)</div>

**【問題】**  
単原子分子理想気体n molを、状態(P₀,V₀)から圧力2P₀まで定積加熱し、その後圧力2P₀のまま体積2V₀まで膨張させた。全過程で気体がした仕事、内部エネルギー変化、受け取った熱を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 気体の状態変化とP-V図のサイクル仕事</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="135" x2="430" y2="135" stroke="#64748b" stroke-width="1.5"/>
  <line x1="70" y1="145" x2="70" y2="25" stroke="#64748b" stroke-width="1.5"/>
  <text x="60" y="30" fill="#94a3b8" font-size="10">P</text>
  <text x="425" y="148" fill="#94a3b8" font-size="10">V</text>
  <polygon points="120,110 300,110 260,45 120,45" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="195" y="82" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">仕事 W (面積)</text>
  <rect x="310" y="45" width="165" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="392" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">第1法則: Q ＝ ΔU ＋ W</text>
  <text x="392" y="80" fill="#fbbf24" font-size="9" text-anchor="middle">内部エネルギー: U ＝ 3/2 nRT</text>
</svg>
  <div class="graph-caption">P-Vグラフで囲まれた面積が、気体が外部にした正味の仕事 W に等しくなります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

各状態の温度をPV=nRTで比較します。仕事はP-V図の面積、内部エネルギーはΔU=3nRΔT/2、最後にQ=ΔU+W_byです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
気体がした仕事は2P₀V₀、内部エネルギー変化は(9/2)P₀V₀、受け取った熱は(13/2)P₀V₀です。

**【詳しい解説】**  
初期状態をT₁とすると、定積加熱後は温度2T₁、膨張後は4T₁です。仕事は定圧膨張のP-V図の面積、内部エネルギー変化は単原子理想気体の公式から求め、熱力学第一法則Q=ΔU+Wで熱量を出します。

**【立式と計算ステップ】**

**Step 1: 仕事**
$$
W=2P₀(2V₀-V₀)=2P₀V₀
$$
*※ 定積過程の仕事は0です。*

**Step 2: 内部エネルギー**
$$
ΔU=3/2 nR(4T₁-T₁)=9/2 P₀V₀
$$
*※ P₀V₀=nRT₁を使います。*

**Step 3: 受け取った熱**
$$
Q=ΔU+W=(13/2)P₀V₀
$$
*※ 気体がした仕事を正とする符号の約束です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/">熱力学シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

<!--@include: ../parts/notice.md-->


<style scoped>
.problem-card {
  background: var(--academic-card-bg);
  border: 1px solid var(--academic-card-border);
  border-left: 4px solid var(--academic-accent);
  border-radius: 12px;
  padding: 22px 24px;
  margin: 1.5rem 0 2.2rem 0;
  box-shadow: var(--academic-shadow);
  color: var(--academic-text-main);
}
.level-tag {
  display: inline-block;
  background: rgba(2, 132, 199, 0.1);
  color: var(--academic-accent);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(2, 132, 199, 0.25);
  margin-bottom: 14px;
}
.dark .level-tag {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.3);
}
details {
  background: var(--academic-callout-bg);
  border: 1px solid var(--academic-card-border);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
  color: var(--academic-text-main);
}
summary {
  font-weight: 700;
  cursor: pointer;
  color: var(--academic-text-main);
  user-select: none;
}
.hint-box summary {
  color: #d97706;
}
.dark .hint-box summary {
  color: #fbbf24;
}
.solution-box summary {
  color: #059669;
}
.dark .solution-box summary {
  color: #34d399;
}
.sim-link-box {
  background: var(--academic-callout-bg);
  border: 1px dashed var(--academic-accent);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  margin-top: 14px;
  color: var(--academic-text-main);
}
</style>

