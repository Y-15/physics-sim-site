# 量子力学（ヒルベルト空間・演算子代数とシュレーディンガー方程式）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学2〜3年次 ／ 必須数学：線形代数（エルミート行列・固有値問題）・偏微分方程式・フーリエ解析・特殊関数
</div>

高校物理の「原子物理」では、光電効果（$E = h\nu$）や物質波（$\lambda = h/p$）、ボーアの水素原子モデル（$2\pi r = n\lambda$）といった**前期量子論**を現象論的な公式として学びました。
大学の**量子力学（Quantum Mechanics）**では、「なぜエネルギーや角運動量が飛び飛びの値（離散値）しかとれないのか？」という根源的な問いに対し、物理状態を複素内積空間（**ヒルベルト空間**）のベクトル $|\psi\rangle$（波動関数 $\psi(\boldsymbol{r}, t)$）として表し、物理量をその上に作用する**エルミート演算子 $\hat{A}$** として記述する公理的体系から厳密な解答を与えます。量子化とは「境界条件のもとでの微分演算子の固有値問題」にほかなりません。

> **表記ルール（ISO 80000-2 準拠）**：本講座では、位置ベクトル $\boldsymbol{r}$、運動量ベクトル $\boldsymbol{p}$、波数ベクトル $\boldsymbol{k}$、確率流密度ベクトル $\boldsymbol{j}$、ナブラ演算子 $\boldsymbol{\nabla}$ を**太字（ボールド体）**で表し、量子力学の演算子にはハット記号 $\hat{\cdot}$ を付します（ベクトル演算子は太字＋ハット：位置演算子 $\hat{\boldsymbol{r}}$、運動量演算子 $\hat{\boldsymbol{p}} = -i\hbar\boldsymbol{\nabla}$、角運動量演算子 $\hat{\boldsymbol{L}} = \hat{\boldsymbol{r}}\times\hat{\boldsymbol{p}}$、スピン演算子 $\hat{\boldsymbol{S}} = \frac{\hbar}{2}\hat{\boldsymbol{\sigma}}$）。

---

## 1. 量子力学の基本公理とヒルベルト空間・エルミート演算子

### 1.1 ディラックのブラ・ケット記法とヒルベルト空間

量子系の状態は、複素内積空間（**ヒルベルト空間 $\mathcal{H}$**）に属する状態ベクトル（**ケットベクトル**）$|\psi\rangle$ によって完全に記述されます。位置表現（座標表示）における**波動関数 $\psi(\boldsymbol{r})$** とは、位置演算子 $\hat{\boldsymbol{r}}$ の固有ブラ $\langle\boldsymbol{r}|$ と状態ケット $|\psi\rangle$ の内積 $\psi(\boldsymbol{r}) \equiv \langle\boldsymbol{r}|\psi\rangle$（展開係数）のことです。

1. **内積（ブラ・ケット）とノルム**：
   2つの状態 $|\phi\rangle, |\psi\rangle$ の内積 $\langle\phi|\psi\rangle$ は次式で定義され、複素共役対称性 $\langle\phi|\psi\rangle = \langle\psi|\phi\rangle^*$ を満たします。
   $$
   \langle\phi|\psi\rangle = \iiint_{-\infty}^{\infty} \phi^*(\boldsymbol{r})\psi(\boldsymbol{r})\,d^3r, \qquad \|\psi\|^2 = \langle\psi|\psi\rangle = \iiint_{-\infty}^{\infty} |\psi(\boldsymbol{r})|^2\,d^3r = 1 \quad (\text{規格化条件})
   $$
2. **ボルンの確率解釈（Born rule）**：
   規格化された状態 $\psi(\boldsymbol{r}, t)$ において、時刻 $t$ に位置 $\boldsymbol{r}$ の周りの微小体積 $d^3r$ 内に粒子を見出す確率 $dP(\boldsymbol{r}, t)$ は、**存在確率密度 $\rho(\boldsymbol{r}, t) \equiv |\psi(\boldsymbol{r}, t)|^2$** に比例します。
   $$
   dP(\boldsymbol{r}, t) = |\psi(\boldsymbol{r}, t)|^2\,d^3r = \psi^*(\boldsymbol{r}, t)\psi(\boldsymbol{r}, t)\,d^3r
   $$
3. **正規直交基底と完全性関係（単位の分解）**：
   正規直交基底 $\{|n\rangle\}$（$\langle m|n\rangle = \delta_{mn}$）に対して、任意の状態 $|\psi\rangle$ は $|\psi\rangle = \sum_n c_n |n\rangle$（$c_n = \langle n|\psi\rangle$）と一意に展開でき、射影演算子の和は恒等演算子 $\hat{I}$ に等しくなります（**完全性関係 / Completeness relation**）。
   $$
   \sum_n |n\rangle\langle n| = \hat{I}, \qquad \iiint |\boldsymbol{r}\rangle\langle\boldsymbol{r}|\,d^3r = \hat{I}, \qquad |\langle n|\psi\rangle|^2 = |c_n|^2 \text{（測定で固有状態 $|n\rangle$ が得られる確率）}
   $$

### 1.2 物理量（オブザーバブル）とエルミート演算子の2大定理

位置 $\boldsymbol{r}$、運動量 $\boldsymbol{p}$、エネルギー $E$、角運動量 $\boldsymbol{L}$ などの観測可能な物理量（オブザーバブル）はすべて、ヒルベルト空間上の**エルミート演算子（自己共役演算子 / Hermitian operator）$\hat{A}$** として表されます。
演算子 $\hat{A}$ の随伴演算子（エルミート共役）$\hat{A}^\dagger$ は、任意の $|\phi\rangle, |\psi\rangle$ に対して $\langle\phi|\hat{A}^\dagger\psi\rangle \equiv \langle\hat{A}\phi|\psi\rangle = \langle\psi|\hat{A}\phi\rangle^*$ で定義され、

$$
\hat{A}^\dagger = \hat{A} \quad \Longleftrightarrow \quad \langle\phi|\hat{A}|\psi\rangle = \langle\hat{A}\phi|\psi\rangle = \iiint \phi^*(\boldsymbol{r})\left[\hat{A}\psi(\boldsymbol{r})\right]d^3r = \iiint \left[\hat{A}\phi(\boldsymbol{r})\right]^*\psi(\boldsymbol{r})\,d^3r
$$

を満たすとき、$\hat{A}$ をエルミート演算子と呼びます。なぜ物理量がエルミート演算子でなければならないのかは、以下の2つの定理によって数学的に保証されます。

- **【定理1】エルミート演算子の固有値はすべて実数である（測定値の実数性）**
  **証明**：固有値方程式 $\hat{A}|a\rangle = a|a\rangle$（$|a\rangle \neq 0$）の両辺に左から $\langle a|$ を掛けると $\langle a|\hat{A}|a\rangle = a\langle a|a\rangle$。一方、エルミート性 $\hat{A}^\dagger = \hat{A}$ より $\langle a|\hat{A}|a\rangle^* = \langle a|\hat{A}^\dagger|a\rangle = \langle a|\hat{A}|a\rangle = a^*\langle a|a\rangle$。$\langle a|a\rangle > 0$ で割れば **$a^* = a$（実数）** が成り立つ。 $\blacksquare$
- **【定理2】異なる固有値に属するエルミート演算子の固有状態は互いに直交する（直交性）**
  **証明**：$\hat{A}|a_1\rangle = a_1|a_1\rangle,\ \hat{A}|a_2\rangle = a_2|a_2\rangle$（$a_1 \neq a_2$）とする。$\langle a_2|\hat{A}|a_1\rangle = a_1\langle a_2|a_1\rangle$ であり、他方エルミート性と固有値の実数性より $\langle a_2|\hat{A}|a_1\rangle = \langle\hat{A}a_2|a_1\rangle = a_2^*\langle a_2|a_1\rangle = a_2\langle a_2|a_1\rangle$。差をとると $(a_1 - a_2)\langle a_2|a_1\rangle = 0$。$a_1 \neq a_2$ より **$\langle a_2|a_1\rangle = 0$**。 $\blacksquare$

### 1.3 正準量子化の手続き（座標表示における演算子）

古典力学のハミルトニアン $H(\boldsymbol{r}, \boldsymbol{p}) = \dfrac{\boldsymbol{p}^2}{2m} + V(\boldsymbol{r})$ から量子力学の演算子へ移行するには、位置ベクトル $\boldsymbol{r}$ と運動量ベクトル $\boldsymbol{p}$ を以下の線形演算子に置き換えます（**正準量子化 / Canonical quantization**）。

| 物理量 | 古典力学の変数 | 量子力学の演算子（座標表示） | 具体的な作用（波動関数 $\psi(\boldsymbol{r})$ に対して） |
| :--- | :---: | :---: | :--- |
| **位置ベクトル** | $\boldsymbol{r} = (x, y, z)$ | $\hat{\boldsymbol{r}} = (\hat{x}, \hat{y}, \hat{z})$ | $\hat{\boldsymbol{r}}\psi(\boldsymbol{r}) = \boldsymbol{r}\psi(\boldsymbol{r})$（座標 $\boldsymbol{r}$ を掛ける演算） |
| **運動量ベクトル** | $\boldsymbol{p} = (p_x, p_y, p_z)$ | $\hat{\boldsymbol{p}} = -i\hbar\boldsymbol{\nabla}$ | $\displaystyle \hat{p}_x\psi = -i\hbar\frac{\partial \psi}{\partial x},\ \hat{p}_y\psi = -i\hbar\frac{\partial \psi}{\partial y},\ \hat{p}_z\psi = -i\hbar\frac{\partial \psi}{\partial z}$ |
| **軌道角運動量** | $\boldsymbol{L} = \boldsymbol{r} \times \boldsymbol{p}$ | $\hat{\boldsymbol{L}} = \hat{\boldsymbol{r}} \times \hat{\boldsymbol{p}} = -i\hbar(\boldsymbol{r} \times \boldsymbol{\nabla})$ | $\displaystyle \hat{L}_z\psi = (\hat{x}\hat{p}_y - \hat{y}\hat{p}_x)\psi = -i\hbar\left(x\frac{\partial}{\partial y} - y\frac{\partial}{\partial x}\right)\psi = -i\hbar\frac{\partial \psi}{\partial \phi}$ |
| **ハミルトニアン** | $\displaystyle H = \frac{\boldsymbol{p}^2}{2m} + V(\boldsymbol{r})$ | $\displaystyle \hat{H} = \frac{\hat{\boldsymbol{p}}^2}{2m} + V(\hat{\boldsymbol{r}}) = -\frac{\hbar^2}{2m}\nabla^2 + V(\boldsymbol{r})$ | $\displaystyle \hat{H}\psi(\boldsymbol{r}) = \left[-\frac{\hbar^2}{2m}\left(\frac{\partial^2}{\partial x^2}+\frac{\partial^2}{\partial y^2}+\frac{\partial^2}{\partial z^2}\right) + V(\boldsymbol{r})\right]\psi(\boldsymbol{r})$ |

規格化された状態 $|\psi\rangle$ における物理量 $\hat{A}$ の**期待値（平均値）$\langle\hat{A}\rangle$** と**分散（揺らぎの2乗）$(\Delta A)^2$** は次式で与えられます。

$$
\langle\hat{A}\rangle \equiv \langle\psi|\hat{A}|\psi\rangle = \iiint \psi^*(\boldsymbol{r})\hat{A}\psi(\boldsymbol{r})\,d^3r, \qquad (\Delta A)^2 \equiv \left\langle (\hat{A} - \langle\hat{A}\rangle)^2 \right\rangle = \langle\hat{A}^2\rangle - \langle\hat{A}\rangle^2
$$

---

## 2. シュレーディンガー方程式と確率保存則・エーレンフェストの定理

### 2.1 時間依存シュレーディンガー方程式と定常状態

量子状態 $|\psi(t)\rangle$（波動関数 $\psi(\boldsymbol{r}, t)$）の時間発展を支配する基本運動方程式が**時間依存シュレーディンガー方程式（Time-dependent Schrödinger equation）**です。

$$
i\hbar \frac{\partial}{\partial t}\psi(\boldsymbol{r}, t) = \hat{H}\psi(\boldsymbol{r}, t) = \left[ -\frac{\hbar^2}{2m}\nabla^2 + V(\boldsymbol{r}, t) \right] \psi(\boldsymbol{r}, t)
$$

ポテンシャル $V(\boldsymbol{r})$ が時間 $t$ に依存しない保存系では、変数分離 $\psi(\boldsymbol{r}, t) = \varphi(\boldsymbol{r})T(t)$ を行うことで、時間部分は $T(t) = e^{-iEt/\hbar}$ となり、空間部分 $\varphi(\boldsymbol{r})$ はハミルトニアン $\hat{H}$ の固有値方程式——**時間に依存しないシュレーディンガー方程式（定常状態シュレーディンガー方程式）**——を満たします。

$$
\hat{H}\varphi_n(\boldsymbol{r}) = E_n \varphi_n(\boldsymbol{r}) \quad \Longleftrightarrow \quad \left[ -\frac{\hbar^2}{2m}\nabla^2 + V(\boldsymbol{r}) \right] \varphi_n(\boldsymbol{r}) = E_n \varphi_n(\boldsymbol{r})
$$

エネルギー固有状態 $\psi_n(\boldsymbol{r}, t) = \varphi_n(\boldsymbol{r})e^{-iE_n t/\hbar}$ では、存在確率密度 $|\psi_n(\boldsymbol{r}, t)|^2 = |\varphi_n(\boldsymbol{r})|^2$ が時間に依らず一定となるため、これを**定常状態（Stationary state）**と呼びます。また、一般の初期状態 $\psi(\boldsymbol{r}, 0) = \sum_n c_n \varphi_n(\boldsymbol{r})$ の時間発展は、定常状態の重ね合わせとして完全に決定されます。

$$
\psi(\boldsymbol{r}, t) = \sum_n c_n \varphi_n(\boldsymbol{r}) e^{-iE_n t/\hbar} \qquad \left(c_n = \langle\varphi_n|\psi(0)\rangle = \iiint \varphi_n^*(\boldsymbol{r})\psi(\boldsymbol{r}, 0)\,d^3r\right)
$$

### 2.2 確率の連続の式と確率流密度ベクトル $\boldsymbol{j}$

時間依存シュレーディンガー方程式と、その複素共役をとった式：

$$
\frac{\partial \psi}{\partial t} = \frac{i\hbar}{2m}\nabla^2\psi - \frac{i}{\hbar}V\psi, \qquad \frac{\partial \psi^*}{\partial t} = -\frac{i\hbar}{2m}\nabla^2\psi^* + \frac{i}{\hbar}V\psi^*
$$

を用いて、存在確率密度 $\rho(\boldsymbol{r}, t) = \psi^*(\boldsymbol{r}, t)\psi(\boldsymbol{r}, t)$ の時間微分を計算すると、ポテンシャル $V(\boldsymbol{r})$（実数）の項は相殺し、ベクトル恒等式 $\boldsymbol{\nabla}\cdot(\psi^*\boldsymbol{\nabla}\psi - \psi\boldsymbol{\nabla}\psi^*) = \psi^*\nabla^2\psi - \psi\nabla^2\psi^*$ より次式が得られます。

$$
\frac{\partial \rho}{\partial t} = \frac{\partial \psi^*}{\partial t}\psi + \psi^*\frac{\partial \psi}{\partial t} = \frac{i\hbar}{2m}\left(\psi^*\nabla^2\psi - \psi\nabla^2\psi^*\right) = -\boldsymbol{\nabla} \cdot \left[ \frac{\hbar}{2mi}\left(\psi^*\boldsymbol{\nabla}\psi - \psi\boldsymbol{\nabla}\psi^*\right) \right]
$$

ここで、**確率流密度ベクトル（Probability current density）$\boldsymbol{j}(\boldsymbol{r}, t)$** を

$$
\boldsymbol{j}(\boldsymbol{r}, t) \equiv \frac{\hbar}{2mi}\left( \psi^*\boldsymbol{\nabla}\psi - \psi\boldsymbol{\nabla}\psi^* \right) = \frac{1}{m}\operatorname{Re}\left( \psi^* \hat{\boldsymbol{p}}\psi \right)
$$

と定義すると、流体力学の質量保存則や電磁気学の電荷保存則と全く同じ形の**確率の連続の式（保存則）**が成り立ちます。

$$
\frac{\partial \rho(\boldsymbol{r}, t)}{\partial t} + \boldsymbol{\nabla} \cdot \boldsymbol{j}(\boldsymbol{r}, t) = 0 \quad \Longrightarrow \quad \frac{d}{dt}\iiint_{\mathbb{R}^3} |\psi(\boldsymbol{r}, t)|^2\,d^3r = -\oiint_{S_\infty} \boldsymbol{j}\cdot d\boldsymbol{S} = 0
$$

すなわち、ハミルトニアン $\hat{H}$ がエルミート演算子である限り、全空間で粒子を見出す全確率 $\int |\psi|^2 d^3r = 1$ は時間発展を通じて厳密に保存されます（**時間発展のユニタリ性**）。

### 2.3 交換関係とエーレンフェストの定理（古典力学との対応原理）

2つの演算子 $\hat{A}, \hat{B}$ の作用順序の差を表す **交換子（Commutator）** を $[\hat{A}, \hat{B}] \equiv \hat{A}\hat{B} - \hat{B}\hat{A}$ と定義します。任意の物理量 $\hat{A}$ の期待値 $\langle\hat{A}\rangle = \langle\psi(t)|\hat{A}|\psi(t)\rangle$ の時間微分をシュレーディンガー方程式 $i\hbar\frac{d}{dt}|\psi\rangle = \hat{H}|\psi\rangle$ を用いて計算すると、以下の基本公式が得られます。

$$
\frac{d}{dt}\langle\hat{A}\rangle = \frac{1}{i\hbar}\left\langle [\hat{A}, \hat{H}] \right\rangle + \left\langle \frac{\partial \hat{A}}{\partial t} \right\rangle
$$

特に、陽に時間 $t$ を含まない演算子 $\hat{A}$（$\partial\hat{A}/\partial t = 0$）がハミルトニアン $\hat{H}$ と可換（**$[\hat{A}, \hat{H}] = 0$**）であるとき、$\dfrac{d}{dt}\langle\hat{A}\rangle = 0$ となり、物理量 $\hat{A}$ は**保存量（運動の定数）**となります。

この公式を $\hat{H} = \dfrac{\hat{\boldsymbol{p}}^2}{2m} + V(\hat{\boldsymbol{r}})$ のもとで位置演算子 $\hat{\boldsymbol{r}}$ と運動量演算子 $\hat{\boldsymbol{p}}$ に適用すると、$[\hat{\boldsymbol{r}}, \hat{H}] = \dfrac{i\hbar}{m}\hat{\boldsymbol{p}}$ および $[\hat{\boldsymbol{p}}, \hat{H}] = -i\hbar\boldsymbol{\nabla}V(\hat{\boldsymbol{r}})$ より、期待値がニュートンの運動方程式と同型の式を満たすことを示す**エーレンフェストの定理（Ehrenfest's theorem）**が導かれます。

$$
\frac{d}{dt}\langle\hat{\boldsymbol{r}}\rangle = \frac{1}{m}\langle\hat{\boldsymbol{p}}\rangle, \qquad \frac{d}{dt}\langle\hat{\boldsymbol{p}}\rangle = -\left\langle \boldsymbol{\nabla}V(\hat{\boldsymbol{r}}) \right\rangle
$$

---

## 3. 正準交換関係とロバートソン・シュレーディンガーの不確定性原理

### 3.1 3次元正準交換関係

任意の試験波動関数 $\psi(\boldsymbol{r})$ に対して $[\hat{x}, \hat{p}_x]\psi = x\left(-i\hbar\dfrac{\partial\psi}{\partial x}\right) - \left(-i\hbar\dfrac{\partial}{\partial x}(x\psi)\right) = i\hbar\psi$ が成り立つことから、3次元の位置演算子 $\hat{\boldsymbol{r}} = (\hat{x}, \hat{y}, \hat{z})$ と運動量演算子 $\hat{\boldsymbol{p}} = (\hat{p}_x, \hat{p}_y, \hat{p}_z)$ の各成分間には、以下の**正準交換関係（Canonical commutation relations）**が成り立ちます（$\alpha, \beta \in \{x, y, z\}$）。

$$
[\hat{r}_\alpha, \hat{p}_\beta] = i\hbar\,\delta_{\alpha\beta}, \qquad [\hat{r}_\alpha, \hat{r}_\beta] = 0, \qquad [\hat{p}_\alpha, \hat{p}_\beta] = 0
$$

> **解析力学との対応（ディラックの量子化則）**：前章の解析力学で学んだ基本ポアソン括弧 $\{r_\alpha, p_\beta\} = \delta_{\alpha\beta}$ に対して、$\{\cdot, \cdot\} \longrightarrow \dfrac{1}{i\hbar}[\hat{\cdot}, \hat{\cdot}]$ という置き換えを行ったものが正準交換関係です。

### 3.2 一般化された不確定性関係（ロバートソンの不等式）の証明

任意の2つのエルミート演算子 $\hat{A}, \hat{B}$ に対して、平均値を差し引いたエルミート演算子 $\Delta\hat{A} \equiv \hat{A} - \langle\hat{A}\rangle,\ \Delta\hat{B} \equiv \hat{B} - \langle\hat{B}\rangle$ を定義します。
ヒルベルト空間におけるコーシー・シュワルツの不等式 $\|\Delta\hat{A}\psi\|^2 \|\Delta\hat{B}\psi\|^2 \ge |\langle\Delta\hat{A}\psi|\Delta\hat{B}\psi\rangle|^2$ において、積 $\Delta\hat{A}\Delta\hat{B}$ をエルミート部分（反交換子）と反エルミート部分（交換子）に分解します：

$$
\Delta\hat{A}\Delta\hat{B} = \frac{1}{2}\{\Delta\hat{A}, \Delta\hat{B}\} + \frac{1}{2}[\hat{A}, \hat{B}] = \frac{1}{2}\{\Delta\hat{A}, \Delta\hat{B}\} + \frac{i}{2}\left(\frac{1}{i}[\hat{A}, \hat{B}]\right)
$$

ここで $\{\Delta\hat{A}, \Delta\hat{B}\}$ と $\dfrac{1}{i}[\hat{A}, \hat{B}]$ はともにエルミート演算子であるため、その期待値は実数です。複素数の絶対値の2乗は虚部の2乗以上（$|\text{Re} + i\,\text{Im}|^2 \ge (\text{Im})^2$）であることから、**ロバートソンの不確定性関係（Robertson uncertainty relation）**が厳密に証明されます。

$$
(\Delta A)^2 (\Delta B)^2 \ge \frac{1}{4}\left| \left\langle [\hat{A}, \hat{B}] \right\rangle \right|^2 \quad \Longleftrightarrow \quad \Delta A \cdot \Delta B \ge \frac{1}{2}\left| \left\langle [\hat{A}, \hat{B}] \right\rangle \right|
$$

これに $\hat{A} = \hat{r}_\alpha,\ \hat{B} = \hat{p}_\alpha$（$[\hat{r}_\alpha, \hat{p}_\alpha] = i\hbar$）を代入すると、直ちに**ハイゼンベルクの不確定性原理（Heisenberg's uncertainty principle）**が得られます。

$$
\Delta x \cdot \Delta p_x \ge \frac{\hbar}{2}, \qquad \Delta y \cdot \Delta p_y \ge \frac{\hbar}{2}, \qquad \Delta z \cdot \Delta p_z \ge \frac{\hbar}{2}
$$

なお、等号 $\Delta x \cdot \Delta p_x = \dfrac{\hbar}{2}$ を達成する**最小不確定状態**は、$\Delta\hat{p}_x |\psi\rangle = i\gamma\Delta\hat{x}|\psi\rangle$（$\gamma > 0$）を満たす**ガウス波束（Gaussian wavepacket）** $\psi(x) = (2\pi\sigma_x^2)^{-1/4}\exp\left(-\dfrac{(x-x_0)^2}{4\sigma_x^2} + \dfrac{ip_0 x}{\hbar}\right)$ です。

---

## 4. 1次元ポテンシャル問題の厳密解（井戸型・調和振動子・トンネル効果）

### 4.1 1次元無限深さ井戸型ポテンシャル（境界条件によるエネルギー量子化）

区間 $0 < x < L$ で $V(x) = 0$、それ以外の領域（$x \le 0,\ x \ge L$）で $V(x) = \infty$ となるポテンシャルを考えます。井戸の内部（$0 < x < L$）での定常状態シュレーディンガー方程式は、

$$
-\frac{\hbar^2}{2m}\frac{d^2\varphi(x)}{dx^2} = E\varphi(x) \quad \Longleftrightarrow \quad \frac{d^2\varphi}{dx^2} + k^2\varphi = 0 \qquad \left(k \equiv \frac{\sqrt{2mE}}{\hbar} > 0\right)
$$

一般解 $\varphi(x) = A\sin kx + B\cos kx$ に対し、無限の壁での波動関数の連続性（境界条件 $\varphi(0) = 0,\ \varphi(L) = 0$）を課すと、$B = 0$ かつ $\sin kL = 0 \implies k_n L = n\pi$（$n = 1, 2, 3, \dots$）となります。規格化条件 $\int_0^L |\varphi_n(x)|^2 dx = 1$ より、エネルギー固有値 $E_n$ と固有関数 $\varphi_n(x)$ は次式で与えられます。

$$
E_n = \frac{\hbar^2 k_n^2}{2m} = \frac{\pi^2 \hbar^2}{2m L^2} n^2 = \frac{h^2}{8m L^2} n^2, \qquad \varphi_n(x) = \sqrt{\frac{2}{L}}\sin\left(\frac{n\pi x}{L}\right) \qquad (n = 1, 2, 3, \dots)
$$

最低エネルギー状態（基底状態 $n=1$）であってもエネルギーはゼロにならず、不確定性原理に起因する**零点エネルギー（Zero-point energy）$E_1 = \dfrac{\pi^2\hbar^2}{2mL^2} > 0$** を持ちます。

<div class="sim-embed">
  <div class="sim-embed-header">▼ 1次元無限深さ井戸型ポテンシャルの固有関数と存在確率密度分布</div>
  <InfiniteWell />
</div>

### 4.2 1次元調和振動子と生成・消滅演算子（代数的解法）

復元力ポテンシャル $V(x) = \dfrac{1}{2}m\omega^2 x^2$ 中の粒子（量子調和振動子）のハミルトニアンは次式です。

$$
\hat{H} = \frac{\hat{p}^2}{2m} + \frac{1}{2}m\omega^2 \hat{x}^2
$$

2階微分方程式（エルミート微分方程式）を直接解く代わりに、無次元化した非エルミート演算子である**消滅演算子（下降演算子）$\hat{a}$** と **生成演算子（上昇演算子）$\hat{a}^\dagger$** を導入します。

$$
\hat{a} \equiv \sqrt{\frac{m\omega}{2\hbar}}\left( \hat{x} + \frac{i}{m\omega}\hat{p} \right), \qquad \hat{a}^\dagger \equiv \sqrt{\frac{m\omega}{2\hbar}}\left( \hat{x} - \frac{i}{m\omega}\hat{p} \right)
$$

正準交換関係 $[\hat{x}, \hat{p}] = i\hbar$ を用いて $[\hat{a}, \hat{a}^\dagger]$ と $\hat{a}^\dagger\hat{a}$ を計算すると、演算子の順序に注意して次の基本代数関係が得られます。

$$
[\hat{a}, \hat{a}^\dagger] = \frac{m\omega}{2\hbar}\left( -\frac{i}{m\omega}[\hat{x}, \hat{p}] + \frac{i}{m\omega}[\hat{p}, \hat{x}] \right) = 1, \qquad \hat{H} = \hbar\omega\left( \hat{a}^\dagger \hat{a} + \frac{1}{2} \right) = \hbar\omega\left( \hat{N} + \frac{1}{2} \right)
$$

ここで $\hat{N} \equiv \hat{a}^\dagger\hat{a}$ は**数演算子（Number operator）**と呼ばれ、交換関係 $[\hat{N}, \hat{a}] = -\hat{a}$、$[\hat{N}, \hat{a}^\dagger] = +\hat{a}^\dagger$ を満たします。これより、$\hat{N}|n\rangle = n|n\rangle$ の固有状態 $|n\rangle$ に $\hat{a}^\dagger, \hat{a}$ を作用させると、固有値がちょうど $1$ だけ増減します。

$$
\hat{N}\left(\hat{a}^\dagger|n\rangle\right) = (n+1)\left(\hat{a}^\dagger|n\rangle\right), \qquad \hat{N}\left(\hat{a}|n\rangle\rangle\right) = (n-1)\left(\hat{a}|n\rangle\right)
$$

ノルムの非負性 $\|\hat{a}|n\rangle\|^2 = \langle n|\hat{a}^\dagger\hat{a}|n\rangle = n\langle n|n\rangle \ge 0$ より固有値は $n \ge 0$ でなければならず、下降操作が負の固有値へ突き抜けないために、$\hat{a}|0\rangle = 0$ を満たす**基底状態 $|0\rangle$** が存在して $n = 0, 1, 2, \dots$（非負整数）に確定します。

- **エネルギー固有値**：
  $$
  E_n = \hbar\omega\left(n + \frac{1}{2}\right) \qquad (n = 0, 1, 2, \dots,\quad \text{零点エネルギー } E_0 = \frac{1}{2}\hbar\omega)
  $$
- **昇降演算子の作用と規格化固有状態**：
  $$
  \hat{a}|n\rangle = \sqrt{n}\,|n-1\rangle, \qquad \hat{a}^\dagger|n\rangle = \sqrt{n+1}\,|n+1\rangle, \qquad |n\rangle = \frac{(\hat{a}^\dagger)^n}{\sqrt{n!}}|0\rangle
  $$
- **座標表示の波動関数（エルミート多項式 $H_n(\xi)$）**：
  1階微分方程式 $\langle x|\hat{a}|0\rangle = 0 \iff \left(x + \dfrac{\hbar}{m\omega}\dfrac{d}{dx}\right)\varphi_0(x) = 0$ を解くと基底状態はガウス関数となり、一般の励起状態 $\varphi_n(x)$ は $\xi \equiv \sqrt{\dfrac{m\omega}{\hbar}}x$ として次式で与えられます。
  $$
  \varphi_0(x) = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4} \exp\left(-\frac{m\omega}{2\hbar}x^2\right), \qquad \varphi_n(x) = \frac{1}{\sqrt{2^n n!}}\left(\frac{m\omega}{\pi\hbar}\right)^{1/4} H_n(\xi) e^{-\xi^2/2}
  $$

### 4.3 ポテンシャル障壁と量子トンネル効果（Quantum Tunneling）

領域 $0 < x < a$ に高さ $V_0 (> E)$ の矩形ポテンシャル障壁があるとき、古典力学ではエネルギー $E < V_0$ の粒子は壁の手前で100%跳ね返されます。しかし量子力学では、障壁内部（$0 < x < a$）でのシュレーディンガー方程式

$$
\frac{d^2\varphi}{dx^2} - \kappa^2 \varphi = 0 \qquad \left(\kappa \equiv \frac{\sqrt{2m(V_0 - E)}}{\hbar} > 0\right)
$$

の解が指数減衰関数 $\varphi(x) = C e^{-\kappa x} + D e^{+\kappa x}$ として非ゼロの値を持ち、境界 $x=0, a$ での $\varphi(x)$ と $\varphi'(x)$ の滑らかな接続条件から、障壁の反対側（$x > a$）へ染み出して進行波 $\varphi_{\text{trans}}(x) = t\,e^{ikx}$ として透過する確率（**透過係数 $T$**）が正の値となります。

$$
T = \left[ 1 + \frac{V_0^2}{4E(V_0 - E)}\sinh^2(\kappa a) \right]^{-1} \underset{\kappa a \gg 1}{\simeq} \frac{16E(V_0 - E)}{V_0^2}\exp\left( -\frac{2a}{\hbar}\sqrt{2m(V_0 - E)} \right), \qquad R + T = 1
$$

この**量子トンネル効果**は、原子核の $\alpha$ 崩壊、走査型トンネル顕微鏡（STM）、トンネルダイオード、フラッシュメモリなどの動作原理そのものです。

<div class="sim-embed">
  <div class="sim-embed-header">▼ ポテンシャル障壁に対する波動関数の入射・反射・量子トンネル透過シミュレーション</div>
  <QuantumTunneling />
</div>

---

## 5. 角運動量演算子・3次元中心力場と水素原子・スピン

### 5.1 軌道角運動量演算子 $\hat{\boldsymbol{L}}$ の交換関係と固有値

3次元の軌道角運動量演算子 $\hat{\boldsymbol{L}} = \hat{\boldsymbol{r}} \times \hat{\boldsymbol{p}} = (\hat{L}_x, \hat{L}_y, \hat{L}_z)$ の各成分間の交換関係を正準交換関係 $[\hat{r}_\alpha, \hat{p}_\beta] = i\hbar\delta_{\alpha\beta}$ から計算すると、エディントンのイプシロン（完全反対称テンソル）$\epsilon_{\alpha\beta\gamma}$ を用いて次の**角運動量代数**が得られます。

$$
[\hat{L}_x, \hat{L}_y] = i\hbar \hat{L}_z, \qquad [\hat{L}_y, \hat{L}_z] = i\hbar \hat{L}_x, \qquad [\hat{L}_z, \hat{L}_x] = i\hbar \hat{L}_y \quad \Longleftrightarrow \quad [\hat{L}_\alpha, \hat{L}_\beta] = i\hbar \sum_{\gamma} \epsilon_{\alpha\beta\gamma} \hat{L}_\gamma
$$

異なる成分同士（$\hat{L}_x, \hat{L}_y, \hat{L}_z$）は互いに非可換であるため同時に確定値を持つことはできませんが、角運動量の2乗演算子 **$\hat{\boldsymbol{L}}^2 \equiv \hat{L}_x^2 + \hat{L}_y^2 + \hat{L}_z^2$** はすべての成分と可換です：

$$
[\hat{\boldsymbol{L}}^2, \hat{L}_x] = [\hat{\boldsymbol{L}}^2, \hat{L}_y] = [\hat{\boldsymbol{L}}^2, \hat{L}_z] = 0 \quad \Longleftrightarrow \quad [\hat{\boldsymbol{L}}^2, \hat{\boldsymbol{L}}] = \boldsymbol{0}
$$

したがって $\hat{\boldsymbol{L}}^2$ と1つの成分（慣例として $\hat{L}_z$）の同時固有状態 $|l, m\rangle$ を構成できます。昇降演算子 $\hat{L}_\pm \equiv \hat{L}_x \pm i\hat{L}_y$（$[\hat{L}_z, \hat{L}_\pm] = \pm\hbar\hat{L}_\pm$）を用いた代数的操作と球座標 $(r, \theta, \phi)$ における1価連続条件から、同時固有値方程式と固有関数（**球面調和関数 $Y_l^m(\theta, \phi)$**）が完全に決定されます。

$$
\hat{\boldsymbol{L}}^2 Y_l^m(\theta, \phi) = l(l+1)\hbar^2 Y_l^m(\theta, \phi) \qquad (l = 0, 1, 2, \dots\text{：方位量子数})
$$

$$
\hat{L}_z Y_l^m(\theta, \phi) = m\hbar Y_l^m(\theta, \phi) \qquad (m = -l, -l+1, \dots, +l\text{：磁気量子数、$2l+1$ 個の値をとる})
$$

$$
\hat{L}_\pm |l, m\rangle = \hbar\sqrt{l(l+1) - m(m\pm 1)}\,|l, m\pm 1\rangle
$$

### 5.2 3次元中心力ポテンシャルと水素原子の厳密解

球対称な中心力ポテンシャル $V(\boldsymbol{r}) = V(r)$ 中の粒子では、球座標ラプラシアンが動径部分と角運動量演算子 $\hat{\boldsymbol{L}}^2$ に分解されるため、ハミルトニアンは $[\hat{H}, \hat{\boldsymbol{L}}^2] = 0,\ [\hat{H}, \hat{L}_z] = 0$ を満たします。

$$
\hat{H} = -\frac{\hbar^2}{2m_e}\frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial}{\partial r}\right) + \frac{\hat{\boldsymbol{L}}^2}{2m_e r^2} + V(r)
$$

波動関数を $\varphi_{nlm}(r, \theta, \phi) = R_{nl}(r)Y_l^m(\theta, \phi) = \dfrac{u_{nl}(r)}{r}Y_l^m(\theta, \phi)$ と変数分離すると、動径関数 $u_{nl}(r) = r R_{nl}(r)$ は遠心力ポテンシャル項を含む1次元有効シュレーディンガー方程式を満たします。

$$
\left[ -\frac{\hbar^2}{2m_e}\frac{d^2}{dr^2} + \underbrace{V(r) + \frac{l(l+1)\hbar^2}{2m_e r^2}}_{V_{\text{eff}}(r)} \right] u_{nl}(r) = E_n u_{nl}(r)
$$

特に、**水素原子**のクーロンポテンシャル $V(r) = -\dfrac{e^2}{4\pi\varepsilon_0 r}$ を代入し、$r \to 0$ および $r \to \infty$ での規格化可能条件（ラゲール陪多項式への切断条件）を課すと、**ボーア半径 $a_0$** と主量子数 $n$（$n = 1, 2, 3, \dots$、ただし $0 \le l \le n-1$）によって離散的なエネルギー固有値 $E_n$ が第一原理から導出されます。

$$
a_0 \equiv \frac{4\pi\varepsilon_0 \hbar^2}{m_e e^2} \approx 0.529\,\text{\AA}, \qquad E_n = -\frac{m_e e^4}{2(4\pi\varepsilon_0)^2 \hbar^2} \frac{1}{n^2} = -\frac{\hbar^2}{2m_e a_0^2}\frac{1}{n^2} \approx -\frac{13.6\,\text{eV}}{n^2}
$$

- **主量子数 $n$ の縮退度**：与えられた $n$ に対して $l = 0, 1, \dots, n-1$ が許され、各 $l$ に対して $m = -l, \dots, +l$ の $(2l+1)$ 状態が存在するため、軌道状態の縮退度は $\sum_{l=0}^{n-1}(2l+1) = n^2$（電子のスピン自由度 $2$ を含めると **$2n^2$ 重縮退**）となります。
- **基底状態（$1\text{s}$ 軌道：$n=1, l=0, m=0$）の波動関数**：
  $$
  \varphi_{100}(\boldsymbol{r}) = \frac{1}{\sqrt{\pi a_0^3}} e^{-r/a_0}, \qquad P_{100}(r)\,dr = |\varphi_{100}|^2 4\pi r^2\,dr = \frac{4}{a_0^3}r^2 e^{-2r/a_0}\,dr
  $$
  動径分布関数 $P_{100}(r)$ が最大となる位置は $\dfrac{d}{dr}(r^2 e^{-2r/a_0}) = 0$ より **$r = a_0$（ボーア半径）** に一致し、期待値は $\langle r \rangle_{100} = \dfrac{3}{2}a_0$ となります。

### 5.3 スピン角運動量 $\hat{\boldsymbol{S}}$ とパウリ行列 $\hat{\boldsymbol{\sigma}}$

電子などの素粒子は、空間的な軌道運動とは無関係な純粋に量子力学的な内部角運動量——**スピン（Spin）$\hat{\boldsymbol{S}} = (\hat{S}_x, \hat{S}_y, \hat{S}_z)$**——を持ちます。スピン $s = 1/2$ の粒子では、$z$ 成分の固有値は $m_s = \pm 1/2$ の2値（スピン上向き $|\uparrow\rangle = \begin{pmatrix} 1 \\ 0 \end{pmatrix}$、スピン下向き $|\downarrow\rangle = \begin{pmatrix} 0 \\ 1 \end{pmatrix}$）のみをとり、2行2列のエルミートかつユニタリな**パウリ行列（Pauli matrices）$\hat{\boldsymbol{\sigma}} = (\sigma_x, \sigma_y, \sigma_z)$** によって表現されます。

$$
\hat{\boldsymbol{S}} = \frac{\hbar}{2}\hat{\boldsymbol{\sigma}}, \qquad \sigma_x = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \qquad \sigma_y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \qquad \sigma_z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}
$$

パウリ行列は以下の美しい代数関係（交換関係と反交換関係の両立）を満たします。

$$
\sigma_\alpha \sigma_\beta = \delta_{\alpha\beta} I_2 + i\sum_\gamma \epsilon_{\alpha\beta\gamma}\sigma_\gamma \quad \Longrightarrow \quad [\hat{S}_\alpha, \hat{S}_\beta] = i\hbar\sum_\gamma \epsilon_{\alpha\beta\gamma}\hat{S}_\gamma, \qquad \hat{\boldsymbol{S}}^2 = \frac{3}{4}\hbar^2 I_2
$$

---

## 6. 量子力学の近似解法（定常摂動論と変分法）

現実の原子・分子や固体中の電子系では、シュレーディンガー方程式が厳密に解けるケースはごく一部に限られます。そこで、厳密解が既知のハミルトニアン $\hat{H}_0$ からのずれを計算する**近似解法**が不可欠となります。

### 6.1 縮退のない時間に依存しない摂動論（Time-independent Perturbation Theory）

ハミルトニアンが $\hat{H} = \hat{H}_0 + \lambda \hat{V}$ と書け、無摂動系 $\hat{H}_0 |n^{(0)}\rangle = E_n^{(0)} |n^{(0)}\rangle$ の固有値・固有状態がすべて既知であり、注目する準位 $n$ に縮退がない場合を考えます。
固有値 $E_n$ と固有状態 $|n\rangle$ を微小パラメータ $\lambda$ のべき級数として展開し、シュレーディンガー方程式 $(\hat{H}_0 + \lambda\hat{V})(|n^{(0)}\rangle + \lambda|n^{(1)}\rangle + \cdots) = (E_n^{(0)} + \lambda E_n^{(1)} + \lambda^2 E_n^{(2)} + \cdots)(|n^{(0)}\rangle + \lambda|n^{(1)}\rangle + \cdots)$ の各次数を比較すると、以下の摂動公式が得られます。

1. **1次のエネルギー補正 $E_n^{(1)}$**：
   **無摂動状態 $|n^{(0)}\rangle$ における摂動ポテンシャル $\hat{V}$ の期待値**に等しい。
   $$
   E_n^{(1)} = \langle n^{(0)} | \hat{V} | n^{(0)} \rangle = \iiint \varphi_n^{(0)*}(\boldsymbol{r}) \hat{V} \varphi_n^{(0)}(\boldsymbol{r})\,d^3r
   $$
2. **1次の状態ベクトル補正 $|n^{(1)}\rangle$ と 2次のエネルギー補正 $E_n^{(2)}$**：
   $$
   |n^{(1)}\rangle = \sum_{m \neq n} \frac{\langle m^{(0)} | \hat{V} | n^{(0)} \rangle}{E_n^{(0)} - E_m^{(0)}} |m^{(0)}\rangle, \qquad E_n^{(2)} = \sum_{m \neq n} \frac{\left| \langle m^{(0)} | \hat{V} | n^{(0)} \rangle \right|^2}{E_n^{(0)} - E_m^{(0)}}
   $$
   特に基底状態（$n = 0$）では、すべての $m \neq 0$ に対して $E_0^{(0)} < E_m^{(0)}$ であるため、**基底状態の2次摂動エネルギー補正は常に負（$E_0^{(2)} \le 0$）**となり、準位反発によって基底状態エネルギーを押し下げます。

### 6.2 リッツの変分原理（Variational Method）

系の真の基底状態エネルギーを $E_0$（$\hat{H}\varphi_0 = E_0\varphi_0$）とするとき、任意の試行波動関数（Trial wavefunction）$|\psi_{\text{trial}}\rangle$ に対するハミルトニアン $\hat{H}$ の期待値 $E[\psi_{\text{trial}}]$ は、**常に真の基底状態エネルギー $E_0$ 以上になる**という極めて強力な不等式が成り立ちます（**変分原理 / Rayleigh-Ritz variational principle**）。

$$
E[\psi_{\text{trial}}] \equiv \frac{\langle \psi_{\text{trial}} | \hat{H} | \psi_{\text{trial}} \rangle}{\langle \psi_{\text{trial}} | \psi_{\text{trial}} \rangle} \ge E_0
$$

**【証明】** $\hat{H}$ の完全正規直交固有基底 $\{|n\rangle\}$（$\hat{H}|n\rangle = E_n|n\rangle,\ E_0 \le E_1 \le E_2 \le \dots$）を用いて $|\psi_{\text{trial}}\rangle = \sum_{n=0}^\infty c_n |n\rangle$ と展開すると、$E_n \ge E_0$ より

$$
\langle\psi_{\text{trial}}|\hat{H}|\psi_{\text{trial}}\rangle = \sum_{n=0}^\infty |c_n|^2 E_n \ge E_0 \sum_{n=0}^\infty |c_n|^2 = E_0 \langle\psi_{\text{trial}}|\psi_{\text{trial}}\rangle \quad \Longrightarrow \quad \frac{\langle\psi_{\text{trial}}|\hat{H}|\psi_{\text{trial}}\rangle}{\langle\psi_{\text{trial}}|\psi_{\text{trial}}\rangle} \ge E_0 \quad \blacksquare
$$

したがって、パラメータ $\alpha$ を含む物理的に妥当な試行関数 $\psi(\boldsymbol{r}; \alpha)$ を用意し、期待値 $E(\alpha)$ を最小化する条件 $\dfrac{\partial E(\alpha)}{\partial \alpha} = 0$ から最適パラメータ $\alpha^*$ を求めれば、$E(\alpha^*)$ は基底状態エネルギー $E_0$ の精密な上限近似値を与えます。

---

## 7. 理解度チェック＆演習問題に挑む

正準交換関係と不確定性原理、1次元井戸型ポテンシャル、調和振動子の生成・消滅演算子、角運動量代数と水素原子、摂動論・変分法を演習問題で実践しましょう。

<div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">
  <a href="/university/problems/quantum" style="display:inline-block; background:#1d4ed8; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700;">
    📝 量子力学の演習問題一覧へ進む →
  </a>
  <a href="/university/problems/index" style="display:inline-block; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700;">
    大学物理 総合演習トップへ →
  </a>
</div>
