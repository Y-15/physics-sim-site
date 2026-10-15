---
title: 薄膜干渉とニュートンリング・くさび形空気層の完全攻略
description: 高校物理の光の干渉最頻出分野。固定端反射による位相の反転（πのズレ）、光路差（光学距離）2nd cos r の導出、くさび形空気層の明線間隔、ニュートンリングの中心暗環の理由と半径公式をシミュレーションとオリジナル例題で完全網羅。
---

# 薄膜干渉とニュートンリング・くさび形空気層の完全攻略

<div class="lead">
シャボン玉がふわふわ浮かぶとき、なぜ表面は虹のように鮮やかに色づくのでしょうか？<br>
また、平らなガラスの上に凸レンズを重ねて上から光を当てると、なぜ美しい同心円の縞模様（<strong>ニュートンリング</strong>）が現れ、その中心は真っ黒（暗環）になるのでしょうか？<br>
この疑問を解き明かすのが「光の薄膜干渉」です。<br>
本ページでは、入試で合否を分ける<strong>「反射時の位相の反転（固定端反射）」</strong>の絶対ルールから、幾何学的な光路差の導出までを完全攻略します。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **シャボン玉・水たまりの油膜**: 膜の厚さが光の波長と同程度（数百ナノメートル）のとき、表面反射光と裏面反射光が強め合って鮮やかな色が見える。
* **カメラレンズの反射防止コーティング（無反射膜）**: 膜厚を $\lambda/4$ に設計し、反射光同士を完全に逆位相（弱め合い）にして打ち消すことで、光の透過率を99%以上に高める。
* **ニュートンリングによるレンズ曲率検査**: 縞の半径を測定することで、ナノメートル精度の超精密なレンズ曲率半径 $R$ を非破壊で測定できる。

### 学習の到達目標
1. **位相変化の絶対判定**: 「屈折率 小 $\to$ 大」の反射では位相が $\pi$ 反転（固定端反射）し、「大 $\to$ 小」では変化しないことを迷わず判定できる。
2. **光路差（光学距離）の導出**: 屈折率 $n$ の媒質中を光が進むとき、実距離の $n$ 倍（$n \times \text{距離}$）遅れる理屈から、斜め入射の光路差 $\Delta = 2nd\cos r$ を自力で導出できる。
3. **くさび形空気層・ニュートンリングの公式制覇**: 明線間隔 $\Delta x = \frac{L\lambda}{2d}$ や、ニュートンリングの明環・暗環半径 $r_m = \sqrt{m R \lambda}$ を近似計算（三平方の定理）から導出できる。

---

## 🧪 インタラクティブ実験室

薄膜の厚さ $d$ や屈折率 $n$ をスライダーで動かし、反射光の干渉色やニュートンリングの同心円縞がどのように変化するか観察してみましょう。

<ThinFilmSim />

---

## 2. 反射時の位相変化（最重要ルール）

光が異なる媒質の境界面で反射するとき、**媒質の屈折率の大小関係によって位相が反転するかどうかが決まります**。

::: important 反射の位相ルール（力学の固定端・自由端と同じ！）
* **【固定端反射（位相が $\pi$ 反転）】**:
  **屈折率が「小さい媒質」から「大きい媒質」へ向かって反射するとき**（疎 $\to$ 密）  
  例：空気（$n=1.0$）からガラス（$n=1.5$）表面での反射、空気から水面での反射。  
  $\implies$ **山が谷に、谷が山にひっくり返る（半波長 $\frac{\lambda}{2}$ の遅れと等価！）**

* **【自由端反射（位相は不変）】**:
  **屈折率が「大きい媒質」から「小さい媒質」へ向かって反射するとき**（密 $\to$ 疎）  
  例：ガラス（$n=1.5$）の中から空気（$n=1.0$）境界での反射。  
  $\implies$ **位相の変化なし（$0$）**
:::

---

## 3. 平行薄膜の光路差導出（完全幾何ステップ）

屈折率 $n$、厚さ $d$ の薄膜に、空気中から入射角 $i$（屈折角 $r$）で波長 $\lambda$ の光が入射するモデルを考えます。

<div class="vector-graph-card">
<svg viewBox="0 0 540 290" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-tf-ray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
  </defs>

  <!-- 空気層 (上部) -->
  <rect x="30" y="20" width="480" height="70" fill="rgba(30, 41, 59, 0.4)"/>
  <text x="45" y="45" fill="#94a3b8" font-size="12">空気 (屈折率 1.0)</text>

  <!-- 薄膜 (中央: y = 90..210, 厚さ d = 120) -->
  <rect x="30" y="90" width="480" height="120" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="2"/>
  <text x="45" y="115" fill="#38bdf8" font-size="12" font-weight="700">薄膜 (屈折率 n, 厚さ d)</text>

  <!-- 膜厚 d の寸法矢印 -->
  <line x1="500" y1="90" x2="500" y2="210" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="495" y1="90" x2="505" y2="90" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="495" y1="210" x2="505" y2="210" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="480" y="155" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="end">厚さ d</text>

  <!-- 法線 (x = 180, x = 300) -->
  <line x1="180" y1="50" x2="180" y2="240" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>
  <line x1="300" y1="50" x2="300" y2="130" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3"/>

  <!-- 光線 1 (表面反射: 点 A = (180, 90)) -->
  <line x1="100" y1="30" x2="180" y2="90" stroke="#38bdf8" stroke-width="2.5"/>
  <line x1="180" y1="90" x2="260" y2="30" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arr-tf-ray)"/>
  <circle cx="180" cy="90" r="4" fill="#f43f5e"/>
  <text x="170" y="82" fill="#f43f5e" font-size="13" font-weight="700">点 A</text>

  <!-- 光線 2 (膜内屈折: 点 A(180,90) -> 点 B(240, 210) -> 点 C(300, 90)) -->
  <line x1="180" y1="90" x2="240" y2="210" stroke="#38bdf8" stroke-width="2.5"/>
  <circle cx="240" cy="210" r="4" fill="#fbbf24"/>
  <text x="240" y="230" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="middle">点 B</text>

  <line x1="240" y1="210" x2="300" y2="90" stroke="#38bdf8" stroke-width="2.5"/>
  <circle cx="300" cy="90" r="4" fill="#10b981"/>
  <text x="310" y="82" fill="#10b981" font-size="13" font-weight="700">点 C</text>

  <!-- 点 C からの反射光 -->
  <line x1="300" y1="90" x2="380" y2="30" stroke="#10b981" stroke-width="2.5" marker-end="url(#arr-tf-ray)"/>

  <!-- 同波面垂線 (点 A から光線2の反射光へ下ろした垂線の足 点 D) -->
  <line x1="180" y1="90" x2="240" y2="45" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,3"/>
  <circle cx="240" cy="45" r="3" fill="#fbbf24"/>
  <rect x="245" y="28" width="85" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="287" y="41" fill="#fbbf24" font-size="10" font-weight="600" text-anchor="middle">点 D (等波面)</text>

  <!-- 角度表示 -->
  <rect x="135" y="52" width="60" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="165" y="65" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">入射角 i</text>
  <rect x="180" y="112" width="60" height="18" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
  <text x="210" y="125" fill="#38bdf8" font-size="10" font-weight="600" text-anchor="middle">屈折角 r</text>
</svg>
<div class="graph-caption">図: 薄膜干渉の光路差作図（屈折率 <i>n</i> の膜内を進む光学距離 <i>n</i>(AB + BC) と空気中を進む距離 AD の差が 2<i>nd</i> cos <i>r</i> となる）</div>
</div>

空気中での幾何学的経路差に屈折率 $n$ を乗じた**光学距離（光路長）の差 $\Delta$** は、スネルの法則 $\sin i = n \sin r$ を用いて次のように極めて美しくまとまります：

$$
\boxed{\Delta = 2 n d \cos r}
$$

* **垂直入射（$i = 0, r = 0$）のとき**:
  $$\cos 0 = 1 \implies \Delta = 2nd$$
  （単に膜の厚さ $d$ を往復 $2d$ し、屈折率 $n$ 倍した光学距離 $2nd$ となります）

### 干渉条件（反射光）
空気中の薄膜（$n_{\text{空気}} = 1 < n_{\text{膜}}$）の場合、表面（点A）で固定端反射（位相 $\pi$ 反転）し、裏面（点B）では自由端反射（位相不変）するため、**反射光同士の位相はあらかじめ $\pi$（半波長分）ズレています**：

* **強め合い（明条）の条件**:
  $$2 n d \cos r = \left(m + \frac{1}{2}\right)\lambda \quad (m = 0, 1, 2, \dots)$$
* **弱め合い（暗条）の条件**:
  $$2 n d \cos r = m \lambda \quad (m = 0, 1, 2, \dots)$$

---

## 4. ニュートンリング（Newton's Rings）

平らなガラス板の上に、曲率半径 $R$ の大きな平凸レンズを載せ、上方から波長 $\lambda$ の単色光を当てて反射光を観察します。

### (1) 空気層の厚さ $d$ の幾何導出
中心からの距離を $r$ とすると、直角三角形の三平方の定理より：

$$R^2 = (R - d)^2 + r^2 = R^2 - 2Rd + d^2 + r^2$$

$d \ll R$ なので微小量 $d^2 \approx 0$ と無視すると：

$$2Rd \approx r^2 \implies \boxed{d \approx \frac{r^2}{2R}}$$

<div class="vector-graph-card">
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg">
  <!-- 平板ガラス (y = 170) -->
  <line x1="50" y1="170" x2="490" y2="170" stroke="#94a3b8" stroke-width="3"/>
  <text x="495" y="174" fill="#94a3b8" font-size="12">平面ガラス板</text>

  <!-- 平凸レンズの球面 (中心 cx=270, R=300) -->
  <path d="M 90,120 Q 270,170 450,120" fill="none" stroke="#38bdf8" stroke-width="3"/>
  <text x="455" y="125" fill="#38bdf8" font-size="12">平凸レンズ (曲率半径 R)</text>

  <!-- 接触点 O (x = 270, y = 170) -->
  <circle cx="270" cy="170" r="5" fill="#f43f5e"/>
  <rect x="185" y="185" width="170" height="22" rx="4" fill="#0f172a" stroke="#f43f5e" stroke-width="1.2"/>
  <text x="270" y="200" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">接触点 O (d = 0, 中心暗斑)</text>

  <!-- 任意位置 r (x = 380, y = 170) -->
  <line x1="270" y1="170" x2="380" y2="170" stroke="#fbbf24" stroke-width="1.5"/>
  <rect x="305" y="172" width="45" height="18" rx="3" fill="#0f172a" stroke="#fbbf24" stroke-width="1"/>
  <text x="327" y="185" fill="#fbbf24" font-size="10" font-weight="700" text-anchor="middle">半径 r</text>

  <!-- 空気層厚さ d (x = 380 でのレンズと板の間隔) -->
  <line x1="380" y1="170" x2="380" y2="150" stroke="#10b981" stroke-width="2"/>
  <rect x="390" y="150" width="100" height="20" rx="3" fill="#0f172a" stroke="#10b981" stroke-width="1"/>
  <text x="440" y="164" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">d ≈ r² / (2R)</text>

  <!-- 反射光の位相判定 -->
  <rect x="80" y="38" width="380" height="52" rx="5" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>
  <text x="95" y="58" fill="#38bdf8" font-size="11" font-weight="600">① レンズ下面反射: ガラス → 空気（位相変化なし 0）</text>
  <text x="95" y="78" fill="#f43f5e" font-size="11" font-weight="700">② 平板ガラス上面反射: 空気 → ガラス（位相 π 反転！）</text>
</svg>
<div class="graph-caption">図: ニュートンリングの空気層厚さ近似（<i>d</i> ≈ <i>r</i>² / 2<i>R</i>）と2つの境界面での位相判定</div>
</div>

### (2) 干渉条件と明環・暗環の半径
空気中（$n=1$）の垂直往復光路差は $\Delta = 2d$ です。
平板ガラス上面での反射のみ位相が $\pi$ 反転するため：

* **暗環（弱め合い）の条件**:
  $$2d = m\lambda \iff 2\left(\frac{r^2}{2R}\right) = m\lambda \implies \boxed{r_m = \sqrt{m R \lambda}} \quad (m = 0, 1, 2, \dots)$$
* **明環（強め合い）の条件**:
  $$2d = \left(m + \frac{1}{2}\right)\lambda \implies \boxed{r_m = \sqrt{\left(m + \frac{1}{2}\right) R \lambda}} \quad (m = 0, 1, 2, \dots)$$

::: danger 中心が必ず「暗環」になる理由
$m = 0$ のとき、接触点 $r = 0$（厚さ $d = 0$）となります。  
光路差はゼロですが、下側反射での位相反転 $\pi$ が残るため、中心は**絶対に暗環（真っ黒）**になります！  
もし中心が「明環」と書かれている参考書や解答があれば、それは透過光を見ている場合か誤りです。
:::

---

## 5. 例題での使い方（完全オリジナル）

### 【例題】ニュートンリングの隙間に液体を注入する問題

```
曲率半径 R = 10.0 m の平凸レンズを平面ガラス板の上に置き、
波長 λ = 600 nm の単色光を上方から垂直に照射したところ、
同心円状の干渉縞が観測された。

(1) 空気中での第 4 暗環（m = 4）の半径 r₄ [mm] を求めよ。
(2) レンズとガラス板の隙間に、ある透明な液体（屈折率 n = 1.44）を満たした。
    このとき、第 4 暗環の半径 r₄' [mm] はいくらになるか。
```

#### 【解法ステップ】

**Step 1: (1) 空気中での第4暗環の半径を計算する**  
暗環半径の公式 $r_m = \sqrt{m R \lambda}$ より：
$$r_4 = \sqrt{4 \times R \times \lambda} = \sqrt{4 \times 10.0 \times (600 \times 10^{-9})} = \sqrt{2.4 \times 10^{-5}}\,\text{m}$$
$$r_4 = \sqrt{24 \times 10^{-6}} = 2\sqrt{6} \times 10^{-3}\,\text{m} \approx 2 \times 2.449 \times 10^{-3} = 4.90 \times 10^{-3}\,\text{m} = 4.90\,\text{mm}$$

**Step 2: (2) 液体（屈折率 $n = 1.44$）を注入したときの半径を計算する**  
液体の屈折率がガラス（$n_{\text{glass}} \approx 1.5$）より小さいため、下面反射での位相 $\pi$ 反転ルールは変わりません。  
液体中での光路長は $2 n d$ となり、暗環条件は：
$$2 n d = m \lambda \iff 2 n \left(\frac{r^2}{2R}\right) = m \lambda \implies r'_m = \sqrt{\frac{m R \lambda}{n}} = \frac{r_m}{\sqrt{n}}$$

したがって、半径は $\frac{1}{\sqrt{n}}$ 倍に縮みます：
$$r_4' = \frac{r_4}{\sqrt{1.44}} = \frac{4.90}{1.2} = 4.08\,\text{mm}$$

**答**: (1) $4.90\,\text{mm}$、(2) $4.08\,\text{mm}$（縞の間隔が内側に縮む）

---

## 6. 要点まとめ

::: tip 📌 薄膜干渉・ニュートンリングの完全整理
* **固定端反射の判定**:
  小 $\to$ 大の反射のみ位相が $\pi$ 反転（半波長 $\lambda/2$ のズレ）。
* **光路差の公式**:
  平行薄膜: $\Delta = 2nd\cos r$  
  ニュートンリング: $\Delta = 2nd \approx \frac{n r^2}{R}$
* **ニュートンリングの中心**:
  接触面 $r = 0$ では反射光の位相が逆転しているため、**常に暗環**。
* **液体を入れると**:
  実質波長が $\lambda/n$ に縮むため、**干渉縞の間隔はすべて狭まる（内側に縮む）**。
:::

<!--@include: ../parts/notice.md-->
