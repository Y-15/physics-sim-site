---
title: 電磁気（Electromagnetism） 厳選演習問題集
description: 高校物理「電磁気（Electromagnetism）」の実践問題・オリジナル解説。基礎から共通テスト・二次試験対策まで、立式プロセスと詳細な計算過程を完全掲載。
---

# 📚 電磁気（Electromagnetism） 厳選演習問題集

電場・電位、コンデンサー回路、直流回路網、磁場とローレンツ力、電磁誘導、交流回路の実効値を網羅した厳選問題集。

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順）

### 第1問: 電位による位置エネルギー

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
電位12 Vの点に電気量3.0 Cの電荷を置きます。電気的位置エネルギーを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

電気的位置エネルギーはU=qVです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
電気的位置エネルギーは36 Jです。

**【詳しい解説】**  
U=qV=3.0×12=36 Jです。電荷と電位の符号にも注意します。

**【立式と計算ステップ】**

**Step 1: 電位と位置エネルギー**
$$
U=qV=3.0\times12=36\ \mathrm{J}
$$
*※ 電位は単位電気量あたりの位置エネルギーです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/field.html">⚡ 電場と電位シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第2問: コンデンサーの電気量とエネルギー

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
容量4.0 μFのコンデンサーに12 Vを加えます。蓄えられる電気量とエネルギーを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

Q=CV、U=1/2CV^2を使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
電気量は48 μC、エネルギーは288 μJです。

**【詳しい解説】**  
Q=4.0×12=48 μC、U=1/2×4.0×12^2=288 μJです。

**【立式と計算ステップ】**

**Step 1: 電気量**
$$
Q=CV=4.0\times10^{-6}\times12=48\times10^{-6}\ \mathrm{C}
$$
*※ μFとμCを使えば、値をそのまま計算できます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/capacitor.html">🔋 コンデンサー回路・静電エネルギー</a> で現象を確認してみよう
</div>

</div>

---

### 第3問: 並列回路の電流

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 3/9)</div>

**【問題】**  
6.0 Ωと3.0 Ωの抵抗を並列につなぎ、両端へ12 Vを加えた。各抵抗を流れる電流と回路全体の電流を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

並列回路では各抵抗の電圧が12 Vです。I=V/Rで各枝を求め、分岐電流を足します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
6.0 Ωには2.0 A、3.0 Ωには4.0 A、全体には6.0 Aが流れます。

**【詳しい解説】**  
並列回路では各抵抗にかかる電圧が等しく12 Vです。オームの法則で枝電流を求め、キルヒホッフの電流則から全体の電流を足し合わせます。

**【立式と計算ステップ】**

**Step 1: 各枝の電流**
$$
I_{6}=\frac{12}{6.0}=2.0\ \mathrm{A},\quad I_{3}=\frac{12}{3.0}=4.0\ \mathrm{A}
$$
*※ 各抵抗の両端電圧は12 Vです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/circuit.html">💡 直流回路・キルヒホッフ・負荷線シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第4問: 直線電流の磁場

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 4/9)</div>

**【問題】**  
長い直線導線に2.0 Aの電流が流れています。導線から0.10 mの点の磁束密度を求めなさい。μ_0=4π×10^-7 T m/Aとします。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

直線電流の磁場B=μ_0I/(2πr)を使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
磁束密度は4.0×10^-6 Tです。

**【詳しい解説】**  
B=(4π×10^-7×2.0)/(2π×0.10)=4.0×10^-6 Tです。

**【立式と計算ステップ】**

**Step 1: 直線電流の磁場**
$$
B=\frac{\mu_0I}{2\pi r}=\frac{4\pi\times10^{-7}\times2.0}{2\pi\times0.10}=4.0\times10^{-6}\ \mathrm{T}
$$
*※ 磁場の向きは右ねじの法則で決まります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/field.html">⚡ クーロン力・電場・電位・電気力線</a> で現象を確認してみよう
</div>

</div>

---

### 第5問: 磁場中の荷電粒子

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 5/9)</div>

**【問題】**  
電気量2.0 μCの粒子が3.0×10^5 m/sで、磁束密度0.20 Tの磁場に垂直に入ります。磁気力の大きさを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

速度と磁場が垂直なのでF=qvBです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
磁気力は0.12 Nです。

**【詳しい解説】**  
F=qvB=2.0×10^-6×3.0×10^5×0.20=0.12 Nです。

**【立式と計算ステップ】**

**Step 1: ローレンツ力**
$$
F=qvB=2.0\times10^{-6}\times3.0\times10^5\times0.20=0.12\ \mathrm{N}
$$
*※ 速度と磁場が垂直でない場合はsinθを掛けます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/lorentz.html">🌀 磁場中のローレンツ力・速度セレクター</a> で現象を確認してみよう
</div>

</div>

---

### 第6問: 電場と電位の重ね合わせ

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 6/9)</div>

**【問題】**  
x軸上のx=-aに+Q、x=+aに-Qを固定した。原点の電位と電場を求め、電位が0でも電場が0とは限らない理由を説明しなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

電位はスカラーとして符号付きで加え、電場は各電荷が原点に作る向きを図示してベクトル合成します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
原点の電位は0、電場は+ x方向に2kQ/a²です。

**【詳しい解説】**  
原点は2つの電荷から同じ距離aにあります。電位はスカラーなので+Qと-Qの寄与が打ち消し合います。一方、電場はどちらの電荷によるものも+x方向を向くため、強さが加わります。

**【立式と計算ステップ】**

**Step 1: 原点の電位**
$$
V=\frac{kQ}{a}+\frac{k(-Q)}{a}=0
$$
*※ 電位はスカラー量です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/field.html">⚡ クーロン力・電場・電位・電気力線</a> で現象を確認してみよう
</div>

</div>

---

### 第7問: 電磁誘導の誘導起電力

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 6/9)</div>

**【問題】**  
100回巻きコイルを通る磁束が0.020 Wbから0 Wbへ0.10 sで変化します。誘導起電力の大きさを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

ファラデーの法則E=N|ΔΦ/Δt|を使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
誘導起電力は20 Vです。

**【詳しい解説】**  
磁束の変化量は0.020 Wbなので、E=100×0.020/0.10=20 Vです。

**【立式と計算ステップ】**

**Step 1: ファラデーの法則**
$$
E=N\left|\frac{\Delta\Phi}{\Delta t}\right|=100\times\frac{0.020}{0.10}=20\ \mathrm{V}
$$
*※ ここでは大きさだけを求めています。向きはレンツの法則で決まります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/induction.html">🧲 電磁誘導・導線棒レール回路</a> で現象を確認してみよう
</div>

</div>

---

### 第8問: 交流回路の実効値

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 7/9)</div>

**【問題】**  
抵抗50 Ωに実効値100 Vの交流電圧を加えます。実効電流と平均消費電力を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

オームの法則とP=V_rms^2/Rを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
実効電流は2.0 A、平均消費電力は200 Wです。

**【詳しい解説】**  
I_rms=100/50=2.0 A、P=100^2/50=200 Wです。

**【立式と計算ステップ】**

**Step 1: 実効電流**
$$
I_{\mathrm{rms}}=\frac{V_{\mathrm{rms}}}{R}=\frac{100}{50}=2.0\ \mathrm{A}
$$
*※ 抵抗だけの交流回路では、実効値でもオームの法則が使えます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/electromagnetism/circuit.html">💡 直流回路・キルヒホッフ・負荷線シミュレーター</a> で現象を確認してみよう
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
