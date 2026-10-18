---
title: 電磁誘導の法則・レンツの法則と導線棒の運動
description: 高校物理の電磁気学最頻出テーマ。ファラデーの電磁誘導の法則（V=-NΔΦ/Δt）、レンツの法則、磁場中を動く導線棒の誘導起電力（V=vBl）、終端速度の導出、自己誘導・相互誘導、エネルギー保存則をシミュレーションとオリジナル例題で完全攻略。
---

# 電磁誘導の法則・レンツの法則と導線棒の運動

<div class="lead">
私たちが家庭で使っている電気（コンセントの交流）は、火力発電所や水力発電所でどのようにして作られているのでしょうか？<br>
また、電磁調理器（IHクッキングヒーター）は、なぜ火も使わずに鍋の底だけを瞬時に熱々にできるのでしょうか？<br>
その根本原理が、1831年にマイケル・ファラデーが発見した<strong>電磁誘導の法則</strong>です。<br>
このページでは、「磁束の変化を嫌う」レンツの法則の直感から、入試頻出の「レール上をすべる導線棒の終端速度とエネルギー収支」までを動く実験室で体感的にマスターします。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **発電機（ダイナモ）**: 磁石の周りでコイルをぐるぐる回転させるだけで、磁束が周期的に変化して連続的な起電力（交流電圧）が発生します。
* **IHクッキングヒーター**: 渦巻きコイルに急激な交流電流を流して変動磁場を作り、鍋底の金属に渦電流（電磁誘導）を発生させて、鍋自身の電気抵抗で直接発熱させます。
* **非接触ICカード（Suica / PASMO / スマホ決済）**: 改札の読み取り機から出る目に見えない電波（変動磁場）がカード内の微小コイルに電磁誘導を起こし、電池なしでICチップを起動させています。

### 学習の到達目標
1. **ファラデーの電磁誘導の法則**: 磁束 $\Phi = B S$ の時間変化率から誘導起電力の大きさ $|V| = N \left|\frac{\Delta \Phi}{\Delta t}\right|$ を計算できる。
2. **レンツの法則による向きの即答**: 「磁束の変化を妨げる向き（邪魔する向き）に電流が流れる」というアマノジャクの法則を使って、誘導電流の向きを迷わず判定できる。
3. **導線棒のレール回路の完全解法**: 誘導起電力 $V = vBl$、回路方程式、電磁気力 $F = IBl$ の運動方程式を立て、終端速度 $v_{\text{terminal}}$ とエネルギー保存（外力の仕事率 $=$ ジュール熱）を導出できる。

---

## 2. 現象のしくみ

### アマノジャクな「レンツの法則」
コイルは「**今の磁場の状態をそのまま保ちたい**」という強い慣性を持っています。
* 磁石のN極を近づけると $\to$ コイルは「入ってくるな！」と拒絶するため、 **手前側にN極を作って反発** する。
* 磁石のN極を遠ざけると $\to$ コイルは「行かないで！」と引き止めるため、 **手前側にS極を作って引き合う**。

<div class="vector-graph-card">
<svg viewBox="0 0 540 190" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-lenz-push" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#38bdf8" />
    </marker>
    <marker id="arr-lenz-force" markerWidth="7" markerHeight="7" refX="5" refY="2.5" orient="auto">
      <path d="M0,0 L0,5 L6,2.5 z" fill="#f43f5e" />
    </marker>
  </defs>
  <!-- ケース1: N極を近づける (y = 20..90) -->
  <g transform="translate(20, 20)">
    <!-- 磁石: 左から右へ移動 -->
    <rect x="10" y="15" width="40" height="24" rx="2" fill="#3b82f6"/>
    <text x="30" y="32" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">S</text>
    <rect x="50" y="15" width="40" height="24" rx="2" fill="#ef4444"/>
    <text x="70" y="32" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">N</text>
    <!-- 移動矢印 (右向き) -->
    <line x1="95" y1="27" x2="135" y2="27" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-lenz-push)"/>
    <text x="115" y="18" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">近づける</text>
    <!-- コイル (楕円ループ) -->
    <ellipse cx="230" cy="27" rx="14" ry="26" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="3"/>
    <text x="230" y="70" fill="#fbbf24" font-size="11" font-weight="700" text-anchor="middle">コイル</text>
    <!-- コイルに生じる磁極（手前がN極） -->
    <rect x="175" y="18" width="30" height="18" rx="2" fill="#ef4444"/>
    <text x="190" y="32" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">N</text>
    <!-- 反発力 (斥力ブレーキ) -->
    <line x1="165" y1="27" x2="145" y2="27" stroke="#f43f5e" stroke-width="2" marker-end="url(#arr-lenz-force)"/>
    <rect x="255" y="18" width="220" height="20" rx="3" fill="#0f172a" stroke="#f43f5e" stroke-width="1"/>
    <text x="365" y="32" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">反発力（入ってくるな！とブレーキ）</text>
  </g>
  <!-- ケース2: N極を遠ざける (y = 105..175) -->
  <g transform="translate(20, 105)">
    <!-- 磁石: 左へ遠ざかる -->
    <rect x="10" y="15" width="40" height="24" rx="2" fill="#3b82f6"/>
    <text x="30" y="32" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">S</text>
    <rect x="50" y="15" width="40" height="24" rx="2" fill="#ef4444"/>
    <text x="70" y="32" fill="#fff" font-size="12" font-weight="700" text-anchor="middle">N</text>
    <!-- 移動矢印 (左向き) -->
    <line x1="95" y1="27" x2="65" y2="27" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-lenz-push)"/>
    <rect x="55" y="4" width="55" height="16" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
    <text x="82" y="16" fill="#38bdf8" font-size="10" font-weight="700" text-anchor="middle">遠ざける</text>
    <!-- コイル (楕円ループ) -->
    <ellipse cx="230" cy="27" rx="14" ry="26" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="3"/>
    <!-- コイルに生じる磁極（手前がS極） -->
    <rect x="175" y="18" width="30" height="18" rx="2" fill="#3b82f6"/>
    <text x="190" y="32" fill="#fff" font-size="11" font-weight="700" text-anchor="middle">S</text>
    <!-- 引力 (引き止めブレーキ) -->
    <line x1="145" y1="27" x2="165" y2="27" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr-lenz-push)"/>
    <rect x="255" y="18" width="220" height="20" rx="3" fill="#0f172a" stroke="#38bdf8" stroke-width="1"/>
    <text x="365" y="32" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">引力（変化を妨げて引き止める）</text>
  </g>
</svg>
<div class="graph-caption">図: レンツの法則の直感理解（磁石の動きを妨げる向きに誘導磁極・誘導電流が発生する）</div>
</div>

このように、 **「外部から加えられた変化を打ち消す向き」に誘導起電力と誘導電流が生じる** という法則を **レンツの法則** と呼びます。

### 導線棒の誘導起電力 $V = vBl$ のミクロな正体
なぜ磁場中を金属棒が動くだけで電池（起電力）になるのでしょうか？
1. 金属棒の中には無数の自由電子（電荷 $-e$）が存在します。
2. 棒が速さ $v$ で磁場 $B$ の中を右へ動くと、電子も一緒に右へ動くため、電子自身が **ローレンツ力（下向き）** を受けます。
3. 電子たちが下端に押し込められてマイナスに帯電し、上端はプラスに帯電します。
4. このプラスとマイナスの偏りによって、棒の内部に上向きの **誘導起電力 $V = v B l$** が生まれるのです！

---

## 3. 基本法則・公式

### ① ファラデーの電磁誘導の法則
巻き数 $N$ のコイルを貫く磁束が、微小時間 $\Delta t\,[\text{s}]$ の間に $\Delta \Phi\,[\text{Wb}]$ だけ変化したとき、コイルに生じる誘導起電力 $V\,[\text{V}]$ は：

$$V = - N \frac{\Delta \Phi}{\Delta t}$$

* $\Phi = B S$: 磁束（磁力線の総本数）$[\text{Wb}] = [\text{T}\cdot\text{m}^2]$
* **マイナス符号（$-$） **: 磁束の変化を妨げる向きに起電力が発生すること（** レンツの法則**）を表す。

---

### ② 磁場を横切る導線棒の誘導起電力
磁束密度 $B\,[\text{T}]$ の一様磁場に垂直に置かれた長さ $l\,[\text{m}]$ の導線棒が、磁場と垂直な方向に速さ $v\,[\text{m/s}]$ で運動するとき、棒の両端に生じる誘導起電力の大きさ $V\,[\text{V}]$ は：

$$V = v B l$$

* **高電位（プラス極）になる端の見分け方**:
  親指を速度 $v$、人さし指を磁場 $B$ に向けたとき、 **中指（正電荷がローレンツ力を受ける向き）の側がプラス極（高電位）** になります。

---

### ③ レール回路と終端速度の運動方程式
間隔 $l$ のレールに抵抗 $R$ をつなぎ、磁場 $B$（奥向き）の中で質量 $m$ の導線棒を右向きの外力 $F_{\text{ext}}$ で引っ張る場合：

1. **誘導起電力**: 上向きに $V = v B l$
2. **誘導電流（オームの法則）**: 反時計回りに $I = \frac{V}{R} = \frac{v B l}{R}$
3. **電磁気力（アンペール力・ブレーキ）**: 左向きに $F_{\text{mag}} = I B l = \frac{B^2 l^2 v}{R}$
4. **導線棒の運動方程式**:
   $$m \frac{dv}{dt} = F_{\text{ext}} - F_{\text{mag}} = F_{\text{ext}} - \frac{B^2 l^2}{R} v$$

#### 終端速度 $v_{\text{terminal}}$
速さ $v$ が上がるとブレーキ力 $F_{\text{mag}}$ が増大し、やがて外力と完全につり合って加速度が $0$ になります：

$$F_{\text{ext}} = \frac{B^2 l^2}{R} v_{\text{terminal}} \implies v_{\text{terminal}} = \frac{F_{\text{ext}} R}{B^2 l^2}$$

#### エネルギー保存則（仕事率の一致）
終端速度で等速運動しているとき、外力が単位時間あたりにする仕事（仕事率 $P_{\text{ext}}$）は：

$$P_{\text{ext}} = F_{\text{ext}} \cdot v_{\text{terminal}} = \left( \frac{B^2 l^2 v}{R} \right) v = \frac{B^2 l^2 v^2}{R}$$

一方、抵抗 $R$ で単位時間あたりに熱として消費されるジュール熱の仕事率 $P_{\text{joule}}$ は：

$$P_{\text{joule}} = I^2 R = \left( \frac{v B l}{R} \right)^2 R = \frac{B^2 l^2 v^2}{R}$$

見事に **$P_{\text{ext}} = P_{\text{joule}}$ ** となり、**外力が注入した力学的仕事が、100%電気エネルギーを経由してジュール熱へと変換されている** ことが証明されます！

---

### ④ 自己誘導と相互誘導
* **自己誘導**: コイル自身の電流 $I$ が変化したとき、その変化を妨げる向きに起電力が発生する現象。
  $$V = - L \frac{\Delta I}{\Delta t}$$
  * $L$: **自己インダクタンス** （単位：ヘンリー $[\text{H}]$）
  * コイルに蓄えられる磁気エネルギー:
    $$U = \frac{1}{2} L I^2$$
* **相互誘導**: 1次コイルの電流 $I_1$ が変化したとき、隣の2次コイルに誘導起電力が発生する現象（変圧器・トランスの原理）。
  $$V_2 = - M \frac{\Delta I_1}{\Delta t}$$
  * $M$: **相互インダクタンス** $[\text{H}]$

---

## 4. 成立条件と注意点

### 公式適用のチェックリスト
* [x] **磁場と導線棒と進行方向の3つが互いに直交しているか** ：斜めになっている場合は、直交する垂直成分（$\sin\theta$）を取り出します。
* [x] **起電力の向きを回路図に正しく書き込めるか** ：導線棒自身を「電池のマーク」に置き換えて回路図を描き直すと、キルヒホッフの法則で簡単に解けます。

---

## 5. シミュレーションで体感する

下の実験室では、「磁場中の導線棒（レール回路）」と「コイルと棒磁石（レンツの法則）」の2大テーマをタブで切り替えて操作できます。

<ClientOnly>
  <InductionSim />
</ClientOnly>

### 観察のポイント
1. **導線棒の走行と終端速度**:
   * 外力 $F_{\text{ext}}$ を加えて「▶️ 走行開始」を押すと、最初はぐんぐん加速しますが、スピードが上がるにつれて電磁気力のブレーキ矢印（ピンク色）が伸びていき、やがてピタリと一定の終端速度に落ち着く様子を観察してください。
   * 下のステータスで、外力の仕事率 $P_{\text{ext}}$ とジュール熱 $P_J$ が終端速度において完全に一致することを確かめてください。
2. **コイルと磁石（レンツの法則）**:
   * スライダーで磁石を動かすと、検流計の針がリアルタイムに振れます。
   * 磁石を速く動かすほど針が大きく振れ、静止させるとピタリと $0$ に戻ることを確認してください（電磁誘導は「動いている瞬間」にしか起きない！）。

---

## 6. 例題での使い方（完全オリジナル）

### 【例題】磁場中を落下する導線棒と終端速度・エネルギー保存

#### 問題設定
鉛直上向きに伸びる鉛直面内に、間隔 $L = 0.50\,\text{m}$ の2本の平行なめらかな導電レールが固定されている。
レールの最上端には、抵抗値 $R = 2.0\,\Omega$ の抵抗器が接続されている。
レールが存在する全領域には、水平かつ紙面の表から裏に向かう一様な磁束密度 $B = 0.80\,\text{T}$ の磁場がかけられている。
質量 $m = 0.20\,\text{kg}$ の均一な金属棒 $\text{PQ}$ をレールに直角に水平に渡し、静かに放したところ、棒は重力によってレールに沿って鉛直下向きに滑り落ち始めた。
重力加速度の大きさを $g = 9.8\,\text{m/s}^2$ とし、棒とレールの間の電気抵抗および摩擦、空気抵抗、回路の自己インダクタンスは無視できるものとする。

1. 金属棒の落下速度が $v = 2.5\,\text{m/s}$ に達した瞬間において、
   (a) 金属棒に生じる誘導起電力の大きさ $V\,[\text{V}]$ を求めよ。
   (b) 回路を流れる誘導電流の大きさ $I\,[\text{A}]$ を求めよ。また、電流は棒 $\text{PQ}$ を $\text{P} \to \text{Q}$ と $\text{Q} \to \text{P}$ のどちら向きに流れるか答えよ（レール左端を $\text{P}$、右端を $\text{Q}$ とする）。
   (c) 金属棒が磁場から受ける電磁気力の大きさ $F_{\text{mag}}\,[\text{N}]$ を求めよ。
2. 金属棒はやがて一定の終端速度 $v_{\text{terminal}}$ で等速落下するようになった。この終端速度 $v_{\text{terminal}}\,[\text{m/s}]$ を求めよ。
3. 終端速度で落下しているとき、重力が金属棒にする仕事の仕事率 $P_{\text{grav}}\,[\text{W}]$、および抵抗で熱として消費されるジュール熱の仕事率 $P_{\text{joule}}\,[\text{W}]$ をそれぞれ求め、両者を比較せよ。

---

#### 解答・解説

##### 設問(1)
* **小問(a)：誘導起電力の大きさ**
  $$V = v B L = 2.5 \times 0.80 \times 0.50 = 1.0\,\text{V}$$
* **小問(b)：誘導電流の大きさと向き**
  * 大きさ: オームの法則より
    $$I = \frac{V}{R} = \frac{1.0}{2.0} = 0.50\,\text{A}$$
  * 向きの判定:
    * **レンツの法則から **: 棒が下に落下すると、回路が囲む面積が広がり、紙面奥向き（$\otimes$）の磁束が増加する。コイル（回路）はこれを妨げるため、手前向き（$\odot$）の磁界を作ろうとする。右ねじの法則より、電流は反時計回りに流れる。したがって棒の部分では** $\text{Q} \to \text{P}$（右から左）** に流れる。
    * **フレミングの左手から**: 親指を下（速度）、人さし指を奥（磁場）に向けると、正電荷が受ける力（中指）は左（$\text{Q} \to \text{P}$）を向く。
* **小問(c)：電磁気力**
  $$F_{\text{mag}} = I B L = 0.50 \times 0.80 \times 0.50 = 0.20\,\text{N}$$
  （向きはフレミングの左手より鉛直上向きで、重力に逆らうブレーキ力となる）

**答**: (a) $V = 1.0\,\text{V}$、(b) $I = 0.50\,\text{A}$、向き：$\text{Q} \to \text{P}$、(c) $F_{\text{mag}} = 0.20\,\text{N}$

---

##### 設問(2)
* **着眼点**: 終端速度では加速度が $0$ になるため、下向きの重力 $mg$ と上向きの電磁気力 $F_{\text{mag}}$ が完全につり合う！
* **立式**:
  $$m g = F_{\text{mag}} = I B L = \left( \frac{v B L}{R} \right) B L = \frac{B^2 L^2}{R} v_{\text{terminal}}$$
* **変形して解く**:
  $$v_{\text{terminal}} = \frac{m g R}{B^2 L^2}$$
* **数値代入**:
  $$v_{\text{terminal}} = \frac{0.20 \times 9.8 \times 2.0}{(0.80)^2 \times (0.50)^2} = \frac{3.92}{0.64 \times 0.25} = \frac{3.92}{0.16} = 24.5\,\text{m/s}$$

**答**: $v_{\text{terminal}} = 24.5\,\text{m/s} \approx 25\,\text{m/s}$

---

##### 設問(3)
* **重力の仕事率 $P_{\text{grav}}$**:
  $$P_{\text{grav}} = m g \cdot v_{\text{terminal}} = (0.20 \times 9.8) \times 24.5 = 1.96 \times 24.5 = 48.02\,\text{W}$$
* **ジュール熱の仕事率 $P_{\text{joule}}$**:
  終端速度での電流 $I_{\text{terminal}}$ は：
  $$I_{\text{terminal}} = \frac{v_{\text{terminal}} B L}{R} = \frac{24.5 \times 0.80 \times 0.50}{2.0} = \frac{9.8}{2.0} = 4.9\,\text{A}$$
  消費されるジュール熱の仕事率は：
  $$P_{\text{joule}} = I_{\text{terminal}}^2 R = (4.9)^2 \times 2.0 = 24.01 \times 2.0 = 48.02\,\text{W}$$
* **比較と考察**:
  $$P_{\text{grav}} = P_{\text{joule}} = 48\,\text{W}$$
  両者は完全に一致する。重力による位置エネルギーの減少分が、すべて抵抗の熱エネルギーへと変換されて等速運動が保たれていることが確認できる。

**答**: $P_{\text{grav}} = 48\,\text{W}, \;\; P_{\text{joule}} = 48\,\text{W}$（両者は完全に一致する）

---

### 【最難関大・発展演習】自己相似な無限はしご型コンデンサー回路と磁場中を落下する導体棒

高校物理（「物理基礎」および「物理」）の範囲内で解くことができ、「**空間的な無限（自己相似性をもつ無限はしご型コンデンサー回路） **」と「** 時間的な無限（$t \to \infty$ における導体棒の漸近挙動）**」の2つの「無限」が交差する、難関大入試レベルの融合難問です。

微積分や微分方程式を一切使わずに、「**自己相似性」「無限等比級数」「力積と運動量の関係」「キルヒホッフの法則**」を組み合わせることで、直感に反する物理現象まで厳密に導き出せる構成になっています。

<div class="vector-diagram-card">
  <svg viewBox="0 0 700 240" class="academic-svg" aria-label="無限はしご型コンデンサー回路と落下導体棒">
    <defs>
      <marker id="arrInd" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="arrGrav" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
    </defs>

    <!-- Magnetic field B symbols -->
    <text x="40" y="30" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="40" y="60" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="40" y="90" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="40" y="120" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="40" y="150" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="40" y="180" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="40" y="210" fill="#38bdf8" font-size="12" font-family="monospace">⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗ ⊗</text>
    <text x="560" y="30" fill="#38bdf8" font-size="12" font-weight="bold" font-family="monospace">⊗ B (紙面奥向き)</text>

    <!-- Rails M1, M2 -->
    <line x1="80" y1="50" x2="80" y2="230" stroke="#a1a1aa" stroke-width="4" />
    <text x="65" y="235" fill="#a1a1aa" font-size="11" font-weight="bold" font-family="sans-serif">M₁</text>
    <line x1="200" y1="50" x2="200" y2="230" stroke="#a1a1aa" stroke-width="4" />
    <text x="205" y="235" fill="#a1a1aa" font-size="11" font-weight="bold" font-family="sans-serif">M₂</text>

    <!-- Rail width L -->
    <line x1="80" y1="40" x2="200" y2="40" stroke="#e4e4e7" stroke-width="1.5" />
    <text x="135" y="35" fill="#e4e4e7" font-size="11" font-family="sans-serif">間隔 L</text>

    <!-- Terminals X, Y -->
    <circle cx="80" cy="50" r="4" fill="#38bdf8" />
    <text x="60" y="48" fill="#38bdf8" font-size="12" font-weight="bold" font-family="sans-serif">X (N₀)</text>
    <circle cx="200" cy="50" r="4" fill="#38bdf8" />
    <text x="210" y="48" fill="#38bdf8" font-size="12" font-weight="bold" font-family="sans-serif">Y (基準電位0)</text>

    <!-- Falling rod PQ -->
    <rect x="75" y="125" width="130" height="12" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5" rx="3" />
    <text x="95" y="120" fill="#f59e0b" font-size="11" font-weight="bold" font-family="sans-serif">導体棒 PQ (質量 m, 抵抗 R)</text>
    <line x1="140" y1="145" x2="140" y2="185" stroke="#f43f5e" stroke-width="2.5" marker-end="url(#arrGrav)" />
    <text x="148" y="170" fill="#f43f5e" font-size="11" font-weight="bold" font-family="sans-serif">mg (重力)</text>
    <line x1="140" y1="120" x2="140" y2="90" stroke="#10b981" stroke-width="2" marker-end="url(#arrInd)" />
    <text x="148" y="105" fill="#10b981" font-size="10" font-weight="bold" font-family="sans-serif">I BL (電磁ブレーキ)</text>

    <!-- Connection from X, Y to Ladder circuit on the right -->
    <line x1="80" y1="50" x2="270" y2="50" stroke="#38bdf8" stroke-width="2" />
    <line x1="200" y1="50" x2="200" y2="65" stroke="#38bdf8" stroke-width="2" />
    <line x1="200" y1="65" x2="270" y2="65" stroke="#38bdf8" stroke-width="2" />
    <line x1="270" y1="65" x2="270" y2="170" stroke="#38bdf8" stroke-width="2" />
    <line x1="270" y1="170" x2="680" y2="170" stroke="#38bdf8" stroke-width="2" />

    <!-- Ladder Network: Stage 1 -->
    <!-- Cap A1 on upper wire -->
    <line x1="270" y1="50" x2="310" y2="50" stroke="#38bdf8" stroke-width="2" />
    <line x1="310" y1="40" x2="310" y2="60" stroke="#fff" stroke-width="2.5" />
    <line x1="316" y1="40" x2="316" y2="60" stroke="#fff" stroke-width="2.5" />
    <text x="305" y="32" fill="#fff" font-size="10" font-family="sans-serif">A₁ (C)</text>
    <line x1="316" y1="50" x2="360" y2="50" stroke="#38bdf8" stroke-width="2" />
    <circle cx="360" cy="50" r="3" fill="#fbbf24" />
    <text x="355" y="42" fill="#fbbf24" font-size="10" font-weight="bold" font-family="sans-serif">N₁</text>
    <!-- Cap B1 vertical -->
    <line x1="360" y1="50" x2="360" y2="95" stroke="#38bdf8" stroke-width="2" />
    <line x1="350" y1="95" x2="370" y2="95" stroke="#fff" stroke-width="2.5" />
    <line x1="350" y1="101" x2="370" y2="101" stroke="#fff" stroke-width="2.5" />
    <text x="375" y="102" fill="#fff" font-size="10" font-family="sans-serif">B₁ (C)</text>
    <line x1="360" y1="101" x2="360" y2="170" stroke="#38bdf8" stroke-width="2" />

    <!-- Stage 2 -->
    <line x1="360" y1="50" x2="410" y2="50" stroke="#38bdf8" stroke-width="2" />
    <line x1="410" y1="40" x2="410" y2="60" stroke="#fff" stroke-width="2.5" />
    <line x1="416" y1="40" x2="416" y2="60" stroke="#fff" stroke-width="2.5" />
    <text x="405" y="32" fill="#fff" font-size="10" font-family="sans-serif">A₂ (C)</text>
    <line x1="416" y1="50" x2="460" y2="50" stroke="#38bdf8" stroke-width="2" />
    <circle cx="460" cy="50" r="3" fill="#fbbf24" />
    <text x="455" y="42" fill="#fbbf24" font-size="10" font-weight="bold" font-family="sans-serif">N₂</text>
    <!-- Cap B2 -->
    <line x1="460" y1="50" x2="460" y2="95" stroke="#38bdf8" stroke-width="2" />
    <line x1="450" y1="95" x2="470" y2="95" stroke="#fff" stroke-width="2.5" />
    <line x1="450" y1="101" x2="470" y2="101" stroke="#fff" stroke-width="2.5" />
    <text x="475" y="102" fill="#fff" font-size="10" font-family="sans-serif">B₂ (C)</text>
    <line x1="460" y1="101" x2="460" y2="170" stroke="#38bdf8" stroke-width="2" />

    <!-- Stage 3 -->
    <line x1="460" y1="50" x2="510" y2="50" stroke="#38bdf8" stroke-width="2" />
    <line x1="510" y1="40" x2="510" y2="60" stroke="#fff" stroke-width="2.5" />
    <line x1="516" y1="40" x2="516" y2="60" stroke="#fff" stroke-width="2.5" />
    <text x="505" y="32" fill="#fff" font-size="10" font-family="sans-serif">A₃</text>
    <line x1="516" y1="50" x2="560" y2="50" stroke="#38bdf8" stroke-width="2" />
    <circle cx="560" cy="50" r="3" fill="#fbbf24" />
    <text x="555" y="42" fill="#fbbf24" font-size="10" font-weight="bold" font-family="sans-serif">N₃</text>
    <!-- Cap B3 -->
    <line x1="560" y1="50" x2="560" y2="95" stroke="#38bdf8" stroke-width="2" />
    <line x1="550" y1="95" x2="570" y2="95" stroke="#fff" stroke-width="2.5" />
    <line x1="550" y1="101" x2="570" y2="101" stroke="#fff" stroke-width="2.5" />
    <text x="575" y="102" fill="#fff" font-size="10" font-family="sans-serif">B₃</text>
    <line x1="560" y1="101" x2="560" y2="170" stroke="#38bdf8" stroke-width="2" />

    <!-- Infinite continuation dots -->
    <text x="590" y="55" fill="#38bdf8" font-size="20" font-family="sans-serif">…</text>
    <text x="590" y="175" fill="#38bdf8" font-size="20" font-family="sans-serif">…</text>
    <text x="570" y="215" fill="#fbbf24" font-size="11" font-weight="bold" font-family="sans-serif">合成容量 C_∞ = (√5 - 1)/2 C</text>
  </svg>
  <div class="diagram-caption">図: 無限はしご型コンデンサー回路と磁場中を落下する導体棒</div>
</div>

#### 【問題文】
鉛直面内に、間隔 $L$ で互いに平行な2本の十分長い（下方に無限に伸びる）なめらかな金属レール $\mathrm{M}_1, \mathrm{M}_2$ が鉛直に固定されている。空間全体には、レールを含む鉛直面に垂直で手前から奥に向かう向きに、磁束密度の大きさ $B$ の一様な磁場がかかっている。重力加速度の大きさを $g$ とする。

レールの上端（入力端子 $\mathrm{X}, \mathrm{Y}$）の間には、すべて同じ電気容量 $C$ をもつコンデンサーが **無限個**、はしご状（ラダー状）に接続された回路網がつながっている。具体的には、左から第 $n$ 番目の基本区間（$n = 1, 2, 3, \dots$）として、
- 上側の導線に直列に挿入された電気容量 $C$ のコンデンサー $\mathrm{A}_n$
- そのすぐ右側の節点 $\mathrm{N}_n$ と下側の共通導線（端子 $\mathrm{Y}$ から水平に伸びる導線）の間に並列に接続された電気容量 $C$ のコンデンサー $\mathrm{B}_n$

のペアが、右方へ無限に繰り返されている（ただし、節点 $\mathrm{N}_0$ は入力端子 $\mathrm{X}$ を表すものとする）。

レール $\mathrm{M}_1, \mathrm{M}_2$ の間には、質量 $m$、長さ $L$、電気抵抗 $R$ の一様な導体棒 $\mathrm{PQ}$ が水平（レールに垂直）に掛けられており、レールと常に接触を保ちながら摩擦なく鉛直方向に運動できる。レールや導線の電気抵抗、回路の自己インダクタンス、空気抵抗、および電磁波の放射は無視できるものとする。また、初期状態においてすべてのコンデンサーに蓄えられている電気量は $0$ である。

##### 設問 (1)：無限はしご型回路の合成容量と黄金比
まず、導体棒を取り除き、入力端子 $\mathrm{X}, \mathrm{Y}$ から右側の無限回路全体を見込んだ全体の合成容量を $C_\infty$ とおく。
無限に続く回路の「自己相似性」（第1区間 $\mathrm{A}_1, \mathrm{B}_1$ を取り除いた残りの無限回路の合成容量もまた $C_\infty$ に等しいこと）に着目し、合成容量 $C_\infty$ を $C$ を用いて表せ。

##### 設問 (2)：無限回路内部の電位分布・電荷保存・静電エネルギーの総和
下側の共通導線（端子 $\mathrm{Y}$）の電位を $0$（基準）とし、入力端子 $\mathrm{X}$（節点 $\mathrm{N}_0$）に電位 $V_0$（$V_0$ は正）を与えたとき、第 $n$ 区間の節点 $\mathrm{N}_n$ の電位を $V_n$（$n = 1, 2, 3, \dots$）とする。また、設問 (1) で求めた無次元比を $\alpha = \dfrac{C_\infty}{C}$（ただし $\alpha^2 + \alpha - 1 = 0$ を満たす正の定数）とおく。

- (a) 隣り合う節点の電位の比 $k = \dfrac{V_n}{V_{n-1}}$ が $n$ によらない定数であり、$k = \alpha^2$ となることを示せ。また、$k$ の具体的な数値と、節点 $\mathrm{N}_n$ の電位 $V_n$ を $V_0$ および $n$ を用いて表せ。
- (b) 第 $n$ 区間の並列コンデンサー $\mathrm{B}_n$ に蓄えられる電気量を $Q_{\mathrm{B}_n}$ とする。無限個の並列コンデンサーすべてに蓄えられる電気量の総和 $Q_{\mathrm{B, total}} = \sum_{n=1}^{\infty} Q_{\mathrm{B}_n}$ を無限等比級数の和として求め、それが入力端子 $\mathrm{X}$ から流入した全電気量 $Q_{\mathrm{in}} = C_\infty V_0$ に完全に一致することを示せ。
- (c) 第 $n$ 区間の2つのコンデンサー $\mathrm{A}_n, \mathrm{B}_n$ に蓄えられる静電エネルギーの和を $u_n = U_{\mathrm{A}_n} + U_{\mathrm{B}_n}$ とする。無限個のコンデンサーすべてに蓄えられる静電エネルギーの総和 $U_{\mathrm{total}} = \sum_{n=1}^{\infty} u_n$ を計算し、等価合成容量 $C_\infty$ を用いた式 $\dfrac{1}{2} C_\infty V_0^2$ に一致することを示せ。

##### 設問 (3)：磁場中を落下する導体棒と時間無限大（$t \to \infty$）の極限
すべてのコンデンサーの電荷を $0$ に戻した上で、時刻 $t = 0$ に導体棒 $\mathrm{PQ}$ を初速度 $0$ で静かに放したところ、導体棒は重力を受けて鉛直下向きに運動を始めた。
時刻 $t$ が十分に大きくなった極限（$t \to \infty$）において、導体棒の加速度 $a(t)$ は一定の値 $a_\infty$ に、導体棒を流れる電流 $I(t)$ は一定の値 $I_\infty$ にそれぞれ収束する。
$a_\infty$ と $I_\infty$ を、$m, g, B, L, C$（または $C_\infty$）を用いて表せ。また、この定常状態において第 $n$ 区間の並列コンデンサー $\mathrm{B}_n$ に流れ込み続ける電流 $I_{\mathrm{B}_n, \infty}$ を $I_\infty, \alpha, n$ を用いて表せ。

##### 設問 (4)：微積分を用いない漸近速度のズレ $\Delta v_\infty$ の導出
もし導体棒の電気抵抗が $R = 0$ であれば、導体棒は時刻 $t = 0$ からずっと一定の加速度 $a_\infty$ で落下し、時刻 $t$ における速さは $v_{\mathrm{ideal}}(t) = a_\infty t$ となる。
では、導体棒に電気抵抗 $R$（$R$ は正）がある場合、十分時間が経過した時刻 $t$（$t \to \infty$）における実際の速さ $v(t)$ は、理想的な速さ $v_{\mathrm{ideal}}(t) = a_\infty t$ に比べて **速くなるか、遅くなるか、あるいは一致するか**。

時刻 $0$ から時刻 $t$ までの導体棒に対する「運動量と力積の関係」と、時刻 $t$ における「キルヒホッフの第二法則」を組み合わせることで、微積分を用いずに時刻 $t$ における速さ $v(t)$ と電流 $I(t)$ の関係式を導き、極限値

$$
\Delta v_\infty = \lim_{t \to \infty} \left\{ v(t) - a_\infty t \right\}
$$

を $m, g, B, L, R, C_\infty$ を用いて表せ。また、$\Delta v_\infty$ の符号がそうなる物理的理由を定性的に説明せよ。

---

<details class="tip">
<summary><strong>💡 思考のヒント・着眼点（クリックして開く）</strong></summary>

1. **設問 (1)・(2) の代数計算の工夫 ** $\alpha = \dfrac{C_\infty}{C} = \dfrac{\sqrt{5}-1}{2}$ を毎回根号の分数で代入すると計算が大変になります。$\alpha$ が二次方程式 $\alpha^2 + \alpha - 1 = 0$ の解であることを利用し、**「$\alpha^2 = 1 - \alpha$」という次数下げ公式** を使うと、分圧比や等比級数の和が鮮やかに約分できます。
2. **設問 (3) の $t \to \infty$ におけるキルヒホッフの法則**  
   無限はしご回路全体は、端子 $\mathrm{X}, \mathrm{Y}$ から見れば単一の電気容量 $C_\infty$ のコンデンサーと完全に等価です。微小時間 $\Delta t$ の間に速度が $\Delta v = a_\infty \Delta t$、電荷が $\Delta Q = I_\infty \Delta t$ 変化し、電流が一定（$\Delta I = 0$）になることから、抵抗での電圧降下 $R I_\infty$ の変化量が $0$ になることに着目します。
3. **設問 (4) の力積と電荷の関係**  
   電流 $I(t)$ が時間変化しても、微小時間 $\Delta t$ に導体棒が受ける上向きの力積 $I(t) B L \Delta t$ は $B L \Delta Q$ に等しいため、時刻 $0$ から $t$ までの力積の総和は、時刻 $t$ までに回路へ流れ込んだ総電気量 $Q(t)$ を使って厳密に $B L Q(t)$ と表せます。
</details>

---

#### 【解答・完全解説】

##### 設問 (1) の解説
入力端子 $\mathrm{X}, \mathrm{Y}$ から右側の無限回路全体を見込んだ合成容量が $C_\infty$ であるとき、無限に続く回路の自己相似性より、第1区間の節点 $\mathrm{N}_1$ と下側共通導線の間から右側（第2区間以降）を見込んだ合成容量も $C_\infty$ に等しい。

したがって、回路全体は「コンデンサー $\mathrm{B}_1$（電気容量 $C$）と合成容量 $C_\infty$ の並列接続（合成容量 $C + C_\infty$）」に、「コンデンサー $\mathrm{A}_1$（電気容量 $C$）」を直列に接続したものと等価である。直列合成容量の公式より、

$$
C_\infty = \frac{C(C + C_\infty)}{C + (C + C_\infty)} = \frac{C(C + C_\infty)}{2C + C_\infty}
$$

分母を払って整理すると、

$$
C_\infty^2 + 2C C_\infty = C^2 + C C_\infty \implies C_\infty^2 + C C_\infty - C^2 = 0
$$

$C_\infty > 0$ であるから、二次方程式の解の公式より、求める合成容量は

$$
\mathbf{C_\infty = \frac{\sqrt{5} - 1}{2} C}
$$

となる（この係数 $\alpha = \dfrac{\sqrt{5} - 1}{2} \approx 0.618$ は黄金比 $\phi = \dfrac{1 + \sqrt{5}}{2}$ の逆数である）。

##### 設問 (2) の解説

###### (a) 電位の減衰比 $k$ と一般項 $V_n$
節点 $\mathrm{N}_0$（電位 $V_0$）から見ると、電気容量 $C$ のコンデンサー $\mathrm{A}_1$ と、節点 $\mathrm{N}_1$ 以降の合成容量 $C + C_\infty$ が直列に接続されている。直列接続されたコンデンサーの電圧は電気容量の逆数に比例して分圧されるため、節点 $\mathrm{N}_1$ の電位 $V_1$ は、

$$
V_1 = \frac{C}{C + (C + C_\infty)} V_0 = \frac{1}{2 + \alpha} V_0
$$

となる。ここで $\alpha = \dfrac{C_\infty}{C}$ は $\alpha^2 + \alpha - 1 = 0$（すなわち $1 - \alpha = \alpha^2$、また $1 + \alpha = \dfrac{1}{\alpha}$）を満たすので、

$$
\frac{V_1}{V_0} = \frac{1}{1 + (1 + \alpha)} = \frac{1}{1 + \frac{1}{\alpha}} = \frac{\alpha}{\alpha + 1} = \alpha^2
$$

回路の自己相似性により、第 $n-1$ 節点と第 $n$ 節点の間でも全く同じ分圧比が成り立つため、

$$
\mathbf{k = \frac{V_n}{V_{n-1}} = \alpha^2 = \left(\frac{\sqrt{5} - 1}{2}\right)^2 = \frac{3 - \sqrt{5}}{2}}
$$

したがって、節点 $\mathrm{N}_n$ の電位 $V_n$ は、

$$
\mathbf{V_n = k^n V_0 = \left(\frac{3 - \sqrt{5}}{2}\right)^n V_0 \quad \left(= \alpha^{2n} V_0\right)}
$$

###### (b) 無限個の並列コンデンサーの電気量の総和
第 $n$ 区間の並列コンデンサー $\mathrm{B}_n$ にかかる電圧は $V_n = k^n V_0$ であるから、蓄えられる電気量は $Q_{\mathrm{B}_n} = C V_n = C k^n V_0$ である。  
公比 $k = \dfrac{3 - \sqrt{5}}{2} \approx 0.382 < 1$ より、無限等比級数の総和 $Q_{\mathrm{B, total}}$ は、

$$
Q_{\mathrm{B, total}} = \sum_{n=1}^{\infty} C k^n V_0 = C V_0 \frac{k}{1 - k}
$$

ここで $k = \alpha^2$ および $1 - \alpha^2 = \alpha$ を代入すると、

$$
Q_{\mathrm{B, total}} = C V_0 \frac{\alpha^2}{\alpha} = \alpha C V_0 = C_\infty V_0 = \mathbf{Q_{\mathrm{in}}}
$$

となり、流入した全電気量 $Q_{\mathrm{in}}$ に完全に一致する。（証明終）

###### (c) 無限個のコンデンサーの静電エネルギーの総和
第 $n$ 区間において、直列コンデンサー $\mathrm{A}_n$ の両端の電位差は $V_{n-1} - V_n = (1 - k) V_{n-1} = (1 - k) k^{n-1} V_0$、並列コンデンサー $\mathrm{B}_n$ の電位差は $V_n = k^n V_0$ である。よって第 $n$ 区間の静電エネルギーの和 $u_n$ は、

$$
u_n = \frac{1}{2} C (V_{n-1} - V_n)^2 + \frac{1}{2} C V_n^2 = \frac{1}{2} C V_0^2 \left\{ (1 - k)^2 + k^2 \right\} k^{2(n-1)}
$$

これを $n = 1$ から $\infty$ まで足し合わせると、初項 $\dfrac{1}{2} C V_0^2 \{(1 - k)^2 + k^2\}$、公比 $k^2$ の無限等比級数の和となる：

$$
U_{\mathrm{total}} = \sum_{n=1}^{\infty} u_n = \frac{1}{2} C V_0^2 \frac{(1 - k)^2 + k^2}{1 - k^2}
$$

$k = \alpha^2$、$1 - k = \alpha$ を代入すると、

$$
\frac{(1 - k)^2 + k^2}{1 - k^2} = \frac{\alpha^2 + \alpha^4}{(1 - \alpha^2)(1 + \alpha^2)} = \frac{\alpha^2 (1 + \alpha^2)}{\alpha (1 + \alpha^2)} = \alpha
$$

ゆえに、

$$
\mathbf{U_{\mathrm{total}} = \frac{1}{2} \alpha C V_0^2 = \frac{1}{2} C_\infty V_0^2}
$$

となり、等価合成容量 $C_\infty$ の単一コンデンサーの静電エネルギーと完全に一致する。（証明終）

##### 設問 (3) の解説
鉛直下向きを正とし、時刻 $t$ における導体棒の速さを $v(t)$、加速度を $a(t)$、導体棒を流れる電流を $I(t)$、時刻 $t$ までに端子 $\mathrm{X}$ へ流入した総電気量を $Q(t)$ とする。

運動方程式：
$$m a(t) = mg - I(t) B L \quad \cdots \text{①}$$
キルヒホッフの第二法則（回路全体は合成容量 $C_\infty$ と等価）：
$$v(t) B L - R I(t) - \frac{Q(t)}{C_\infty} = 0 \quad \cdots \text{②}$$

極限（$t \to \infty$）において加速度が $a_\infty$、電流が $I_\infty$（一定）に収束するとき、微小時間 $\Delta t$ の間の変化量は $\Delta v = a_\infty \Delta t$、$\Delta I = 0$、$\Delta Q = I_\infty \Delta t$ となる。②式の微小変化をとると：

$$
B L a_\infty \Delta t - 0 - \frac{I_\infty \Delta t}{C_\infty} = 0 \implies I_\infty = C_\infty B L a_\infty \quad \cdots \text{③}
$$

③を①の極限式 $m a_\infty = mg - I_\infty B L$ に代入すると、

$$
m a_\infty = mg - C_\infty B^2 L^2 a_\infty
$$

これより求める加速度 $a_\infty$ と電流 $I_\infty$ は：

$$
\mathbf{a_\infty = \frac{mg}{m + C_\infty B^2 L^2} = \frac{2mg}{2m + (\sqrt{5} - 1) C B^2 L^2}}
$$

$$
\mathbf{I_\infty = \frac{C_\infty B L mg}{m + C_\infty B^2 L^2} = \frac{(\sqrt{5} - 1) C B L mg}{2m + (\sqrt{5} - 1) C B^2 L^2}}
$$

また、第 $n$ 区間の並列コンデンサー $\mathrm{B}_n$ に蓄えられる電気量は設問 (2) より $Q_{\mathrm{B}_n}(t) = \alpha^{2n-1} Q(t)$ であるから、定常的に流れ込み続ける電流 $I_{\mathrm{B}_n, \infty}$ は：

$$
\mathbf{I_{\mathrm{B}_n, \infty} = \alpha^{2n-1} I_\infty = \left(\frac{\sqrt{5} - 1}{2}\right)^{2n-1} I_\infty}
$$

##### 設問 (4) の解説
時刻 $0$ から時刻 $t$ までの「運動量と力積の関係」より：

$$
m v(t) - 0 = m g t - B L Q(t) \implies Q(t) = \frac{m g t - m v(t)}{B L} \quad \cdots \text{④}
$$

キルヒホッフの第二法則②より：

$$
Q(t) = C_\infty B L v(t) - C_\infty R I(t) \quad \cdots \text{⑤}
$$

④と⑤から $Q(t)$ を消去して整理すると：

$$
(m + C_\infty B^2 L^2) v(t) = m g t + C_\infty R B L I(t)
$$

$$
v(t) = a_\infty t + \frac{C_\infty R B L}{m + C_\infty B^2 L^2} I(t) \quad \cdots \text{⑥}
$$

時刻 $t \to \infty$ では $I(t) \to I_\infty = C_\infty B L a_\infty$ に収束するため、

$$
\mathbf{\Delta v_\infty = \lim_{t \to \infty} \left\{ v(t) - a_\infty t \right\} = \frac{C_\infty^2 B^2 L^2 R m g}{(m + C_\infty B^2 L^2)^2} > 0}
$$

- **結論と定性的理由： ** $\Delta v_\infty > 0$ であるため、電気抵抗 $R$ がある場合の実際の速さ $v(t)$ は、**$R = 0$ の理想的な速さ $a_\infty t$ よりも $\Delta v_\infty$ だけ速くなる **。** 【理由】**  
  抵抗 $R$ がある場合、運動初期（$t=0$）で電流が $0$ から立ち上がるまでに遅れが生じ、導体棒に働く電磁ブレーキ力 $I(t) B L$ が $R=0$ の場合よりも一時的に弱くなります。その間に初期加速度が重力加速度 $g$ 近くまで大きくなって余分にスピードを獲得し、その先行した速度のズレが終端等加速度運動へと移行した後も $\Delta v_\infty$ の下駄（シフト）として永久に残るためです。

---

## 7. 受験生が陥りやすい誤解・つまずき

### 誤解1：「終端速度になったら、もう電磁気力は働かなくなる」
* **最大の勘違いです！**
  * 加速度が $0$ になるのは「力がつり合っているから」であって、「力が消えたから」ではありません。
  * 終端速度でも導線棒は猛スピードで磁場を横切っているため、一定の誘導起電力と誘導電流が流れ続け、重力と同じ大きさの上向き電磁気力 $F_{\text{mag}} = mg$ がずっと支え続けています。

### 誤解2：「ファラデーの式のマイナスを計算結果につけて負の電圧にしてしまう」
* ファラデーの法則の公式 $V = -N \frac{\Delta \Phi}{\Delta t}$ にあるマイナス記号は、「磁束の変化を妨げる向き（レンツの法則）」を表す記号的な意味合いです。
* 実際の入試問題では、まず起電力の **大きさ（絶対値）** を $|V| = N \left|\frac{\Delta \Phi}{\Delta t}\right|$ で求め、 **向き（符号）** はレンツの法則から右ねじを使って作図で判定するのが、最も計算ミスを防ぐ鉄則です。

---

## 8. 要点まとめ

::: tip 📋 電磁誘導の重要公式・解法総まとめ
* **ファラデーの電磁誘導の法則**:
  $$V = -N \frac{\Delta\Phi}{\Delta t} \quad [\text{V}]$$
  * 磁束: $\Phi = B S \quad [\text{Wb}]$
  * 負符号（$-$）は **レンツの法則** を表し、「磁束の変化を妨げる向きに誘導起電力・誘導電流が生じる」ことを示す。

* **磁場を横切る導線棒の誘導起電力**:
  $$V = v B l \quad [\text{V}]$$
  * 高電位端の見分け方：自由電子が受けるローレンツ力（フレミングの左手の中指が正電荷の受ける力＝高電位側）。

* **レール回路の終端速度**:
  $$mg = \frac{B^2 l^2 v_{\text{terminal}}}{R} \implies v_{\text{terminal}} = \frac{mgR}{B^2 l^2}$$

* **エネルギー保存の鉄則**:
  $$(\text{重力・外力の仕事率 } P = F v) = (\text{回路の消費電力・ジュール熱 } P = I^2 R)$$
:::

<!--@include: ../parts/notice.md-->
