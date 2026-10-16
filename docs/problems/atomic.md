---
title: 原子物理（Atomic Physics） 厳選演習問題集（全21問）
description: 高校物理「原子物理（Atomic Physics）」の実践問題・オリジナル解説。光電効果、X線、コンプトン効果、ド・ブロイ波、ボーア模型、半減期、質量欠損・結合エネルギーまで完全網羅。
---

# 📚 原子物理（Atomic Physics） 厳選演習問題集（全21問）

光量子仮説、光電方程式、物質波、ボーアの量子条件、放射性崩壊と半減期、核エネルギーなど、共通テスト・二次試験で差がつく原子物理の完全問題集。

全問題に「💡 ヒント」「✅ 解答・解説」「立式プロセス・計算過程」、および連動する「動くシミュレーター」へのリンクが付いています。まずは自力でノートに解いてから解説を確認しましょう！

---

## 演習問題一覧（難易度順・全21問）

### 第1問: 光子のエネルギー

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
振動数 6.0×10¹⁴ Hz の光子1個のエネルギーを求めなさい。

プランク定数を

h=6.6×10⁻³⁴ J· s

とする。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

E=hf

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
4.0×10⁻¹⁹ J

**【詳しい解説】**  
E=hf

E=6.6×10⁻³⁴×6.0×10¹⁴

E=3.96×10⁻¹⁹ J

有効数字を考えて、

E=4.0×10⁻¹⁹ J

間違えやすいポイント: 光の振動数が大きいほど、光子1個のエネルギーも大きい。

**【立式と計算ステップ】**

**Step 1: 光子のエネルギーの使用公式**
$$
E=hf
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第2問: 原子の構成

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
原子番号が 8、質量数が 18 の中性原子について、陽子数、中性子数、電子数を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子の構成と原子核（陽子・中性子・電子）</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="80" r="50" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="185" cy="45" r="5" fill="#38bdf8"/>
  <rect x="195" y="35" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="217" y="46" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">電子 (e⁻)</text>
  <circle cx="150" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="150" y="77" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">原子核</text>
  <text x="150" y="90" fill="#fbbf24" font-size="8" text-anchor="middle">陽子＋中性子</text>
  <rect x="270" y="35" width="205" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">質量数 A ＝ 陽子数 Z ＋ 中性子数 N</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">中性原子: 電子数 ＝ 陽子数 Z</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">同位体: Z が同じで A が異なる原子</text>
</svg>
  <div class="graph-caption">原子番号 Z（陽子の数＝中性原子の電子の数）と質量数 A（陽子＋中性子の総数）から構成が決まります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

原子番号は陽子数を表す。

中性原子では、電子数と陽子数は等しい。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
陽子数8

中性子数10

電子数8

**【詳しい解説】**  
陽子数は、

8

電子数も、

8

である。

中性子数は、

18-8=10

である。

間違えやすいポイント: 質量数は陽子数と中性子数の合計である。

**【立式と計算ステップ】**

**Step 1: 原子の構成の使用する関係**
$$
\text{中性子数} = \text{質量数}-\text{原子番号}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第3問: 半減期

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
半減期が 4.0 日の放射性物質が 160 g ある。

12日後に残っている質量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子核の崩壊・半減期と質量エネルギー</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-nu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="100" y="84" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">親核 (N₀)</text>
  <line x1="125" y1="80" x2="185" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-nu-rose)"/>
  <circle cx="215" cy="65" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="215" y="69" fill="#38bdf8" font-size="8" text-anchor="middle">娘核</text>
  <circle cx="240" cy="105" r="8" fill="#fbbf24"/>
  <text x="240" y="108" fill="#0f172a" font-size="8" font-weight="700" text-anchor="middle">α/β</text>
  <rect x="290" y="45" width="190" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">半減期: N ＝ N₀ (½)^(t/T)</text>
  <text x="385" y="82" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">質量欠損: E ＝ Δm c²</text>
</svg>
  <div class="graph-caption">放射性原子核の個数は指数関数的に減少し、質量欠損 Δm により E = Δm c² の莫大な核エネルギーが解放されます。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

12日間には、半減期が、

(12)/(4.0)=3

回含まれる。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
20 g

**【詳しい解説】**  
1回目の半減後は、

1602=80 g

2回目は、

802=40 g

3回目は、

402=20 g

となる。

間違えやすいポイント: 12日後だから12回半減するわけではない。

**【立式と計算ステップ】**

**Step 1: 半減期の使用公式**
$$
N=N_0\left(\frac{1}{2}\right)^n
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第4問: 原子核の陽子数と中性子数

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 1/9)</div>

**【問題】**  
ナトリウム23（原子番号11）の原子核に含まれる陽子数と中性子数を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子の構成と原子核（陽子・中性子・電子）</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <circle cx="150" cy="80" r="50" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="185" cy="45" r="5" fill="#38bdf8"/>
  <rect x="195" y="35" width="45" height="15" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="217" y="46" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">電子 (e⁻)</text>
  <circle cx="150" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="150" y="77" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">原子核</text>
  <text x="150" y="90" fill="#fbbf24" font-size="8" text-anchor="middle">陽子＋中性子</text>
  <rect x="270" y="35" width="205" height="60" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">質量数 A ＝ 陽子数 Z ＋ 中性子数 N</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="9" text-anchor="middle">中性原子: 電子数 ＝ 陽子数 Z</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">同位体: Z が同じで A が異なる原子</text>
</svg>
  <div class="graph-caption">原子番号 Z（陽子の数＝中性原子の電子の数）と質量数 A（陽子＋中性子の総数）から構成が決まります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

原子番号は陽子数、質量数は陽子数と中性子数の合計です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
陽子11個、中性子12個です。

**【詳しい解説】**  
陽子数は原子番号11です。中性子数は23-11=12個です。

**【立式と計算ステップ】**

**Step 1: 原子核の構成**
$$
N=A-Z=23-11=12
$$
*※ Aは質量数、Zは原子番号、中性子数をNとしています。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第5問: 光の波長

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
真空中を進む光の振動数が 5.0×10¹⁴ Hz である。

光速を 3.0×10⁸ m/s として、波長を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光電効果とアインシュタインの光電方程式</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="180" y="50" width="130" height="80" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
  <text x="245" y="70" fill="#94a3b8" font-size="10" text-anchor="middle">金属内部</text>
  <text x="245" y="115" fill="#fbbf24" font-size="9" text-anchor="middle">仕事関数 W</text>
  <path d="M 60,60 Q 80,45 100,60 T 140,60 L 175,75" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <rect x="65" y="25" width="85" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="107" y="38" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">光子 E ＝ hν</text>
  <circle cx="180" cy="75" r="5" fill="#f43f5e"/>
  <line x1="180" y1="75" x2="120" y2="120" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-pe-rose)"/>
  <rect x="65" y="125" width="105" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="117" y="138" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">光電子 K_max</text>
  <rect x="325" y="45" width="160" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="405" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">hν ＝ W ＋ K_max</text>
  <text x="405" y="82" fill="#fbbf24" font-size="9" text-anchor="middle">阻止電圧: eV₀ ＝ K_max</text>
</svg>
  <div class="graph-caption">入射光子のエネルギー hν が金属の仕事関数 W を超えると、余剰が光電子の最大運動エネルギーになります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

c=fλ

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
6.0×10⁻⁷ m

**【詳しい解説】**  
c=fλ

λ=(c)/(f)

λ= (3.0×10⁸)/(5.0×10¹⁴)

λ=6.0×10⁻⁷ m

間違えやすいポイント: 指数の割り算に注意する。

**【立式と計算ステップ】**

**Step 1: 光の波長の使用公式**
$$
c=f\lambda
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第6問: 光電効果

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
ある金属の仕事関数が 3.0×10⁻¹⁹ J である。

この金属に、エネルギー 5.0×10⁻¹⁹ J の光子を当てた。飛び出した光電子の最大運動エネルギーを求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

K_max=E-W

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
2.0×10⁻¹⁹ J

**【詳しい解説】**  
K_max=E-W

K_max = 5.0×10⁻¹⁹ - 3.0×10⁻¹⁹

K_max = 2.0×10⁻¹⁹ J

間違えやすいポイント: 入射光のエネルギーの一部は、電子を金属から取り出すために使われる。

**【立式と計算ステップ】**

**Step 1: 光電効果の使用公式**
$$
K_{\max}=hf-W
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第7問: 質量とエネルギー

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
核反応によって 2.0×10⁻⁹ kg の質量が失われた。

光速を 3.0×10⁸ m/s として、放出されたエネルギーを求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光電効果とアインシュタインの光電方程式</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <rect x="180" y="50" width="130" height="80" rx="4" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
  <text x="245" y="70" fill="#94a3b8" font-size="10" text-anchor="middle">金属内部</text>
  <text x="245" y="115" fill="#fbbf24" font-size="9" text-anchor="middle">仕事関数 W</text>
  <path d="M 60,60 Q 80,45 100,60 T 140,60 L 175,75" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <rect x="65" y="25" width="85" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="107" y="38" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">光子 E ＝ hν</text>
  <circle cx="180" cy="75" r="5" fill="#f43f5e"/>
  <line x1="180" y1="75" x2="120" y2="120" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-pe-rose)"/>
  <rect x="65" y="125" width="105" height="18" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
  <text x="117" y="138" fill="#f43f5e" font-size="10" font-weight="700" text-anchor="middle">光電子 K_max</text>
  <rect x="325" y="45" width="160" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="405" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">hν ＝ W ＋ K_max</text>
  <text x="405" y="82" fill="#fbbf24" font-size="9" text-anchor="middle">阻止電圧: eV₀ ＝ K_max</text>
</svg>
  <div class="graph-caption">入射光子のエネルギー hν が金属の仕事関数 W を超えると、余剰が光電子の最大運動エネルギーになります。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

E=mc²

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.8×10⁸ J

**【詳しい解説】**  
E=mc²

E= 2.0×10⁻⁹ × (3.0×10⁸)²

E= 2.0×10⁻⁹ × 9.0×10¹⁶

E=1.8×10⁸ J

間違えやすいポイント: 光速全体を2乗する。

**【立式と計算ステップ】**

**Step 1: 質量とエネルギーの使用公式**
$$
E=mc^2
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第8問: ボーア模型のエネルギー準位

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
水素原子の電子が、エネルギー -3.4 eV の状態から、エネルギー -13.6 eV の状態へ遷移した。

放出される光子のエネルギーを求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

放出される光子のエネルギーは、二つのエネルギー準位の差である。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
10.2 eV

**【詳しい解説】**  
E= (-3.4)-(-13.6)

E=10.2 eV

間違えやすいポイント: エネルギー準位は負の値で表されるため、符号に注意する。

**【立式と計算ステップ】**

**Step 1: ボーア模型のエネルギー準位の使用する関係**
$$
E_{\mathrm{光子}} = E_{\mathrm{高い準位}} - E_{\mathrm{低い準位}}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第9問: 半減期と放射性物質

<div class="problem-card">

<div class="level-tag">⭐ 基礎 (Level 2/9)</div>

**【問題】**  
半減期が8日で、はじめに80 gあった放射性物質があります。24日後の質量を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子核の崩壊・半減期と質量エネルギー</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-nu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="100" y="84" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">親核 (N₀)</text>
  <line x1="125" y1="80" x2="185" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-nu-rose)"/>
  <circle cx="215" cy="65" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="215" y="69" fill="#38bdf8" font-size="8" text-anchor="middle">娘核</text>
  <circle cx="240" cy="105" r="8" fill="#fbbf24"/>
  <text x="240" y="108" fill="#0f172a" font-size="8" font-weight="700" text-anchor="middle">α/β</text>
  <rect x="290" y="45" width="190" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">半減期: N ＝ N₀ (½)^(t/T)</text>
  <text x="385" y="82" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">質量欠損: E ＝ Δm c²</text>
</svg>
  <div class="graph-caption">放射性原子核の個数は指数関数的に減少し、質量欠損 Δm により E = Δm c² の莫大な核エネルギーが解放されます。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

24日間には半減期が3回含まれます。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
質量は10 gです。

**【詳しい解説】**  
3回半減するので、$80 \times \left(\frac{1}{2}\right)^3 = 10\text{ g}$ です。

**【立式と計算ステップ】**

**Step 1: 放射性物質の減少**
$$
m = 80 \times \left(\frac{1}{2}\right)^{\frac{24}{8}} = 80 \times \left(\frac{1}{2}\right)^3 = 10\text{ g}
$$
*※ 半減期は放射性物質の量が半分になる時間です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第10問: 光子と仕事関数

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 3/9)</div>

**【問題】**  
振動数 8.0×10¹⁴ Hz の光を、仕事関数 3.0×10⁻¹⁹ J の金属に当てた。

プランク定数を 6.6×10⁻³⁴ J· s として、飛び出す光電子の最大運動エネルギーを求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

まず光子1個のエネルギーを求め、その後、仕事関数を引く。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
2.3×10⁻¹⁹ J

**【詳しい解説】**  
光子のエネルギーは、

E=hf

E= 6.6×10⁻³⁴ × 8.0×10¹⁴

E=5.28×10⁻¹⁹ J

したがって、

K_max = 5.28×10⁻¹⁹ - 3.0×10⁻¹⁹

K_max = 2.28×10⁻¹⁹ J

有効数字を考えて、

K_max = 2.3×10⁻¹⁹ J

間違えやすいポイント: 光子のエネルギーが仕事関数より小さいと、光電子は飛び出さない。

もちろんです。前の54問に追加できるように、問題55〜74として20問増やします。すべて独立問題です。

**【立式と計算ステップ】**

**Step 1: 光子と仕事関数の使用公式 1**
$$
E=hf
$$
*※ 問題で使用する関係式です。*

**Step 2: 光子と仕事関数の使用公式 2**
$$
K_{\max}=hf-W
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第11問: 放射性崩壊

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 3/9)</div>

**【問題】**  
半減期が 6.0 h の放射性物質がある。

最初に 3200 個の放射性原子核があったとき、18時間後に崩壊せずに残っている原子核の個数を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子核の崩壊・半減期と質量エネルギー</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-nu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="100" y="84" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">親核 (N₀)</text>
  <line x1="125" y1="80" x2="185" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-nu-rose)"/>
  <circle cx="215" cy="65" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="215" y="69" fill="#38bdf8" font-size="8" text-anchor="middle">娘核</text>
  <circle cx="240" cy="105" r="8" fill="#fbbf24"/>
  <text x="240" y="108" fill="#0f172a" font-size="8" font-weight="700" text-anchor="middle">α/β</text>
  <rect x="290" y="45" width="190" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">半減期: N ＝ N₀ (½)^(t/T)</text>
  <text x="385" y="82" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">質量欠損: E ＝ Δm c²</text>
</svg>
  <div class="graph-caption">放射性原子核の個数は指数関数的に減少し、質量欠損 Δm により E = Δm c² の莫大な核エネルギーが解放されます。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

18時間は半減期3回分である。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
400個

**【詳しい解説】**  
(18)/(6.0)=3

したがって、

N = 3200 ((1)/(2))³

N = 3200×(1)/(8)

N=400

間違えやすいポイント: 崩壊した個数ではなく、残っている個数を求めている。

**【立式と計算ステップ】**

**Step 1: 放射性崩壊の使用公式**
$$
N=N_0\left(\frac{1}{2}\right)^n
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第12問: 質量欠損と結合エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 3/9)</div>

**【問題】**  
核反応で質量欠損が0.0010 u生じました。1 u=931.5 MeV/c^2として、発生するエネルギーを求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子核の崩壊・半減期と質量エネルギー</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-nu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="100" y="84" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">親核 (N₀)</text>
  <line x1="125" y1="80" x2="185" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-nu-rose)"/>
  <circle cx="215" cy="65" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="215" y="69" fill="#38bdf8" font-size="8" text-anchor="middle">娘核</text>
  <circle cx="240" cy="105" r="8" fill="#fbbf24"/>
  <text x="240" y="108" fill="#0f172a" font-size="8" font-weight="700" text-anchor="middle">α/β</text>
  <rect x="290" y="45" width="190" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">半減期: N ＝ N₀ (½)^(t/T)</text>
  <text x="385" y="82" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">質量欠損: E ＝ Δm c²</text>
</svg>
  <div class="graph-caption">放射性原子核の個数は指数関数的に減少し、質量欠損 Δm により E = Δm c² の莫大な核エネルギーが解放されます。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

質量欠損をuで表したとき、931.5 MeVを掛けます。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
発生するエネルギーは0.932 MeVです。

**【詳しい解説】**  
E=0.0010×931.5=0.9315 MeVなので、約0.932 MeVです。

**【立式と計算ステップ】**

**Step 1: 質量とエネルギー**
$$
E=Δm c^2=0.0010×931.5=0.9315 MeV
$$
*※ uを使うと、エネルギーをMeVで直接求められます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第13問: 光電効果

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
仕事関数が 2.2 eV の金属に、波長 400 nm の単色光を当てた。

hc=1240 eV· nm

とする。

1. 光子1個のエネルギーを求めなさい。
2. 放出される光電子の最大運動エネルギーを求めなさい。
3. 光電子を止めるために必要な阻止電圧を求めなさい。
4. この金属から光電子を放出させることのできる限界波長を求めなさい。
5. 光の波長を変えずに強度だけを2倍にしたとき、最大運動エネルギーと単位時間あたりの光電子数がどう変化するか答えなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

光子のエネルギーは、

E=(hc)/(λ)

光電効果の式は、

K_max=E-W

である。

電子の最大運動エネルギーを eV で表せば、阻止電圧の数値と一致する。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1. 3.10 eV
2. 0.90 eV
3. 0.90 V
4. 5.64×10² nm
5. 最大運動エネルギー：変化しない

   光電子数：2倍になる

**【詳しい解説】**  
光子のエネルギーは、

E=(1240)/(400)

E=3.10 eV

最大運動エネルギーは、

K_max=3.10-2.2

K_max=0.90 eV

したがって、阻止電圧は、

V₀=0.90 V

である。

限界波長を λ₀ とすると、

W=(hc)/(λ₀)

λ₀=(1240)/(2.2)

λ₀=564 nm

光の強度を2倍にしても、光子1個のエネルギーは変化しないため、最大運動エネルギーは変わらない。

一方、単位時間あたりに入射する光子数が増えるため、放出される光電子数は増える。

理想的には2倍になる。

間違えやすいポイント: - 光の強度は光電子の最大運動エネルギーを変えない。
- 最大運動エネルギーを決めるのは光の振動数、または波長である。
- 限界波長より長い光では、強度を上げても光電子は出ない。

**【立式と計算ステップ】**

**Step 1: 光電効果の使用公式 1**
$$
E=\frac{hc}{\lambda}
$$
*※ 問題で使用する関係式です。*

**Step 2: 光電効果の使用公式 2**
$$
K_{\max}=hf-W
$$
*※ 問題で使用する関係式です。*

**Step 3: 光電効果の使用公式 3**
$$
eV_0=K_{\max}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第14問: 光電効果

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
仕事関数が 2.0 eV の金属に、波長 400 nm の単色光を当てた。

hc=1240 eV· nm

とする。

1. 光子1個のエネルギーを求めなさい。
2. 光電子の最大運動エネルギーを求めなさい。
3. 阻止電圧を求めなさい。
4. 限界波長を求めなさい。
5. 波長を変えずに光の強度を3倍にすると、最大運動エネルギーと光電流はどのように変化するか。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

光子のエネルギーは、

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1. 3.1 eV
2. 1.1 eV
3. 1.1 V
4. 620 nm
5. 最大運動エネルギーは不変、光電流は3倍

**【詳しい解説】**  
光子のエネルギーは、

E=(1240)/(400)

E=3.1 eV

最大運動エネルギーは、

K_max=3.1-2.0

K_max=1.1 eV

阻止電圧は、

V₀=1.1 V

限界波長は、

λ₀=(1240)/(2.0)

λ₀=620 nm

強度を3倍にしても、光子1個のエネルギーは変わらないため、最大運動エネルギーは変化しない。

光子数が増えるので、光電流は理想的には3倍になる。

**【立式と計算ステップ】**

**Step 1: 光電効果の解法で使用する式 1**
$$
E=\frac{1240}{400}
$$
*※ 問題で使用する関係式です。*

**Step 2: 光電効果の解法で使用する式 2**
$$
E=3.1\ \mathrm{eV}
$$
*※ 問題で使用する関係式です。*

**Step 3: 光電効果の解法で使用する式 3**
$$
K_{\max}=3.1-2.0
$$
*※ 問題で使用する関係式です。*

**Step 4: 光電効果の解法で使用する式 4**
$$
K_{\max}=1.1\ \mathrm{eV}
$$
*※ 問題で使用する関係式です。*

**Step 5: 光電効果の解法で使用する式 5**
$$
V_0=1.1\ \mathrm{V}
$$
*※ 問題で使用する関係式です。*

**Step 6: 光電効果の解法で使用する式 6**
$$
\lambda_0=\frac{1240}{2.0}
$$
*※ 問題で使用する関係式です。*

**Step 7: 光電効果の解法で使用する式 7**
$$
\lambda_0=620\ \mathrm{nm}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第15問: 電子のド・ブロイ波長

<div class="problem-card">

<div class="level-tag">⭐⭐ 標準 (Level 4/9)</div>

**【問題】**  
運動量6.63×10^-24 kg m/sの電子の物質波の波長を求めなさい。プランク定数h=6.63×10^-34 J sとします。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

ド・ブロイの式λ=h/pを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
波長は1.0×10^-10 mです。

**【詳しい解説】**  
λ=6.63×10^-34/(6.63×10^-24)=1.0×10^-10 mです。

**【立式と計算ステップ】**

**Step 1: ド・ブロイの式**
$$
λ=h/p=6.63×10^-34/(6.63×10^-24)=1.0×10^-10 m
$$
*※ 運動量が大きいほど物質波の波長は短くなります。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/matter-wave.html">物質波（ド・ブロイ波）と電子線回折</a> で現象を確認してみよう
</div>

</div>

---

### 第16問: 水素原子と光電効果

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
水素原子のエネルギー準位は、

E_n=-(13.6)/(n²) eV

で表される。

水素原子内の電子が、主量子数 n=3 の状態から n=2 の状態へ遷移した。

hc=1240 eV· nm

とする。

1. 放出される光子のエネルギーを求めなさい。
2. 放出される光の波長を求めなさい。
3. この光を仕事関数 1.50 eV の金属に当てたとき、光電子の最大運動エネルギーを求めなさい。
4. 阻止電圧を求めなさい。
5. n=2 から n=1 への遷移で放出される光子は、基底状態の水素原子を電離できるか答えなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

E₃=-(13.6)/(9)=-1.51 eV

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.89 eV

656 nm

0.39 eV

0.39 V

電離できない

**【詳しい解説】**  
E₃=-(13.6)/(9)=-1.51 eV

E₂=-(13.6)/(4)=-3.40 eV

放出エネルギーは、

E_γ=E₃-E₂

E_γ=1.89 eV

波長は、

λ=(1240)/(1.89)

λ≈656 nm

最大運動エネルギーは、

K_max=1.89-1.50

K_max=0.39 eV

阻止電圧は、

V₀=0.39 V

n=2 から n=1 への遷移エネルギーは、

13.6-3.4=10.2

基底状態の水素原子の電離には 13.6 eV が必要なので、電離できない。

**【立式と計算ステップ】**

**Step 1: 水素原子と光電効果の解法で使用する式 1**
$$
E_3=-\frac{13.6}{9}=-1.51\ \mathrm{eV}
$$
*※ 問題で使用する関係式です。*

**Step 2: 水素原子と光電効果の解法で使用する式 2**
$$
E_2=-\frac{13.6}{4}=-3.40\ \mathrm{eV}
$$
*※ 問題で使用する関係式です。*

**Step 3: 水素原子と光電効果の解法で使用する式 3**
$$
E_\gamma=E_3-E_2
$$
*※ 問題で使用する関係式です。*

**Step 4: 水素原子と光電効果の解法で使用する式 4**
$$
E_\gamma=1.89\ \mathrm{eV}
$$
*※ 問題で使用する関係式です。*

**Step 5: 水素原子と光電効果の解法で使用する式 5**
$$
\lambda=\frac{1240}{1.89}
$$
*※ 問題で使用する関係式です。*

**Step 6: 水素原子と光電効果の解法で使用する式 6**
$$
\lambda\approx656\ \mathrm{nm}
$$
*※ 問題で使用する関係式です。*

**Step 7: 水素原子と光電効果の解法で使用する式 7**
$$
K_{\max}=1.89-1.50
$$
*※ 問題で使用する関係式です。*

**Step 8: 水素原子と光電効果の解法で使用する式 8**
$$
K_{\max}=0.39\ \mathrm{eV}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第17問: 放射性崩壊と放出エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
半減期が 6.0 h の放射性原子核が、初め

N₀=8.0×10¹²個

存在した。

18時間後に残っている原子核数を求めなさい。

18時間の間に崩壊した原子核数を求めなさい。

崩壊定数を s⁻¹ の単位で求めなさい。

18時間後の放射能を求めなさい。

1回の崩壊につき 2.0 MeV のエネルギーが放出されるとき、18時間の間に放出された総エネルギーを求めなさい。

ただし、

ln2=0.693

1 eV=1.6×10⁻¹⁹ J

とする。

<div class="vector-graph-card">
  <div class="graph-title">📐 原子核の崩壊・半減期と質量エネルギー</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-nu-rose" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f43f5e"/></marker>
  </defs>
  <circle cx="100" cy="80" r="22" fill="#1e293b" stroke="#f43f5e" stroke-width="2"/>
  <text x="100" y="84" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">親核 (N₀)</text>
  <line x1="125" y1="80" x2="185" y2="80" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-nu-rose)"/>
  <circle cx="215" cy="65" r="15" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="215" y="69" fill="#38bdf8" font-size="8" text-anchor="middle">娘核</text>
  <circle cx="240" cy="105" r="8" fill="#fbbf24"/>
  <text x="240" y="108" fill="#0f172a" font-size="8" font-weight="700" text-anchor="middle">α/β</text>
  <rect x="290" y="45" width="190" height="48" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="385" y="64" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">半減期: N ＝ N₀ (½)^(t/T)</text>
  <text x="385" y="82" fill="#f43f5e" font-size="9" font-weight="700" text-anchor="middle">質量欠損: E ＝ Δm c²</text>
</svg>
  <div class="graph-caption">放射性原子核の個数は指数関数的に減少し、質量欠損 Δm により E = Δm c² の莫大な核エネルギーが解放されます。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

18時間は半減期3回分である。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
1.0×10¹²個

7.0×10¹²個

3.21×10⁻⁵ s⁻¹

3.21×10⁷ Bq

2.24 J

**【詳しい解説】**  
18時間は半減期3回分である。

N=N₀((1)/(2))³

N=1.0×10¹²個

崩壊した原子核数は、

8.0×10¹²-1.0×10¹²

7.0×10¹²個

半減期を秒に直す。

T=6.0×3600

T=2.16×10⁴ s

崩壊定数は、

λ=(ln2)/(T)

(0.693)/(2.16×10⁴)

λ=3.21×10⁻⁵ s⁻¹

18時間後の放射能は、

A=λ N

3.21×10⁻⁵×1.0×10¹²

A=3.21×10⁷ Bq

1回あたりのエネルギーは、

2.0×10⁶×1.6×10⁻¹⁹

3.2×10⁻¹³ J

したがって、総エネルギーは、

7.0×10¹²×3.2×10⁻¹³

E=2.24 J

間違えやすいポイント: 放射能 (A) と原子核数 (N) は同じ量ではない。

半減期を崩壊定数の式に入れるときは、時間の単位を秒にそろえる。

MeV をジュールへ変換するときは (10^6) を忘れない。

**【立式と計算ステップ】**

**Step 1: 放射性崩壊と放出エネルギーの解法で使用する式 1**
$$
N=N_0\left(\frac12\right)^3
$$
*※ 問題で使用する関係式です。*

**Step 2: 放射性崩壊と放出エネルギーの解法で使用する式 2**
$$
N=1.0\times10^{12}\text{個}
$$
*※ 問題で使用する関係式です。*

**Step 3: 放射性崩壊と放出エネルギーの解法で使用する式 3**
$$
8.0\times10^{12}-1.0\times10^{12}
$$
*※ 問題で使用する関係式です。*

**Step 4: 放射性崩壊と放出エネルギーの解法で使用する式 4**
$$
7.0\times10^{12}\text{個}
$$
*※ 問題で使用する関係式です。*

**Step 5: 放射性崩壊と放出エネルギーの解法で使用する式 5**
$$
T=6.0\times3600
$$
*※ 問題で使用する関係式です。*

**Step 6: 放射性崩壊と放出エネルギーの解法で使用する式 6**
$$
T=2.16\times10^4\ \mathrm{s}
$$
*※ 問題で使用する関係式です。*

**Step 7: 放射性崩壊と放出エネルギーの解法で使用する式 7**
$$
\lambda=\frac{\ln2}{T}
$$
*※ 問題で使用する関係式です。*

**Step 8: 放射性崩壊と放出エネルギーの解法で使用する式 8**
$$
\lambda=3.21\times10^{-5}\ \mathrm{s^{-1}}
$$
*※ 問題で使用する関係式です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/">原子物理シミュレーション一覧</a> で現象を確認してみよう
</div>

</div>

---

### 第18問: 光電子の最大運動エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 5/9)</div>

**【問題】**  
仕事関数2.2 eVの金属へ、光子エネルギー3.0 eVの光を当てた。光電子の最大運動エネルギーと阻止電圧を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

hf=W+K_maxとK_max=eV_sを順に使います。eV単位で扱うと、数値的にK_max[eV]=V_s[V]です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
最大運動エネルギーは0.8 eV、阻止電圧は0.8 Vです。

**【詳しい解説】**  
光子のエネルギーから仕事関数を引いた残りが、光電子の最大運動エネルギーです。eV単位で計算すると、最大運動エネルギーの数値が阻止電圧の数値になります。

**【立式と計算ステップ】**

**Step 1: 光電方程式**
$$
K_max=3.0-2.2=0.8 eV
$$
*※ 光子エネルギーから仕事関数を引きます。*

**Step 2: 阻止電圧**
$$
K_max=eV_s → V_s=0.8 V
$$
*※ 電子1個の電荷eを使います。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第19問: 光電効果の最大運動エネルギー

<div class="problem-card">

<div class="level-tag">⭐⭐⭐ 応用 (Level 6/9)</div>

**【問題】**  
仕事関数2.0 eVの金属に、光子エネルギー3.5 eVの光を当てます。光電子の最大運動エネルギーと阻止電圧を求めなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

アインシュタインの式K_max=hf-Wを使います。eV単位なら阻止電圧の数値と一致します。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
最大運動エネルギーは1.5 eV、阻止電圧は1.5 Vです。

**【詳しい解説】**  
K_max=3.5-2.0=1.5 eVです。K_max=eV_sよりV_s=1.5 Vです。

**【立式と計算ステップ】**

**Step 1: 光電効果の式**
$$
K_max=hf-W=3.5-2.0=1.5 eV
$$
*※ 仕事関数は電子を金属から取り出すための最低エネルギーです。*

**Step 2: 阻止電圧**
$$
K_max=eV_s  →  V_s=1.5 V
$$
*※ 電子ボルトで計算すると、阻止電圧の数値がそのまま得られます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/photoelectric.html">光電効果とアインシュタインの光量子仮説</a> で現象を確認してみよう
</div>

</div>

---

### 第20問: 水素原子のスペクトル

<div class="problem-card">

<div class="level-tag">⭐⭐⭐⭐ 発展・入試 (Level 7/9)</div>

**【問題】**  
水素原子の電子がn=2からn=1へ遷移するときに放出する光のエネルギーと波長を求めなさい。hc=1240 eV nmとします。

<div class="vector-graph-card">
  <div class="graph-title">📐 ボーアの水素原子模型とエネルギー準位</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-bo-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <circle cx="180" cy="80" r="10" fill="#f43f5e"/>
  <text x="180" y="84" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">＋e</text>
  <circle cx="180" cy="80" r="35" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="180" cy="80" r="60" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="215" cy="80" r="5" fill="#38bdf8"/>
  <circle cx="240" cy="80" r="5" fill="#fbbf24"/>
  <line x1="240" y1="80" x2="218" y2="80" stroke="#f43f5e" stroke-width="2"/>
  <path d="M 230,80 Q 245,60 260,80 T 290,80" fill="none" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-bo-cyan)"/>
  <rect x="250" y="55" width="85" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="292" y="67" fill="#38bdf8" font-size="9" font-weight="700" text-anchor="middle">放出光子 hν</text>
  <rect x="340" y="45" width="145" height="45" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="412" y="63" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">振動数条件: hν ＝ E₂ − E₁</text>
  <text x="412" y="79" fill="#fbbf24" font-size="9" text-anchor="middle">量子条件: 2πr ＝ nλ</text>
</svg>
  <div class="graph-caption">電子は量子条件を満たす軌道のみを回り、軌道間の遷移に伴って光子 hν = E₂ - E₁ を放出します。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

E_n=-13.6/n^2 eV、λ=hc/ΔEを使います。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
光のエネルギーは10.2 eV、波長は約122 nmです。

**【詳しい解説】**  
エネルギー差は|−13.6−(−3.40)|=10.2 eVです。λ=1240/10.2≈122 nmとなります。

**【立式と計算ステップ】**

**Step 1: エネルギー準位**
$$
ΔE=|-13.6-(-13.6/4)|=10.2 eV
$$
*※ 放出される光子のエネルギーは準位差の大きさです。*

**Step 2: 光の波長**
$$
λ=hc/ΔE=1240/10.2≈122 nm
$$
*※ hcをeV nmで使うと、波長をnmで求められます。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/bohr.html">ボーアの水素原子模型と量子条件</a> で現象を確認してみよう
</div>

</div>

---

### 第21問: 水素原子の遷移と物質波

<div class="problem-card">

<div class="level-tag">⭐⭐⭐⭐ 発展・入試 (Level 9/9)</div>

**【問題】**  
水素原子の電子がn=3からn=2へ遷移するときに放出される光子のエネルギーと波長を求めなさい。また同じ運動量を持つ電子のド・ブロイ波長との比較方法を説明しなさい。

<div class="vector-graph-card">
  <div class="graph-title">📐 光量子仮説と光子のエネルギー・運動量</div>
  <svg class="vector-svg" viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-pe-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#38bdf8"/></marker>
  </defs>
  <path d="M 50,80 Q 75,45 100,80 T 150,80 T 200,80 L 235,80" fill="none" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-pe-cyan)"/>
  <circle cx="100" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="150" cy="80" r="5" fill="#fbbf24"/>
  <circle cx="200" cy="80" r="5" fill="#fbbf24"/>
  <rect x="90" y="40" width="70" height="16" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="125" y="52" fill="#fbbf24" font-size="9" font-weight="700" text-anchor="middle">光子 (hν)</text>
  <rect x="270" y="35" width="205" height="58" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="372" y="53" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">エネルギー: E ＝ hν ＝ hc / λ</text>
  <text x="372" y="70" fill="#cbd5e1" font-size="10" text-anchor="middle">運動量: p ＝ h / λ ＝ E / c</text>
  <text x="372" y="85" fill="#fbbf24" font-size="9" text-anchor="middle">プランク定数 h ≒ 6.63×10⁻³⁴ J・s</text>
</svg>
  <div class="graph-caption">振動数 ν、波長 λ の光は、エネルギー E = hν = hc/λ、運動量 p = h/λ を持つ粒子（光子）です。</div>
</div>

<details class="hint-box">
<summary>💡 考え方のヒントを見る</summary>

E_n=-13.6/n² eVから準位差を求め、λ=hc/ΔEを使います。電子側はλ=h/pなので、比較には運動量pの情報が必要です。

</details>

<details class="solution-box">
<summary>✅ 解答と丁寧な解説・計算プロセス</summary>

**【正解】**  
光子エネルギーは約1.89 eV、波長は約656 nmです。電子の波長はλ=h/pで、運動量pが分からないため数値比較はできません。

**【詳しい解説】**  
水素原子のn=3とn=2のエネルギー準位を求め、その差が放出光子のエネルギーになります。波長はhc/ΔEで計算します。電子は同じエネルギーではなく「同じ運動量」と条件が指定されているので、比較式はド・ブロイの式を使います。

**【立式と計算ステップ】**

**Step 1: 準位差**
$$
ΔE=|-13.6/2²-(-13.6/3²)|=1.89 eV
$$
*※ 放出される光子のエネルギーです。*

**Step 2: 光の波長**
$$
λ=hc/ΔE≈656 nm
$$
*※ 水素のバルマー系列Hα線に対応します。*

**Step 3: 物質波との比較**
$$
λ_e=h/p
$$
*※ 電子の運動量pの値が必要です。*

</details>

<div class="sim-link-box">
👉 <strong>動かして納得！</strong> <a href="/atomic/bohr.html">ボーアの水素原子模型と量子条件</a> で現象を確認してみよう
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

