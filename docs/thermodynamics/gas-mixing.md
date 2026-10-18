---
title: 気体の混合と可動ピストンで仕切られた2気体のつり合い
description: 高校物理の熱力学・難関大最頻出テーマ「気体の混合と可動ピストン」。断熱容器内での内部エネルギー保存則による混合温度の決定、ドルトンの分圧則、可動ピストンの圧力平衡条件をシミュレーターとベクター図解で徹底攻略！
---

# 気体の混合と可動ピストンで仕切られた2気体のつり合い

熱力学の入試問題（東大、京大、東工大、医学部など）において、受験生の正答率が大きく分かれるのが「**2つの気体室がコックや可動ピストンでつながれた問題**」です。

一見すると複雑な連立方程式に見えますが、「**断熱系における内部エネルギー保存則（仕事も熱も出入りしない） **」 と 「** 可動ピストンの両側で圧力が一致する（$P_A = P_B$）**」 という2大原則を適用すれば、どんな難問もスッキリと解き明かせます。

<ClientOnly>
  <GasMixingSim />
</ClientOnly>

---

## 1. コックを開けて気体を混合するときの理論

体積 $V_A$、温度 $T_A$、物質量 $n_A$ の気体Aと、体積 $V_B$、温度 $T_B$、物質量 $n_B$ の気体Bが、コック付きの細管で結ばれた断熱容器に入っています。

<div class="vector-graph-card">
  <svg viewBox="0 0 760 320" class="vector-graph" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="gridGM" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="gradGM" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#090d16"/>
        <stop offset="100%" stop-color="#111827"/>
      </linearGradient>
    </defs>
    <rect width="760" height="320" fill="url(#gradGM)" rx="10"/>
    <rect width="760" height="320" fill="url(#gridGM)" rx="10"/>
    <!-- コック混合プロセス -->
    <g transform="translate(60, 40)">
      <text x="140" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">【コック開通と内部エネルギー保存】</text>
      <!-- 2つの球形/箱形容器 -->
      <!-- 容器A -->
      <rect x="20" y="60" width="110" height="110" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="2" rx="10"/>
      <text x="75" y="100" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle">気体A</text>
      <text x="75" y="125" fill="#e2e8f0" font-size="11" text-anchor="middle">n_A, T_A, V_A</text>
      <!-- 連結管とコック -->
      <rect x="130" y="105" width="60" height="20" fill="#1e293b" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="160" cy="115" r="7" fill="#ef4444"/>
      <text x="160" y="95" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="middle">コック</text>
      <!-- 容器B -->
      <rect x="190" y="60" width="110" height="110" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="2" rx="10"/>
      <text x="245" y="100" fill="#f59e0b" font-size="13" font-weight="bold" text-anchor="middle">気体B</text>
      <text x="245" y="125" fill="#e2e8f0" font-size="11" text-anchor="middle">n_B, T_B, V_B</text>
      <!-- 断熱壁表示 -->
      <rect x="10" y="50" width="300" height="130" fill="none" stroke="#64748b" stroke-width="3" stroke-dasharray="6,4" rx="12"/>
      <text x="160" y="205" fill="#64748b" font-size="12" text-anchor="middle">外壁は断熱材で覆われている (Q = 0, W = 0)</text>
    </g>
    <!-- 右側: 理論式まとめカード -->
    <g transform="translate(420, 30)">
      <rect x="0" y="0" width="300" height="260" fill="#1e293b" rx="8" stroke="#334155"/>
      <text x="150" y="30" fill="#34d399" font-size="14" font-weight="bold" text-anchor="middle">【熱力学第1法則: Q = ΔU + W】</text>
      <text x="20" y="60" fill="#94a3b8" font-size="12">1. 断熱材なので熱の出入りなし: Q = 0</text>
      <text x="20" y="85" fill="#94a3b8" font-size="12">2. 外壁は剛体で動かないので: W = 0</text>
      <text x="20" y="115" fill="#f8fafc" font-size="13" font-weight="bold">⇒ 全体の内部エネルギーが保存！</text>
      <text x="20" y="140" fill="#38bdf8" font-size="13">U_前 = U_後</text>
      <text x="20" y="165" fill="#f59e0b" font-size="13">n_A C_V T_A + n_B C_V T_B = (n_A + n_B) C_V T</text>
      <line x1="20" y1="180" x2="280" y2="180" stroke="#334155"/>
      <text x="20" y="205" fill="#a855f7" font-size="13" font-weight="bold">混合後の絶対温度 T:</text>
      <text x="150" y="235" fill="#34d399" font-size="15" font-weight="bold" text-anchor="middle">T = (n_A T_A + n_B T_B) / (n_A + n_B)</text>
    </g>
  </svg>
</div>

### ① 内部エネルギー保存則による混合温度 $T$ の決定
熱力学第1法則 $\Delta U = Q - W$ を系全体に適用します。
- 容器全体が断熱材で囲まれているため、$Q = 0$
- 容器全体の容積は変化せず、外部へピストンを押したりしないため、$W = 0$

したがって、 **$\Delta U = 0$（混合前後で内部エネルギーの総和は完全に一定）** です！

$$
U_{\text{前}} = U_{\text{後}} \implies n_A C_V T_A + n_B C_V T_B = (n_A + n_B) C_V T
$$

定積モル比熱 $C_V$ が等しい気体同士（例：ともに単原子分子）であれば、$C_V$ が相殺されて：

$$
T = \frac{n_A T_A + n_B T_B}{n_A + n_B}
$$

混合後の温度 $T$ は、 **物質量 $n_A, n_B$ を重みとする「加重平均（内分点）」** になります！

### ② ドルトンの分圧の法則による全圧 $P$ の決定
混合後の全容積は $V = V_A + V_B$、全物質量は $n = n_A + n_B$ ですから、状態方程式より全圧 $P$ は：

$$
P = \frac{(n_A + n_B) R T}{V_A + V_B} = \frac{n_A R T_A + n_B R T_B}{V_A + V_B} = \frac{P_A V_A + P_B V_B}{V_A + V_B}
$$

各気体が全体に広がったときの分圧の和 $P = P'_A + P'_B$ に完全に一致します。

---

## 2. 可動ピストンで仕切られた2気体のつり合い

シリンダー内がなめらかに動くピストンでA室とB室に仕切られている場合、ピストンが静止（平衡状態）する条件は「**両側の圧力が等しい**」ことです。

$$
P_A = P_B \iff \frac{n_A R T_A}{V_A} = \frac{n_B R T_B}{V_B}
$$

### ピストンの性質による2大パターン

| ピストンの種類 | 温度の関係 | 体積比と圧力の決定 |
| :--- | :--- | :--- |
| **熱を通すピストン（透熱） **| 十分に時間が経つと熱平衡に達し、** 両室の温度が等しくなる（$T_A = T_B$） **| $P_A = P_B$ かつ $T_A = T_B$ より、** 体積比は物質量比に一致**: $\frac{V_A}{V_B} = \frac{n_A}{n_B}$ |
| **熱を通さないピストン（断熱） **| 両室で熱のやり取りはない（$T_A \neq T_B$ のまま維持） | A室が加熱されると膨張してピストンを押し、** 気体Aが気体Bに対して仕事をする（$W_A = -W_B$）** |

::: tip 断熱ピストンの仕事のやり取り
断熱ピストンが右へ体積 $\Delta V$ だけ動いたとき：
- A室は外部（B室）に仕事 $W$ をする $\implies \Delta U_A = Q_A - W = Q_A - P\Delta V$
- B室はA室から仕事をされる（仕事を $-W$ する） $\implies \Delta U_B = 0 - (-W) = +W = +P\Delta V$
B室は加熱されていなくても、 **A室から仕事をされることで温度が上昇（断熱圧縮）** します！
:::

---

## 3. 大学入試 厳選実践例題

### 例題1: 2つの断熱容器の混合と分圧（標準・頻出）

::: info 【問題】
コックのついた細管でつながれた2つの容器A、Bがある。容積はそれぞれ $V_A = 2.0\,\text{L}$、$V_B = 3.0\,\text{L}$ である。
はじめコックは閉じており、容器Aには圧力 $P_A = 3.0 \times 10^5\,\text{Pa}$、温度 $T_A = 300\,\text{K}$ の単原子分子理想気体が、容器Bには圧力 $P_B = 1.0 \times 10^5\,\text{Pa}$、温度 $T_B = 400\,\text{K}$ の同種の単原子分子理想気体が入っている。容器全体は断熱材で覆われており、細管の体積は無視できる。
コックを開いて十分に時間が経過したときの、混合気体の温度 $T\,[\text{K}]$ および全圧 $P\,[\text{Pa}]$ を求めよ。
:::

#### 【解法と解説】

**1. 混合後の全圧 $P$**
内部エネルギー保存則より：
$$
U_{\text{前}} = U_{\text{後}} \implies \frac{3}{2}n_A R T_A + \frac{3}{2}n_B R T_B = \frac{3}{2}(n_A + n_B) R T
$$
状態方程式 $PV = nRT$ を用いると、$nRT = PV$ と書き換えられます！
$$
P_A V_A + P_B V_B = P (V_A + V_B)
$$
したがって、全圧 $P$ は温度を計算する前に直ちに求まります：
$$
P = \frac{P_A V_A + P_B V_B}{V_A + V_B} = \frac{(3.0 \times 10^5) \times 2.0 + (1.0 \times 10^5) \times 3.0}{2.0 + 3.0} = \frac{6.0 \times 10^5 + 3.0 \times 10^5}{5.0} = \frac{9.0 \times 10^5}{5.0} = 1.8 \times 10^5\,\text{Pa}
$$

**2. 混合後の温度 $T$**
物質量の比を求めます：
$$
n_A = \frac{P_A V_A}{R T_A} = \frac{6.0 \times 10^5}{300 R} = \frac{2000}{R}
$$
$$
n_B = \frac{P_B V_B}{R T_B} = \frac{3.0 \times 10^5}{400 R} = \frac{750}{R}
$$
加重平均の公式に代入すると：
$$
T = \frac{n_A T_A + n_B T_B}{n_A + n_B} = \frac{\frac{2000}{R} \times 300 + \frac{750}{R} \times 400}{\frac{2000}{R} + \frac{750}{R}} = \frac{600000 + 300000}{2750} = \frac{900000}{2750} \approx 327\,\text{K}
$$

---

### 例題2: 可動ピストンで仕切られたシリンダーの加熱（難関大レベル）

::: info 【問題】
断熱材で作られた水平なシリンダー内が、なめらかに動く断熱ピストンによって容積の等しいA室とB室（ともに体積 $V_0$）に仕切られている。
両室にはともに $1\,\text{mol}$ の単原子分子理想気体が封入されており、初期温度はともに $T_0$、圧力はともに $P_0$ でつり合っている。
いま、A室内のヒーターで気体Aをゆっくり加熱したところ、ピストンが右へ移動し、B室の体積が $\frac{3}{4}V_0$ に圧縮された。気体定数を $R$ とする。
1. このときB室の気体の温度 $T_B$ を求めよ。ただし、気体の断熱変化におけるポアソンの法則 $T V^{\gamma-1} = \text{一定}$（$\gamma = 5/3$）を用いてよい。
2. この変化の間に、ピストンがB室の気体にした仕事 $W$ を $R, T_0$ を用いて表せ。
:::

#### 【解法と解説】

**1. B室の温度 $T_B$**
B室の気体は外部との熱のやり取りがないため、準静的断熱圧縮されます。
ポアソンの法則 $T_0 V_0^{\gamma-1} = T_B V_B^{\gamma-1}$ において、$\gamma = 5/3 \implies \gamma - 1 = 2/3$、体積 $V_B = \frac{3}{4}V_0$ を代入すると：
$$
T_B = T_0 \left(\frac{V_0}{V_B}\right)^{2/3} = T_0 \left(\frac{4}{3}\right)^{2/3}
$$

**2. ピストンがした仕事 $W$**
B室に対する熱力学第1法則より、$Q_B = 0$ なので：
$$
\Delta U_B = Q_B + W_{\text{in}} = 0 + W \implies W = \Delta U_B
$$
ピストンが気体Bにした仕事 $W$ は、 **そのままB室の内部エネルギー増加 $\Delta U_B$ に等しい**！
気体Bは単原子分子 $1\,\text{mol}$ なので：
$$
W = \Delta U_B = 1 \cdot C_V (T_B - T_0) = \frac{3}{2}R \left[ T_0 \left(\frac{4}{3}\right)^{2/3} - T_0 \right] = \frac{3}{2}R T_0 \left[\left(\frac{4}{3}\right)^{2/3} - 1\right]
$$
仕事を積分することなく、熱力学第1法則のエネルギー保存関係から一撃で求められます！
