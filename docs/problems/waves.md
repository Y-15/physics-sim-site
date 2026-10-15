---
title: 波動（Waves） 厳選演習問題集
description: 高校物理「波動（Waves）」の実践問題・オリジナル解説。基礎から共通テスト・二次試験対策まで、立式プロセスと詳細な計算過程を完全掲載。
---

# 📚 波動（Waves） 厳選演習問題集

波の基本式、定常波、音波、ドップラー効果、ヤングの光干渉、幾何光学（屈折・レンズ）を網羅した厳選問題集。

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順）

### 第1問: 波の速さと波長

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
振動数5.0 Hz、波長0.40 mの波の速さを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

波の基本式v=fλを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
波の速さは2.0 m/sです。

**【詳しい解説】**  
1秒あたり5.0回振動し、1回の波長が0.40 mなので、5.0×0.40=2.0 m/sです。

**【立式と計算ステップ】**

**Step 1: 波の基本式**
$$
v=f\lambda=5.0\times0.40=2.0\ \mathrm{m/s}
$$
*※ 振動数と波長の積が波の速さです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/wave-equation.html">🌊 波の式と y-x / y-t グラフ</a> で現象を確認してみよう
</div>

</div>

---

### 第2問: ヤングの干渉

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
間隔0.50 mmの2つのスリットへ波長600 nmの単色光を当て、2.0 m先のスクリーンに干渉縞を作った。明線の間隔を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

すべてmに直し、縞間隔 Δx=Lλ/d を使います。答えはmm程度になります。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
明線の間隔は2.4 mmです。

**【詳しい解説】**  
スリット間隔d、スクリーンまでの距離L、波長λをすべてSI単位へ直します。ヤングの干渉では、隣り合う明線の間隔はLλ/dで求められます。

**【立式と計算ステップ】**

**Step 1: 単位の変換**
$$
d=5.0\times10^{-4}\ \mathrm{m},\quad \lambda=6.0\times10^{-7}\ \mathrm{m},\quad L=2.0\ \mathrm{m}
$$
*※ 0.50 mm=5.0×10⁻⁴ m、600 nm=6.0×10⁻⁷ mです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/young.html">🌈 ヤングの二重スリット干渉シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第3問: 反射音から距離を求める

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
音を出してから1.0 s後に山から反射音が聞こえました。音速を340 m/sとして山までの距離を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

音は往復するので、距離はvtを2で割ります。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
山までの距離は170 mです。

**【詳しい解説】**  
音が進んだ全距離は340×1.0=340 mです。片道の距離はその半分なので170 mです。

**【立式と計算ステップ】**

**Step 1: 往復距離**
$$
2L=vt\quad\Longrightarrow\quad L=\frac{340\times1.0}{2}=170\ \mathrm{m}
$$
*※ 発した場所から山までを片道の距離Lとしています。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/young.html">🌈 ヤングの二重スリット干渉シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第4問: 弦の定常波の振動数

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 3/9)</div>

**【問題】**  
長さ0.60 mの両端固定の弦を、速さ120 m/sの波が伝わります。2倍振動の振動数を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

両端固定の定常波ではf_n=nv/(2L)です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
振動数は200 Hzです。

**【詳しい解説】**  
n=2を公式に代入すると、f_2=2×120/(2×0.60)=200 Hzです。

**【立式と計算ステップ】**

**Step 1: 定常波の条件**
$$
f_2=\frac{2v}{2L}=\frac{2\times120}{2\times0.60}=200\ \mathrm{Hz}
$$
*※ 2倍振動では弦の長さに半波長が2個入ります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/index.html">🌊 定常波・重ね合わせシミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第5問: 音源が近づくときのドップラー効果

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 4/9)</div>

**【問題】**  
音速340 m/sの空気中で、500 Hzの音源が20 m/sで観測者に近づきます。観測される振動数を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

観測者が静止し音源が近づくとき、f'=vf/(v-v_s)です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
振動数は約531 Hzです。

**【詳しい解説】**  
音源が近づくため波長が短くなります。f'=340×500/(340-20)=531.25 Hzです。

**【立式と計算ステップ】**

**Step 1: ドップラー効果**
$$
f^\prime=\frac{vf}{v-v_s}=\frac{340\times500}{340-20}\simeq531\ \mathrm{Hz}
$$
*※ 音源が観測者へ近づく場合は分母がv-v_sです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/index.html">🚑 ドップラー効果シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第6問: 屈折角を求める

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 5/9)</div>

**【問題】**  
屈折率1.0の空気から屈折率1.5の物質へ、入射角sin i=0.60で光が進みます。屈折角を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

スネルの法則n_1 sin i=n_2 sin rを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
屈折角は約23.6°です。

**【詳しい解説】**  
sin r=(1.0/1.5)×0.60=0.40なので、r=arcsin0.40≈23.6°です。

**【立式と計算ステップ】**

**Step 1: スネルの法則**
$$
n_1\sin i=n_2\sin r\quad\Longrightarrow\quad\sin r=\frac{1.0}{1.5}\times0.60=0.40
$$
*※ 角度は法線から測ります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/optics.html">🔍 光の屈折・全反射・レンズ結像</a> で現象を確認してみよう
</div>

</div>

---

### 第7問: 凸レンズの像の位置

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 6/9)</div>

**【問題】**  
焦点距離0.20 mの凸レンズの前方0.30 mに物体を置きます。像の位置と倍率を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

レンズの公式1/f=1/u+1/vと倍率m=-v/uを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
像はレンズの後方0.60 mにでき、倍率は-2.0です。

**【詳しい解説】**  
1/v=1/0.20-1/0.30=1.667よりv=0.60 mです。倍率は-0.60/0.30=-2.0です。

**【立式と計算ステップ】**

**Step 1: レンズの公式**
$$
\frac{1}{v}=\frac{1}{0.20}-\frac{1}{0.30}\quad\Longrightarrow\quad v=0.60\ \mathrm{m}
$$
*※ 実像なので像はレンズの反対側にできます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/optics.html">🔍 凸レンズ・凹レンズ写像公式</a> で現象を確認してみよう
</div>

</div>

---

### 第8問: 正弦波と位相差

<div class="problem-card">

<div class="level-tag">⭐⭐⭐⭐ 入試発展・二次試験実戦 (Level 8/9)</div>

**【問題】**  
波 y=A sin(4πt-2πx+π/3) がSI単位で表されている。振幅を除く角振動数、振動数、波数、波長、波の速さ、+x方向に0.25 m離れた2点の位相差を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

y=A sin(ωt-kx+φ)と係数を比較し、f=ω/(2π)、λ=2π/k、v=ω/kを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
ω=4π rad/s、f=2.0 Hz、k=2π rad/m、λ=1.0 m、波の速さは2.0 m/s、位相差の大きさはπ/2です。

**【詳しい解説】**  
与えられた波の式を標準形y=A sin(ωt-kx+φ)と比較します。x方向に0.25 m離れた点の位相差はkΔxで求めます。

**【立式と計算ステップ】**

**Step 1: 係数の比較**
$$
\omega=4\pi\ \mathrm{rad/s},\quad k=2\pi\ \mathrm{rad/m}
$$
*※ 波の式のtとxの係数を読み取ります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/waves/young.html">🌈 ヤングの二重スリット干渉シミュレーター</a> で現象を確認してみよう
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
