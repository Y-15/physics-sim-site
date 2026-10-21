# 電磁気学（ベクトル解析・マクスウェル方程式と電磁場理論）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学1〜2年次 ／ 必須数学：ベクトル解析・偏微分方程式・多重積分・フーリエ解析
</div>

高校物理の電磁気学では、「クーロンの法則」「ガウスの法則（対称性の高い図形のみ）」「ビオ・サバールの法則」「ファラデーの電磁誘導の法則」などが個別の公式として登場し、それらの間の数学的なつながりはブラックボックスになっていました。
大学の電磁気学では、**ベクトル解析（$\boldsymbol{\nabla}$ 演算子）**を言語として用いることで、すべての電磁気現象がたった4つの偏微分方程式——**マクスウェル方程式（Maxwell's equations）**——から統一的に導かれる美しい体系であることを学びます。

> **表記ルール（ISO 80000-2 準拠）**：本講座では、位置ベクトル $\boldsymbol{r}$、電場 $\boldsymbol{E}$、磁束密度 $\boldsymbol{B}$、電束密度 $\boldsymbol{D}$、磁場 $\boldsymbol{H}$、ベクトルポテンシャル $\boldsymbol{A}$、電流密度 $\boldsymbol{j}$、ポインティングベクトル $\boldsymbol{S}$、ナブラ演算子 $\boldsymbol{\nabla}$、単位基底ベクトル $\boldsymbol{e}_x, \boldsymbol{e}_y, \boldsymbol{e}_z, \boldsymbol{e}_r, \boldsymbol{n}$ などのベクトル量をすべて**太字（ボールド体）**で表記します。

---

## 1. ベクトル解析の基礎と積分定理（場の数学的記述）

空間の各点 $\boldsymbol{r} = (x, y, z)$ と時刻 $t$ に対してスカラー値 $\phi(\boldsymbol{r}, t)$ が定まるものを**スカラー場**（例：静電ポテンシャル、電荷密度）、ベクトル値 $\boldsymbol{A}(\boldsymbol{r}, t)$ が定まるものを**ベクトル場**（例：電場 $\boldsymbol{E}$、磁束密度 $\boldsymbol{B}$）と呼びます。

### 1.1 ナブラ演算子 $\boldsymbol{\nabla}$ と3つの微分演算

3次元直交座標系 $(x, y, z)$ におけるベクトル微分演算子 **$\boldsymbol{\nabla}$（ナブラ / デル）** は、正規直交基底 $\boldsymbol{e}_x, \boldsymbol{e}_y, \boldsymbol{e}_z$ を用いて次のように定義されます。

$$
\boldsymbol{\nabla} \equiv \boldsymbol{e}_x \frac{\partial}{\partial x} + \boldsymbol{e}_y \frac{\partial}{\partial y} + \boldsymbol{e}_z \frac{\partial}{\partial z} = \left( \frac{\partial}{\partial x},\, \frac{\partial}{\partial y},\, \frac{\partial}{\partial z} \right)
$$

この $\boldsymbol{\nabla}$ をスカラー場 $\phi(\boldsymbol{r})$ やベクトル場 $\boldsymbol{A}(\boldsymbol{r}) = (A_x, A_y, A_z)$ に作用させることで、物理的に明確な意味を持つ3種類の空間微分が定義されます。

| 演算名称 | 記号と定義式（直交座標系） | 出力の型 | 物理的・幾何学的意味 |
| :--- | :--- | :---: | :--- |
| **勾配 (Gradient)** | $\displaystyle \operatorname{grad}\phi = \boldsymbol{\nabla}\phi = \left(\frac{\partial \phi}{\partial x},\, \frac{\partial \phi}{\partial y},\, \frac{\partial \phi}{\partial z}\right)$ | ベクトル場 | スカラー場 $\phi$ が最も急激に増加する向きと、その単位長さあたりの変化率を表す。等位面（等電位面 $\phi = \text{const.}$）に常に直交する。 |
| **発散 (Divergence)** | $\displaystyle \operatorname{div}\boldsymbol{A} = \boldsymbol{\nabla}\cdot\boldsymbol{A} = \frac{\partial A_x}{\partial x} + \frac{\partial A_y}{\partial y} + \frac{\partial A_z}{\partial z}$ | スカラー場 | 点 $\boldsymbol{r}$ を囲む微小体積から単位体積あたりに湧き出すフラックス（流束）の正味の量（湧き出し源 $\boldsymbol{\nabla}\cdot\boldsymbol{A}>0$、吸い込み口 $\boldsymbol{\nabla}\cdot\boldsymbol{A}<0$）を表す。 |
| **回転 (Rotation / Curl)** | $\displaystyle \operatorname{rot}\boldsymbol{A} = \boldsymbol{\nabla}\times\boldsymbol{A} = \begin{vmatrix} \boldsymbol{e}_x & \boldsymbol{e}_y & \boldsymbol{e}_z \\ \dfrac{\partial}{\partial x} & \dfrac{\partial}{\partial y} & \dfrac{\partial}{\partial z} \\ A_x & A_y & A_z \end{vmatrix}$ | ベクトル場 | 点 $\boldsymbol{r}$ のまわりのベクトル場 $\boldsymbol{A}$ の単位面積あたりの渦の強さ（循環密度）と、右ねじの法則による回転軸の向きを表す。 |

さらに、勾配の発散をとる2階微分演算子を **ラプラシアン（Laplacian）** と呼びます。

$$
\Delta \phi \equiv \boldsymbol{\nabla}\cdot(\boldsymbol{\nabla}\phi) = \nabla^2 \phi = \frac{\partial^2 \phi}{\partial x^2} + \frac{\partial^2 \phi}{\partial y^2} + \frac{\partial^2 \phi}{\partial z^2}
$$

### 1.2 ベクトル解析の重要恒等式

任意の滑らかなスカラー場 $\phi, \psi$ とベクトル場 $\boldsymbol{A}, \boldsymbol{B}$ に対して、以下の恒等式が常に成り立ちます。特に**(1)勾配の回転は恒等的にゼロ**、**(2)回転の発散は恒等的にゼロ**という2つの性質は、ポテンシャル（$\phi, \boldsymbol{A}$）の存在根拠となる最重要定理です。

1. **渦なし場の恒等式（勾配の回転）**：
   $$
   \boldsymbol{\nabla} \times (\boldsymbol{\nabla}\phi) = \boldsymbol{0}
   $$
   （単連結領域において $\boldsymbol{\nabla}\times\boldsymbol{E} = \boldsymbol{0} \iff \boldsymbol{E} = -\boldsymbol{\nabla}\phi$ となるスカラーポテンシャル $\phi$ が存在する）
2. **湧き出しなし場の恒等式（回転の発散）**：
   $$
   \boldsymbol{\nabla} \cdot (\boldsymbol{\nabla} \times \boldsymbol{A}) = 0
   $$
   （$\boldsymbol{\nabla}\cdot\boldsymbol{B} = 0 \iff \boldsymbol{B} = \boldsymbol{\nabla}\times\boldsymbol{A}$ となるベクトルポテンシャル $\boldsymbol{A}$ が存在する）
3. **回転の回転（2階微分公式）**：
   $$
   \boldsymbol{\nabla} \times (\boldsymbol{\nabla} \times \boldsymbol{A}) = \boldsymbol{\nabla}(\boldsymbol{\nabla} \cdot \boldsymbol{A}) - \nabla^2 \boldsymbol{A}
   $$
   （電磁波の波動方程式を導出する際の必須公式）
4. **積の微分公式（ライプニッツ則）**：
   $$
   \boldsymbol{\nabla}\cdot(\phi\boldsymbol{A}) = (\boldsymbol{\nabla}\phi)\cdot\boldsymbol{A} + \phi(\boldsymbol{\nabla}\cdot\boldsymbol{A}), \qquad \boldsymbol{\nabla}\cdot(\boldsymbol{A}\times\boldsymbol{B}) = \boldsymbol{B}\cdot(\boldsymbol{\nabla}\times\boldsymbol{A}) - \boldsymbol{A}\cdot(\boldsymbol{\nabla}\times\boldsymbol{B})
   $$

### 1.3 ガウスの発散定理とストークスの定理

マクスウェル方程式の「積分形（マクロな法則）」と「微分形（局所的な法則）」を相互に変換する数学的架け橋が、以下の2つの積分定理です。

1. **ガウスの発散定理（Gauss's Divergence Theorem）**
   有界な3次元領域 $V$ と、その境界をなす閉曲面 $S = \partial V$（外向き単位法線ベクトルを $\boldsymbol{n}$ とし、面積素ベクトルを $d\boldsymbol{S} = \boldsymbol{n}\,dS$ とする）に対して、次式が成り立ちます。

   $$
   \iiint_V (\boldsymbol{\nabla} \cdot \boldsymbol{A})\,dV = \oiint_{\partial V} \boldsymbol{A} \cdot d\boldsymbol{S}
   $$

   > **物理的意味**：「領域 $V$ 内部にあるすべての湧き出し源の総和（体積積分）」は、「境界面 $\partial V$ を通過して外部へ流出する総フラックス（面積分）」に厳密に等しい。

2. **ストークスの定理（Stokes' Theorem）**
   向き付けられた滑らかな曲面 $S$ と、その境界をなす閉曲線 $C = \partial S$（曲面 $S$ の単位法線ベクトル $\boldsymbol{n}$ に対して右ねじの向きに周回する線素ベクトルを $d\boldsymbol{r}$ とする）に対して、次式が成り立ちます。

   $$
   \iint_S (\boldsymbol{\nabla} \times \boldsymbol{A}) \cdot d\boldsymbol{S} = \oint_{\partial S} \boldsymbol{A} \cdot d\boldsymbol{r}
   $$

   > **物理的意味**：「曲面 $S$ 上のすべての微小な渦（回転）の総和（面積分）」は、「隣り合う内部の渦同士が打ち消し合うため、境界ループ $\partial S$ に沿った周回積分（循環）」に厳密に等しい。

### 1.4 円柱座標系・球座標系における微分演算子とディラックのデルタ関数

対称性を持つ電磁気の問題を解く際に不可欠な、円柱座標系 $(\rho, \phi, z)$（正規直交基底 $\boldsymbol{e}_\rho, \boldsymbol{e}_\phi, \boldsymbol{e}_z$）および球座標系 $(r, \theta, \phi)$（正規直交基底 $\boldsymbol{e}_r, \boldsymbol{e}_\theta, \boldsymbol{e}_\phi$）での具体的な演算子は以下の通りです。

- **球座標系 $(r, \theta, \phi)$ における勾配・発散・ラプラシアン**：
  $$
  \boldsymbol{\nabla} f = \frac{\partial f}{\partial r}\boldsymbol{e}_r + \frac{1}{r}\frac{\partial f}{\partial \theta}\boldsymbol{e}_\theta + \frac{1}{r\sin\theta}\frac{\partial f}{\partial \phi}\boldsymbol{e}_\phi
  $$
  $$
  \boldsymbol{\nabla}\cdot\boldsymbol{A} = \frac{1}{r^2}\frac{\partial}{\partial r}(r^2 A_r) + \frac{1}{r\sin\theta}\frac{\partial}{\partial \theta}(\sin\theta\, A_\theta) + \frac{1}{r\sin\theta}\frac{\partial A_\phi}{\partial \phi}
  $$
  $$
  \nabla^2 f = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2 \frac{\partial f}{\partial r}\right) + \frac{1}{r^2\sin\theta}\frac{\partial}{\partial \theta}\left(\sin\theta\frac{\partial f}{\partial \theta}\right) + \frac{1}{r^2\sin^2\theta}\frac{\partial^2 f}{\partial \phi^2}
  $$

また、点電荷 $q$ の電荷密度を連続場の式で表すために **3次元ディラックのデルタ関数 $\delta^3(\boldsymbol{r} - \boldsymbol{r}')$** を導入します。特にクーロンポテンシャル型の関数 $1/|\boldsymbol{r}-\boldsymbol{r}'|$ にラプラシアンを作用させた次の公式は、ポアソン方程式のグリーン関数として極めて重要です。

$$
\boldsymbol{\nabla} \cdot \left( \frac{\boldsymbol{r} - \boldsymbol{r}'}{|\boldsymbol{r} - \boldsymbol{r}'|^3} \right) = 4\pi \delta^3(\boldsymbol{r} - \boldsymbol{r}'), \qquad \nabla^2 \left( \frac{1}{|\boldsymbol{r} - \boldsymbol{r}'|} \right) = -4\pi \delta^3(\boldsymbol{r} - \boldsymbol{r}')
$$

<div class="sim-embed">
  <div class="sim-embed-header">▼ ベクトル場の発散（div）と回転（rot）をインタラクティブに視覚化する</div>
  <VectorFieldVisualizer />
</div>

---

## 2. 真空中のマクスウェル方程式と電荷保存則

### 2.1 マクスウェル方程式の微分形と積分形

真空中において、電荷密度 $\rho(\boldsymbol{r}, t)$［$\text{C/m}^3$］と電流密度 $\boldsymbol{j}(\boldsymbol{r}, t)$［$\text{A/m}^2$］が存在するとき、電場 $\boldsymbol{E}(\boldsymbol{r}, t)$ と磁束密度 $\boldsymbol{B}(\boldsymbol{r}, t)$ が満たす基礎方程式は以下の4つに集約されます（$\varepsilon_0$ は真空の誘電率、$\mu_0$ は真空の透磁率）。

| 法則名 | 微分形（局所的な場の法則） | 積分形（広域的な領域・閉路の法則） | 物理的意味 |
| :--- | :--- | :--- | :--- |
| **(1) 電場のガウスの法則** | $\displaystyle \boldsymbol{\nabla} \cdot \boldsymbol{E} = \frac{\rho}{\varepsilon_0}$ | $\displaystyle \oiint_{\partial V} \boldsymbol{E} \cdot d\boldsymbol{S} = \frac{1}{\varepsilon_0} \iiint_V \rho\,dV = \frac{Q_{\text{in}}}{\varepsilon_0}$ | 電荷 $\rho$ が電場 $\boldsymbol{E}$ の湧き出し源（正電荷）および吸い込み口（負電荷）となる。 |
| **(2) 磁場のガウスの法則** | $\displaystyle \boldsymbol{\nabla} \cdot \boldsymbol{B} = 0$ | $\displaystyle \oiint_{\partial V} \boldsymbol{B} \cdot d\boldsymbol{S} = 0$ | 磁気単極子（モノポール）は存在せず、磁束線は途切れることなく必ず閉じる。 |
| **(3) ファラデーの電磁誘導の法則** | $\displaystyle \boldsymbol{\nabla} \times \boldsymbol{E} = -\frac{\partial \boldsymbol{B}}{\partial t}$ | $\displaystyle \oint_{\partial S} \boldsymbol{E} \cdot d\boldsymbol{r} = -\frac{d}{dt} \iint_S \boldsymbol{B} \cdot d\boldsymbol{S} = -\frac{d\Phi_B}{dt}$ | 磁束密度 $\boldsymbol{B}$ の時間変化が、それを打ち消す向きに渦状の誘導電場 $\boldsymbol{E}$ を生み出す。 |
| **(4) アンペール・マクスウェルの法則** | $\displaystyle \boldsymbol{\nabla} \times \boldsymbol{B} = \mu_0 \boldsymbol{j} + \mu_0 \varepsilon_0 \frac{\partial \boldsymbol{E}}{\partial t}$ | $\displaystyle \oint_{\partial S} \boldsymbol{B} \cdot d\boldsymbol{r} = \mu_0 \iint_S \left(\boldsymbol{j} + \varepsilon_0 \frac{\partial \boldsymbol{E}}{\partial t}\right) \cdot d\boldsymbol{S}$ | 伝導電流 $\boldsymbol{j}$ だけでなく、電場の時間変化（変位電流）も渦状の磁場 $\boldsymbol{B}$ を生み出す。 |

### 2.2 電荷保存則（連続の式）と変位電流の必然性

アンペールの法則 $\boldsymbol{\nabla}\times\boldsymbol{B} = \mu_0 \boldsymbol{j}$ は定常電流に対してしか成り立ちません。実際、この両辺の発散をとると、左辺は恒等式 $\boldsymbol{\nabla}\cdot(\boldsymbol{\nabla}\times\boldsymbol{B}) \equiv 0$ により常に $0$ となるため、$\boldsymbol{\nabla}\cdot\boldsymbol{j} = 0$ となってしまい、コンデンサーの充放電のように電荷が蓄積・減少する非定常過程（$\partial\rho/\partial t \neq 0$）と矛盾します。

一方、アンペール・マクスウェルの法則の両辺の発散をとると、電場のガウスの法則 $\boldsymbol{\nabla}\cdot\boldsymbol{E} = \rho/\varepsilon_0$ を用いて次式が得られます。

$$
0 = \boldsymbol{\nabla}\cdot(\boldsymbol{\nabla}\times\boldsymbol{B}) = \mu_0 \left( \boldsymbol{\nabla}\cdot\boldsymbol{j} + \varepsilon_0 \frac{\partial (\boldsymbol{\nabla}\cdot\boldsymbol{E})}{\partial t} \right) = \mu_0 \left( \boldsymbol{\nabla}\cdot\boldsymbol{j} + \frac{\partial \rho}{\partial t} \right)
$$

$$
\therefore \quad \boldsymbol{\nabla} \cdot \boldsymbol{j} + \frac{\partial \rho}{\partial t} = 0 \qquad \left(\text{積分形：}\oiint_{\partial V} \boldsymbol{j}\cdot d\boldsymbol{S} = -\frac{d}{dt}\iiint_V \rho\,dV = -\frac{dQ_{\text{in}}}{dt}\right)
$$

これを**電荷保存則（連続の式 / Continuity equation）**と呼びます。マクスウェルが導入した**変位電流密度 $\boldsymbol{j}_d \equiv \varepsilon_0 \dfrac{\partial \boldsymbol{E}}{\partial t}$** は、電荷保存則との数学的無矛盾性を保証するだけでなく、電磁波の存在を予言する決定的な役割を果たしました。

### 2.3 ローレンツ力と電磁場中の運動方程式

マクスウェル方程式は「電荷・電流がどのように電磁場 $\boldsymbol{E}, \boldsymbol{B}$ を作るか」を記述します。逆に「電磁場 $\boldsymbol{E}, \boldsymbol{B}$ から荷電粒子がどのような力を受けるか」を与えるのが**ローレンツ力（Lorentz force）**です。
位置 $\boldsymbol{r}$、速度 $\boldsymbol{v} = \dot{\boldsymbol{r}}$ を持つ電荷 $q$ の粒子が受ける力 $\boldsymbol{F}$、および連続的な電荷密度 $\rho$・電流密度 $\boldsymbol{j}$ が単位体積あたりに受けるローレンツ力密度 $\boldsymbol{f}$ は次式で与えられます。

$$
\boldsymbol{F} = q\left(\boldsymbol{E}(\boldsymbol{r}, t) + \boldsymbol{v} \times \boldsymbol{B}(\boldsymbol{r}, t)\right), \qquad \boldsymbol{f} = \rho\boldsymbol{E} + \boldsymbol{j} \times \boldsymbol{B}
$$

---

## 3. 静電場と境界値問題（ポアソン方程式・多重極展開）

電荷分布 $\rho(\boldsymbol{r})$ が時間に依存しない静電場（$\partial/\partial t = 0$）では、基礎方程式は次の2つに帰着します。

$$
\boldsymbol{\nabla} \cdot \boldsymbol{E}(\boldsymbol{r}) = \frac{\rho(\boldsymbol{r})}{\varepsilon_0}, \qquad \boldsymbol{\nabla} \times \boldsymbol{E}(\boldsymbol{r}) = \boldsymbol{0}
$$

### 3.1 静電ポテンシャルとポアソン方程式・ラプラス方程式

$\boldsymbol{\nabla}\times\boldsymbol{E} = \boldsymbol{0}$ より、静電場 $\boldsymbol{E}(\boldsymbol{r})$ は保存場であり、**静電ポテンシャル（電位）$\phi(\boldsymbol{r})$** を用いて次のように表せます。

$$
\boldsymbol{E}(\boldsymbol{r}) = -\boldsymbol{\nabla}\phi(\boldsymbol{r}) \quad \Longleftrightarrow \quad \phi(\boldsymbol{r}) - \phi(\boldsymbol{r}_0) = -\int_{\boldsymbol{r}_0}^{\boldsymbol{r}} \boldsymbol{E}(\boldsymbol{r}')\cdot d\boldsymbol{r}'
$$

これをガウスの法則 $\boldsymbol{\nabla}\cdot\boldsymbol{E} = \rho/\varepsilon_0$ に代入すると、電位 $\phi(\boldsymbol{r})$ が満たすべき2階偏微分方程式が得られます。

$$
\nabla^2 \phi(\boldsymbol{r}) = -\frac{\rho(\boldsymbol{r})}{\varepsilon_0} \quad (\text{ポアソン方程式}), \qquad \nabla^2 \phi(\boldsymbol{r}) = 0 \quad (\text{電荷のない領域でのラプラス方程式})
$$

無限遠方で $\phi(\boldsymbol{r}) \to 0$（$|\boldsymbol{r}| \to \infty$）となる境界条件のもとで、ポアソン方程式の解はグリーン関数 $G(\boldsymbol{r}, \boldsymbol{r}') = \dfrac{1}{4\pi|\boldsymbol{r}-\boldsymbol{r}'|}$ の重ね合わせ（クーロン積分）として一意に定まります。

$$
\phi(\boldsymbol{r}) = \frac{1}{4\pi\varepsilon_0} \iiint \frac{\rho(\boldsymbol{r}')}{|\boldsymbol{r} - \boldsymbol{r}'|}\,d^3r', \qquad \boldsymbol{E}(\boldsymbol{r}) = \frac{1}{4\pi\varepsilon_0} \iiint \rho(\boldsymbol{r}') \frac{\boldsymbol{r} - \boldsymbol{r}'}{|\boldsymbol{r} - \boldsymbol{r}'|^3}\,d^3r'
$$

### 3.2 解の一意性定理と鏡像法（Method of Images）

領域 $V$ 内の電荷分布 $\rho(\boldsymbol{r})$ と、境界 $\partial V$ 上での電位 $\phi$（ディリクレ境界条件）または電場の法線成分 $\partial\phi/\partial n$（ノイマン境界条件）が指定されると、ポアソン方程式の解 $\phi(\boldsymbol{r})$ は**ただ一つに決まります（一意性定理）**。
**【証明】** 同じ境界条件を満たす2つの解 $\phi_1, \phi_2$ が存在したとし、差 $u \equiv \phi_1 - \phi_2$ を考えると、$V$ 内で $\nabla^2 u = 0$、境界 $\partial V$ 上で $u = 0$（または $\partial u/\partial n = 0$）となります。ガウスの発散定理を $\boldsymbol{\nabla}\cdot(u\boldsymbol{\nabla}u) = (\boldsymbol{\nabla}u)^2 + u\nabla^2 u$ に適用すると、

$$
\iiint_V (\boldsymbol{\nabla}u)^2\,dV = \oiint_{\partial V} u\boldsymbol{\nabla}u \cdot d\boldsymbol{S} - \iiint_V u\nabla^2 u\,dV = 0
$$

被積分関数 $(\boldsymbol{\nabla}u)^2 \ge 0$ が恒等的に $0$ となるため、$\boldsymbol{E}_1 = -\boldsymbol{\nabla}\phi_1 = -\boldsymbol{\nabla}\phi_2 = \boldsymbol{E}_2$ となり、電場は一意に定まります。
この定理により、接地された導体平面（$\phi=0$）や導体球の近くに点電荷 $q$ がある問題では、導体外部の領域に仮想的な**鏡像電荷（Image charge）**を配置して境界条件 $\phi=0$ を満たす解を構成できれば、それが真の唯一解であることが保証されます（**鏡像法**）。

### 3.3 多重極展開と電気双極子モーメント $\boldsymbol{p}$

原点付近の局在した領域に分布する電荷 $\rho(\boldsymbol{r}')$ が、十分に離れた観測点 $\boldsymbol{r}$（$r = |\boldsymbol{r}| \gg r' = |\boldsymbol{r}'|$）に作る電位 $\phi(\boldsymbol{r})$ を調べます。逆距離 $\dfrac{1}{|\boldsymbol{r}-\boldsymbol{r}'|}$ を $r'/r$ についてテイラー展開すると、

$$
\frac{1}{|\boldsymbol{r} - \boldsymbol{r}'|} = \frac{1}{\sqrt{r^2 - 2\boldsymbol{r}\cdot\boldsymbol{r}' + r'^2}} = \frac{1}{r} + \frac{\boldsymbol{r}\cdot\boldsymbol{r}'}{r^3} + \frac{1}{2}\sum_{\alpha,\beta} \frac{3x_\alpha x_\beta - r^2\delta_{\alpha\beta}}{r^5} x'_\alpha x'_\beta + \mathcal{O}\left(\frac{r'^3}{r^4}\right)
$$

これをクーロン積分に代入することで、電位の**多重極展開（Multipole expansion）**が得られます。

$$
\phi(\boldsymbol{r}) = \frac{1}{4\pi\varepsilon_0}\left[ \frac{Q}{r} + \frac{\boldsymbol{p}\cdot\boldsymbol{r}}{r^3} + \frac{1}{2}\sum_{\alpha,\beta} Q_{\alpha\beta} \frac{x_\alpha x_\beta}{r^5} + \cdots \right]
$$

- **第1項（単極子項 / Monopole）**：全電荷 $Q = \iiint \rho(\boldsymbol{r}')\,d^3r'$ が原点に集中したときの電位（$\propto r^{-1}$）。
- **第2項（双極子項 / Dipole）**：全電荷 $Q=0$ の中性分子などで支配的となる項（$\propto r^{-2}$）。ここで **電気双極子モーメント $\boldsymbol{p}$** は次式で定義されます。
  $$
  \boldsymbol{p} \equiv \iiint \boldsymbol{r}' \rho(\boldsymbol{r}')\,d^3r' \qquad \left(\text{離散点電荷系では }\boldsymbol{p} = \sum_i q_i \boldsymbol{r}_i\right)
  $$

電気双極子 $\boldsymbol{p}$ が作る電位 $\phi_{\text{dip}}(\boldsymbol{r})$ と電場 $\boldsymbol{E}_{\text{dip}}(\boldsymbol{r}) = -\boldsymbol{\nabla}\phi_{\text{dip}}(\boldsymbol{r})$ は、動径方向の単位ベクトル $\boldsymbol{e}_r = \boldsymbol{r}/r$ を用いて次のように表されます。

$$
\phi_{\text{dip}}(\boldsymbol{r}) = \frac{\boldsymbol{p}\cdot\boldsymbol{r}}{4\pi\varepsilon_0 r^3} = \frac{\boldsymbol{p}\cdot\boldsymbol{e}_r}{4\pi\varepsilon_0 r^2}, \qquad \boldsymbol{E}_{\text{dip}}(\boldsymbol{r}) = \frac{1}{4\pi\varepsilon_0 r^3}\left[ 3(\boldsymbol{p}\cdot\boldsymbol{e}_r)\boldsymbol{e}_r - \boldsymbol{p} \right]
$$

また、外部電場 $\boldsymbol{E}_{\text{ext}}$ 中に置かれた電気双極子 $\boldsymbol{p}$ のポテンシャルエネルギー $U$、受ける力 $\boldsymbol{F}$、および力のモーメント（トルク）$\boldsymbol{N}$ は次式で与えられます。

$$
U = -\boldsymbol{p}\cdot\boldsymbol{E}_{\text{ext}}, \qquad \boldsymbol{F} = (\boldsymbol{p}\cdot\boldsymbol{\nabla})\boldsymbol{E}_{\text{ext}}, \qquad \boldsymbol{N} = \boldsymbol{p} \times \boldsymbol{E}_{\text{ext}}
$$

### 3.4 静電エネルギーと電場のエネルギー密度

電荷分布 $\rho(\boldsymbol{r})$ を無限遠から運んで組み立てるのに要する静電エネルギー $U_e$ は、ポアソン方程式 $\rho = -\varepsilon_0 \boldsymbol{\nabla}\cdot\boldsymbol{E}$ と部分積分（ガウスの発散定理）を用いることで、空間全体に広がる電場 $\boldsymbol{E}(\boldsymbol{r})$ そのものが蓄えるエネルギーとして書き換えられます。

$$
U_e = \frac{1}{2}\iiint \rho(\boldsymbol{r})\phi(\boldsymbol{r})\,d^3r = -\frac{\varepsilon_0}{2}\iiint (\boldsymbol{\nabla}\cdot\boldsymbol{E})\phi\,d^3r = \frac{\varepsilon_0}{2}\iiint \boldsymbol{E}^2\,d^3r, \qquad u_e(\boldsymbol{r}) = \frac{1}{2}\varepsilon_0 \boldsymbol{E}^2
$$

---

## 4. 静磁場とベクトルポテンシャル $\boldsymbol{A}$

電荷密度が時間変化しない定常電流系（$\boldsymbol{\nabla}\cdot\boldsymbol{j} = 0$）では、静磁場 $\boldsymbol{B}(\boldsymbol{r})$ の基礎方程式は次の2つになります。

$$
\boldsymbol{\nabla} \cdot \boldsymbol{B}(\boldsymbol{r}) = 0, \qquad \boldsymbol{\nabla} \times \boldsymbol{B}(\boldsymbol{r}) = \mu_0 \boldsymbol{j}(\boldsymbol{r})
$$

### 4.1 ベクトルポテンシャル $\boldsymbol{A}$ とクーロンゲージ

$\boldsymbol{\nabla}\cdot\boldsymbol{B} = 0$ が恒等的に成り立つことから、静磁場 $\boldsymbol{B}(\boldsymbol{r})$ は**ベクトルポテンシャル $\boldsymbol{A}(\boldsymbol{r})$** の回転として表すことができます。

$$
\boldsymbol{B}(\boldsymbol{r}) = \boldsymbol{\nabla} \times \boldsymbol{A}(\boldsymbol{r})
$$

これをアンペールの法則 $\boldsymbol{\nabla}\times\boldsymbol{B} = \mu_0\boldsymbol{j}$ に代入し、2階微分恒等式 $\boldsymbol{\nabla}\times(\boldsymbol{\nabla}\times\boldsymbol{A}) = \boldsymbol{\nabla}(\boldsymbol{\nabla}\cdot\boldsymbol{A}) - \nabla^2\boldsymbol{A}$ を用いると、

$$
\boldsymbol{\nabla}(\boldsymbol{\nabla}\cdot\boldsymbol{A}) - \nabla^2 \boldsymbol{A} = \mu_0 \boldsymbol{j}
$$

ここで、ベクトルポテンシャルには任意の勾配場 $\boldsymbol{\nabla}\chi$ を加えても磁場 $\boldsymbol{B} = \boldsymbol{\nabla}\times(\boldsymbol{A}+\boldsymbol{\nabla}\chi) = \boldsymbol{\nabla}\times\boldsymbol{A}$ が変わらないという任意性（**ゲージ変換の不変性**）があります。そこで付帯条件として **クーロンゲージ条件 $\boldsymbol{\nabla}\cdot\boldsymbol{A} = 0$** を課すと、$\boldsymbol{A}(\boldsymbol{r})$ の各直交成分は静電ポテンシャルと全く同じ形の**ベクトル・ポアソン方程式**を満たします。

$$
\nabla^2 \boldsymbol{A}(\boldsymbol{r}) = -\mu_0 \boldsymbol{j}(\boldsymbol{r}) \quad \Longrightarrow \quad \boldsymbol{A}(\boldsymbol{r}) = \frac{\mu_0}{4\pi} \iiint \frac{\boldsymbol{j}(\boldsymbol{r}')}{|\boldsymbol{r} - \boldsymbol{r}'|}\,d^3r'
$$

### 4.2 ビオ・サバールの法則の導出

上の $\boldsymbol{A}(\boldsymbol{r})$ の積分表示に対して観測点 $\boldsymbol{r}$ に関する回転 $\boldsymbol{B}(\boldsymbol{r}) = \boldsymbol{\nabla}\times\boldsymbol{A}(\boldsymbol{r})$ を計算すると、$\boldsymbol{\nabla}\times\left[\dfrac{\boldsymbol{j}(\boldsymbol{r}')}{|\boldsymbol{r}-\boldsymbol{r}'|}\right] = \boldsymbol{\nabla}\left(\dfrac{1}{|\boldsymbol{r}-\boldsymbol{r}'|}\right)\times\boldsymbol{j}(\boldsymbol{r}') = \dfrac{\boldsymbol{j}(\boldsymbol{r}')\times(\boldsymbol{r}-\boldsymbol{r}')}{|\boldsymbol{r}-\boldsymbol{r}'|^3}$ より、直ちに**ビオ・サバールの法則（Biot-Savart law）**が導出されます。

$$
\boldsymbol{B}(\boldsymbol{r}) = \frac{\mu_0}{4\pi} \iiint \frac{\boldsymbol{j}(\boldsymbol{r}') \times (\boldsymbol{r} - \boldsymbol{r}')}{|\boldsymbol{r} - \boldsymbol{r}'|^3}\,d^3r' \qquad \left(\text{細線電流 $I$ では }\boldsymbol{B}(\boldsymbol{r}) = \frac{\mu_0 I}{4\pi} \oint_C \frac{d\boldsymbol{r}' \times (\boldsymbol{r} - \boldsymbol{r}')}{|\boldsymbol{r} - \boldsymbol{r}'|^3}\right)
$$

### 4.3 磁気双極子モーメント $\boldsymbol{m}$ と静磁場エネルギー

局在する定常電流分布 $\boldsymbol{j}(\boldsymbol{r}')$ が遠方（$r \gg r'$）に作るベクトルポテンシャル $\boldsymbol{A}(\boldsymbol{r})$ を多重極展開すると、$\boldsymbol{\nabla}'\cdot\boldsymbol{j} = 0$ により単極子項は消滅し、主要項は双極子項となります。**磁気双極子モーメント（磁気モーメント）$\boldsymbol{m}$** を次式で定義します。

$$
\boldsymbol{m} \equiv \frac{1}{2} \iiint \left(\boldsymbol{r}' \times \boldsymbol{j}(\boldsymbol{r}')\right)\,d^3r' \qquad \left(\text{平面ループ電流 $I$ では }\boldsymbol{m} = I\boldsymbol{S}\right)
$$

このとき、遠方でのベクトルポテンシャル $\boldsymbol{A}_{\text{dip}}(\boldsymbol{r})$ と磁束密度 $\boldsymbol{B}_{\text{dip}}(\boldsymbol{r}) = \boldsymbol{\nabla}\times\boldsymbol{A}_{\text{dip}}(\boldsymbol{r})$ は次式で与えられます（磁束密度の角度依存性は電気双極子電場と完全に同型になります）。

$$
\boldsymbol{A}_{\text{dip}}(\boldsymbol{r}) = \frac{\mu_0}{4\pi} \frac{\boldsymbol{m} \times \boldsymbol{r}}{r^3}, \qquad \boldsymbol{B}_{\text{dip}}(\boldsymbol{r}) = \frac{\mu_0}{4\pi r^3}\left[ 3(\boldsymbol{m}\cdot\boldsymbol{e}_r)\boldsymbol{e}_r - \boldsymbol{m} \right]
$$

また、定常電流系が蓄える静磁場エネルギー $U_m$ と磁場のエネルギー密度 $u_m$ は次式で表されます。

$$
U_m = \frac{1}{2}\iiint \boldsymbol{j}(\boldsymbol{r})\cdot\boldsymbol{A}(\boldsymbol{r})\,d^3r = \frac{1}{2\mu_0}\iiint \boldsymbol{B}^2\,d^3r, \qquad u_m(\boldsymbol{r}) = \frac{1}{2\mu_0}\boldsymbol{B}^2
$$

---

## 5. 物質中の電磁気学（$\boldsymbol{D}, \boldsymbol{H}$ 場と境界条件）

誘電体や磁性体などの物質中では、外部場によって物質内部の原子・分子に**誘電分極 $\boldsymbol{P}$** や **磁化 $\boldsymbol{M}$** が誘起され、それらが新たな「束縛電荷（分極電荷）$\rho_b$」や「束縛電流（磁化電流・分極電流）$\boldsymbol{j}_b$」として働きます。

### 5.1 誘電分極 $\boldsymbol{P}$ と電束密度 $\boldsymbol{D}$

単位体積あたりの電気双極子モーメントを**誘電分極ベクトル $\boldsymbol{P}(\boldsymbol{r})$**［$\text{C/m}^2$］と定義すると、不均一な分極によって物質内部に生じる分極電荷密度 $\rho_p$ と表面分極電荷密度 $\sigma_p$ は次式で与えられます。

$$
\rho_p = -\boldsymbol{\nabla} \cdot \boldsymbol{P}, \qquad \sigma_p = \boldsymbol{P} \cdot \boldsymbol{n}
$$

真電荷密度（自由電荷密度）を $\rho_f$ とすると、全電荷密度は $\rho = \rho_f + \rho_p = \rho_f - \boldsymbol{\nabla}\cdot\boldsymbol{P}$ となるため、ガウスの法則 $\varepsilon_0 \boldsymbol{\nabla}\cdot\boldsymbol{E} = \rho_f - \boldsymbol{\nabla}\cdot\boldsymbol{P}$ は、**電束密度 $\boldsymbol{D}$** を導入することで真電荷 $\rho_f$ のみを源とする簡潔な形に書き換えられます。

$$
\boldsymbol{D} \equiv \varepsilon_0 \boldsymbol{E} + \boldsymbol{P} \quad \Longrightarrow \quad \boldsymbol{\nabla} \cdot \boldsymbol{D} = \rho_f
$$

等方的な線形誘電体では、電気感受率を $\chi_e$、誘電率を $\varepsilon = \varepsilon_0(1+\chi_e) = \varepsilon_0 \varepsilon_r$ として $\boldsymbol{P} = \varepsilon_0 \chi_e \boldsymbol{E}$、すなわち $\boldsymbol{D} = \varepsilon \boldsymbol{E}$ が成り立ちます。

### 5.2 磁化 $\boldsymbol{M}$ と磁場 $\boldsymbol{H}$

単位体積あたりの磁気双極子モーメントを**磁化ベクトル $\boldsymbol{M}(\boldsymbol{r})$**［$\text{A/m}$］と定義すると、空間的に変化する磁化は等価的な**磁化電流密度 $\boldsymbol{j}_m$** を生み出します。また、分極 $\boldsymbol{P}$ の時間変化は**分極電流密度 $\boldsymbol{j}_p$** を生み出します。

$$
\boldsymbol{j}_m = \boldsymbol{\nabla} \times \boldsymbol{M}, \qquad \boldsymbol{j}_p = \frac{\partial \boldsymbol{P}}{\partial t}
$$

真電流密度（自由電流密度）を $\boldsymbol{j}_f$ とすると、全電流密度は $\boldsymbol{j} = \boldsymbol{j}_f + \boldsymbol{j}_m + \boldsymbol{j}_p$ となります。これをアンペール・マクスウェルの法則 $\dfrac{1}{\mu_0}\boldsymbol{\nabla}\times\boldsymbol{B} = \boldsymbol{j}_f + \boldsymbol{\nabla}\times\boldsymbol{M} + \dfrac{\partial \boldsymbol{P}}{\partial t} + \varepsilon_0\dfrac{\partial \boldsymbol{E}}{\partial t}$ に代入し、**磁場の強さ $\boldsymbol{H}$** を導入すると次式が得られます。

$$
\boldsymbol{H} \equiv \frac{1}{\mu_0}\boldsymbol{B} - \boldsymbol{M} \quad \Longrightarrow \quad \boldsymbol{\nabla} \times \boldsymbol{H} = \boldsymbol{j}_f + \frac{\partial \boldsymbol{D}}{\partial t}
$$

等方的な線形磁性体では、磁化率を $\chi_m$、透磁率を $\mu = \mu_0(1+\chi_m) = \mu_0 \mu_r$ として $\boldsymbol{M} = \chi_m \boldsymbol{H}$、すなわち $\boldsymbol{B} = \mu \boldsymbol{H}$ が成り立ちます。

### 5.3 物質中のマクスウェル方程式と異なる媒質間の境界条件

以上をまとめると、物質中におけるマクロなマクスウェル方程式は以下の4式となります。

$$
\boldsymbol{\nabla}\cdot\boldsymbol{D} = \rho_f, \qquad \boldsymbol{\nabla}\cdot\boldsymbol{B} = 0, \qquad \boldsymbol{\nabla}\times\boldsymbol{E} = -\frac{\partial \boldsymbol{B}}{\partial t}, \qquad \boldsymbol{\nabla}\times\boldsymbol{H} = \boldsymbol{j}_f + \frac{\partial \boldsymbol{D}}{\partial t}
$$

異なる2つの媒質1・媒質2の境界面（媒質1から媒質2へ向かう単位法線ベクトルを $\boldsymbol{n}$ とする）をまたぐ極薄い円柱（ガウスの法則を適用）および極細い長方形ループ（ストークスの定理を適用）を考えることで、境界面における場の接続条件（**境界条件**）が導かれます。

| 対象となる場 | ベクトル形式の境界条件 | 成分表現（$n$: 法線成分, $\parallel$: 接線成分） |
| :--- | :--- | :--- |
| **電束密度 $\boldsymbol{D}$ の法線成分** | $\displaystyle (\boldsymbol{D}_2 - \boldsymbol{D}_1) \cdot \boldsymbol{n} = \sigma_f$ | $D_{2n} - D_{1n} = \sigma_f$（真表面電荷 $\sigma_f=0$ なら連続） |
| **磁束密度 $\boldsymbol{B}$ の法線成分** | $\displaystyle (\boldsymbol{B}_2 - \boldsymbol{B}_1) \cdot \boldsymbol{n} = 0$ | $B_{2n} = B_{1n}$（常に連続） |
| **電場 $\boldsymbol{E}$ の接線成分** | $\displaystyle \boldsymbol{n} \times (\boldsymbol{E}_2 - \boldsymbol{E}_1) = \boldsymbol{0}$ | $\boldsymbol{E}_{2\parallel} = \boldsymbol{E}_{1\parallel}$（常に連続） |
| **磁場 $\boldsymbol{H}$ の接線成分** | $\displaystyle \boldsymbol{n} \times (\boldsymbol{H}_2 - \boldsymbol{H}_1) = \boldsymbol{K}_f$ | $\boldsymbol{H}_{2\parallel} - \boldsymbol{H}_{1\parallel} = \boldsymbol{K}_f \times \boldsymbol{n}$（真表面電流 $\boldsymbol{K}_f=\boldsymbol{0}$ なら連続） |

---

## 6. 電磁波とポインティングの定理・ゲージ不変性

### 6.1 電磁ポテンシャル $(\phi, \boldsymbol{A})$ とゲージ変換・ローレンツゲージ

時間変化する一般の電磁場では、$\boldsymbol{\nabla}\cdot\boldsymbol{B} = 0$ より $\boldsymbol{B} = \boldsymbol{\nabla}\times\boldsymbol{A}$ と置けます。これをファラデーの法則 $\boldsymbol{\nabla}\times\boldsymbol{E} + \dfrac{\partial\boldsymbol{B}}{\partial t} = \boldsymbol{0}$ に代入すると、

$$
\boldsymbol{\nabla} \times \left( \boldsymbol{E} + \frac{\partial \boldsymbol{A}}{\partial t} \right) = \boldsymbol{0} \quad \Longrightarrow \quad \boldsymbol{E}(\boldsymbol{r}, t) = -\boldsymbol{\nabla}\phi(\boldsymbol{r}, t) - \frac{\partial \boldsymbol{A}(\boldsymbol{r}, t)}{\partial t}
$$

これにより、全6成分の電磁場 $(\boldsymbol{E}, \boldsymbol{B})$ は、4成分の**電磁ポテンシャル $(\phi, \boldsymbol{A})$** によって完全に表現されます。このとき、任意のスカラー関数 $\chi(\boldsymbol{r}, t)$ を用いた次の**ゲージ変換（Gauge transformation）**を行っても、物理的な観測量である $\boldsymbol{E}$ と $\boldsymbol{B}$ は全く変化しません（**ゲージ不変性**）。

$$
\boldsymbol{A}' = \boldsymbol{A} + \boldsymbol{\nabla}\chi, \qquad \phi' = \phi - \frac{\partial \chi}{\partial t}
$$

相対論的共変性を持つ**ローレンツゲージ条件（Lorenz gauge condition）**：

$$
\boldsymbol{\nabla} \cdot \boldsymbol{A} + \frac{1}{c^2}\frac{\partial \phi}{\partial t} = 0 \qquad \left(c \equiv \frac{1}{\sqrt{\varepsilon_0 \mu_0}}\right)
$$

を課すと、$\phi$ と $\boldsymbol{A}$ の方程式は完全に分離し、対称な**非斉次波動方程式（ダランベール方程式）**が得られます。

$$
\left( \nabla^2 - \frac{1}{c^2}\frac{\partial^2}{\partial t^2} \right) \phi = -\frac{\rho}{\varepsilon_0}, \qquad \left( \nabla^2 - \frac{1}{c^2}\frac{\partial^2}{\partial t^2} \right) \boldsymbol{A} = -\mu_0 \boldsymbol{j}
$$

### 6.2 電磁波の波動方程式と平面電磁波の性質

電荷も電流も存在しない真空中（$\rho = 0, \boldsymbol{j} = \boldsymbol{0}$）において、ファラデーの法則の両辺の回転をとると、恒等式 $\boldsymbol{\nabla}\times(\boldsymbol{\nabla}\times\boldsymbol{E}) = \boldsymbol{\nabla}(\boldsymbol{\nabla}\cdot\boldsymbol{E}) - \nabla^2\boldsymbol{E} = -\nabla^2\boldsymbol{E}$ およびアンペール・マクスウェルの法則 $\boldsymbol{\nabla}\times\boldsymbol{B} = \varepsilon_0\mu_0 \dfrac{\partial\boldsymbol{E}}{\partial t}$ より、$\boldsymbol{E}$ と $\boldsymbol{B}$ が満たす3次元波動方程式が導かれます。

$$
\nabla^2 \boldsymbol{E} - \varepsilon_0 \mu_0 \frac{\partial^2 \boldsymbol{E}}{\partial t^2} = \boldsymbol{0}, \qquad \nabla^2 \boldsymbol{B} - \varepsilon_0 \mu_0 \frac{\partial^2 \boldsymbol{B}}{\partial t^2} = \boldsymbol{0}
$$

これにより、電磁場の変動は真空中を速さ $c = \dfrac{1}{\sqrt{\varepsilon_0 \mu_0}} \approx 2.998 \times 10^8\,\text{m/s}$（光速）で伝播する波（**電磁波**）であることが証明されます。

波数ベクトル $\boldsymbol{k}$、角振動数 $\omega = ck$（$k = |\boldsymbol{k}|$）を持つ単色平面電磁波：

$$
\boldsymbol{E}(\boldsymbol{r}, t) = \operatorname{Re}\left[\boldsymbol{E}_0 e^{i(\boldsymbol{k}\cdot\boldsymbol{r} - \omega t)}\right], \qquad \boldsymbol{B}(\boldsymbol{r}, t) = \operatorname{Re}\left[\boldsymbol{B}_0 e^{i(\boldsymbol{k}\cdot\boldsymbol{r} - \omega t)}\right]
$$

において、空間微分 $\boldsymbol{\nabla} \to i\boldsymbol{k}$、時間微分 $\dfrac{\partial}{\partial t} \to -i\omega$ をマクスウェル方程式に適用すると、以下の重要な幾何学的関係が得られます。

1. **横波（Transverse wave）の性質**：
   $$
   \boldsymbol{\nabla}\cdot\boldsymbol{E} = 0 \implies \boldsymbol{k}\cdot\boldsymbol{E} = 0, \qquad \boldsymbol{\nabla}\cdot\boldsymbol{B} = 0 \implies \boldsymbol{k}\cdot\boldsymbol{B} = 0
   $$
   電場 $\boldsymbol{E}$ と磁束密度 $\boldsymbol{B}$ はともに進行方向 $\boldsymbol{k}$ に垂直な**横波**である。
2. **$\boldsymbol{E}, \boldsymbol{B}, \boldsymbol{k}$ の直交右手系と振幅比**：
   $$
   \boldsymbol{\nabla}\times\boldsymbol{E} = -\frac{\partial\boldsymbol{B}}{\partial t} \implies \boldsymbol{B} = \frac{1}{\omega}(\boldsymbol{k}\times\boldsymbol{E}) = \frac{1}{c}(\boldsymbol{e}_k \times \boldsymbol{E}), \qquad |\boldsymbol{E}| = c|\boldsymbol{B}|
   $$
   $\boldsymbol{E}, \boldsymbol{B}, \boldsymbol{k}$ は互いに直交し、$\boldsymbol{E}\times\boldsymbol{B}$ の向きが電磁波の進行方向 $\boldsymbol{k}$ に一致する。

<div class="sim-embed">
  <div class="sim-embed-header">▼ 3次元空間を伝播する平面電磁波（電場ベクトルと磁束密度ベクトルの直交進行波）</div>
  <EMWave3D />
</div>

### 6.3 ポインティングの定理（電磁場のエネルギー保存則）

電磁場が荷電粒子系に対して単位時間・単位体積あたりにする仕事率（ジュール熱の発生率）は、ローレンツ力密度 $\boldsymbol{f} = \rho\boldsymbol{E} + \boldsymbol{j}\times\boldsymbol{B}$ より $\boldsymbol{j}\cdot\boldsymbol{E}$ で与えられます（磁場は粒子の速度と直交するため仕事をしない）。
アンペール・マクスウェルの法則から $\boldsymbol{j} = \dfrac{1}{\mu_0}\boldsymbol{\nabla}\times\boldsymbol{B} - \varepsilon_0\dfrac{\partial\boldsymbol{E}}{\partial t}$ を代入し、ベクトル恒等式 $\boldsymbol{\nabla}\cdot(\boldsymbol{E}\times\boldsymbol{B}) = \boldsymbol{B}\cdot(\boldsymbol{\nabla}\times\boldsymbol{E}) - \boldsymbol{E}\cdot(\boldsymbol{\nabla}\times\boldsymbol{B})$ とファラデーの法則 $\boldsymbol{\nabla}\times\boldsymbol{E} = -\dfrac{\partial\boldsymbol{B}}{\partial t}$ を用いると、次式が得られます。

$$
\boldsymbol{j}\cdot\boldsymbol{E} = \frac{1}{\mu_0}(\boldsymbol{\nabla}\times\boldsymbol{B})\cdot\boldsymbol{E} - \varepsilon_0\boldsymbol{E}\cdot\frac{\partial\boldsymbol{E}}{\partial t} = -\boldsymbol{\nabla}\cdot\left(\frac{1}{\mu_0}\boldsymbol{E}\times\boldsymbol{B}\right) - \frac{\partial}{\partial t}\left(\frac{1}{2}\varepsilon_0\boldsymbol{E}^2 + \frac{1}{2\mu_0}\boldsymbol{B}^2\right)
$$

ここで、**電磁場のエネルギー密度 $u$** と **ポインティングベクトル（エネルギー流束密度）$\boldsymbol{S}$**［$\text{W/m}^2$］を

$$
u \equiv \frac{1}{2}\varepsilon_0 \boldsymbol{E}^2 + \frac{1}{2\mu_0}\boldsymbol{B}^2 = \frac{1}{2}\left(\boldsymbol{E}\cdot\boldsymbol{D} + \boldsymbol{B}\cdot\boldsymbol{H}\right), \qquad \boldsymbol{S} \equiv \frac{1}{\mu_0}\boldsymbol{E} \times \boldsymbol{B} = \boldsymbol{E} \times \boldsymbol{H}
$$

と定義すると、電磁場と荷電粒子系の全エネルギー保存則を表す**ポインティングの定理（Poynting's theorem）**が得られます。

$$
\frac{\partial u}{\partial t} + \boldsymbol{\nabla} \cdot \boldsymbol{S} = -\boldsymbol{j} \cdot \boldsymbol{E} \qquad \left(\text{積分形：}-\frac{d}{dt}\iiint_V u\,dV = \oiint_{\partial V} \boldsymbol{S}\cdot d\boldsymbol{S} + \iiint_V \boldsymbol{j}\cdot\boldsymbol{E}\,dV\right)
$$

> **物理的意味**：領域 $V$ 内の電磁場エネルギーの減少率（左辺）は、境界面 $\partial V$ からポインティングベクトル $\boldsymbol{S}$ によって外部へ運び去られる電磁波の放射パワー（右辺第1項）と、領域内部で物質の運動エネルギーやジュール熱に変換される消費パワー（右辺第2項）の和に等しい。

---

## 7. 理解度チェック＆演習問題に挑む

マクスウェル方程式のベクトル解析、ポアソン方程式の境界値問題、鏡像法、ビオ・サバールの法則、電磁波とポインティングベクトルを実際の計算問題で確認しましょう。

<div style="margin-top:20px; display:flex; gap:12px; flex-wrap:wrap;">
  <a href="/university/problems/electromagnetism" style="display:inline-block; background:#1d4ed8; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700;">
    📝 電磁気学の演習問題一覧へ進む →
  </a>
  <a href="/university/thermodynamics/index" style="display:inline-block; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:700;">
    次の単元：熱力学・統計力学へ →
  </a>
</div>
