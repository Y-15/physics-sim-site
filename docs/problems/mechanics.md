---
title: 力学（Mechanics） 厳選演習問題集
description: 高校物理「力学（Mechanics）」の実践問題・オリジナル解説。基礎から共通テスト・二次試験対策まで、立式プロセスと詳細な計算過程を完全掲載。
---

# 📚 力学（Mechanics） 厳選演習問題集

等加速度運動、放物運動、運動方程式、力学的エネルギー保存、運動量、円運動など、物理の土台となる力学の厳選問題集。

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順）

### 第1問: 運動量保存の基本

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
質量2.0 kgの台車Aが右向きに3.0 m/sで進み、静止していた質量1.0 kgの台車Bと衝突して一体になった。衝突後の速度を求めなさい。摩擦は無視する。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

右向きを正にし、衝突前後で 2.0×3.0+1.0×0=(2.0+1.0)v と立式します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
衝突後の速度は右向きに2.0 m/sです。

**【詳しい解説】**  
台車AとBを1つの系とみると、衝突中の外力の力積は無視できます。右向きを正として、衝突前後の全運動量を等しくします。最後に、速度が正なので右向きだと確認します。

**【立式と計算ステップ】**

**Step 1: 運動量保存**
$$
2.0\times3.0+1.0\times0=(2.0+1.0)v
$$
*※ 衝突前後で全運動量を等しくします。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/momentum.html">💥 運動量保存・衝突シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第2問: 等加速度運動の速度

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
初速度2.0 m/s、加速度3.0 m/s^2で4.0 s運動する物体の速度を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

速度の公式 v=v_0+at に、分かっている値を代入します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
速度は14 m/sです。

**【詳しい解説】**  
速度の公式に初速度、加速度、時間を代入すると、2.0+3.0×4.0=14となります。

**【立式と計算ステップ】**

**Step 1: 速度の公式**
$$
v=v_0+at=2.0+3.0\times4.0=14\ \mathrm{m/s}
$$
*※ 加速度と時間の積が速度の変化量です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/acceleration.html">🏎️ 等加速度運動 v-t グラフ</a> で現象を確認してみよう
</div>

</div>

---

### 第3問: 鉛直投げ上げの位置

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
物体を初速度20 m/sで鉛直上向きに投げます。g=10 m/s^2として、1.0 s後の高さを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

上向きを正にして y=v_0t-1/2gt^2 を使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
投げた位置から15 mの高さです。

**【詳しい解説】**  
上向きを正にすると加速度は-gです。y=20×1.0-1/2×10×(1.0)^2=15 mとなります。

**【立式と計算ステップ】**

**Step 1: 位置の公式**
$$
y=v_0t-\frac{1}{2}gt^2=20\times1.0-\frac{1}{2}\times10\times(1.0)^2=15\ \mathrm{m}
$$
*※ 鉛直上向きを正にしたため、重力加速度の符号は負です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/projectile.html">🚀 斜方投射・放物運動シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第4問: 運動方程式から加速度

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 3/9)</div>

**【問題】**  
質量2.0 kgの物体を水平方向に6.0 Nの合力で押します。加速度を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

運動方程式 F=ma を使い、aについて解きます。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
加速度は3.0 m/s^2です。

**【詳しい解説】**  
物体には合力6.0 Nが働くので、6.0=2.0aです。したがってa=3.0 m/s^2となります。

**【立式と計算ステップ】**

**Step 1: 運動方程式**
$$
F=ma\quad\Longrightarrow\quad a=\frac{F}{m}=\frac{6.0}{2.0}=3.0\ \mathrm{m/s^2}
$$
*※ Fは物体に働く合力です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/newton.html">⚙️ 滑車・運動の法則シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第5問: 重力による位置エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 4/9)</div>

**【問題】**  
質量2.0 kgの物体を基準面から5.0 mの高さに置きます。g=10 m/s^2として位置エネルギーを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

重力による位置エネルギーはU=mghです。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
位置エネルギーは100 Jです。

**【詳しい解説】**  
基準面を位置エネルギー0とすると、U=2.0×10×5.0=100 Jです。

**【立式と計算ステップ】**

**Step 1: 位置エネルギー**
$$
U=mgh=2.0\times10\times5.0=100\ \mathrm{J}
$$
*※ 基準面の選び方で位置エネルギーの値は変わりますが、差は同じです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/energy.html">⚡ 力学的エネルギー保存シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第6問: 水平面上の動摩擦力

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準・定期テスト (Level 5/9)</div>

**【問題】**  
質量5.0 kgの物体を水平に20 Nで引きます。動摩擦係数を0.20、g=10 m/s^2として加速度を求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

垂直抗力N=mg、動摩擦力f=μNです。引く力から摩擦力を引きます。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
加速度は2.0 m/s^2です。

**【詳しい解説】**  
N=50 N、f=0.20×50=10 Nです。合力は20-10=10 Nなので、a=10/5.0=2.0 m/s^2です。

**【立式と計算ステップ】**

**Step 1: 摩擦力と合力**
$$
N=mg=50\ \mathrm{N},\quad f=\mu N=10\ \mathrm{N},\quad F_{\mathrm{net}}=20-10=10\ \mathrm{N}
$$
*※ 水平面上で鉛直方向に加速度がないため、N=mgです。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/friction.html">📐 摩擦力・摩擦角シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第7問: 衝突とばねの複合問題

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 6/9)</div>

**【問題】**  
水平面上で質量mの小球が速さv₀で進み、静止した質量2mの物体へ完全非弾性衝突した。衝突後、2物体は一体となってばね定数kのばねを縮める。最大圧縮量を求めなさい。摩擦はない。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

衝突中は運動量保存、衝突後から最大圧縮までは力学的エネルギー保存です。衝突で運動エネルギーが保存しない点に注意します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
最大圧縮量は x=v₀√(m/(3k)) です。

**【詳しい解説】**  
まず衝突中だけを考えて運動量を保存します。完全非弾性衝突なので、衝突後の一体化した物体の速さを求めた後、その運動エネルギーがばねの弾性エネルギーへ変わるとして最大圧縮量を求めます。

**【立式と計算ステップ】**

**Step 1: 衝突直後の速度**
$$
mv_0=(m+2m)V\quad\Longrightarrow\quad V=\frac{v_0}{3}
$$
*※ 衝突中は運動量保存を使います。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/momentum.html">💥 運動量保存・衝突シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第8問: 高度による重力加速度

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 6/9)</div>

**【問題】**  
地球の中心から2Rの距離にある場所での重力加速度を、地表のgを使って表しなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

重力加速度は中心からの距離rの2乗に反比例します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
重力加速度はg/4です。

**【詳しい解説】**  
g(r)=GM/r^2より、r=Rのときのgと比べると、距離が2倍なので重力加速度は1/4になります。

**【立式と計算ステップ】**

**Step 1: 重力加速度の比**
$$
\frac{g(2R)}{g(R)}=\left(\frac{R}{2R}\right)^2=\frac{1}{4}
$$
*※ 地球の自転や空気抵抗は考えません。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/gravitation.html">🪐 万有引力・ケプラー則シミュレーター</a> で現象を確認してみよう
</div>

</div>

---

### 第9問: 鉛直面内の円運動

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 共通テスト・入試標準 (Level 7/9)</div>

**【問題】**  
長さlの軽い糸につけた質量mの小球を鉛直面内で回す。円の最高点で糸がたるまないために必要な最小の速さと、そのとき最低点で必要な速さを求めなさい。

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

最高点で張力が0になる場合が限界です。その後、最高点と最低点の間で力学的エネルギー保存を使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
最高点の最小速度は√(gl)、最低点の速度は√(5gl)です。

**【詳しい解説】**  
最高点で糸がたるまない限界では張力が0です。最高点では重力だけが向心力になる条件を使い、その後は最高点から最低点までの高さ2lの位置エネルギー変化を運動エネルギーへ変換します。

**【立式と計算ステップ】**

**Step 1: 最高点の限界条件**
$$
mg=\frac{mv_{\mathrm{top}}^2}{l}\quad\Longrightarrow\quad v_{\mathrm{top}}=\sqrt{gl}
$$
*※ 最高点で張力T=0とします。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/mechanics/circular.html">🔄 等速円運動シミュレーター</a> で現象を確認してみよう
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
