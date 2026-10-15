---
title: 剛体の転倒条件と滑り出し限界（直方体の安定性）
description: 高校物理の剛体の力学最難関テーマ。水平面・斜面上の直方体を押したとき「滑るのか、それとも倒れるのか」の境界条件を、垂直抗力の作用点シフトとモーメントのつり合いから完全攻略。
---

# 剛体の転倒条件と滑り出し限界（直方体の安定性）

<div class="lead">
机の上に置かれた背の高い本やペットボトルの側面を指で押したとき、<br>
・下の方を押すと、すんなり<strong>「ズズズ…と横に滑り出す」</strong>のに、<br>
・上の方を押すと、滑る前に<strong>「コロンと転倒して倒れる」</strong>という経験はありませんか？<br>
「質点」ではなく「大きさを持つ物体（<strong>剛体</strong>）」を扱う入試問題において、最も合否の差がつくテーマがこの<strong>転倒条件（Toppling Condition）</strong>です。<br>
本ページでは、垂直抗力の作用点が移動するメカニズムから、滑りと転倒の分岐条件を完全マスターします。
</div>

---

## 1. 身近な現象と到達目標

### 身近な現象
* **地震時の家具の転倒防止**: タンスなどの背の高い家具は、底面が狭く重心が高いため、地震の横揺れで容易に転倒する（突っ張り棒で上部を固定する理由）。
* **レーシングカーの低重心・ワイドボディ**: 高速で急カーブを曲がるとき、遠心力で外側に転倒しないよう、車高を極限まで低く（$h$ を小さく）トレッド幅を広く（$w$ を大きく）設計している。
* **重い冷蔵庫を動かすときのコツ**: 底に近い低い位置を押せば、倒れる心配なく横に滑らせることができる。

### 学習の到達目標
1. **垂直抗力の作用点シフトの理解**: 外力 $F$ を加えたとき、倒れないように垂直抗力 $N$ が中心から押し出し側へ移動する理由をモーメントから説明できる。
2. **転倒限界外力の導出**: 右下端（回転軸）まわりのモーメントのつり合いから、転倒限界外力 $F_{\text{topple}} = Mg \frac{w}{2h_F}$ を立式できる。
3. **滑り出しと転倒の境界判定**: 静止摩擦係数 $\mu_s$ と直方体のアスペクト比 $w/h_F$ の比較から、「どちらが先に起こるか」を瞬時に見抜ける。

---

## 🧪 インタラクティブ実験室

外力の大きさ $F$ や加える高さ $h_F$、摩擦係数 $\mu_s$ を動かし、直方体が「静止安定」「横滑り」「転倒」のどれになるかシミュレーションしてみましょう。

<TopplingSim />

---

## 2. 垂直抗力の作用点が移動するメカニズム

質量 $M$、幅 $w$、高さ $h$ の一様な直方体が、粗い水平面上に置かれています。  
高さ $h_F$ の位置に右向きの外力 $F$ を加えたとき、物体に働く力は次の4つです：

1. **重力 $Mg$**（重心 $\text{G}$ から鉛直下向き）
2. **外力 $F$**（高さ $h_F$ から水平右向き）
3. **垂直抗力 $N$**（底面から鉛直上向き）
4. **静止摩擦力 $f$**（底面から水平左向き）

<div class="vector-graph-card">
<svg viewBox="0 0 540 280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arr-top-f" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#f43f5e" />
    </marker>
    <marker id="arr-top-n" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#10b981" />
    </marker>
    <marker id="arr-top-g" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L7,3 z" fill="#38bdf8" />
    </marker>
  </defs>

  <!-- 床 (y = 230) -->
  <line x1="40" y1="230" x2="500" y2="230" stroke="#64748b" stroke-width="3"/>

  <!-- 直方体 (幅 140, 高さ 180, 左下: x=180, 右下: x=320) -->
  <rect x="180" y="50" width="140" height="180" rx="3" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/>

  <!-- 寸法表示 w (幅) -->
  <line x1="180" y1="245" x2="320" y2="245" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="180" y1="240" x2="180" y2="250" stroke="#fbbf24" stroke-width="1.5"/>
  <line x1="320" y1="240" x2="320" y2="250" stroke="#fbbf24" stroke-width="1.5"/>
  <text x="250" y="260" fill="#fbbf24" font-size="12" font-weight="700" text-anchor="middle">幅 w</text>

  <!-- 重心 G (x = 250, y = 140) -->
  <circle cx="250" cy="140" r="5" fill="#fbbf24"/>
  <text x="260" y="135" fill="#fbbf24" font-size="12" font-weight="700">重心 G</text>

  <!-- 鉛直中心線 -->
  <line x1="250" y1="50" x2="250" y2="230" stroke="#475569" stroke-width="1" stroke-dasharray="3,3"/>

  <!-- 重力 Mg (真下) -->
  <line x1="250" y1="140" x2="250" y2="220" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arr-top-g)"/>
  <text x="258" y="195" fill="#38bdf8" font-size="12" font-weight="700">Mg</text>

  <!-- 外力 F (高さ h_F = 80, y = 150) -->
  <line x1="100" y1="100" x2="180" y2="100" stroke="#f43f5e" stroke-width="3" marker-end="url(#arr-top-f)"/>
  <text x="90" y="95" fill="#f43f5e" font-size="13" font-weight="700">外力 F</text>
  <text x="135" y="115" fill="#94a3b8" font-size="11">高さ h_F</text>

  <!-- 垂直抗力 N (中心から x_N だけ右にシフト: x = 290) -->
  <line x1="295" y1="230" x2="295" y2="160" stroke="#10b981" stroke-width="3" marker-end="url(#arr-top-n)"/>
  <circle cx="295" cy="230" r="4" fill="#10b981"/>
  <text x="305" y="175" fill="#10b981" font-size="13" font-weight="700">垂直抗力 N</text>

  <!-- シフト量 x_N 表示 -->
  <line x1="250" y1="215" x2="295" y2="215" stroke="#10b981" stroke-width="1.5"/>
  <text x="272" y="210" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">x_N</text>

  <!-- 右下端 A (転倒の回転軸: x = 320, y = 230) -->
  <circle cx="320" cy="230" r="5" fill="#f43f5e"/>
  <text x="330" y="235" fill="#f43f5e" font-size="13" font-weight="700">点 A（右下端）</text>
</svg>
<div class="graph-caption">図: 直方体に働く力と垂直抗力 $N$ の作用点シフト（外力 $F$ の時計回りモーメントに対抗するため、抗力 $N$ が中心から $x_N$ だけ右へ移動して反時計回りモーメントを作る）</div>
</div>

### なぜ垂直抗力は右へずれるのか？
外力 $F$ は直方体を**時計回りに回転（転倒）させようとするモーメント**を生み出します。  
もし垂直抗力 $N$ が底面中央のままだと、モーメントがつり合わずに物体は即座に倒れてしまいます。  
そのため、床面からの圧力分布が右側に偏り、**合力としての垂直抗力 $N$ の作用点が右側へ $x_N$ だけ移動**することで、反時計回りのモーメントを作って姿勢を保つのです。

底面中央のまわりのモーメントのつり合いより：

$$F \cdot h_F - N \cdot x_N = 0 \implies \boxed{x_N = \frac{F h_F}{N} = \frac{F h_F}{M g}}$$

---

## 3. 「滑り出し」vs「転倒」の限界条件

### ① 滑り出しの限界外力 $F_{\text{slip}}$
床面との最大静止摩擦力は $f_{\max} = \mu_s N = \mu_s M g$ です。水平方向の力のつり合い $F = f$ より：

$$
\boxed{F_{\text{slip}} = \mu_s M g}
$$

外力 $F$ がこの値を超えると、物体は水平に滑り出します。

---

### ② 転倒の限界外力 $F_{\text{topple}}$
垂直抗力 $N$ が移動できるのは**直方体の底面の右端（点 A：$x_N = w/2$）まで**です！  
作用点が右端に達したときが転倒の限界であり、右下端 A のまわりのモーメントのつり合いを立てると：

$$F \cdot h_F = M g \cdot \frac{w}{2} \implies \boxed{F_{\text{topple}} = M g \frac{w}{2h_F}}$$

外力 $F$ がこの値を超えると、垂直抗力はもはや右端を超えて外側へは出られないため、反時計回りの支えを失い、**点 A を軸としてコロンと倒れます**。

---

### ③ どちらが先に起こるかの判定法（超重要公式）

外力 $F$ を $0$ から徐々に大きくしていくとき、**$F_{\text{slip}}$ と $F_{\text{topple}}$ のうち「値が小さい方」が先に発生**します！

* **ケース A：先に滑り出す条件（倒れずにすべる）**:
  $$F_{\text{slip}} < F_{\text{topple}} \iff \mu_s M g < M g \frac{w}{2h_F} \iff \boxed{\mu_s < \frac{w}{2h_F}}$$
  $\implies$ 摩擦が小さい（ツルツル）か、低い位置を押すとき。

* **ケース B：先に倒れる条件（滑らずに転倒する）**:
  $$F_{\text{topple}} < F_{\text{slip}} \iff \boxed{\mu_s > \frac{w}{2h_F}}$$
  $\implies$ 摩擦が大きい（ザラザラ）か、高い位置を押すとき。

---

## 4. 例題での使い方（完全オリジナル）

### 【例題】直方体の滑りと転倒の境界条件

```
水平な床の上に、質量 M = 4.0 kg、底面の幅 w = 20 cm、高さ h = 60 cm の一様な直方体が置かれている。
重力加速度を g = 9.8 m/s² とする。

(1) 床と直方体の間の静止摩擦係数を μ_s = 0.40 とする。
    直方体の一番上の端（高さ h_F = 60 cm）を水平に力 F で押したとき、
    直方体は「滑り出す」か、それとも「倒れる」か。
    また、そのとき動き出す最小の力 F_min [N] を求めよ。

(2) 直方体を「どんなに強い力で押しても決して倒れず、必ず滑り出す」ようにしたい。
    力を加える高さ h_F [cm] は床から何 cm 以下にしなければならないか。
```

#### 【解法ステップ】

**Step 1: (1) 各限界外力を計算して比較する**  
重力 $Mg = 4.0 \times 9.8 = 39.2\,\text{N}$。  
* **滑り出し限界外力**:
  $$F_{\text{slip}} = \mu_s M g = 0.40 \times 39.2 = 15.68\,\text{N}$$
* **転倒限界外力**（右端 $w/2 = 10\,\text{cm}$、高さ $h_F = 60\,\text{cm}$）:
  $$F_{\text{topple}} = M g \frac{w/2}{h_F} = 39.2 \times \frac{10}{60} = \frac{39.2}{6} \approx 6.53\,\text{N}$$

$F_{\text{topple}} = 6.53\,\text{N} < F_{\text{slip}} = 15.68\,\text{N}$ であるため、滑り出す前に**先に転倒します**。  
動き出す最小の力は $F_{\min} = 6.53\,\text{N}$ です。

**Step 2: (2) 決して倒れない高さの条件を求める**  
「倒れずに必ず滑る」ための条件は、常に $F_{\text{slip}} \le F_{\text{topple}}$ が成立することです：
$$\mu_s \le \frac{w}{2 h_F} \iff h_F \le \frac{w}{2 \mu_s}$$

数値を代入：
$$h_F \le \frac{20\,\text{cm}}{2 \times 0.40} = \frac{20}{0.80} = 25\,\text{cm}$$

したがって、床から $25\,\text{cm}$ 以下の位置を押せば、どんなに強く押しても倒れることはありません。

**答**: (1) **倒れる**、$F_{\min} \approx 6.5\,\text{N}$、(2) **$25\,\text{cm}$ 以下**

---

## 5. 要点まとめ

::: tip 📌 剛体の転倒 vs 滑り出しの公式総まとめ
* **抗力作用点シフト**:
  $$x_N = \frac{F h_F}{M g} \quad \left(0 \le x_N \le \frac{w}{2}\right)$$
* **2大限界外力**:
  滑り出し: $F_{\text{slip}} = \mu_s M g$  
  転倒限界: $F_{\text{topple}} = M g \frac{w}{2h_F}$
* **運命の分岐条件**:
  $$\mu_s < \frac{w}{2h_F} \implies \text{滑る！} \qquad \mu_s > \frac{w}{2h_F} \implies \text{倒れる！}$$
:::

<!--@include: ../parts/notice.md-->
