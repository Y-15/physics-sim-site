---
title: 熱力学（Thermodynamics） 厳選演習問題集
description: 高校物理「熱力学（Thermodynamics）」の実践問題・オリジナル解説。基礎から共通テスト・二次試験対策まで、立式プロセスと詳細な計算過程を完全掲載。
---

# 📚 熱力学（Thermodynamics） 厳選演習問題集

熱量・比熱、気体の状態方程式、気体分子運動論、P-V図サイクルと熱力学第1法則、熱効率を網羅した厳選問題集。

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順）

### 第1問: 気体の圧力と体積

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
温度一定の気体を、圧力1.0×10^5 Pa、体積2.0×10^-2 m^3から体積1.0×10^-2 m^3へ圧縮します。圧力を求めなさい。

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
P_1V_1=P_2V_2\quad\Longrightarrow\quad P_2=2.0\times10^5\ \mathrm{Pa}
$$
*※ 温度と物質量が一定の変化です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/gas-law.html">🔥 気体の状態変化・P-V図シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第2問: 分子の平均運動エネルギー

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
温度300 Kの理想気体分子1個の平均運動エネルギーを求めなさい。ボルツマン定数を1.38×10^-23 J/Kとします。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

平均運動エネルギーは3/2 kTです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
平均運動エネルギーは6.21×10^-21 Jです。

**【詳しい解説】**  
3/2×1.38×10^-23×300=6.21×10^-21 Jです。

**【立式と計算ステップ】**

**Step 1: 平均運動エネルギー**
$$
K=\frac{3}{2}kT=\frac{3}{2}\times1.38\times10^{-23}\times300=6.21\times10^{-21}\ \mathrm{J}
$$
*※ 温度が高いほど分子の平均運動エネルギーは大きくなります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/kinetic-theory.html">🔬 気体分子運動論・二乗平均速度</a> で現象を確認してみよう
</div>

</div>

---

### 第3問: 熱力学第一法則

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 3/9)</div>

**【問題】**  
気体が500 Jの熱を受け取り、外部に200 Jの仕事をしました。気体の内部エネルギーの変化を求めなさい。

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
\Delta U=Q-W=500-200=300\ \mathrm{J}
$$
*※ Wは気体が外部へした仕事として正に取っています。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/gas-law.html">🔥 P-V図サイクルと第1法則熱量収支</a> で現象を確認してみよう
</div>

</div>

---

### 第4問: 水を温める熱量

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 4/9)</div>

**【問題】**  
20 ℃の水0.20 kgを80 ℃まで温めるのに必要な熱量を求めなさい。水の比熱を4.2×10³ J/(kg·K)、容器の熱容量と熱損失は無視する。

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
\Delta T=80-20=60\ \mathrm{K}
$$
*※ 温度差は摂氏でもケルビンでも数値が同じです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/gas-law.html">🔥 気体の状態変化・P-V図シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第5問: 熱機関の効率

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 4/9)</div>

**【問題】**  
熱機関が高温熱源から1000 Jを受け取り、低温熱源へ600 Jを捨てます。仕事と熱効率を求めなさい。

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
W=Q_h-Q_c=1000-600=400\ \mathrm{J}
$$
*※ 受け取った熱のうち、捨てなかった分が仕事になります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/gas-law.html">🔥 気体の状態変化・P-V図シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第6問: 理想気体の状態方程式

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 5/9)</div>

**【問題】**  
1.0 molの気体が300 K、体積0.0246 m^3にあります。気体定数R=8.31 J/(mol・K)として圧力を求めなさい。

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
P=\frac{nRT}{V}=\frac{1.0\times8.31\times300}{0.0246}\simeq1.01\times10^5\ \mathrm{Pa}
$$
*※ 体積はm^3、温度はKで代入します。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/gas-law.html">🔥 気体の状態変化・P-V図シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第7問: 単原子分子気体の内部エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 6/9)</div>

**【問題】**  
単原子分子理想気体2.0 molを300 Kから450 Kへ変化させます。内部エネルギーの変化を求めなさい。R=8.31 J/(mol・K)とします。

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
\Delta U=\frac{3}{2}nR\Delta T=\frac{3}{2}\times2.0\times8.31\times150\simeq3.74\times10^3\ \mathrm{J}
$$
*※ 理想気体の内部エネルギーは温度だけで決まります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/kinetic-theory.html">🔬 気体分子運動論・二乗平均速度</a> で現象を確認してみよう
</div>

</div>

---

### 第8問: P-V図と熱力学第一法則

<div class="problem-card">

<div class="level-tag">⭐⭐⭐⭐ 入試発展・二次試験実戦 (Level 8/9)</div>

**【問題】**  
単原子分子理想気体n molを、状態(P₀,V₀)から圧力2P₀まで定積加熱し、その後圧力2P₀のまま体積2V₀まで膨張させた。全過程で気体がした仕事、内部エネルギー変化、受け取った熱を求めなさい。

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
W=2P_0(2V_0-V_0)=2P_0V_0
$$
*※ 定積過程の仕事は0です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/thermodynamics/gas-law.html">🔥 P-V図サイクルと第1法則熱量収支</a> で現象を確認してみよう
</div>

</div>

---

<!--@include: ../parts/notice.md-->

<style scoped>
.problem-card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
  margin: 1.2rem 0 2rem 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
.level-tag {
  display: inline-block;
  background: #27272a;
  color: #38bdf8;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 9999px;
  border: 1px solid #3f3f46;
  margin-bottom: 12px;
}
details {
  background: #202024;
  border: 1px solid #333338;
  border-radius: 8px;
  padding: 12px 16px;
  margin: 12px 0;
}
summary {
  font-weight: 600;
  cursor: pointer;
  color: #e4e4e7;
  user-select: none;
}
summary:hover {
  color: #38bdf8;
}
.hint-box summary {
  color: #fbbf24;
}
.solution-box summary {
  color: #34d399;
}
.sim-link-box {
  background: rgba(56, 189, 248, 0.08);
  border: 1px dashed #0284c7;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
  margin-top: 14px;
}
</style>
