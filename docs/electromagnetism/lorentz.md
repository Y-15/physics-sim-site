---
title: 磁場中の荷電粒子の運動・ローレンツ力
description: 高校物理の電磁気学。ローレンツ力の定義（F=qvB）、フレミングの左手の法則、磁場中の等速円運動（半径r=mv/qB、周期T=2πm/qB）、らせん運動、直交電磁場（速度セレクター）と比電荷測定をシミュレーションとオリジナル例題で完全攻略。
---

# 磁場中の荷電粒子の運動・ローレンツ力

<div class="lead">
北極や南極の夜空を幻想的に彩る「オーロラ」は、なぜ極地方でしか見られないのでしょうか？<br>
旧型のブラウン管テレビや現代の最先端粒子加速器（シンクロトロン）は、どのようにして目に見えない電子の進路をミリ単位で曲げているのでしょうか？<br>
その秘密は、磁場の中を運動する電荷が受ける<strong>ローレンツ力</strong>にあります。<br>
このページでは、「なぜローレンツ力は仕事をしないのか？」「なぜ周期は速さによらないのか？」という本質的疑問から、速度セレクターの直進条件までを動く実験室で体感的にマスターします。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **オーロラ**: 太陽から吹き付ける超高速の荷電粒子（太陽風）が地球の磁場に捉えられ、磁力線に巻き付くように「らせん運動」をしながら極地の上空の大気分子と衝突して発光します。
* **質量分析器**: 元素や分子をイオン化して磁場に撃ち込み、回転半径の違いから分子の重さ（質量）を1兆分の1グラムの精度で識別します。
* **サイクロトロン（粒子加速器）**: がん治療用の放射線ビームを作るため、磁場で粒子を何度もぐるぐる円運動させながら高周波電場で加速します。

### 学習の到達目標
1. **ローレンツ力の向きと大きさ**: 電流が受ける力 $F = I B L$ とのつながりを理解し、フレミングの左手の法則（正電荷と負電荷の反転）をミスなく適用できる。
2. **等速円運動の完全導出**: 向心力方程式から、軌道半径 $r = \frac{mv}{qB}$ と回転周期 $T = \frac{2\pi m}{qB}$ を導出できる。
3. **ローレンツ力の仕事ゼロの性質**: ローレンツ力は常に進行方向に直角に働くため **仕事をしない（速さや運動エネルギーは不変）** ことを論理的に説明できる。

---

## 2. 現象のしくみ

### 電流が磁場から受ける力のミクロな正体
導線に電流 $I$ を流して磁場の中に置くと、導線全体が電磁気力 $F = I B L$ を受けます。
この導線の中を覗いてみると、無数の自由電子（電荷 $-e$）が平均の速さ $v$ で一斉に移動しています。
つまり、 **「電流が受ける力」の正体は、導線の中の1個1個の電子が磁場から受けている力（ローレンツ力）の総和** なのです。

### なぜ円運動になるのか？
1. 磁場に対して垂直に飛び込んだ粒子は、進行方向に対して常に「直角（横向き）」のローレンツ力を受けます。
2. 常に進行方向に直角な力を受け続ける運動とは、まさに **等速円運動** です！
3. ローレンツ力がそのまま円運動の「向心力」の役割を果たします。

---

## 3. 基本法則・公式

### ① ローレンツ力（Lorentz Force）
磁束密度 $B\,[\text{T}]$ の一様磁場の中を、電気量 $q\,[\text{C}]$ の荷電粒子が速さ $v\,[\text{m/s}]$ で運動するとき、粒子が受けるローレンツ力の大きさ $F\,[\text{N}]$ は：

$$F = |q| v B \sin\theta$$

* $\theta$: 速度ベクトル $\vec{v}$ と磁場ベクトル $\vec{B}$ のなす角
* 磁場に垂直に入射するとき（$\theta = 90^\circ$）： **最大値 $F = |q| v B$**
* 磁場と平行に動くとき（$\theta = 0^\circ$ または $180^\circ$）： **力はゼロ（$F = 0$）**

<div class="vector-graph-card">
  <div class="graph-title">図1：速度ベクトル <i>v</i> と磁場 <i>B</i> のなす角 <i>θ</i> とローレンツ力 <i>F</i></div>
  <svg viewBox="0 0 540 240" class="vector-svg" aria-label="ローレンツ力における速度と磁場のなす角θの図">
    <defs>
      <marker id="lz1-arr-b" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="lz1-arr-v" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
      </marker>
      <marker id="lz1-arr-f" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
    </defs>
    <!-- 磁場と速度がつくる水平平面 (斜め透視の平行四辺形) -->
    <polygon points="100,185 400,185 460,125 160,125" fill="rgba(56, 189, 248, 0.08)" stroke="rgba(148, 163, 184, 0.35)" stroke-width="1.2" stroke-dasharray="4,3" />
    <!-- 磁束密度 B ベクトル (右向き・平面上) -->
    <line x1="190" y1="158" x2="395" y2="158" stroke="#38bdf8" stroke-width="3" marker-end="url(#lz1-arr-b)" />
    <text x="410" y="163" fill="#38bdf8" font-size="14" font-weight="700">磁場 B</text>
    <!-- 速度 v ベクトル (斜め上向き・同じ平面上の奥方向へ角度θ) -->
    <line x1="190" y1="158" x2="315" y2="122" stroke="#10b981" stroke-width="3" marker-end="url(#lz1-arr-v)" />
    <text x="328" y="122" fill="#10b981" font-size="14" font-weight="700">速度 v</text>
    <!-- 角度 θ の弧 -->
    <path d="M 248,158 A 58,58 0 0 0 241,143" fill="none" stroke="#fbbf24" stroke-width="2" />
    <text x="262" y="147" fill="#fbbf24" font-size="15" font-weight="700">θ</text>
    <!-- ローレンツ力 F (平面に対して垂直上向き・正電荷 +q) -->
    <line x1="190" y1="158" x2="190" y2="48" stroke="#f43f5e" stroke-width="3.5" marker-end="url(#lz1-arr-f)" />
    <text x="202" y="58" fill="#f43f5e" font-size="14" font-weight="700">ローレンツ力 F</text>
    <text x="202" y="76" fill="#fda4af" font-size="12">大きさ F = |q| v B sin θ</text>
    <!-- 直角マーク (F ⊥ B) -->
    <polyline points="190,144 204,144 204,158" fill="none" stroke="#94a3b8" stroke-width="1.2" />
    <!-- v sinθ の補助線 -->
    <line x1="315" y1="122" x2="315" y2="158" stroke="rgba(16, 185, 129, 0.5)" stroke-width="1.5" stroke-dasharray="3,3" />
    <text x="342" y="146" fill="#6ee7b7" font-size="11">v sin θ (Bに垂直成分)</text>
    <!-- 荷電粒子 +q -->
    <circle cx="190" cy="158" r="10" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
    <text x="190" y="162" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">+q</text>
    <text x="270" y="216" fill="#cbd5e1" font-size="12" text-anchor="middle">力 F は常に「v と B の両方に垂直な向き」にはたらく（正電荷の例）</text>
  </svg>
</div>

#### 力の向き（フレミングの左手の法則）
* **中指**: 電流の向き（**正電荷なら運動の向き、負電荷なら運動と逆向き！**）
* **人さし指**: 磁場の向き（$\text{N} \to \text{S}$）
* **親指**: ローレンツ力の向き

> [!WARNING]
> **電子（負電荷）の超頻出トラップ**  
> 電子（$q = -e$）が右に飛んでいるとき、電流の向きは「左」です！  
> 中指を左に向けてフレミングの左手を使いましょう（または正電荷として求めた親指の向きを最後に反対にする）。

---

### ② 磁場中の等速円運動（垂直入射）
磁場に垂直に速さ $v$ で入射した粒子（質量 $m$）の円運動の運動方程式：

$$m \frac{v^2}{r} = |q| v B$$

#### 1. 軌道半径 $r$
両辺の $v$ を1個約分して整理すると：

$$r = \frac{m v}{|q| B}$$

* **運動量 $mv$ が大きい（重い、速い）** ほど大回りになる（$r$ が大）。
* **磁場 $B$ が強い、電荷 $|q|$ が大きい** ほど強く曲げられて小回りになる（$r$ が小）。

#### 2. 回転周期 $T$（1周にかかる時間）
円周の長さ $2\pi r$ を速さ $v$ で割ると：

$$T = \frac{2\pi r}{v} = \frac{2\pi \left(\frac{mv}{|q|B}\right)}{v} = \frac{2\pi m}{|q| B}$$

> [!IMPORTANT]
> **周期の驚くべき性質**  
> なんと周期 $T$ の式から速さ $v$ が消えてしまいます！  
> **どんなに猛スピードで飛び込んでも、ゆっくり飛び込んでも、1周して戻ってくる時間は完全に同じ** です（速い粒子ほど大回りをするため、走る距離と速さが相殺される）。この性質を応用したのがサイクロトロン加速器です。

---

### ③ らせん運動（斜め入射）
磁場に対して角 $\theta\,(\ne 90^\circ)$ で斜めに入射した場合：
* **磁場に平行な成分 $v_\parallel = v \cos\theta$**: ローレンツ力を受けないため、**等速直線運動**を続ける。
* **磁場に垂直な成分 $v_\perp = v \sin\theta$**: ローレンツ力により、半径 $r = \frac{m v \sin\theta}{|q| B}$ の**等速円運動**を行う。
* **合成運動**: 円運動をしながら前方にまっすぐ進むため、<strong>らせん階段のような軌道（らせん運動）</strong>になります。
  * 1回転する間に進む距離（ピッチ $p$）：
    $$p = v_\parallel \cdot T = (v \cos\theta) \times \frac{2\pi m}{|q| B}$$

<div class="vector-graph-card">
  <div class="graph-title">図2：磁場に対して角度 <i>θ</i> で斜めに入射した粒子のらせん運動</div>
  <svg viewBox="0 0 560 250" class="vector-svg" aria-label="らせん運動と角度θ、速度成分分解の図">
    <defs>
      <marker id="lz2-arr-b" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="lz2-arr-v" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
      </marker>
      <marker id="lz2-arr-comp" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#a78bfa" />
      </marker>
    </defs>
    <!-- 中心軸 (磁場 B の向き) -->
    <line x1="40" y1="130" x2="520" y2="130" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" marker-end="url(#lz2-arr-b)" />
    <text x="485" y="116" fill="#38bdf8" font-size="13" font-weight="700">磁場 B</text>
    <!-- 補助磁力線 -->
    <line x1="50" y1="60" x2="500" y2="60" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.2" marker-end="url(#lz2-arr-b)" />
    <line x1="50" y1="200" x2="500" y2="200" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.2" marker-end="url(#lz2-arr-b)" />
    <!-- らせん軌道 -->
    <path d="M 110,130 C 125,75 155,75 170,130 C 185,185 215,185 230,130 C 245,75 275,75 290,130 C 305,185 335,185 350,130 C 365,75 395,75 410,130 C 425,185 450,185 465,140"
          fill="none" stroke="#f59e0b" stroke-width="2.6" stroke-linecap="round" />
    <!-- 粒子点 (入射点) -->
    <circle cx="110" cy="130" r="6" fill="#f43f5e" stroke="#fff" stroke-width="1.5" />
    <text x="95" y="150" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="end">+q</text>
    <!-- 入射速度ベクトル v と成分分解 (平行 v cosθ, 垂直 v sinθ) -->
    <line x1="110" y1="130" x2="188" y2="68" stroke="#10b981" stroke-width="2.8" marker-end="url(#lz2-arr-v)" />
    <text x="195" y="65" fill="#10b981" font-size="13" font-weight="700">v</text>
    <!-- v_parallel (暗背景ピル付きで曲線と重なっても視認性を確保) -->
    <line x1="110" y1="130" x2="188" y2="130" stroke="#a78bfa" stroke-width="2.2" marker-end="url(#lz2-arr-comp)" />
    <rect x="115" y="138" width="82" height="17" rx="4" fill="#090d16" fill-opacity="0.92" />
    <text x="156" y="151" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="middle">v∥ = v cos θ</text>
    <!-- v_perp -->
    <line x1="110" y1="130" x2="110" y2="68" stroke="#a78bfa" stroke-width="2.2" marker-end="url(#lz2-arr-comp)" />
    <text x="102" y="88" fill="#a78bfa" font-size="12" font-weight="700" text-anchor="end">v⊥ = v sin θ</text>
    <!-- 分解の点線長方形 -->
    <line x1="110" y1="68" x2="188" y2="68" stroke="rgba(167, 139, 250, 0.5)" stroke-width="1.2" stroke-dasharray="3,3" />
    <line x1="188" y1="68" x2="188" y2="130" stroke="rgba(167, 139, 250, 0.5)" stroke-width="1.2" stroke-dasharray="3,3" />
    <!-- 角度 θ -->
    <path d="M 148,130 A 38,38 0 0 0 139,107" fill="none" stroke="#fbbf24" stroke-width="2" />
    <text x="154" y="114" fill="#fbbf24" font-size="14" font-weight="700">θ</text>
    <!-- 1ピッチ p の表示 (頂点間または交差点間) -->
    <line x1="230" y1="196" x2="350" y2="196" stroke="#e2e8f0" stroke-width="1.5" />
    <line x1="230" y1="188" x2="230" y2="204" stroke="#e2e8f0" stroke-width="1.5" />
    <line x1="350" y1="188" x2="350" y2="204" stroke="#e2e8f0" stroke-width="1.5" />
    <text x="290" y="218" fill="#e2e8f0" font-size="12" font-weight="700" text-anchor="middle">ピッチ p = (v cos θ)・T</text>
    <!-- 半径 r 表示 -->
    <line x1="260" y1="130" x2="260" y2="88" stroke="#fda4af" stroke-width="1.5" stroke-dasharray="2,2" />
    <text x="268" y="108" fill="#fda4af" font-size="11" font-weight="700">r</text>
  </svg>
</div>

---

### ④ 速度セレクター（直交電磁場）
電場 $\vec{E}$ と磁場 $\vec{B}$ を互いに直交させて配置した空間：
* 正電荷 $+q$ に対し、下向きの電場による力 $F_E = q E$（下向き）
* 画面奥向きの磁場によるローレンツ力 $F_B = q v B$（上向き）
* 2つの力が完全につり合えば、粒子は **軌道を曲げられずに真っ直ぐ直進** します！

$$q E = q v B \iff v = \frac{E}{B}$$

特定の速さ $v = E/B$ を持つ粒子だけが直進してスリットを通り抜けられるため、 **速度セレクター（速度選別器）** と呼ばれます。

---

## 4. 成立条件と注意点

### ローレンツ力は「仕事をしない」！
* ローレンツ力 $\vec{F}$ は常に粒子の速度 $\vec{v}$（微小移動方向）に対して直角です（$\cos 90^\circ = 0$）。
* したがって、ローレンツ力が荷電粒子にする仕事は常に **$W = 0$** です。
* **ローレンツ力によって粒子の運動エネルギー $\frac{1}{2}mv^2$ や速さ $v$ が変化することは絶対にありません** （変えられるのは「進む向き」だけです）。

### 重力は無視できるか？
高校物理の電子や陽子の問題では、重力 $mg \approx 10^{-30}\,\text{N}$ に対して電磁気力 $qE, qvB \approx 10^{-14}\,\text{N}$ が圧倒的に（16桁以上！）巨大なため、問題文に「重力の影響は無視できるものとする」と明記されます。

---

## 5. シミュレーションで体感する

下の実験室では、「一様磁場中の円運動」と「直交電磁場の速度セレクター」をタブで切り替えて操作できます。
磁束密度 $B$ や粒子の初速度 $v$、電場 $E$ を変更し、電子・陽子・アルファ粒子の軌道の違いを観察してください。

<ClientOnly>
  <LorentzSim />
</ClientOnly>

### 観察のポイント
1. **電子と陽子の曲がる向きの違い**:
   * 電子（負電荷）と陽子（正電荷）で、曲がる向きが正反対になることを確かめてください。
   * 電子は質量が極めて小さいため、同じ磁場でも鋭く小回り（小さな半径）で回転します。
2. **磁場 $B$ を反転**:
   * スライダーをマイナスに動かすと、磁場の向きが画面奥向き（$\otimes$）から手前向き（$\odot$）に反転し、回転方向が時計回り・反時計回りで切り替わります。
3. **速度セレクター（直進条件）**:
   * $v = E/B$ となる特定の速度のときだけ、粒子が上下に偏向せず中央を真っ直ぐ突き抜ける様子を観察してください。

---

## 6. 例題での使い方（完全オリジナル）

### 【例題】速度セレクターと質量分析器（トムソンの比電荷測定モデル）

#### 問題設定
図のように、下向きの一様な電場 $E = 1.2 \times 10^4\,\text{V/m}$ と、紙面の裏から表に向かう一様な磁場 $B_1 = 0.20\,\text{T}$ が互いに直交する領域（領域Ⅰ：速度セレクター）がある。
電気量 $-e = -1.6 \times 10^{-19}\,\text{C}$、質量 $m$ の電子を水平右向きに速度セレクターに入射させたところ、電子は軌道を曲げられることなく直進し、細いスリット $\text{S}$ を通過した。
スリット $\text{S}$ の右側（領域Ⅱ）には電場はなく、紙面の表から裏に向かう一様な磁場 $B_2 = 0.10\,\text{T}$ のみがかけられている。
スリット $\text{S}$ を抜けた電子は領域Ⅱで半円を描いて運動し、スリットと同じ壁面上にある蛍光板の点 $\text{P}$ に衝突して輝点を生じた。スリット $\text{S}$ と点 $\text{P}$ の間の距離を $D = 6.8\,\text{mm} = 6.8 \times 10^{-3}\,\text{m}$ とする。重力の影響は無視できるものとする。

<div class="vector-graph-card">
  <div class="graph-title">図3：例題の模式図（速度セレクター［領域Ⅰ］と質量分析器［領域Ⅱ］）</div>
  <svg viewBox="0 0 600 280" class="vector-svg" aria-label="速度セレクターと質量分析器の例題模式図">
    <defs>
      <marker id="lz3-arr-e" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
      <marker id="lz3-arr-v" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
      </marker>
      <marker id="lz3-arr-dim" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
      </marker>
    </defs>
    <!-- 領域分けの背景 -->
    <rect x="70" y="55" width="212" height="190" fill="rgba(56, 189, 248, 0.04)" />
    <rect x="295" y="30" width="265" height="225" fill="rgba(167, 139, 250, 0.05)" stroke="rgba(167, 139, 250, 0.25)" stroke-dasharray="4,3" />
    <!-- 領域タイトル -->
    <text x="172" y="28" fill="#e2e8f0" font-size="13" font-weight="700" text-anchor="middle">領域Ⅰ（速度セレクター）</text>
    <text x="427" y="22" fill="#e2e8f0" font-size="13" font-weight="700" text-anchor="middle">領域Ⅱ（一様磁場 B₂）</text>
    <!-- 上下極板 (領域Ⅰ：スリット壁と十分離して x=75..268 に配置) -->
    <rect x="75" y="55" width="193" height="8" rx="2" fill="#ef4444" />
    <text x="172" y="47" fill="#fca5a5" font-size="11" text-anchor="middle">上極板 (+)</text>
    <rect x="75" y="235" width="193" height="8" rx="2" fill="#38bdf8" />
    <text x="172" y="262" fill="#7dd3fc" font-size="11" text-anchor="middle">下極板 (-)</text>
    <!-- 電場 E の下向き矢印 -->
    <line x1="115" y1="68" x2="115" y2="225" stroke="rgba(244, 63, 94, 0.45)" stroke-width="1.5" marker-end="url(#lz3-arr-e)" />
    <line x1="185" y1="68" x2="185" y2="225" stroke="rgba(244, 63, 94, 0.45)" stroke-width="1.5" marker-end="url(#lz3-arr-e)" />
    <line x1="242" y1="68" x2="242" y2="225" stroke="rgba(244, 63, 94, 0.45)" stroke-width="1.5" marker-end="url(#lz3-arr-e)" />
    <text x="150" y="94" fill="#f43f5e" font-size="12" font-weight="700" text-anchor="middle">電場 E ↓</text>
    <!-- 領域Ⅰの磁場 B1 (紙面表向き ⊙) -->
    <g stroke="#38bdf8" stroke-width="1.3" fill="none">
      <circle cx="95" cy="135" r="7" /><circle cx="95" cy="135" r="2" fill="#38bdf8" />
      <circle cx="150" cy="135" r="7" /><circle cx="150" cy="135" r="2" fill="#38bdf8" />
      <circle cx="215" cy="135" r="7" /><circle cx="215" cy="135" r="2" fill="#38bdf8" />
      <circle cx="176" cy="212" r="7" /><circle cx="176" cy="212" r="2" fill="#38bdf8" />
      <circle cx="222" cy="212" r="7" /><circle cx="222" cy="212" r="2" fill="#38bdf8" />
    </g>
    <text x="80" y="216" fill="#38bdf8" font-size="12" font-weight="700">B₁ (⊙ 表向き)</text>
    <!-- 領域Ⅱの磁場 B2 (紙面奥向き ⊗, D=2r寸法線領域を避けて右寄りに配置) -->
    <g stroke="#a78bfa" stroke-width="1.3" fill="none" opacity="0.7">
      <circle cx="450" cy="58" r="7" /><line x1="445" y1="53" x2="455" y2="63" /><line x1="455" y1="53" x2="445" y2="63" />
      <circle cx="525" cy="58" r="7" /><line x1="520" y1="53" x2="530" y2="63" /><line x1="530" y1="53" x2="520" y2="63" />
      <circle cx="450" cy="145" r="7" /><line x1="445" y1="140" x2="455" y2="150" /><line x1="455" y1="140" x2="445" y2="150" />
      <circle cx="525" cy="145" r="7" /><line x1="520" y1="140" x2="530" y2="150" /><line x1="530" y1="140" x2="520" y2="150" />
      <circle cx="450" cy="220" r="7" /><line x1="445" y1="215" x2="455" y2="225" /><line x1="455" y1="215" x2="445" y2="225" />
      <circle cx="525" cy="220" r="7" /><line x1="520" y1="215" x2="530" y2="225" /><line x1="530" y1="215" x2="520" y2="225" />
    </g>
    <text x="455" y="242" fill="#c4b5fd" font-size="12" font-weight="700">B₂ (⊗ 奥向き)</text>
    <!-- スリット S 付き壁・蛍光板 (x = 290, 上壁 y=30..170, 下壁 y=186..255) -->
    <rect x="286" y="30" width="8" height="140" fill="#cbd5e1" />
    <rect x="286" y="186" width="8" height="69" fill="#cbd5e1" />
    <text x="275" y="198" fill="#cbd5e1" font-size="12" font-weight="700" text-anchor="end">スリット S</text>
    <text x="300" y="44" fill="#94a3b8" font-size="11" text-anchor="start">蛍光板</text>
    <!-- 電子の直線軌道 (領域Ⅰ: y = 178) -->
    <line x1="35" y1="178" x2="294" y2="178" stroke="#10b981" stroke-width="2.5" stroke-dasharray="5,3" />
    <!-- 領域Ⅱの半円軌道 (S: (294, 178) → P: (294, 82)、半径 r = 48) -->
    <path d="M 294,178 A 48,48 0 0 0 294,82" fill="none" stroke="#10b981" stroke-width="2.8" />
    <!-- 軌道半径 r 表示 -->
    <circle cx="294" cy="130" r="2.5" fill="#94a3b8" />
    <line x1="294" y1="130" x2="342" y2="130" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3,2" />
    <text x="318" y="123" fill="#cbd5e1" font-size="11" text-anchor="middle">r</text>
    <!-- 電子粒子 (-e) 入射 -->
    <circle cx="52" cy="178" r="8" fill="#38bdf8" stroke="#fff" stroke-width="1.5" />
    <text x="52" y="182" fill="#090d16" font-size="11" font-weight="700" text-anchor="middle">e⁻</text>
    <line x1="62" y1="178" x2="98" y2="178" stroke="#10b981" stroke-width="2.2" marker-end="url(#lz3-arr-v)" />
    <text x="72" y="166" fill="#10b981" font-size="12" font-weight="700">v</text>
    <!-- 衝突輝点 P (上極板 y=55..63 よりも下に配置して重複を完全回避) -->
    <circle cx="294" cy="82" r="5.5" fill="#fbbf24" stroke="#fff" stroke-width="1.5" />
    <text x="280" y="86" fill="#fbbf24" font-size="13" font-weight="700" text-anchor="end">点 P</text>
    <!-- 距離 D = 2r の寸法線 (領域Ⅱ側の空きスペースにすっきり配置) -->
    <line x1="294" y1="82" x2="378" y2="82" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1" stroke-dasharray="3,2" />
    <line x1="294" y1="178" x2="378" y2="178" stroke="rgba(251, 191, 36, 0.4)" stroke-width="1" stroke-dasharray="3,2" />
    <line x1="372" y1="82" x2="372" y2="178" stroke="#fbbf24" stroke-width="1.5" marker-start="url(#lz3-arr-dim)" marker-end="url(#lz3-arr-dim)" />
    <text x="382" y="134" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="start">D = 2r</text>
  </svg>
</div>

1. 領域Ⅰを直進した電子の速さ $v\,[\text{m/s}]$ を求めよ。
2. 領域Ⅱにおける電子の軌道半径 $r\,[\text{m}]$ を求め、点 $\text{P}$ はスリット $\text{S}$ の上方・下方のどちらにあるか答えよ。
3. 電子の比電荷（単位質量あたりの電気量）$\frac{e}{m}\,[\text{C/kg}]$ の値を有効数字2桁で求めよ。

---

#### 解答・解説

##### 設問(1)
* **着眼点**: 領域Ⅰにおいて、電子（負電荷）に働く力のつり合いを考える。
  * 電場は下向きなので、負電荷である電子が受ける静電気力 $F_E$ は **上向き** で大きさは $eE$。
  * 磁場 $B_1$ は表向き（$\odot$）。電子は右に飛ぶので電流は左向き。フレミングの左手を使うと、正電荷なら下向きだが、電子なので反転して **下向き** （またはフレミングで中指を左、人さし指を表に向けると親指は下を向く）。ローレンツ力の大きさは $F_B = e v B_1$。
  * 電子が直進するための力のつり合い条件：
    $$e E = e v B_1 \implies v = \frac{E}{B_1}$$
* **数値計算**:
  $$v = \frac{1.2 \times 10^4}{0.20} = 6.0 \times 10^4\,\text{m/s}$$

**答**: $6.0 \times 10^4\,\text{m/s}$

---

##### 設問(2)
* **ステップ1：領域Ⅱでの曲がる向き**
  * 電子はスリット $\text{S}$ を右向きに入射する（電流の向きは左）。
  * 領域Ⅱの磁場 $B_2$ は裏向き（$\otimes$、人さし指を画面奥へ）。
  * フレミングの左手より、親指は **上向き** を指す。
  * したがって、電子は **上向きに円軌道を描く** ため、衝突点 $\text{P}$ はスリット $\text{S}$ の **上方** にある。
* **ステップ2：軌道半径 $r$**  
  電子は半円を描いてスリット面に戻るため、スリット $\text{S}$ と衝突点 $\text{P}$ の距離 $D$ は **円の直径（$2r$）** に等しい：
  $$D = 2r \implies r = \frac{D}{2} = \frac{6.8 \times 10^{-3}}{2} = 3.4 \times 10^{-3}\,\text{m}$$

**答**: 半径 $r = 3.4 \times 10^{-3}\,\text{m}$（$3.4\,\text{mm}$）、位置：スリット $\text{S}$ の **上方**

---

##### 設問(3)
* **着眼点**: 領域Ⅱにおける等速円運動の運動方程式を立てる。
  $$m \frac{v^2}{r} = e v B_2 \implies r = \frac{m v}{e B_2}$$
  これを比電荷 $\frac{e}{m}$ について解く：
  $$\frac{e}{m} = \frac{v}{r B_2}$$
* **数値を代入して計算**:
  設問(1)より $v = 6.0 \times 10^4\,\text{m/s}$、設問(2)より $r = 3.4 \times 10^{-3}\,\text{m}$、$B_2 = 0.10\,\text{T}$ なので：
  $$\frac{e}{m} = \frac{6.0 \times 10^4}{(3.4 \times 10^{-3}) \times 0.10} = \frac{6.0 \times 10^4}{3.4 \times 10^{-4}} = \frac{60}{3.4} \times 10^7 \approx 17.64 \times 10^7 \approx 1.8 \times 10^{11}\,\text{C/kg}$$

**答**: $\frac{e}{m} = 1.8 \times 10^{11}\,\text{C/kg}$

---

## 7. 受験生が陥りやすい誤解・つまずき

### 誤解1：「ローレンツ力によって粒子が加速されてスピードアップする」
* **最大の思い込みです！**
  * 電場は荷電粒子に仕事をしてスピードを変化させられます（$\Delta K = qV$）。
  * しかし、ローレンツ力は常に進行方向と $90^\circ$ をなすため、 **仕事は常に $0$** です。
  * したがって、ローレンツ力だけで曲がっている限り、 **速さ $v$ や運動エネルギーは1ミリも変わりません** （曲がるだけ）。

### 誤解2：「直交電磁場で直進する速さが粒子の質量や電荷によって変わる」
* 速度セレクターの直進条件 $qE = qvB$ を見ると、両辺の電荷 $q$ は約分されて消え、質量 $m$ はそもそも式に入っていません。
* したがって、$v = E/B$ という直進速度は、 **粒子の質量にも電荷の大きさ・正負にも一切依存しません！** 電子でも陽子でも同じ速度なら直進します。

---

## 8. 要点まとめ

::: tip 📋 ローレンツ力の重要公式総まとめ
* **ローレンツ力の公式**:
  $$F = |q| v B \sin\theta \quad [\text{N}]$$
  * 速度ベクトル $\vec{v}$ と磁場 $\vec{B}$ の双方に常に垂直（**仕事 $W = 0$**、速さ $v$ や運動エネルギーは一定！）。
  * 負電荷（電子）はフレミングの左手が指す向きと **正反対** になる点に注意。

* **等速円運動（磁場に垂直入射 $\theta = 90^\circ$）**:
  $$\frac{m v^2}{r} = |q| v B$$
  * 軌道半径: $r = \frac{m v}{|q| B}$
  * 回転周期: $T = \frac{2\pi r}{v} = \frac{2\pi m}{|q| B}$（**速さ $v$ や半径 $r$ によらず一定！**）

* **直交電磁場（速度セレクター）**:
  $$q E = q v B \iff v = \frac{E}{B}$$
  * 電子の比電荷測定（トムソンの実験）の必須基礎。
:::

<!--@include: ../parts/notice.md-->
