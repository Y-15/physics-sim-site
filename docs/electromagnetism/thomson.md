---
title: トムソンの比電荷測定と速度セレクター（直交電磁場）の完全導出
description: 高校物理・大学入試超頻出「トムソンの比電荷測定実験」。直交電磁場による速度セレクターv=E/Bの原理、電場による放物運動、磁場による円運動、電子の比電荷e/m=1.76×10^11 C/kgの導出、陰極線と電子の発見の歴史的意義をシミュレータと図解で徹底解説！
---

# トムソンの比電荷測定と速度セレクター

1897年、イギリスの物理学者 **J.J.トムソン（Joseph John Thomson）** は、真空放電管（陰極線管）を用いた画期的な実験によって、陰極線の正体が負の電荷をもつ未知の微粒子であることを突き止めました。

これが人類史上初となる素粒子「**電子（Electron）**」の発見です。

トムソンは電場と磁場を直交させた空間に陰極線を通すことで、個々の質量 $m$ や電気量 $e$ は直接測れなくとも、その比率である「**比電荷（Specific charge） $\frac{e}{m}$**」を極めて高い精度で決定することに成功しました。

<ClientOnly>
  <ThomsonSim />
</ClientOnly>

---

## 1. 速度セレクター（直交電磁場フィルター）の原理

電子銃から射出される電子ビームには速度のばらつきが存在するため、まずは特定の速さの電子のみを選別する必要があります。

下向きの一様な電場 $E$ と、紙面の表から裏に向かう一様な磁場 $B$ を重ね合わせた空間（**直交電磁場**）に、電子（電荷 $-e$、質量 $m$）が水平右向きに速さ $v$ で突入したとします。

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 220" class="academic-svg" aria-label="速度セレクターにおける電場・磁場・力のつり合い図解">
    <defs>
      <marker id="thomson-arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="thomson-arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
      </marker>
      <marker id="thomson-arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
      </marker>
    </defs>

    <!-- 上極板 (+) -->
    <rect x="60" y="25" width="420" height="12" rx="3" fill="#ef4444" opacity="0.8" />
    <text x="270" y="20" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle">上極板（正電位 ＋）</text>

    <!-- 下極板 (-) -->
    <rect x="60" y="175" width="420" height="12" rx="3" fill="#38bdf8" opacity="0.8" />
    <text x="270" y="205" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">下極板（負電位 −）</text>

    <!-- 電場ベクトル E (下向き) -->
    <g stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3">
      <line x1="120" y1="40" x2="120" y2="165" marker-end="url(#thomson-arrow-blue)" />
      <line x1="200" y1="40" x2="200" y2="165" marker-end="url(#thomson-arrow-blue)" />
      <line x1="340" y1="40" x2="340" y2="165" marker-end="url(#thomson-arrow-blue)" />
      <line x1="420" y1="40" x2="420" y2="165" marker-end="url(#thomson-arrow-blue)" />
    </g>
    <text x="445" y="105" fill="#38bdf8" font-size="12" font-weight="bold">電場 E (↓)</text>

    <!-- 磁場 B (奥向き ⊗) グリッド -->
    <g stroke="#a78bfa" stroke-width="1.5">
      <g transform="translate(160, 70)"><circle cx="0" cy="0" r="8" fill="none"/><line x1="-5" y1="-5" x2="5" y2="5"/><line x1="5" y1="-5" x2="-5" y2="5"/></g>
      <g transform="translate(160, 140)"><circle cx="0" cy="0" r="8" fill="none"/><line x1="-5" y1="-5" x2="5" y2="5"/><line x1="5" y1="-5" x2="-5" y2="5"/></g>
      <g transform="translate(380, 70)"><circle cx="0" cy="0" r="8" fill="none"/><line x1="-5" y1="-5" x2="5" y2="5"/><line x1="5" y1="-5" x2="-5" y2="5"/></g>
      <g transform="translate(380, 140)"><circle cx="0" cy="0" r="8" fill="none"/><line x1="-5" y1="-5" x2="5" y2="5"/><line x1="5" y1="-5" x2="-5" y2="5"/></g>
    </g>
    <text x="395" y="60" fill="#a78bfa" font-size="11" font-weight="bold">磁場 B (⊗)</text>

    <!-- 電子の軌道（直進軌道） -->
    <line x1="30" y1="105" x2="510" y2="105" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4,4" />
    <line x1="30" y1="105" x2="245" y2="105" stroke="#fbbf24" stroke-width="2.5" marker-end="url(#thomson-arrow-amber)" />

    <!-- 電子粒子本体 -->
    <circle cx="270" cy="105" r="9" fill="#1e293b" stroke="#fbbf24" stroke-width="2.5" />
    <text x="270" y="109" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">−</text>
    <text x="270" y="125" fill="#f8fafc" font-size="11" text-anchor="middle">電子 -e</text>

    <!-- 力のつり合いベクトル -->
    <!-- 上向き: 静電気力 Fe = eE -->
    <line x1="270" y1="96" x2="270" y2="52" stroke="#ef4444" stroke-width="2.5" marker-end="url(#thomson-arrow-red)" />
    <text x="282" y="65" fill="#ef4444" font-size="12" font-weight="bold">F_E = eE (上向き)</text>

    <!-- 下向き: ローレンツ力 Fb = evB -->
    <line x1="270" y1="114" x2="270" y2="158" stroke="#a78bfa" stroke-width="2.5" marker-end="url(#thomson-arrow-blue)" />
    <text x="282" y="152" fill="#a78bfa" font-size="12" font-weight="bold">F_B = evB (下向き)</text>
  </svg>
  <div class="diagram-caption">図: 速度セレクター（直交電磁場）における静電気力とローレンツ力の拮抗</div>
</div>

電子が受ける2つの力を検証します：

1. **静電気力 $\vec{F}_E$**:
   電場は下向きですが、電子の電荷は負（$-e$）であるため、 **上向き** に力を受けます。
   $$
   F_E = e E \quad (\text{上向き})
   $$
2. **ローレンツ力 $\vec{F}_B$**:
   フレミングの左手の法則（電流の向きは電子の運動と逆の左向き、磁場は奥向き）より、電子は **下向き** に力を受けます。
   $$
   F_B = e v B \quad (\text{下向き})
   $$

### 直進条件（速度セレクター公式）
電子が曲がらずに真っ直ぐ直進するためには、これら2つの力が完全につり合わなければなりません。

$$
F_E = F_B \iff e E = e v B
$$

両辺の電荷 $e$ を割ると：

$$
v = \frac{E}{B}
$$

::: tip 速度セレクターの驚くべき性質
この条件式 $v = E/B$ には、 **粒子の質量 $m$ も電荷 $e$ も含まれていません！** 電荷の符号や大きさ、粒子の重さに関係なく、 **速さがちょうど $v = \frac{E}{B}$ である粒子だけが直進** し、それより速い粒子はローレンツ力（下向き）に曲げられ、遅い粒子は電場力（上向き）に曲げられて排除されます。
:::

---

## 2. 電場のみによる偏向と放物運動

速さ $v$ が揃った電子ビームを、長さ $l$、極板間隔 $d$ の平行平板電極（電場 $E = \frac{V}{d}$ のみ印加、磁場 $B = 0$）に通します。

電子は水平（$x$ 軸）方向には等速直線運動、垂直（$y$ 軸）方向には一定の静電力 $F = eE$ による等加速度運動（**放物運動**）を行います。

### ① 偏向部通過中の運動（$0 \le x \le l$）
- 通過時間: $t_1 = \frac{l}{v}$
- $y$ 方向の加速度: $a_y = \frac{eE}{m}$
- 極板出口での垂直変位 $y_1$:
  $$
  y_1 = \frac{1}{2} a_y t_1^2 = \frac{e E l^2}{2 m v^2}
  $$
- 極板出口での垂直速度 $v_y$:
  $$
  v_y = a_y t_1 = \frac{e E l}{m v}
  $$

### ② 極板を出てからスクリーンまで（距離 $L$）
極板を出た後は力を受けないため、出口での速度ベクトルを保って等速直線運動をします。

- スクリーン到達までの時間: $t_2 = \frac{L}{v}$
- スクリーンまでの追加変位: $y_2 = v_y t_2 = \frac{e E l L}{m v^2}$

### ③ スクリーン上の総変位 $Y$

$$
Y = y_1 + y_2 = \frac{e E l}{m v^2} \left(\frac{l}{2} + L\right)
$$

> **幾何学的解釈**:
> 電子は、あたかも「**極板の中央点（$x = l/2$）から直進して飛び出してきた**」かのようにスクリーンに衝突します！

---

## 3. 電子の比電荷 $\frac{e}{m}$ の導出

ここで、先に速度セレクターから求めた速さ $v = \frac{E}{B}$ を上の式に代入します。

$$
\begin{aligned}
Y &= \frac{e E l}{m \left(\frac{E}{B}\right)^2} \left(\frac{l}{2} + L\right) \\
&= \frac{e}{m} \cdot \frac{B^2 l}{E} \left(\frac{l}{2} + L\right)
\end{aligned}
$$

この式を比電荷 $\frac{e}{m}$ について解くと：

$$
\frac{e}{m} = \frac{Y E}{B^2 l \left(\frac{l}{2} + L\right)}
$$

この右辺の量は、すべて実験室で測定可能なマクロな量（電場 $E$、磁場 $B$、電極の長さ $l$、距離 $L$、蛍光板の変位 $Y$）です！

### 測定結果と歴史的衝撃
トムソンが得た比電荷の値は：

$$
\frac{e}{m} \approx 1.76 \times 10^{11} \quad [\text{C/kg}]
$$

当時知られていた最も軽い粒子である水素イオン $\text{H}^+$ の比電荷は約 $9.58 \times 10^7\,\text{C/kg}$ でした。

$$
\frac{(e/m)_{\text{電子}}}{(e/m)_{\text{H}^+}} \approx \frac{1.76 \times 10^{11}}{9.58 \times 10^7} \approx \mathbf{1840}
$$

もし電子と水素イオンの電気量が同程度だとすれば、 **電子の質量は最も軽い水素原子の約 $\frac{1}{1840}$ しかない** ことになります。
これによって、「原子こそが物質の最小分割単位である」という古代ギリシャ以来の原子論が覆され、 **原子の内部にさらに小さな構成要素（電子）が存在する** ことが世界で初めて証明されました。

---

## 4. 実戦入試演習問題

### 【問題】
陰極線管内で、電圧 $V_0 = 500\,\text{V}$ で静止状態から加速された電子（電荷 $-e$、質量 $m$）のビームがある。

1. 電子が加速された直後の速さ $v$ を、$e, m, V_0$ を用いて表せ。
2. この電子ビームを直交電磁場（電場 $E = 1.0 \times 10^4\,\text{V/m}$、磁場 $B$）に入射させたところ、ビームは全く偏向せず直進した。磁場の強さ $B$ を求めよ。比電荷を $\frac{e}{m} = 1.76 \times 10^{11}\,\text{C/kg}$ とする。
3. 次に磁場を取り去り、長さ $l = 4.0\,\text{cm}$、極板間隔 $d = 2.0\,\text{cm}$ の平行平板電極に電圧 $V_1 = 40\,\text{V}$ を印加した。極板を出た直後の電子の垂直偏向 $y_1$ を求めよ。

---

### 【解答・解説】

#### 1. 加速直後の速さ $v$
運動エネルギーと静電場の仕事のエネルギー保存則より：

$$
\frac{1}{2} m v^2 = e V_0 \implies v = \sqrt{\frac{2 e V_0}{m}}
$$

#### 2. 直進条件の磁場 $B$
電子の速さ $v$ を数値計算します：

$$
v = \sqrt{2 \times (1.76 \times 10^{11}) \times 500} = \sqrt{1.76 \times 10^{14}} = 1.327 \times 10^7\,\text{m/s}
$$

直進条件 $v = \frac{E}{B}$ より：

$$
B = \frac{E}{v} = \frac{1.0 \times 10^4}{1.327 \times 10^7} \approx 7.54 \times 10^{-4}\,\text{T} = \mathbf{0.75\,\text{mT}}
$$

#### 3. 電場偏向 $y_1$
極板間の電場は $E_1 = \frac{V_1}{d} = \frac{40}{0.020} = 2.0 \times 10^3\,\text{V/m}$。
極板出口での変位の式：

$$
y_1 = \frac{e E_1 l^2}{2 m v^2}
$$

ここで $m v^2 = 2 e V_0$ であるため、比電荷を使わずに代入して約分できます！

$$
\begin{aligned}
y_1 &= \frac{e E_1 l^2}{2 (2 e V_0)} = \frac{E_1 l^2}{4 V_0} \\
&= \frac{\frac{V_1}{d} l^2}{4 V_0} = \frac{V_1 l^2}{4 d V_0}
\end{aligned}
$$

数値を代入すると：

$$
\begin{aligned}
y_1 &= \frac{40 \times (0.040)^2}{4 \times 0.020 \times 500} = \frac{40 \times 0.0016}{40} \\
&= 0.0016\,\text{m} = \mathbf{1.6\,\text{mm}}
\end{aligned}
$$
