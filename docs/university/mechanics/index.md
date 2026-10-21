---
title: 大学力学・解析力学（Classical & Analytical Mechanics）
description: ベクトル微積分・微分方程式によるニュートン力学の厳密構築から、減衰・強制・連成振動、中心力場とビネの公式、回転座標系とコリオリ力、剛体の慣性テンソルとオイラー方程式、ラグランジュ・ハミルトン解析力学まで完全網羅。
---

# 🏎️ 大学力学・解析力学（Classical & Analytical Mechanics）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学1〜2年次 ／ 必須数学：常微分方程式・ベクトル解析・線形代数・変分法
</div>

高校物理では「公式 $ma = F$ に数値を代入して解く」ことが中心でしたが、大学力学では<strong>運動方程式そのものをベクトル微分方程式 $m\dfrac{d^2\boldsymbol{r}}{dt^2} = \boldsymbol{F}(\boldsymbol{r}, \dot{\boldsymbol{r}}, t)$ として定式化し、初期条件のもとで厳密に積分すること</strong>が本質となります。
本講では、大学標準の<strong>太字ベクトル表記（$\boldsymbol{r}, \boldsymbol{v}, \boldsymbol{a}, \boldsymbol{p}, \boldsymbol{L}, \boldsymbol{F}$）</strong>に基づき、ニュートン力学の微積分的再構築から、振動論・中心力場・非慣性系・剛体の慣性テンソル、そして現代物理学の礎である<strong>解析力学（ラグランジュ形式・ハミルトン正準理論・ポアソン括弧）</strong>までを一切の曖昧さなく体系的に解説します。

---

## 1. ベクトル微積分によるニュートン力学と保存則の体系

### ① 位置・速度・加速度ベクトルと運動の第2法則
3次元ユークリッド空間内の正規直交基底を $(\boldsymbol{e}_x, \boldsymbol{e}_y, \boldsymbol{e}_z)$ とし、時刻 $t$ における質点（質量 $m$）の位置ベクトルを $\boldsymbol{r}(t) = x(t)\boldsymbol{e}_x + y(t)\boldsymbol{e}_y + z(t)\boldsymbol{e}_z$ と表します。速度ベクトル $\boldsymbol{v}(t)$ および加速度ベクトル $\boldsymbol{a}(t)$ は時間微分により定義されます：

$$\boldsymbol{v}(t) \equiv \frac{d\boldsymbol{r}}{dt} = \dot{\boldsymbol{r}}(t) = \dot{x}\boldsymbol{e}_x + \dot{y}\boldsymbol{e}_y + \dot{z}\boldsymbol{e}_z$$

$$\boldsymbol{a}(t) \equiv \frac{d\boldsymbol{v}}{dt} = \frac{d^2\boldsymbol{r}}{dt^2} = \ddot{\boldsymbol{r}}(t) = \ddot{x}\boldsymbol{e}_x + \ddot{y}\boldsymbol{e}_y + \ddot{z}\boldsymbol{e}_z$$

質点の運動量ベクトルを $\boldsymbol{p} \equiv m\boldsymbol{v}$ と定義するとき、ニュートンの運動方程式（第2法則）は次式で与えられます：

$$\frac{d\boldsymbol{p}}{dt} = \boldsymbol{F}(\boldsymbol{r}, \boldsymbol{v}, t) \iff m\frac{d^2\boldsymbol{r}}{dt^2} = \boldsymbol{F}(\boldsymbol{r}, \dot{\boldsymbol{r}}, t)$$

加速度 $\boldsymbol{a}(t)$ が既知のとき、初期条件 $\boldsymbol{r}(t_0) = \boldsymbol{r}_0, \boldsymbol{v}(t_0) = \boldsymbol{v}_0$ のもとで時間積分を実行することで軌道が一意に定まります：

$$\boldsymbol{v}(t) = \boldsymbol{v}_0 + \int_{t_0}^t \boldsymbol{a}(t')\,dt', \quad \boldsymbol{r}(t) = \boldsymbol{r}_0 + \int_{t_0}^t \boldsymbol{v}(t')\,dt'$$

---

### ② 線積分による仕事と保存力・ポテンシャルエネルギー
質点が空間内の曲線 $C$ に沿って点 $\mathrm{A}(\boldsymbol{r}_A)$ から点 $\mathrm{B}(\boldsymbol{r}_B)$ まで移動するとき、力 $\boldsymbol{F}$ が質点になす仕事 $W_{A \to B}$ は**線積分（Line Integral）**で定義されます：

$$W_{A \to B} \equiv \int_C \boldsymbol{F} \cdot d\boldsymbol{r} = \int_{t_A}^{t_B} \boldsymbol{F}(\boldsymbol{r}(t)) \cdot \frac{d\boldsymbol{r}}{dt}\,dt$$

ここに運動方程式 $m\frac{d\boldsymbol{v}}{dt} = \boldsymbol{F}$ を代入し、$\frac{d}{dt}(\boldsymbol{v}\cdot\boldsymbol{v}) = 2\boldsymbol{v}\cdot\frac{d\boldsymbol{v}}{dt}$ を用いると、経路や力の性質（保存・非保存）を問わず**仕事と運動エネルギーの定理**が厳密に成立します：

$$W_{A \to B} = \int_{t_A}^{t_B} m\frac{d\boldsymbol{v}}{dt}\cdot\boldsymbol{v}\,dt = \int_{t_A}^{t_B} \frac{d}{dt}\left(\frac{1}{2}m\boldsymbol{v}^2\right)dt = \frac{1}{2}mv_B^2 - \frac{1}{2}mv_A^2 = T_B - T_A$$

#### 保存力の3つの等価条件
力 $\boldsymbol{F}(\boldsymbol{r})$ が速度や時間に陽に依存せず、以下の互いに同値な条件を満たすとき、$\boldsymbol{F}(\boldsymbol{r})$ を**保存力（Conservative Force）**と呼びます（領域は単連結とする）：

1. 任意の2点間の仕事 $\int_{\boldsymbol{r}_A}^{\boldsymbol{r}_B} \boldsymbol{F}\cdot d\boldsymbol{r}$ が途中の経路 $C$ に依らず、始点 $\boldsymbol{r}_A$ と終点 $\boldsymbol{r}_B$ のみで決まる。
2. 任意の閉曲線 $C$ に沿う周回積分が恒等的にゼロになる：$\displaystyle \oint_C \boldsymbol{F}\cdot d\boldsymbol{r} = 0$。
3. ストークスの定理 $\oint_C \boldsymbol{F}\cdot d\boldsymbol{r} = \iint_S (\boldsymbol{\nabla}\times\boldsymbol{F})\cdot d\boldsymbol{S} = 0$ より、力の回転（curl）が全空間でゼロ（**渦なし場**）となる：
   $$\boldsymbol{\nabla} \times \boldsymbol{F} = \boldsymbol{0}$$
4. 位置のみのスカラー関数 $U(\boldsymbol{r})$（**ポテンシャルエネルギー**）が存在し、その負の勾配（gradient）として力が表される：
   $$\boldsymbol{F}(\boldsymbol{r}) = -\boldsymbol{\nabla} U(\boldsymbol{r}) = -\left(\frac{\partial U}{\partial x}\boldsymbol{e}_x + \frac{\partial U}{\partial y}\boldsymbol{e}_y + \frac{\partial U}{\partial z}\boldsymbol{e}_z\right), \quad U(\boldsymbol{r}) = -\int_{\boldsymbol{r}_0}^{\boldsymbol{r}} \boldsymbol{F}(\boldsymbol{r}')\cdot d\boldsymbol{r}'$$

このとき、運動方程式の両辺と $\boldsymbol{v} = \frac{d\boldsymbol{r}}{dt}$ の内積をとることで、**力学的エネルギー保存則**が第1積分として導かれます：

$$m\frac{d\boldsymbol{v}}{dt}\cdot\boldsymbol{v} = -\boldsymbol{\nabla}U\cdot\frac{d\boldsymbol{r}}{dt} \implies \frac{d}{dt}\left(\frac{1}{2}m\boldsymbol{v}^2 + U(\boldsymbol{r})\right) = 0 \implies E = \frac{1}{2}mv^2 + U(\boldsymbol{r}) = \mathrm{const.}$$

---

### ③ 角運動量ベクトル $\boldsymbol{L}$ と力のモーメント（トルク）$\boldsymbol{N}$
原点 $\mathrm{O}$ のまわりの質点の**角運動量ベクトル** $\boldsymbol{L}$ と、力 $\boldsymbol{F}$ による**力のモーメント（トルク）ベクトル** $\boldsymbol{N}$ を外積（Cross Product）で定義します：

$$\boldsymbol{L} \equiv \boldsymbol{r} \times \boldsymbol{p} = m(\boldsymbol{r} \times \boldsymbol{v}), \quad \boldsymbol{N} \equiv \boldsymbol{r} \times \boldsymbol{F}$$

$\boldsymbol{L}$ を時間 $t$ で微分すると、積の微分法則および平行ベクトルの外積 $\boldsymbol{v} \times (m\boldsymbol{v}) = \boldsymbol{0}$ より：

$$\frac{d\boldsymbol{L}}{dt} = \frac{d\boldsymbol{r}}{dt}\times\boldsymbol{p} + \boldsymbol{r}\times\frac{d\boldsymbol{p}}{dt} = \underbrace{\boldsymbol{v}\times(m\boldsymbol{v})}_{=\,\boldsymbol{0}} + \boldsymbol{r}\times\boldsymbol{F} = \boldsymbol{N}$$

すなわち、**角運動量の時間変化率はトルクに等しい**という普遍法則が得られます。特にトルク $\boldsymbol{N} = \boldsymbol{0}$（力が常に位置ベクトル $\boldsymbol{r}$ と平行な中心力 $\boldsymbol{F}(\boldsymbol{r}) \parallel \boldsymbol{r}$ の場合など）では、$\frac{d\boldsymbol{L}}{dt} = \boldsymbol{0}$ となり、角運動量ベクトル $\boldsymbol{L}$ は大きさと向きを含めて完全に保存します（軌道が $\boldsymbol{L}$ に垂直な固定平面内に拘束される根拠）。

---

### ④ 多粒子系（質点系）の運動と2体問題・換算質量
$N$ 個の質点（質量 $m_i$、位置 $\boldsymbol{r}_i$）からなる系において、質点 $i$ に働く外力を $\boldsymbol{F}_i^{(\text{ext})}$、質点 $j$ から質点 $i$ に働く内力を $\boldsymbol{f}_{ij}$ とします。作用・反作用の法則 $\boldsymbol{f}_{ij} = -\boldsymbol{f}_{ji}$ より、全運動量 $\boldsymbol{P} \equiv \sum_{i=1}^N m_i \dot{\boldsymbol{r}}_i = M\dot{\boldsymbol{R}}$（全質量 $M = \sum_i m_i$、重心位置 $\boldsymbol{R} \equiv \frac{1}{M}\sum_i m_i \boldsymbol{r}_i$）について内力は完全に相殺します：

$$\frac{d\boldsymbol{P}}{dt} = M\frac{d^2\boldsymbol{R}}{dt^2} = \sum_{i=1}^N \boldsymbol{F}_i^{(\text{ext})} \equiv \boldsymbol{F}^{(\text{ext})}$$

#### 2体問題（Two-Body Problem）の重心分離
外力が働かず、互いに内力 $\boldsymbol{f}_{12}(\boldsymbol{r}_1 - \boldsymbol{r}_2) = -\boldsymbol{f}_{21}$ のみを及ぼし合う2体問題（連星系、太陽と惑星、水素原子など）では、**重心座標** $\boldsymbol{R}$ と**相対座標** $\boldsymbol{r} \equiv \boldsymbol{r}_1 - \boldsymbol{r}_2$ を導入します：

$$\boldsymbol{R} = \frac{m_1\boldsymbol{r}_1 + m_2\boldsymbol{r}_2}{m_1 + m_2}, \quad \boldsymbol{r} = \boldsymbol{r}_1 - \boldsymbol{r}_2 \iff \begin{cases} \boldsymbol{r}_1 = \boldsymbol{R} + \dfrac{m_2}{m_1+m_2}\boldsymbol{r} \\[6pt] \boldsymbol{r}_2 = \boldsymbol{R} - \dfrac{m_1}{m_1+m_2}\boldsymbol{r} \end{cases}$$

運動方程式 $m_1\ddot{\boldsymbol{r}}_1 = \boldsymbol{F}(\boldsymbol{r}), \; m_2\ddot{\boldsymbol{r}}_2 = -\boldsymbol{F}(\boldsymbol{r})$ から、重心運動と相対運動は完全に分離されます：

$$(m_1 + m_2)\ddot{\boldsymbol{R}} = \boldsymbol{0}, \quad \mu \ddot{\boldsymbol{r}} = \boldsymbol{F}(\boldsymbol{r}) \quad \left(\text{換算質量 } \mu \equiv \frac{m_1 m_2}{m_1 + m_2}\right)$$

また、全運動エネルギーと全角運動量も重心成分と相対成分の和に厳密に分解されます：

$$T = \frac{1}{2}(m_1 + m_2)\dot{\boldsymbol{R}}^2 + \frac{1}{2}\mu \dot{\boldsymbol{r}}^2, \quad \boldsymbol{L} = (m_1 + m_2)\boldsymbol{R}\times\dot{\boldsymbol{R}} + \boldsymbol{r}\times(\mu\dot{\boldsymbol{r}})$$

---

## 2. 減衰振動・強制振動・連成振動（線形微分方程式と固有値問題）

### ① 粘性減衰振動（Damped Harmonic Oscillator）
復元力 $-kx$ と速度に比例する粘性抵抗力 $-c\dot{x}$（$c > 0$）を受ける1次元振動子の運動方程式は：

$$m\ddot{x} + c\dot{x} + kx = 0 \iff \ddot{x} + 2\gamma\dot{x} + \omega_0^2 x = 0 \quad \left(\gamma \equiv \frac{c}{2m}, \; \omega_0 \equiv \sqrt{\frac{k}{m}}\right)$$

指数関数解 $x(t) = e^{\lambda t}$ を代入すると特性方程式 $\lambda^2 + 2\gamma\lambda + \omega_0^2 = 0$ より $\lambda = -\gamma \pm \sqrt{\gamma^2 - \omega_0^2}$ を得ます。判別式 $D = \gamma^2 - \omega_0^2$ の符号により解は3通りに分類されます：

| 減衰レジーム | 条件 | 一般解 $x(t)$ の具体形 | 物理的特徴 |
| :--- | :--- | :--- | :--- |
| **① 減衰振動**（Underdamping） | $\gamma < \omega_0$ | $x(t) = A e^{-\gamma t}\cos(\omega t + \alpha)$ <br>（ただし $\omega = \sqrt{\omega_0^2 - \gamma^2}$） | 固有角振動数より少し遅い角振動数 $\omega$ で往復振動しながら、包絡線 $\pm A e^{-\gamma t}$ に沿って振幅が指数減衰する。1周期ごとの振幅比の対数 $\delta_{\text{dec}} = \ln\frac{x(t)}{x(t+T)} = \gamma T = \frac{2\pi\gamma}{\omega}$ を**対数減衰率**という。 |
| **② 臨界減衰**（Critical Damping） | $\gamma = \omega_0$ | $x(t) = (C_1 + C_2 t)e^{-\gamma t}$ | 特性根が重根 $\lambda = -\gamma$ となる境界条件。振動を起こすことなく**最短時間**で平衡位置 $x=0$ へ収束する（ドアダンパーや計測器指針の最適設計条件）。 |
| **③ 過減衰**（Overdamping） | $\gamma > \omega_0$ | $x(t) = C_1 e^{-(\gamma - \kappa)t} + C_2 e^{-(\gamma + \kappa)t}$ <br>（ただし $\kappa = \sqrt{\gamma^2 - \omega_0^2}$） | 粘性抵抗が極めて強く、一度も振動せずにゆっくりと平衡位置へ漸近する（遅い減衰モード $e^{-(\gamma-\kappa)t}$ が長時間挙動を支配する）。 |

---

### ② 強制振動（Forced Oscillation）と共振曲線・$Q$ 値
減衰振動子に周期的外力 $F(t) = F_0 \cos(\omega t)$ を印加した非斉次2階微分方程式を考えます：

$$\ddot{x} + 2\gamma\dot{x} + \omega_0^2 x = \frac{F_0}{m}\cos(\omega t)$$

複素化方程式 $\ddot{\tilde{x}} + 2\gamma\dot{\tilde{x}} + \omega_0^2 \tilde{x} = \frac{F_0}{m}e^{i\omega t}$ に特解 $\tilde{x}(t) = \tilde{A}(\omega)e^{i\omega t}$ を代入すると、複素振幅は直ちに求まります：

$$\tilde{A}(\omega) = \frac{F_0 / m}{(\omega_0^2 - \omega^2) + 2i\gamma\omega} = A(\omega)e^{-i\delta(\omega)}$$

実部をとることで、十分時間が経過した後の**定常振動解** $x_{\text{steady}}(t) = A(\omega)\cos(\omega t - \delta(\omega))$ が得られます：

$$A(\omega) = \frac{F_0 / m}{\sqrt{(\omega_0^2 - \omega^2)^2 + 4\gamma^2\omega^2}}, \quad \tan\delta(\omega) = \frac{2\gamma\omega}{\omega_0^2 - \omega^2} \quad (0 \le \delta \le \pi)$$

* **振幅の共振角振動数**: 分母の根号内を $\omega^2$ で微分して最小化すると、$\gamma < \frac{\omega_0}{\sqrt{2}}$ のとき $\omega_r = \sqrt{\omega_0^2 - 2\gamma^2}$ で振幅は最大値 $A_{\max} = \frac{F_0}{2m\gamma\sqrt{\omega_0^2 - \gamma^2}}$ をとります。
* **位相の遅れ $\delta(\omega)$**: 低周波極限（$\omega \ll \omega_0$）では外力と同位相（$\delta \to 0$）、固有角振動数 $\omega = \omega_0$ ではちょうど $\delta = \frac{\pi}{2}$（速度が外力と同位相となりエネルギー吸収パワーが最大）、高周波極限（$\omega \gg \omega_0$）では逆位相（$\delta \to \pi$）となります。
* **$Q$ 値（Quality Factor）**: 共振の鋭さを表す無次元指標であり、弱減衰（$\gamma \ll \omega_0$）において次式で定義されます：
  $$Q \equiv \frac{\omega_0}{2\gamma} = \frac{\sqrt{mk}}{c} \approx \frac{\omega_0}{\Delta \omega_{\text{FWHM}}}$$
  ここで $\Delta\omega_{\text{FWHM}} = 2\gamma$ は吸収パワー（またはエネルギー $E(\omega) \propto A(\omega)^2$）の半値全幅です。

---

### ③ 多自由度系の連成振動と基準振動（Normal Modes）
質量 $m$ の2つの質点が3本のばね（ばね定数 $k, K, k$）で直線上に連結された連成振動系では、変位ベクトル $\boldsymbol{x} = \begin{pmatrix} x_1 \\ x_2 \end{pmatrix}$ に対する運動方程式は行列形式で記述されます：

$$\begin{cases} m\ddot{x}_1 = -kx_1 - K(x_1 - x_2) \\ m\ddot{x}_2 = -kx_2 - K(x_2 - x_1) \end{cases} \iff m\frac{d^2\boldsymbol{x}}{dt^2} = -\mathbf{K}\boldsymbol{x}, \quad \mathbf{K} = \begin{pmatrix} k+K & -K \\ -K & k+K \end{pmatrix}$$

基準振動解 $\boldsymbol{x}(t) = \boldsymbol{u}\cos(\omega t + \phi)$ を代入すると、対称行列の**固有値問題**に帰着します：

$$(\mathbf{K} - m\omega^2 \mathbf{I})\boldsymbol{u} = \boldsymbol{0} \implies \det(\mathbf{K} - m\omega^2 \mathbf{I}) = 0 \quad (\text{永年方程式})$$

これを解くと、2つの独立な**固有角振動数**と**基準モード（固有ベクトル）**が得られます：

1. **同相モード（対称モード）**: $\omega_1 = \sqrt{\dfrac{k}{m}}, \quad \boldsymbol{u}_1 = \dfrac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix}$ （中央の結合ばね $K$ が伸縮せず、両質点が同じ向きに等振幅で振動）
2. **逆相モード（反対称モード）**: $\omega_2 = \sqrt{\dfrac{k + 2K}{m}}, \quad \boldsymbol{u}_2 = \dfrac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix}$ （中央の結合ばねが2倍伸縮し、両質点が互いに逆向きに振動）

**基準座標（Normal Coordinates）** $Q_1 \equiv \frac{x_1 + x_2}{\sqrt{2}}, \; Q_2 \equiv \frac{x_1 - x_2}{\sqrt{2}}$ を導入すると、運動方程式は $\ddot{Q}_1 + \omega_1^2 Q_1 = 0, \; \ddot{Q}_2 + \omega_2^2 Q_2 = 0$ へと完全に非結合化（対角化）されます。

---

## 3. 中心力場・極座標系とケプラー問題の厳密解

### ① 2次元極座標 $(r, \theta)$ の基底ベクトル微分
平面極座標 $(r, \theta)$ における正規直交基底ベクトル $\boldsymbol{e}_r(\theta), \boldsymbol{e}_\theta(\theta)$ は次式で定義されます：

$$\boldsymbol{e}_r = \cos\theta\,\boldsymbol{e}_x + \sin\theta\,\boldsymbol{e}_y, \quad \boldsymbol{e}_\theta = -\sin\theta\,\boldsymbol{e}_x + \cos\theta\,\boldsymbol{e}_y$$

位置によって基底ベクトルの向き自体が変化するため、時間微分には連鎖律（$\frac{d}{dt} = \dot{\theta}\frac{d}{d\theta}$）を適用します：

$$\frac{d\boldsymbol{e}_r}{dt} = \dot{\theta}(-\sin\theta\,\boldsymbol{e}_x + \cos\theta\,\boldsymbol{e}_y) = \dot{\theta}\boldsymbol{e}_\theta, \quad \frac{d\boldsymbol{e}_\theta}{dt} = \dot{\theta}(-\cos\theta\,\boldsymbol{e}_x - \sin\theta\,\boldsymbol{e}_y) = -\dot{\theta}\boldsymbol{e}_r$$

これを用いて位置ベクトル $\boldsymbol{r} = r\boldsymbol{e}_r$ を時間微分すると、速度 $\boldsymbol{v}$ と加速度 $\boldsymbol{a}$ の極座標表示が得られます：

$$\boldsymbol{v} = \frac{d}{dt}(r\boldsymbol{e}_r) = \dot{r}\boldsymbol{e}_r + r\dot{\theta}\boldsymbol{e}_\theta$$

$$\boldsymbol{a} = \frac{d\boldsymbol{v}}{dt} = (\ddot{r} - r\dot{\theta}^2)\boldsymbol{e}_r + (r\ddot{\theta} + 2\dot{r}\dot{\theta})\boldsymbol{e}_\theta = (\ddot{r} - r\dot{\theta}^2)\boldsymbol{e}_r + \frac{1}{r}\frac{d}{dt}(r^2\dot{\theta})\boldsymbol{e}_\theta$$

ここで動径成分の第2項 $-r\dot{\theta}^2$ は向心加速度、方位角成分の第2項 $2\dot{r}\dot{\theta}$ はコリオリ型加速度に対応します。

---

### ② 角運動量保存則・面積速度一定則と有効ポテンシャル
中心力場 $\boldsymbol{F}(\boldsymbol{r}) = F(r)\boldsymbol{e}_r = -\frac{dU(r)}{dr}\boldsymbol{e}_r$ の運動方程式を成分ごとに書き下すと：

$$m(\ddot{r} - r\dot{\theta}^2) = F(r), \quad \frac{m}{r}\frac{d}{dt}(r^2\dot{\theta}) = 0$$

第2式より、角運動量の $z$ 成分 $L \equiv mr^2\dot{\theta}$ は保存量となります。動径ベクトル $\boldsymbol{r}$ が単位時間に掃く面積（**面積速度**）は：

$$\frac{dS}{dt} = \frac{1}{2}|\boldsymbol{r}\times\boldsymbol{v}| = \frac{1}{2}r^2\dot{\theta} = \frac{L}{2m} = \mathrm{const.} \quad (\text{ケプラーの第2法則})$$

さらに $\dot{\theta} = \frac{L}{mr^2}$ を動径運動方程式および全エネルギー $E = \frac{1}{2}m(\dot{r}^2 + r^2\dot{\theta}^2) + U(r)$ に代入すると、角変数 $\theta$ が消去され、**有効ポテンシャル（Effective Potential）** $U_{\text{eff}}(r)$ 中の1次元運動に帰着します：

$$m\ddot{r} = -\frac{d}{dr}U_{\text{eff}}(r), \quad E = \frac{1}{2}m\dot{r}^2 + U_{\text{eff}}(r), \quad U_{\text{eff}}(r) \equiv U(r) + \frac{L^2}{2mr^2}$$

ここで $\frac{L^2}{2mr^2}$ は角運動量保存によって中心への墜落を妨げる**遠心力ポテンシャル（遠心力バリア）**です。

---

### ③ ビネの公式（Binet's Formula）とケプラー軌道の完全導出
軌道の幾何学的形状 $r = r(\theta)$ を求めるため、逆数変数 $u(\theta) \equiv \frac{1}{r(\theta)}$ を導入します。微分演算子 $\frac{d}{dt} = \dot{\theta}\frac{d}{d\theta} = \frac{L}{m}u^2\frac{d}{d\theta}$ を用いると：

$$\dot{r} = \frac{d}{dt}\left(\frac{1}{u}\right) = -\frac{1}{u^2}\frac{du}{d\theta}\left(\frac{L}{m}u^2\right) = -\frac{L}{m}\frac{du}{d\theta}, \quad \ddot{r} = -\frac{L^2}{m^2}u^2\frac{d^2u}{d\theta^2}$$

これを動径運動方程式に代入すると、任意の中心力場に対する軌道微分方程式である**ビネの公式**が得られます：

$$\frac{d^2u}{d\theta^2} + u = -\frac{m}{L^2 u^2}F\left(\frac{1}{u}\right)$$

万有引力（またはクーロン引力） $F(r) = -\frac{k}{r^2} = -ku^2$（万有引力では $k = GMm$、ポテンシャル $U(r) = -\frac{k}{r}$）を代入すると、右辺は定数となります：

$$\frac{d^2u}{d\theta^2} + u = \frac{mk}{L^2} \equiv \frac{1}{l} \quad \left(\text{半直弦 } l \equiv \frac{L^2}{mk} = \frac{L^2}{GMm^2}\right)$$

この2階線形常微分方程式の一般解は（近日点を $\theta = 0$ に選ぶと）：

$$u(\theta) = \frac{1}{r(\theta)} = \frac{1}{l}(1 + \varepsilon\cos\theta) \iff r(\theta) = \frac{l}{1 + \varepsilon\cos\theta}$$

またエネルギー保存則 $E = \frac{1}{2}m\dot{r}^2 + \frac{L^2}{2mr^2} - \frac{k}{r} = \frac{L^2}{2m}\left[\left(\frac{du}{d\theta}\right)^2 + u^2\right] - ku$ に代入すると、**離心率（Eccentricity）** $\varepsilon$ と全力学的エネルギー $E$ の関係式が厳密に導かれます：

$$\varepsilon = \sqrt{1 + \frac{2EL^2}{mk^2}}$$

* $E = -\frac{mk^2}{2L^2} < 0 \implies \varepsilon = 0$: **円軌道**（半径 $r_0 = l$）
* $-\frac{mk^2}{2L^2} < E < 0 \implies 0 < \varepsilon < 1$: **楕円軌道**（ケプラーの第1法則、軌道長半径 $a = \frac{l}{1-\varepsilon^2} = -\frac{k}{2E}$、周期 $T = \frac{\pi ab}{dS/dt} = 2\pi\sqrt{\frac{m}{k}}a^{3/2}$ すなわちケプラーの第3法則 $\frac{T^2}{a^3} = \frac{4\pi^2}{GM}$）
* $E = 0 \implies \varepsilon = 1$: **放物線軌道**（第二宇宙速度・脱出臨界軌道）
* $E > 0 \implies \varepsilon > 1$: **双曲線軌道**（非束縛散乱軌道・ラザフォード散乱）

---

## 4. 回転座標系と見かけの力（コリオリの力・遠心力）

慣性系 $\Sigma$ に対して一定の角速度ベクトル $\boldsymbol{\omega}$（または時間変化する $\boldsymbol{\omega}(t)$）で回転している座標系 $\Sigma'$ を考えます。回転系に固定された正規直交基底 $(\boldsymbol{e}'_1, \boldsymbol{e}'_2, \boldsymbol{e}'_3)$ の時間変化は $\frac{d\boldsymbol{e}'_i}{dt} = \boldsymbol{\omega}\times\boldsymbol{e}'_i$ で与えられるため、任意のベクトル $\boldsymbol{A} = \sum_{i=1}^3 A'_i \boldsymbol{e}'_i$ の慣性系での時間微分 $\left(\frac{d\boldsymbol{A}}{dt}\right)_{\Sigma}$ と回転系での時間微分 $\left(\frac{d\boldsymbol{A}}{dt}\right)_{\Sigma'} \equiv \sum_{i=1}^3 \dot{A}'_i \boldsymbol{e}'_i$ の間には次の基本演算子恒等式が成り立ちます：

$$\left(\frac{d\boldsymbol{A}}{dt}\right)_{\Sigma} = \left(\frac{d\boldsymbol{A}}{dt}\right)_{\Sigma'} + \boldsymbol{\omega} \times \boldsymbol{A}$$

これを位置ベクトル $\boldsymbol{r}$ に2回繰り返し適用すると、慣性系での速度 $\boldsymbol{v}$・加速度 $\boldsymbol{a}$ と回転系での速度 $\boldsymbol{v}' \equiv \left(\frac{d\boldsymbol{r}}{dt}\right)_{\Sigma'}$・加速度 $\boldsymbol{a}' \equiv \left(\frac{d^2\boldsymbol{r}}{dt^2}\right)_{\Sigma'}$ の関係が導出されます：

$$\boldsymbol{v} = \boldsymbol{v}' + \boldsymbol{\omega}\times\boldsymbol{r}$$

$$\boldsymbol{a} = \left(\frac{d\boldsymbol{v}'}{dt}\right)_{\Sigma'} + \boldsymbol{\omega}\times\boldsymbol{v}' + \dot{\boldsymbol{\omega}}\times\boldsymbol{r} + \boldsymbol{\omega}\times(\boldsymbol{v}' + \boldsymbol{\omega}\times\boldsymbol{r}) = \boldsymbol{a}' + 2\boldsymbol{\omega}\times\boldsymbol{v}' + \boldsymbol{\omega}\times(\boldsymbol{\omega}\times\boldsymbol{r}) + \dot{\boldsymbol{\omega}}\times\boldsymbol{r}$$

したがって、回転座標系 $\Sigma'$ における質点の運動方程式は、真の外力 $\boldsymbol{F}$ に3つの**慣性力（見かけの力）**を加えた形になります：

$$m\boldsymbol{a}' = \boldsymbol{F} \underbrace{- 2m(\boldsymbol{\omega} \times \boldsymbol{v}')}_{\text{コリオリの力 }\boldsymbol{F}_{\text{Cor}}} \underbrace{- m\boldsymbol{\omega} \times (\boldsymbol{\omega} \times \boldsymbol{r})}_{\text{遠心力 }\boldsymbol{F}_{\text{cf}}} \underbrace{- m\dot{\boldsymbol{\omega}} \times \boldsymbol{r}}_{\text{オイラー力}}$$

* **遠心力（Centrifugal Force）** $\boldsymbol{F}_{\text{cf}} = -m\boldsymbol{\omega}\times(\boldsymbol{\omega}\times\boldsymbol{r})$: 回転軸から垂直外向き（軸からの距離 $\rho$ に対して $m\omega^2\rho$）に働く保存力であり、遠心力ポテンシャル $U_{\text{cf}}(\boldsymbol{r}) = -\frac{1}{2}m(\boldsymbol{\omega}\times\boldsymbol{r})^2$ から導かれます。
* **コリオリの力（Coriolis Force）** $\boldsymbol{F}_{\text{Cor}} = -2m(\boldsymbol{\omega}\times\boldsymbol{v}')$: 回転系内で運動する物体（$\boldsymbol{v}' \neq \boldsymbol{0}$）に対して、回転軸 $\boldsymbol{\omega}$ と速度 $\boldsymbol{v}'$ の双方に垂直な向きに働く力です。速度 $\boldsymbol{v}'$ と常に直交するため仕事はゼロ（$\boldsymbol{F}_{\text{Cor}}\cdot\boldsymbol{v}' = 0$）ですが、北半球において運動方向を進行方向右向きへ偏向させ、台風の反時計回り渦やフーコーの振り子の振動面回転を引き起こします。

---

## 5. 剛体の力学（慣性テンソルとオイラーの運動方程式）

### ① 慣性テンソル $\mathbf{I}$ と角運動量ベクトル
原点（または重心）のまわりを角速度ベクトル $\boldsymbol{\omega}$ で回転する剛体において、位置 $\boldsymbol{r} = (x_1, x_2, x_3)$ にある微小質量要素 $dm = \rho(\boldsymbol{r})dV$ の速度は $\boldsymbol{v} = \boldsymbol{\omega}\times\boldsymbol{r}$ です。剛体全体の角運動量ベクトル $\boldsymbol{L}$ はベクトル三重積公式 $\boldsymbol{A}\times(\boldsymbol{B}\times\boldsymbol{C}) = (\boldsymbol{A}\cdot\boldsymbol{C})\boldsymbol{B} - (\boldsymbol{A}\cdot\boldsymbol{B})\boldsymbol{C}$ により展開されます：

$$\boldsymbol{L} = \int_V \boldsymbol{r}\times(\boldsymbol{\omega}\times\boldsymbol{r})\,\rho(\boldsymbol{r})\,dV = \int_V \left[ r^2\boldsymbol{\omega} - (\boldsymbol{r}\cdot\boldsymbol{\omega})\boldsymbol{r} \right]\rho(\boldsymbol{r})\,dV = \mathbf{I}\boldsymbol{\omega}$$

これを成分で書くと $L_\alpha = \sum_{\beta=1}^3 I_{\alpha\beta}\omega_\beta$（$\alpha, \beta \in \{x, y, z\}$）となり、2階対称テンソルである**慣性テンソル（Inertia Tensor）** $\mathbf{I}$ が定義されます：

$$I_{\alpha\beta} \equiv \int_V \rho(\boldsymbol{r})\left( r^2\delta_{\alpha\beta} - x_\alpha x_\beta \right)dV = \begin{pmatrix} \int(y^2+z^2)dm & -\int xy\,dm & -\int xz\,dm \\ -\int yx\,dm & \int(z^2+x^2)dm & -\int yz\,dm \\ -\int zx\,dm & -\int zy\,dm & \int(x^2+y^2)dm \end{pmatrix}$$

対角成分 $I_{xx}, I_{yy}, I_{zz}$ を**慣性モーメント**、非対角成分 $I_{xy}$ 等を**慣性乗積**と呼びます。また剛体の回転運動エネルギーは二次形式で与えられます：

$$T_{\text{rot}} = \frac{1}{2}\int_V (\boldsymbol{\omega}\times\boldsymbol{r})^2\,\rho(\boldsymbol{r})\,dV = \frac{1}{2}\boldsymbol{\omega}\cdot\boldsymbol{L} = \frac{1}{2}\boldsymbol{\omega}^T \mathbf{I}\boldsymbol{\omega} = \frac{1}{2}\sum_{\alpha,\beta} I_{\alpha\beta}\omega_\alpha\omega_\beta$$

**注意**：一般の3次元回転では、角運動量ベクトル $\boldsymbol{L} = \mathbf{I}\boldsymbol{\omega}$ と角速度ベクトル $\boldsymbol{\omega}$ は**同じ向きを向きません**。

---

### ② 慣性主軸とオイラーの運動方程式
慣性テンソル $\mathbf{I}$ は実対称行列であるため、適切な直交座標系（剛体に固定された**慣性主軸系** $\boldsymbol{e}_1, \boldsymbol{e}_2, \boldsymbol{e}_3$）を選ぶことで常に対角化できます：

$$\mathbf{I}_{\text{principal}} = \begin{pmatrix} I_1 & 0 & 0 \\ 0 & I_2 & 0 \\ 0 & 0 & I_3 \end{pmatrix}, \quad \boldsymbol{L} = I_1\omega_1\boldsymbol{e}_1 + I_2\omega_2\boldsymbol{e}_2 + I_3\omega_3\boldsymbol{e}_3, \quad T_{\text{rot}} = \frac{1}{2}\left(I_1\omega_1^2 + I_2\omega_2^2 + I_3\omega_3^2\right)$$

剛体に固定された慣性主軸系は剛体とともに角速度 $\boldsymbol{\omega}$ で回転しているため、回転座標系の微分公式 $\left(\frac{d\boldsymbol{L}}{dt}\right)_{\text{space}} = \left(\frac{d\boldsymbol{L}}{dt}\right)_{\text{body}} + \boldsymbol{\omega}\times\boldsymbol{L} = \boldsymbol{N}$ を成分展開すると、剛体の3次元回転を支配する**オイラーの運動方程式（Euler's Equations）**が得られます：

$$\begin{cases} I_1 \dot{\omega}_1 - (I_2 - I_3)\omega_2\omega_3 = N_1 \\ I_2 \dot{\omega}_2 - (I_3 - I_1)\omega_3\omega_1 = N_2 \\ I_3 \dot{\omega}_3 - (I_1 - I_2)\omega_1\omega_2 = N_3 \end{cases}$$

特に外力トルクがない対称コマ（$\boldsymbol{N}=\boldsymbol{0}, \; I_1 = I_2 \neq I_3$）では、第3式より $\dot{\omega}_3 = 0 \implies \omega_3 = \text{const.}$ となり、第1・第2式から角速度ベクトル $\boldsymbol{\omega}$ が対象軸 $\boldsymbol{e}_3$ のまわりを角振動数 $\Omega_p = \frac{I_3 - I_1}{I_1}\omega_3$ で回転する**自由歳差運動（Free Precession）**（地球の極運動・チャンドラー極運動など）が導かれます。

---

## 6. 解析力学（ラグランジュ形式・ハミルトン正準理論）

### ① 一般化座標・最小作用の原理とオイラー＝ラグランジュ方程式
$N$ 個の質点系が $k$ 個のホロノミックな束縛条件 $f_m(\boldsymbol{r}_1, \dots, \boldsymbol{r}_N, t) = 0 \; (m=1,\dots,k)$ を受けるとき、系の独立な自由度は $n = 3N - k$ となります。系を完全に指定する $n$ 個の独立なパラメータ $q = (q_1, q_2, \dots, q_n)$ を**一般化座標**、その時間微分 $\dot{q} = (\dot{q}_1, \dots, \dot{q}_n)$ を**一般化速度**と呼びます。

運動エネルギー $T(q, \dot{q}, t)$ とポテンシャルエネルギー $U(q, t)$ の差として**ラグランジアン（Lagrangian）** $L$ を定義し、時刻 $t_1$ から $t_2$ までの時間積分として汎関数である**作用積分（Action Integral）** $S[q(t)]$ を定義します：

$$L(q, \dot{q}, t) \equiv T(q, \dot{q}, t) - U(q, t), \quad S[q(t)] \equiv \int_{t_1}^{t_2} L(q(t), \dot{q}(t), t)\,dt$$

**ハミルトンの原理（最小作用の原理）**は、「実現される物理的軌道 $q(t)$ は、両端を固定した微小変分（$\delta q_i(t_1) = \delta q_i(t_2) = 0$）に対して作用 $S$ を停留させる（$\delta S = 0$）」と主張します。変分を計算し、部分積分を行うと：

$$\delta S = \int_{t_1}^{t_2} \sum_{i=1}^n \left( \frac{\partial L}{\partial q_i}\delta q_i + \frac{\partial L}{\partial \dot{q}_i}\frac{d(\delta q_i)}{dt} \right)dt = \sum_{i=1}^n \underbrace{\left[ \frac{\partial L}{\partial \dot{q}_i}\delta q_i \right]_{t_1}^{t_2}}_{=\,0} + \int_{t_1}^{t_2} \sum_{i=1}^n \left\{ \frac{\partial L}{\partial q_i} - \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_i}\right) \right\}\delta q_i\,dt = 0$$

任意の変分 $\delta q_i(t)$ に対して上式が成り立つための必要十分条件として、座標系の選び方（デカルト・極・円筒・球・移動座標系）に依存しない普遍的な**オイラー＝ラグランジュ方程式**が得られます：

$$\frac{d}{dt}\left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = 0 \quad (i = 1, 2, \dots, n)$$

---

### ② 対称性と保存則（ネーターの定理）
一般化座標 $q_i$ に共役な**一般化運動量（正準運動量）** $p_i$ を次式で定義します：

$$p_i \equiv \frac{\partial L}{\partial \dot{q}_i}$$

* **循環座標（Cyclic Coordinate）**: ラグランジアン $L$ がある座標 $q_k$ を陽に含まない（$\frac{\partial L}{\partial q_k} = 0$）とき、オイラー＝ラグランジュ方程式より直ちに $\frac{dp_k}{dt} = 0 \implies p_k = \text{const.}$ が得られます。
* **ネーターの定理（Noether's Theorem）**: 「ラグランジアン（作用）が連続的な変換群に対して不変性（対称性）をもつとき、それに対応する保存量が必ず存在する」。
  - **空間並進対称性**（$\boldsymbol{r}_a \to \boldsymbol{r}_a + \boldsymbol{\epsilon}$ で不変）$\implies$ **全運動量ベクトル** $\boldsymbol{P} = \sum_a \boldsymbol{p}_a$ の保存
  - **空間回転対称性**（$\boldsymbol{r}_a \to \boldsymbol{r}_a + \delta\boldsymbol{\theta}\times\boldsymbol{r}_a$ で不変）$\implies$ **全角運動量ベクトル** $\boldsymbol{L} = \sum_a \boldsymbol{r}_a\times\boldsymbol{p}_a$ の保存
  - **時間並進対称性**（$\frac{\partial L}{\partial t} = 0$）$\implies$ **エネルギー（ハミルトニアン）** $H \equiv \sum_{i=1}^n p_i\dot{q}_i - L$ の保存

---

### ③ ハミルトンの正準方程式とポアソン括弧式
独立変数を $(q, \dot{q}, t)$ から $(q, p, t)$（$2n$ 次元の**位相空間 Phase Space**）へルジャンドル変換することで、**ハミルトニアン（Hamiltonian）** $H(q, p, t)$ を定義します：

$$H(q, p, t) \equiv \sum_{i=1}^n p_i \dot{q}_i - L(q, \dot{q}(q,p,t), t)$$

全微分 $dH = \sum_i \left(\dot{q}_i dp_i + p_i d\dot{q}_i - \frac{\partial L}{\partial q_i}dq_i - \frac{\partial L}{\partial \dot{q}_i}d\dot{q}_i\right) - \frac{\partial L}{\partial t}dt = \sum_i (\dot{q}_i dp_i - \dot{p}_i dq_i) - \frac{\partial L}{\partial t}dt$ の係数を比較することで、**ハミルトンの正準方程式（Canonical Equations）**が得られます：

$$\dot{q}_i = \frac{\partial H}{\partial p_i}, \quad \dot{p}_i = -\frac{\partial H}{\partial q_i} \quad (i = 1, 2, \dots, n), \quad \frac{dH}{dt} = \frac{\partial H}{\partial t} = -\frac{\partial L}{\partial t}$$

#### ポアソン括弧（Poisson Bracket）と量子力学への架け橋
位相空間上の任意の2つの物理量 $f(q, p, t), \; g(q, p, t)$ に対し、**ポアソン括弧** $\{f, g\}$ を次式で定義します：

$$\{f, g\} \equiv \sum_{i=1}^n \left( \frac{\partial f}{\partial q_i}\frac{\partial g}{\partial p_i} - \frac{\partial f}{\partial p_i}\frac{\partial g}{\partial q_i} \right)$$

正準変数自身の基本ポアソン括弧は $\{q_i, p_j\} = \delta_{ij}, \; \{q_i, q_j\} = 0, \; \{p_i, p_j\} = 0$ であり、任意の物理量 $f(q, p, t)$ の時間変化はハミルトニアン $H$ とのポアソン括弧として統一的に記述されます：

$$\frac{df}{dt} = \sum_{i=1}^n \left( \frac{\partial f}{\partial q_i}\dot{q}_i + \frac{\partial f}{\partial p_i}\dot{p}_i \right) + \frac{\partial f}{\partial t} = \{f, H\} + \frac{\partial f}{\partial t}$$

特に $\frac{\partial f}{\partial t} = 0$ の物理量が保存量となる条件は $\{f, H\} = 0$ です。ディラックはこの構造に着目し、古典ポアソン括弧を量子力学の交換子（Commutator）へ置き換える**正準量子化（$\{A, B\} \longrightarrow \frac{1}{i\hbar}[\hat{A}, \hat{B}]$）**によって量子力学のハイゼンベルク運動方程式を定式化しました。

---

## 📝 大学力学・解析力学 演習問題で実力を鍛える

減衰振動、ビネの公式とケプラー軌道、慣性モーメントの3重積分、オイラー＝ラグランジュ方程式、連成振動の基準モード、回転座標系のコリオリ力まで、院試頻出の厳選6題に挑戦しましょう：

<div class="problem-jump-card">
  <h3>🏎️ 大学力学・解析力学 厳選演習問題集（全6問）</h3>
  <p>粘性減衰振動子の完全解、ビネの公式によるケプラー楕円軌道導出、一様球の慣性モーメント重積分、台車付き単振り子のオイラー＝ラグランジュ方程式、2自由度連成振動の固有値解析、地球回転系のコリオリ東偏計算を詳細解説つきで演習できます。</p>
  <a class="jump-btn" href="/university/problems/mechanics">👉 大学力学・解析力学 演習問題を解く →</a>
</div>

<style scoped>
.problem-jump-card {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(129, 140, 248, 0.14));
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 2rem 0;
}
.problem-jump-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: var(--vp-c-brand-1, #38bdf8);
}
.problem-jump-card p {
  margin: 0 0 14px 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.jump-btn {
  display: inline-block;
  padding: 8px 18px;
  background: var(--vp-c-brand-1, #38bdf8);
  color: #fff !important;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 6px;
  text-decoration: none;
}
.jump-btn:hover {
  opacity: 0.9;
}
</style>
