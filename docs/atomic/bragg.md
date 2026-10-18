---
title: ブラッグ反射とX線結晶回折の完全導出・DNA構造解析への道
description: 高校物理・大学入試超頻出「ブラッグ反射とX線結晶回折」。結晶格子面間隔d、すれすれ角θ、幾何学的光路差2d sinθ、ブラッグ条件2d sinθ=nλの厳密導出、光学入射角との定義の違い、結晶構造解析と物質波（ド・ブロイ波）への応用をシミュレータと図解で徹底解説！
---

# ブラッグ反射とX線結晶回折

1912年、マックス・フォン・ラウエがX線の結晶回折現象（ラウエ斑点）を発見し、X線が波であることを証明しました。

翌1913年、イギリスの物理学者**W.H.ブラッグ（父）とW.L.ブラッグ（息子）**は、結晶を「原子が規則正しく並んだ平行な無数の格子面の集まり」と捉え、結晶面からのX線の反射波が干渉し合って強め合う条件を極めて直感的な幾何学モデルで定式化しました。

これが「**ブラッグの法則（Bragg's law）**」です。
この理論は、食塩（$\text{NaCl}$）やダイヤモンドなどの結晶構造解析から、1953年のワトソン・クリックらによる**DNA二重らせん構造の解明**に至るまで、20世紀の物質科学・分子生物学の基盤となりました。

<ClientOnly>
  <BraggReflectionSim />
</ClientOnly>

---

## 1. 入射角（すれすれ角）$\theta$ の定義に超注意！

高校物理の光学（スネルの法則やレンズ）では、入射角は「境界面の法線とのなす角」として定義されます。

しかし、**X線回折におけるブラッグ角 $\theta$ は、「結晶面そのものとX線のなす角（すれすれ角 / Glancing angle）」**として定義されます！

<div class="vector-diagram-card">
  <svg viewBox="0 0 540 180" class="academic-svg" aria-label="X線結晶回折におけるブラッグ角（すれすれ角）の定義">
    <defs>
      <marker id="bragg-ray-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
    </defs>

    <!-- 結晶格子面 (原子列) -->
    <line x1="50" y1="120" x2="490" y2="120" stroke="#64748b" stroke-width="2.5" />
    <!-- 原子ビーズ列 -->
    <circle cx="100" cy="120" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <circle cx="170" cy="120" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <circle cx="240" cy="120" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <circle cx="310" cy="120" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <circle cx="380" cy="120" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <circle cx="450" cy="120" r="7" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
    <text x="495" y="124" fill="#94a3b8" font-size="12" font-weight="bold">結晶格子面</text>

    <!-- 法線 (光学での基準) -->
    <line x1="240" y1="20" x2="240" y2="120" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4" />
    <text x="245" y="35" fill="#ef4444" font-size="11" font-weight="bold">法線（光学基準）</text>

    <!-- X線入射光 -->
    <line x1="100" y1="35" x2="235" y2="117" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#bragg-ray-arrow)" />
    <text x="110" y="30" fill="#38bdf8" font-size="13" font-weight="bold">X線入射光</text>

    <!-- X線反射光 -->
    <line x1="240" y1="120" x2="375" y2="38" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#bragg-ray-arrow)" />
    <text x="375" y="30" fill="#38bdf8" font-size="13" font-weight="bold">反射光</text>

    <!-- すれすれ角 θ (結晶面と入射光のなす角) -->
    <path d="M 190 120 A 50 50 0 0 0 205 100" fill="none" stroke="#fbbf24" stroke-width="2.5" />
    <text x="175" y="112" fill="#fbbf24" font-size="14" font-weight="bold">θ</text>
    <text x="140" y="145" fill="#fbbf24" font-size="11" font-weight="bold">すれすれ角（ブラッグ角 θ）</text>

    <!-- 光学の入射角 (90° - θ) -->
    <path d="M 240 70 A 50 50 0 0 0 215 78" fill="none" stroke="#ef4444" stroke-width="1.5" />
    <text x="205" y="65" fill="#ef4444" font-size="11">90° - θ</text>
  </svg>
  <div class="diagram-caption">図: ブラッグ角 θ（結晶面と光線のなす「すれすれ角」）の定義</div>
</div>

> **最大の頻出ひっかけ！**:
> - 光学の通常の入射角（法線基準）: $i = 90^\circ - \theta$
> - X線回折のブラッグ角: **結晶面となす角 $\theta$**
>
> 入試問題で「法線とX線のなす角が $\phi$ であった」と書かれていた場合、ブラッグ条件に代入する角度は $\theta = 90^\circ - \phi$ と置き換えなければなりません。

---

## 2. ブラッグ条件 $2d\sin\theta = n\lambda$ の完全導出

格子面の間隔を $d$、照射するX線の波長を $\lambda$ とします。

結晶の第1層の原子 A で反射する光線①と、第2層の直下の原子 B で反射する光線②を考えます。

<div class="vector-diagram-card">
  <svg viewBox="0 0 560 250" class="academic-svg" aria-label="結晶2層によるX線反射と光路差2d sinθの幾何学的導出">
    <defs>
      <marker id="bragg-path-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="bragg-path-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#fbbf24" />
      </marker>
    </defs>

    <!-- 第1格子面 -->
    <line x1="40" y1="70" x2="520" y2="70" stroke="#475569" stroke-width="2" stroke-dasharray="4,4" />
    <circle cx="160" cy="70" r="5" fill="#334155" />
    <circle cx="280" cy="70" r="7" fill="#38bdf8" stroke="#0284c7" stroke-width="2" />
    <text x="280" y="55" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">原子 A (第1層)</text>
    <circle cx="400" cy="70" r="5" fill="#334155" />

    <!-- 第2格子面 -->
    <line x1="40" y1="180" x2="520" y2="180" stroke="#475569" stroke-width="2" stroke-dasharray="4,4" />
    <circle cx="160" cy="180" r="5" fill="#334155" />
    <circle cx="280" cy="180" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
    <text x="280" y="202" fill="#fbbf24" font-size="12" font-weight="bold" text-anchor="middle">原子 B (第2層)</text>
    <circle cx="400" cy="180" r="5" fill="#334155" />

    <!-- 面間隔 d 寸法線 -->
    <line x1="280" y1="70" x2="280" y2="180" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3,3" />
    <text x="268" y="130" fill="#94a3b8" font-size="13" font-weight="bold" text-anchor="end">間隔 d</text>

    <!-- 光線① (Aで反射) -->
    <line x1="80" y1="10" x2="275" y2="68" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#bragg-path-arrow)" />
    <text x="80" y="25" fill="#38bdf8" font-size="12" font-weight="bold">光線①</text>
    <line x1="280" y1="70" x2="475" y2="12" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#bragg-path-arrow)" />
    <text x="475" y="25" fill="#38bdf8" font-size="12" font-weight="bold">反射光①</text>

    <!-- 光線② (Bで反射) -->
    <!-- 入射光② (〜点Pまで) -->
    <line x1="40" y1="108" x2="195" y2="154" stroke="#38bdf8" stroke-width="2.5" />
    <text x="40" y="100" fill="#38bdf8" font-size="12" font-weight="bold">光線②</text>
    
    <!-- 垂線 AP (Aから光線②への垂線) -->
    <line x1="280" y1="70" x2="195" y2="154" stroke="#ef4444" stroke-width="2" />
    <circle cx="195" cy="154" r="3.5" fill="#ef4444" />
    <text x="180" y="152" fill="#ef4444" font-size="12" font-weight="bold">点 P</text>
    <!-- 直角マーク -->
    <path d="M 203 146 L 211 154 L 203 162" fill="none" stroke="#ef4444" stroke-width="1.2" />

    <!-- 光路差区間 PB (d sinθ) -->
    <line x1="195" y1="154" x2="275" y2="178" stroke="#fbbf24" stroke-width="4" marker-end="url(#bragg-path-amber)" />
    <text x="220" y="180" fill="#fbbf24" font-size="11" font-weight="bold">PB = d sinθ</text>

    <!-- 光路差区間 BQ (d sinθ) -->
    <line x1="280" y1="180" x2="360" y2="156" stroke="#fbbf24" stroke-width="4" marker-end="url(#bragg-path-amber)" />
    <text x="325" y="180" fill="#fbbf24" font-size="11" font-weight="bold">BQ = d sinθ</text>

    <!-- 垂線 AQ (Aから反射線②への垂線) -->
    <line x1="280" y1="70" x2="365" y2="154" stroke="#ef4444" stroke-width="2" />
    <circle cx="365" cy="154" r="3.5" fill="#ef4444" />
    <text x="375" y="152" fill="#ef4444" font-size="12" font-weight="bold">点 Q</text>

    <!-- 反射光② (Q以降) -->
    <line x1="365" y1="154" x2="515" y2="110" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#bragg-path-arrow)" />
    <text x="515" y="100" fill="#38bdf8" font-size="12" font-weight="bold">反射光②</text>

    <!-- 光路差のまとめ表示 -->
    <rect x="170" y="215" width="220" height="28" rx="6" fill="rgba(251, 191, 36, 0.15)" stroke="#fbbf24" stroke-width="1.5" />
    <text x="280" y="233" fill="#fbbf24" font-size="12" font-weight="bold" text-anchor="middle">光路差 ΔL = PB + BQ = 2d sinθ</text>
  </svg>
  <div class="diagram-caption">図: 結晶2層によるX線散乱と光路差 2d sinθ の幾何学的導出</div>
</div>

1. 点 A から光線②の入射線へ下ろした垂線の足を P とします。
   直角三角形 $\text{ABP}$ において、斜辺は $\text{AB} = d$、角 $\angle\text{PAB} = \theta$ であるため：
   $$
   \text{PB} = d \sin\theta
   $$
2. 点 A から光線②の反射線へ下ろした垂線の足を Q とします。
   同様に直角三角形 $\text{ABQ}$ において：
   $$
   \text{BQ} = d \sin\theta
   $$
3. 光線①と光線②の**幾何学的光路差 $\Delta$** は、$\text{PB}$ と $\text{BQ}$ の和となります。

$$
\Delta = \text{PB} + \text{BQ} = d \sin\theta + d \sin\theta = 2 d \sin\theta
$$

### 各原子面での反射における位相変化
すべての結晶面（第1層も第2層も）において、X線は同一の電子雲によって散乱・反射されるため、**反射に伴う相対的な位相のズレはゼロ（同条件）**です。
したがって、純粋に光路差 $\Delta$ が波長 $\lambda$ の整数倍になるときに、すべての反射波が同位相で重なり合って強め合います。

$$
2 d \sin\theta = n \lambda \quad (n = 1, 2, 3, \dots)
$$

- $n = 1$: **1次反射（最も強い回折ピーク）**
- $n = 2$: **2次反射**
- $n = 3$: **3次反射**

---

## 3. ブラッグの法則の2大実用用途

公式 $2d\sin\theta = n\lambda$ は、未知の物理量を測定するための強力な方程式です。

### ① 未知のX線波長 $\lambda$ を測定する（X線分光）
面間隔 $d$ が既知の結晶（方解石やNaClなど）にX線を当て、回折強度がピークとなる角度 $\theta$ を測定すれば、X線の波長 $\lambda = \frac{2d\sin\theta}{n}$ が高精度に決まります。

### ② 未知の結晶構造・格子間隔 $d$ を決定する（X線結晶構造解析）
波長 $\lambda$ が既知の単色X線（例えば銅の管球から出る $\text{Cu-K}\alpha$ 線: $\lambda = 0.1542\,\text{nm}$）を結晶試料に照射し、ピーク角度 $\theta$ を測定すれば、原子の並び間隔 $d = \frac{n\lambda}{2\sin\theta}$ が直接算出できます。

---

## 4. 物質波（電子線・中性子線回折）への拡張

ド・ブロイが提唱した「物質波 $\lambda = \frac{h}{p}$」も、波長が数Å（$0.1\,\text{nm}$ オーダー）となるため、X線と全く同様にブラッグ反射を起こします。

デイヴィソンとガーマーのニッケル結晶実験（1927年）では、加速された電子線がブラッグ条件 $2d\sin\theta = n\lambda$ に厳密に従って散乱されることが確認され、量子力学の正しさが証明されました。
現代では、中性子回折や電子顕微鏡による材料科学の標準測定法として日常的に活用されています。

---

## 5. 実戦入試演習問題

### 【問題】
食塩（$\text{NaCl}$）の単結晶のへき開面に、波長 $\lambda = 0.154\,\text{nm}$ のX線を照射した。
X線と結晶面のなす角（すれすれ角）$\theta$ を $0^\circ$ から徐々に大きくしていったところ、$\theta = 15.9^\circ$ で最初の回折強度極大（1次反射）が観測された。$\sin 15.9^\circ = 0.273$ とする。

1. 食塩結晶の格子面間隔 $d$ は何 $\text{nm}$ か。
2. 次の回折強度極大（2次反射）が観測される角度 $\theta_2$ を求めよ（$\sin\theta_2$ の値を求めよ）。
3. この結晶面で観測可能な回折反射の最大次数 $n_{max}$ はいくつか。

---

### 【解答・解説】

#### 1. 格子面間隔 $d$
1次反射（$n = 1$）のブラッグ条件 $2d\sin\theta_1 = \lambda$ より：

$$
d = \frac{\lambda}{2 \sin\theta_1} = \frac{0.154\,\text{nm}}{2 \times 0.273} = \frac{0.154}{0.546} \approx \mathbf{0.282\,\text{nm} = 2.82\,\text{Å}}
$$

#### 2. 2次反射の角度 $\theta_2$
2次反射（$n = 2$）のブラッグ条件 $2d\sin\theta_2 = 2\lambda$ より：

$$
\sin\theta_2 = \frac{2\lambda}{2d} = \frac{\lambda}{d} = 2 \times \sin\theta_1 = 2 \times 0.273 = \mathbf{0.546}
$$

（$\arcsin(0.546) \approx 33.1^\circ$ となり、約 $33.1^\circ$ で2次反射が起こります）。

#### 3. 観測可能な最大次数 $n_{max}$
正弦関数の最大値は $\sin\theta \le 1.0$ です。
ブラッグ条件より：

$$
\sin\theta = \frac{n\lambda}{2d} \le 1 \implies n \le \frac{2d}{\lambda}
$$

ここで $\frac{\lambda}{2d} = \sin 15.9^\circ = 0.273$ であるため：

$$
n \le \frac{1}{0.273} \approx 3.66
$$

次数 $n$ は整数であるため、観測可能な最大次数は **$n_{max} = 3$**（3次反射まで）となります。
（4次反射を起こすには $\sin\theta > 1$ となってしまうため物理的に存在できません）。
