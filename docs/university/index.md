---
title: 大学物理ポータル＆カリキュラム体系 | 理工系・院試・物理再入門
description: 大学物理の全分野（力学・解析力学、電磁気学・マクスウェル方程式、熱力学・統計力学、量子力学）の体系的講義と専用演習問題集。太字ベクトル表記・微分積分・ベクトル解析・演算子法による厳密な数理展開。
---

# 🎓 大学物理（理工系・院試・専門基礎）ポータル

「高校物理では公式として暗記していた式が、なぜ成り立つのか？」  
「微積分や微分方程式、ベクトル解析、線形代数を使うと、物理の世界はどう見通せるのか？」  

大学物理は、自然現象を少数の根本原理（変分原理・対称性・場の微分方程式・正準量子化・統計アンサンブル）から**数学的に演繹（えんえき）し、統一的に記述する体系**です。当サイトでは、高校物理（大学受験・直感的理解）と大学物理（厳密な数理体系）を**完全に分離**し、国際標準（ISO 80000-2）に準拠した**太字ベクトル表記（$\boldsymbol{r}, \boldsymbol{v}, \boldsymbol{F}, \boldsymbol{E}, \boldsymbol{B}, \boldsymbol{\nabla}$）**を用いて、理工系学部生・大学院入試（院試）受験生・社会人の学び直しに最適な専門コンテンツを提供します。

---

## 🧭 高校物理と大学物理の本質的な違い

| 比較項目 | 🏫 高校物理（物理基礎・物理） | 🎓 大学物理（理工系教養・専門・院試） |
| :--- | :--- | :--- |
| **ベクトル表記** | 矢印付きの文字（主に平面内の成分分解と図形的合成） | **太字（ボールド体）表記** $\boldsymbol{r}, \boldsymbol{v}, \boldsymbol{F}, \boldsymbol{E}, \boldsymbol{B}$ および微分演算子 $\boldsymbol{\nabla}$（内積・外積・テンソル代数） |
| **数学的道具** | 初等代数、三角関数、グラフの傾きと面積（$v$-$t$ 図・$P$-$V$ 図） | 常微分・偏微分方程式、多重積分、ベクトル解析（$\operatorname{grad}, \operatorname{div}, \operatorname{rot}$）、ヒルベルト空間・エルミート演算子 |
| **力学・解析力学** | $ma = F$（等加速度運動、または単振動・円運動の公式適用） | 微分方程式 $m\dfrac{d^2\boldsymbol{r}}{dt^2} = \boldsymbol{F}(\boldsymbol{r}, \dot{\boldsymbol{r}}, t)$、最小作用の原理 $\delta S = 0$ とオイラー・ラグランジュ方程式・ハミルトン正準方程式 |
| **電磁気学** | クーロンの法則、ビオ・サバール則の特殊解、ファラデー則を個別の公式として適用 | 4つの**マクスウェル偏微分方程式**から静電磁場・電磁波・ポインティングベクトル $\boldsymbol{S}$ を統一的に演繹 |
| **熱・統計力学** | 理想気体の状態方程式 $PV = nRT$ と第1法則 $\Delta U = Q + W$ の代数計算 | ルジャンドル変換による熱力学ポテンシャル $(U, H, F, G, \Omega)$ と、分配関数 $Z, \Xi$ からのミクロ統計導出 |
| **量子力学** | 光量子仮説・ボーアの量子条件（$2\pi r = n\lambda$）などの前期量子論 | シュレーディンガー方程式 $i\hbar\dfrac{\partial}{\partial t}\vert\psi\rangle = \hat{H}\vert\psi\rangle$ と正準交換関係 $[\hat{r}_\alpha, \hat{p}_\beta] = i\hbar\delta_{\alpha\beta}$ による記述 |

<div style="margin: 12px 0 24px;">
  <a href="/mechanics/index" style="font-weight:700; color:#0284c7; text-decoration:none;">👉 高校物理カリキュラム・シミュレーター一覧はこちら</a>
</div>

---

## 🛠️ 大学物理における表記規約と必須数学ツール

大学物理の各講義および演習問題では、国際標準（ISO 80000-2）および国内外の標準的な理工系専門書に準拠し、以下の数学的記法を統一して用います。

| 記法・演算子 | 定義・数式表現 | 物理における主な役割と意味 |
| :--- | :--- | :--- |
| **太字ベクトル** $\boldsymbol{A}$ | $\boldsymbol{A} = A_x \boldsymbol{e}_x + A_y \boldsymbol{e}_y + A_z \boldsymbol{e}_z$ | 位置 $\boldsymbol{r}$、速度 $\boldsymbol{v}$、運動量 $\boldsymbol{p}$、力 $\boldsymbol{F}$、電場 $\boldsymbol{E}$、磁束密度 $\boldsymbol{B}$ などの空間ベクトル量（大きさと向きをもつ量）。スカラー量 $A = \vert\boldsymbol{A}\vert$（細字斜体）と明確に区別する。 |
| **単位基底ベクトル** $\boldsymbol{e}_i, \boldsymbol{n}$ | $\boldsymbol{e}_i \cdot \boldsymbol{e}_j = \delta_{ij}, \quad \vert\boldsymbol{n}\vert = 1$ | 直交基底 $(\boldsymbol{e}_x, \boldsymbol{e}_y, \boldsymbol{e}_z)$、極座標・球座標の動径・角度基底 $(\boldsymbol{e}_r, \boldsymbol{e}_\theta, \boldsymbol{e}_\phi)$、および閉曲面の外向き単位法線ベクトル $\boldsymbol{n}$。 |
| **時間微分ドット記法** $\dot{q}, \ddot{q}$ | $\dot{q} \equiv \dfrac{dq}{dt}, \quad \ddot{q} \equiv \dfrac{d^2 q}{dt^2}$ | ニュートンが導入した時間微分の略記法。速度 $\boldsymbol{v} = \dot{\boldsymbol{r}}$、加速度 $\boldsymbol{a} = \ddot{\boldsymbol{r}}$、および解析力学の一般化速度 $\dot{q}_i$ で標準的に用いる。 |
| **ナブラ演算子** $\boldsymbol{\nabla}$ | $\boldsymbol{\nabla} \equiv \boldsymbol{e}_x \dfrac{\partial}{\partial x} + \boldsymbol{e}_y \dfrac{\partial}{\partial y} + \boldsymbol{e}_z \dfrac{\partial}{\partial z}$ | 勾配 $\boldsymbol{\nabla}\phi = \operatorname{grad}\phi$、発散 $\boldsymbol{\nabla}\cdot\boldsymbol{A} = \operatorname{div}\boldsymbol{A}$、回転 $\boldsymbol{\nabla}\times\boldsymbol{A} = \operatorname{rot}\boldsymbol{A}$、ラプラシアン $\nabla^2 = \boldsymbol{\nabla}\cdot\boldsymbol{\nabla} = \Delta$ を生成するベクトル微分演算子。 |
| **偏微分の添字表記** $\left(\dfrac{\partial f}{\partial x}\right)_y$ | $df = \left(\dfrac{\partial f}{\partial x}\right)_y dx + \left(\dfrac{\partial f}{\partial y}\right)_x dy$ | 熱力学のように独立変数の選び方が複数存在する系において、**何を一定に保って偏微分するか**を右下の添字で明示する。 |
| **ハット記号・ブラケット** $\hat{A}, \vert\psi\rangle$ | $\hat{A}\vert\psi\rangle, \quad \langle\phi\vert\hat{A}\vert\psi\rangle$ | 量子力学において古典変数と区別される線形演算子（$\hat{\boldsymbol{r}}, \hat{\boldsymbol{p}}, \hat{H}, \hat{\boldsymbol{L}}, \hat{\boldsymbol{S}}$）およびディラックのブラ $\langle\phi\vert$・ケット $\vert\psi\rangle$ 状態ベクトル。 |

---

## 📚 大学物理 体系講義カリキュラム（全4大分野）

### 🏎️ [1. 力学・解析力学（Classical & Analytical Mechanics）](/university/mechanics/)
- **副題**：ベクトル微積分によるニュートン力学からラグランジュ・ハミルトン正準理論へ
- **講義内容**：位置 $\boldsymbol{r}(t)$・速度 $\boldsymbol{v}(t)$・加速度 $\boldsymbol{a}(t)$ の微積分、線積分と保存力の渦なし条件（$\boldsymbol{\nabla}\times\boldsymbol{F}=\boldsymbol{0}$）、質点系の運動量・角運動量保存則と2体問題の換算質量 $\mu$、減衰振動・強制振動・共振と連成振動（基準モード固有値問題）、2次元極座標 $(\boldsymbol{e}_r, \boldsymbol{e}_\theta)$ とビネの公式によるケプラー軌道導出、回転座標系とコリオリ力 $-2m\boldsymbol{\omega}\times\boldsymbol{v}'$、剛体の慣性テンソル $\mathbf{I}$ とオイラーの運動方程式、最小作用の原理 $\delta S = 0$・オイラー・ラグランジュ方程式・ネーターの定理・ハミルトン正準方程式・ポアソン括弧式 $\{f, g\}$。
- 👉 [📖 力学・解析力学の講義を読む](/university/mechanics/) ｜ [📝 力学・解析力学の演習問題（全6問）](/university/problems/mechanics)

### ⚡ [2. 電磁気学（Electromagnetism & Maxwell Equations）](/university/electromagnetism/)
- **副題**：ベクトル解析・曲線座標・マクスウェル方程式・ゲージ理論・電磁波
- **講義内容**：スカラー場・ベクトル場の勾配 $\boldsymbol{\nabla}\phi$・発散 $\boldsymbol{\nabla}\cdot\boldsymbol{A}$・回転 $\boldsymbol{\nabla}\times\boldsymbol{A}$ とベクトル恒等式、ガウスの発散定理とストークスの定理、円柱・球座標系の微分演算子とディラックのデルタ関数 $\delta^3(\boldsymbol{r})$、マクスウェル4方程式（微分形・積分形）と電荷保存則、ポアソン・ラプラス方程式とグリーン関数・電気双極子モーメント $\boldsymbol{p}$・鏡像法、ビオ・サバールの法則とベクトルポテンシャル $\boldsymbol{A}$・磁気双極子モーメント $\boldsymbol{m}$、誘電体・磁性体中の $\boldsymbol{D}, \boldsymbol{H}$ と媒質境界条件、電磁波の波動方程式・ゲージ変換（クーロン／ローレンツゲージ）・ポインティングベクトル $\boldsymbol{S} = \dfrac{1}{\mu_0}\boldsymbol{E}\times\boldsymbol{B}$。
- 👉 [📖 大学電磁気学の講義を読む](/university/electromagnetism/) ｜ [📝 大学電磁気学の演習問題（全6問）](/university/problems/electromagnetism)

### 🔥 [3. 熱力学・統計力学（Thermodynamics & Statistical Mechanics）](/university/thermodynamics/)
- **副題**：ルジャンドル変換と熱力学関数からミクロ・カノニカル・量子統計力学へ
- **講義内容**：熱力学第0〜第3法則とクラウジウス不等式、完全微分とルジャンドル変換による熱力学ポテンシャル $(U, H, F, G, \Omega)$・ギブス・デュエム関係式、4大マクスウェル関係式とエネルギー方程式・ファン・デル・ワールス気体・熱容量差 $C_P - C_V = \dfrac{TV\alpha^2}{\kappa_T}$・クラペイロン・クラウジウス式、等重率の原理とボルツマンの関係式 $S = k_B \ln W$、カノニカル分配関数 $Z$ とエネルギー揺らぎ $\langle(\Delta E)^2\rangle = k_B T^2 C_V$、グランドカノニカル大分配関数 $\Xi$、古典理想気体の位相空間重積分とザックール・テトロード式、ショットキー比熱・アインシュタイン＆デバイ比熱、フェルミ・ディラック分布とボース・アインシュタイン分布。
- 👉 [📖 熱力学・統計力学の講義を読む](/university/thermodynamics/) ｜ [📝 熱・統計力学の演習問題（全6問）](/university/problems/thermodynamics)

### ⚛️ [4. 量子力学（Quantum Mechanics）](/university/quantum/)
- **副題**：ヒルベルト空間・エルミート演算子・シュレーディンガー方程式・角運動量・摂動論
- **講義内容**：量子力学の公理系とディラックのブラ・ケット記法、ボルンの確率解釈とエルミート演算子 $\hat{A}^\dagger = \hat{A}$ の固有値実数性・直交性証明、シュレーディンガー方程式と確率流密度ベクトル $\boldsymbol{j}$・エーレンフェストの定理、正準交換関係 $[\hat{r}_\alpha, \hat{p}_\beta] = i\hbar\delta_{\alpha\beta}$ とロバートソン不確定性関係の厳密証明、無限井戸型ポテンシャル・調和振動子（生成消滅演算子 $\hat{a}, \hat{a}^\dagger$）・ポテンシャル障壁とトンネル効果、軌道角運動量演算子 $\hat{\boldsymbol{L}} = \hat{\boldsymbol{r}}\times\hat{\boldsymbol{p}}$ と球面調和関数・水素原子の動径波動関数・スピン $\hat{\boldsymbol{S}} = \dfrac{\hbar}{2}\hat{\boldsymbol{\sigma}}$、定常状態摂動論とリッツの変分原理。
- 👉 [📖 大学量子力学の講義を読む](/university/quantum/) ｜ [📝 大学量子力学の演習問題（全6問）](/university/problems/quantum)

---

## 🎯 大学物理 演習問題アーカイブ（学部定期試験・院試完全対応）

高校物理の演習問題（全197問）とは完全に切り離された、**大学物理専用の厳選演習問題アーカイブ（全24問）** です。
すべての問題に「必須数学ツール」「考え方のヒント」「途中式を一切省略しない厳密な解答・導出解説」を完備しています。

<div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.1)); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: 12px; padding: 24px; margin: 1.5rem 0;">
  <h3 style="margin: 0 0 8px 0; font-size: 1.25rem; color: #4f46e5;">📝 大学物理 演習問題集トップ（全24問 検索＆学習進捗管理）</h3>
  <p style="margin: 0 0 16px 0; font-size: 0.92rem; line-height: 1.6;">
    力学・解析力学（6問）、電磁気学（6問）、熱・統計力学（6問）、量子力学（6問）の全24問を分野別・難易度別（学部教養／学部専門／院試基礎）に検索・演習できる対話型問題バンクです。KaTeXによる高速数式レンダリングとローカル進捗保存に対応しています。
  </p>
  <a href="/university/problems/index" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: #fff; font-weight: 700; font-size: 0.92rem; border-radius: 8px; text-decoration: none;">🚀 大学物理 演習問題集トップを開く →</a>
</div>
