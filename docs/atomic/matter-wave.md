---
title: 物質波（ド・ブロイ波）と電子線回折・ブラッグ反射
description: 量子力学の夜明けを告げた「物質波（ド・ブロイ波）」。粒子の波動性λ=h/p、加速電圧Vによる波長短縮、デイヴィソン＝ガーマーの実験、結晶格子によるブラッグ反射、ボーアの量子条件の物理的意味をシミュレータとベクター図解で徹底解説！
---

# 物質波（ド・ブロイ波）と電子線回折・ブラッグ反射

アインシュタインの光量子仮説によって、「光（波）はエネルギー $E=h\nu$、運動量 $p=\frac{h}{\lambda}$ をもつ**粒子**としても振る舞う」という光の粒子性が明らかになりました。

1924年、フランスの物理学者ルイ・ド・ブロイは、その逆の驚くべき大胆な着想を発表しました。
**「光が波でありながら粒子でもあるなら、電子や陽子のような『粒子』もまた、波としての性質（物質波）をもつのではないか？」**

この大胆な仮説は、その後の電子線回折実験によって見事に実証され、現代の量子力学と電子顕微鏡の基礎となりました。

<ClientOnly>
  <MatterWaveSim />
</ClientOnly>

---

## 1. ド・ブロイの物質波の波長公式

運動量 $p = mv$ をもって運動する質量 $m$ の粒子には、次の波長 $\lambda$ をもつ波（**物質波・ド・ブロイ波**）が伴います。

$$
\lambda = \frac{h}{p} = \frac{h}{mv}
$$

ここで $h$ はプランク定数（$h \approx 6.63 \times 10^{-34}\,\text{J}\cdot\text{s}$）です。

### 電圧 $V$ で加速された電子の物質波波長
静止していた電子（質量 $m_e$、電荷 $-e$）が電圧 $V$ で加速されると、静電場から仕事 $eV$ を得て運動エネルギーになります。

$$
\frac{1}{2}m_e v^2 = e V \implies p = m_e v = \sqrt{2 m_e e V}
$$

したがって、加速された電子のド・ブロイ波長 $\lambda$ は：

$$
\lambda = \frac{h}{\sqrt{2 m_e e V}}
$$

数値を代入すると：
- $h = 6.626 \times 10^{-34}\,\text{J}\cdot\text{s}$
- $m_e = 9.109 \times 10^{-31}\,\text{kg}$
- $e = 1.602 \times 10^{-19}\,\text{C}$

$$
\lambda \approx \frac{1.226}{\sqrt{V}}\,[\text{nm}]
$$

::: tip なぜ電子の波長が重要なのか？
加速電圧 $V = 100\,\text{V}$ のとき、波長は $\lambda \approx 0.123\,\text{nm} = 1.23\,\text{Å}$ となります。
これは、**物質を構成する結晶格子の原子間隔（数Å）やX線の波長とまったく同じオーダー**です！
したがって、電子線はX線と同じように、結晶格子によって**回折・干渉**を起こすことができます。
:::

---

## 2. 物質波の実験的証明（ベクター図解）

### ① デイヴィソン＝ガーマーの実験（1927年）
ニッケル単結晶の表面に低速電子線を照射し、散乱される電子の強度を様々な角度で測定しました。
ある特定の角度で電子の散乱強度が極大になる現象は、電子が波として干渉し合っている証拠（ブラッグ反射）として世界で初めて実証されました。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 320" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridMW" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradMW" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="320" fill="url(#gradMW)" rx="10"/>
    <rect width="760" height="320" fill="url(#gridMW)" rx="10"/>

    <!-- 左側: ブラッグ反射の幾何学的経路差 -->
    <g transform="translate(40, 30)">
      <text x="140" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【結晶格子によるブラッグ反射】</text>

      <!-- 第1層・第2層 原子列 -->
      <line x1="30" y1="120" x2="270" y2="120" stroke="#475569" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="30" y1="180" x2="270" y2="180" stroke="#475569" stroke-width="1" stroke-dasharray="4,4"/>

      <!-- 原子 (丸) -->
      <circle cx="80" cy="120" r="7" fill="#64748b"/>
      <circle cx="150" cy="120" r="7" fill="#38bdf8"/>
      <text x="150" y="110" fill="#38bdf8" font-size="11" text-anchor="middle">A</text>
      <circle cx="220" cy="120" r="7" fill="#64748b"/>

      <circle cx="80" cy="180" r="7" fill="#64748b"/>
      <circle cx="150" cy="180" r="7" fill="#f59e0b"/>
      <text x="150" y="200" fill="#f59e0b" font-size="11" text-anchor="middle">B</text>
      <circle cx="220" cy="180" r="7" fill="#64748b"/>

      <!-- 面間隔 d -->
      <line x1="40" y1="120" x2="40" y2="180" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="25" y="155" fill="#38bdf8" font-size="12">d</text>

      <!-- 入射・反射光線 -->
      <!-- 入射1 -->
      <line x1="70" y1="70" x2="150" y2="120" stroke="#38bdf8" stroke-width="2.5"/>
      <!-- 反射1 -->
      <line x1="150" y1="120" x2="230" y2="70" stroke="#38bdf8" stroke-width="2.5"/>

      <!-- 入射2 -->
      <line x1="30" y1="105" x2="150" y2="180" stroke="#f59e0b" stroke-width="2.5"/>
      <!-- 反射2 -->
      <line x1="150" y1="180" x2="270" y2="105" stroke="#f59e0b" stroke-width="2.5"/>

      <!-- 垂線と経路差 -->
      <line x1="150" y1="120" x2="114" y2="157" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3"/>
      <line x1="150" y1="120" x2="186" y2="157" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,3"/>
      <!-- 経路差部分を赤線ハイライト -->
      <line x1="114" y1="157" x2="150" y2="180" stroke="#ef4444" stroke-width="3.5"/>
      <line x1="150" y1="180" x2="186" y2="157" stroke="#ef4444" stroke-width="3.5"/>

      <text x="150" y="235" fill="#ef4444" font-size="13" font-weight="bold" text-anchor="middle">光路差 = 2 d sinθ</text>
      <text x="150" y="260" fill="#34d399" font-size="14" font-weight="bold" text-anchor="middle">強め合い: 2 d sinθ = n λ</text>
    </g>

    <!-- 右側: ボーア量子条件の物理的意味 -->
    <g transform="translate(420, 30)">
      <rect x="0" y="0" width="300" height="260" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="150" y="30" fill="#c084fc" font-size="14" font-weight="bold" text-anchor="middle">【ボーア量子条件の正体】</text>

      <!-- 円形軌道と物質波の定常波 (n=4) -->
      <circle cx="150" cy="120" r="50" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="4,4"/>
      <!-- 波打つ軌道 -->
      <path d="M 150 60 Q 165 65 175 75 Q 185 85 190 100 Q 205 110 200 120 Q 205 130 190 140 Q 185 155 175 165 Q 165 175 150 180 Q 135 175 125 165 Q 115 155 110 140 Q 95 130 100 120 Q 95 110 110 100 Q 115 85 125 75 Q 135 65 150 60 Z" fill="none" stroke="#c084fc" stroke-width="2.5"/>
      <circle cx="150" cy="120" r="8" fill="#ef4444"/>
      <text x="150" y="124" fill="#ffffff" font-size="10" font-weight="bold" text-anchor="middle">原子核</text>

      <text x="150" y="195" fill="#f8fafc" font-size="12" text-anchor="middle">軌道周長 2πr にド・ブロイ波が</text>
      <text x="150" y="215" fill="#f8fafc" font-size="12" text-anchor="middle">ちょうど整数個 (n個) ぴったり収まる！</text>
      <text x="150" y="240" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">2πr = n λ = n (h / mv)</text>
    </g>
  </svg>
</div>

::: tip ボーアの量子条件の謎が解けた！
ボーアは水素原子模型において「角運動量が $\frac{h}{2\pi}$ の整数倍である」という謎の仮説 $m v r = n \frac{h}{2\pi}$ を立てました。
ド・ブロイ波の式 $\lambda = \frac{h}{mv}$ を使うと：
$$
2\pi r = n \left(\frac{h}{mv}\right) = n \lambda
$$
すなわち、**「電子の軌道一周の長さが、物質波の波長 $\lambda$ のちょうど整数倍になっているときだけ、定常波となって打ち消し合わずに安定して存在できる」**という極めて明快な物理的意味が明らかになったのです！
:::

---

## 3. ブラッグの干渉条件

結晶格子面に対して角度 $\theta$（格子面となす角：すれすれの角）で物質波が入射するとき、隣接する面で反射された波の経路差は図より $2d\sin\theta$ となります。

強め合う条件（**ブラッグ条件**）は：

$$
2 d \sin\theta = n \lambda \quad (n = 1, 2, 3, \dots)
$$

### G.P.トムソンの電子線回折実験（1927年）
多結晶の薄膜（金箔など）に高速電子線を照射すると、あらゆる向きを向いた微小結晶によるブラッグ反射により、写真乾板上に**同心円状の同心干渉リング（デバイ＝シェラー環）**が現れます。
電子の加速電圧 $V$ を上げると、波長 $\lambda \propto \frac{1}{\sqrt{V}}$ が短くなるため、回折角 $\theta$ が小さくなり、**リングの半径 $R$ が縮小**します。この実験的検証により、トムソンもノーベル物理学賞を受賞しました。

---

## 4. 大学入試 厳選実践例題

### 例題1: 加速電子の物質波波長とブラッグ反射（典型標準）

::: info 【問題】
質量 $m = 9.1 \times 10^{-31}\,\text{kg}$、電荷 $-e = -1.6 \times 10^{-19}\,\text{C}$ の電子を、電圧 $V = 150\,\text{V}$ で静止状態から加速した。プランク定数を $h = 6.6 \times 10^{-34}\,\text{J}\cdot\text{s}$ とする。
1. 加速後の電子のド・ブロイ波長 $\lambda\,[\text{nm}]$ を求めよ。
2. この電子線を格子面間隔 $d = 0.20\,\text{nm}$ の結晶に照射したとき、1次のブラッグ反射（$n=1$）が起こる角 $\theta$ について、$\sin\theta$ の値を求めよ。
:::

#### 【解法と解説】

**1. ド・ブロイ波長 $\lambda$**
電子の運動エネルギーは $E_k = eV$ です。
$$
p = \sqrt{2 m e V} = \sqrt{2 \times (9.1 \times 10^{-31}) \times (1.6 \times 10^{-19}) \times 150}
$$
ルートの中を整理すると：
$$
2 \times 9.1 \times 1.6 \times 150 \times 10^{-50} = 4368 \times 10^{-50} \approx (66.1 \times 10^{-25})^2
$$
したがって、
$$
p \approx 6.61 \times 10^{-24}\,\text{kg}\cdot\text{m/s}
$$
物質波の波長は：
$$
\lambda = \frac{h}{p} = \frac{6.6 \times 10^{-34}}{6.61 \times 10^{-24}} \approx 1.0 \times 10^{-10}\,\text{m} = 0.10\,\text{nm}
$$

**2. ブラッグ角 $\theta$**
ブラッグ条件 $2d\sin\theta = n\lambda$ において $n=1, d=0.20\,\text{nm}, \lambda=0.10\,\text{nm}$ を代入すると：
$$
2 \times 0.20 \times \sin\theta = 1 \times 0.10 \implies 0.40 \sin\theta = 0.10
$$
$$
\sin\theta = \frac{0.10}{0.40} = 0.25
$$
したがって、$\sin\theta = 0.25$（$\theta \approx 14.5^\circ$）となります。

---

### 例題2: マクロな物体の物質波（思考力・考察問題）

::: info 【問題】
質量 $M = 150\,\text{g}$ の硬式野球ボールが、時速 $144\,\text{km/h}$（秒速 $40\,\text{m/s}$）で投げられた。
1. この野球ボールのド・ブロイ波長 $\lambda_{\text{ball}}$ を求めよ。プランク定数は $h = 6.6 \times 10^{-34}\,\text{J}\cdot\text{s}$ とする。
2. なぜ私たちは日常生活で、野球ボールや人間などの日常的な物体が波として回折したり干渉したりする現象を目撃できないのか、その理由を簡潔に説明せよ。
:::

#### 【解法と解説】

**1. 野球ボールの波長 $\lambda_{\text{ball}}$**
ボールの運動量は：
$$
p = M v = 0.15\,\text{kg} \times 40\,\text{m/s} = 6.0\,\text{kg}\cdot\text{m/s}
$$
ド・ブロイ波長は：
$$
\lambda_{\text{ball}} = \frac{h}{p} = \frac{6.6 \times 10^{-34}}{6.0} = 1.1 \times 10^{-34}\,\text{m}
$$

**2. 理由の考察**
物質波が回折や干渉といった顕著な波動現象を示すには、スリット幅や障害物のサイズが物質波の波長と同程度である必要があります。
しかし、野球ボールの波長 $\lambda \approx 10^{-34}\,\text{m}$ は、原子核の大きさ（約 $10^{-15}\,\text{m}$）に比べても桁違いに（約 $10^{19}$ 倍も）小さく、宇宙に存在するいかなる微小な構造よりも遥かに小さいため、波動性を観測することは原理的・事実上不可能です。
したがって、マクロな日常世界の物体はニュートン力学（古典力学）の粒子として振る舞います。
