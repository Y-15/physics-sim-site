---
title: 大学力学・解析力学（Classical & Analytical Mechanics）
description: 微分積分・微分方程式によるニュートン力学の再構築から、減衰・強制振動、中心力場、剛体の慣性モーメント重積分、オイラー＝ラグランジュ方程式、ハミルトン形式まで完全網羅。
---

# 🏎️ 大学力学・解析力学（Classical & Analytical Mechanics）

<div class="lead">
高校物理では「公式 $ma = F$ に数値を代入して解く」ことが中心でしたが、大学力学では<strong>運動方程式そのものを「2階線形・非線形微分方程式」として定式化し、厳密に解くこと</strong>が本質となります。<br>
さらに質点系から剛体の回転運動、そしてニュートン力学の限界を越えて量子力学や相対性理論の架け橋となる<strong>解析力学（ラグランジュ形式・ハミルトン形式）</strong>へと視野を広げます。
</div>

---

## 1. 微積分によるニュートン力学の基礎

### ① 速度と加速度の微積分的定義
質点の位置ベクトルを $\vec{r}(t) = (x(t), y(t), z(t))$ と表すとき：

$$\vec{v}(t) = \frac{d\vec{r}}{dt} = \lim_{\Delta t \to 0}\frac{\vec{r}(t+\Delta t) - \vec{r}(t)}{\Delta t} = (\dot{x}, \dot{y}, \dot{z})$$

$$\vec{a}(t) = \frac{d\vec{v}}{dt} = \frac{d^2\vec{r}}{dt^2} = (\ddot{x}, \ddot{y}, \ddot{z})$$

加速度 $\vec{a}(t)$ を時間積分することで、任意の運動の速度 $\vec{v}(t)$ と位置 $\vec{r}(t)$ を初期条件から決定できます：

$$\vec{v}(t) = \vec{v}(0) + \int_0^t \vec{a}(t') dt', \quad \vec{r}(t) = \vec{r}(0) + \int_0^t \vec{v}(t') dt'$$

### ② 保存力とポテンシャルエネルギー
力 $\vec{F}$ のなす仕事が始点と終点の経路に依存しないとき、その力を **保存力（Conservative force）** と呼びます。
保存力に対しては、スカラー関数である <strong>ポテンシャルエネルギー $U(\vec{r})$</strong> が存在し、勾配（グラディエント）により結びつきます：

$$\vec{F} = -\nabla U = -\left( \frac{\partial U}{\partial x}\vec{e}_x + \frac{\partial U}{\partial y}\vec{e}_y + \frac{\partial U}{\partial z}\vec{e}_z \right)$$

#### 力学的エネルギー保存則の微分学的証明
運動方程式 $m\frac{d\vec{v}}{dt} = \vec{F}$ の両辺と速度ベクトル $\vec{v} = \frac{d\vec{r}}{dt}$ の内積をとると：

$$m\frac{d\vec{v}}{dt} \cdot \vec{v} = \vec{F} \cdot \frac{d\vec{r}}{dt} \implies \frac{d}{dt}\left( \frac{1}{2}m v^2 \right) = -\nabla U \cdot \frac{d\vec{r}}{dt} = -\frac{dU}{dt}$$

$$\frac{d}{dt}\left( \frac{1}{2}m v^2 + U(\vec{r}) \right) = 0 \implies \frac{1}{2}mv^2 + U(\vec{r}) = E \,(\text{一定})$$

高校物理では当たり前とされていた力学的エネルギー保存則が、ニュートン方程式の1回積分（エネルギー積分）として数式から必然的に導出されます。

---

## 2. 減衰振動と強制振動（2階微分方程式）

### 減衰振動の運動方程式
速度に比例する粘性抵抗力 $-c\dot{x}$（$c > 0$）を受けるばね振動子：

$$m\ddot{x} + c\dot{x} + kx = 0 \iff \ddot{x} + 2\gamma \dot{x} + \omega_0^2 x = 0$$

ここで減衰係数 $\gamma = \frac{c}{2m}$、固有角振動数 $\omega_0 = \sqrt{\frac{k}{m}}$。
特性方程式 $\lambda^2 + 2\gamma\lambda + \omega_0^2 = 0$ の判別式 $D = \gamma^2 - \omega_0^2$ により、解は劇的に変化します：

1. **過減衰（$\gamma > \omega_0$）**: 抵抗が強く、振動せず指数減衰する。
2. **臨界減衰（$\gamma = \omega_0$）**: 最短時間で原点に収束する（$x(t) = (C_1 + C_2 t)e^{-\gamma t}$）。
3. **減衰振動（$\gamma < \omega_0$）**: 角振動数 $\omega = \sqrt{\omega_0^2 - \gamma^2}$ で振動しながら振幅が $e^{-\gamma t}$ で減衰する。

### 強制振動と共振現象
外部から周期的な駆動力 $F_0 \cos(\omega t)$ を加えた場合：

$$\ddot{x} + 2\gamma \dot{x} + \omega_0^2 x = \frac{F_0}{m}\cos(\omega t)$$

過渡解が減衰した後の定常振動振幅 $A(\omega)$ は：

$$A(\omega) = \frac{F_0 / m}{\sqrt{(\omega_0^2 - \omega^2)^2 + 4\gamma^2\omega^2}}$$

外力角振動数 $\omega$ が共振角振動数 $\omega_r = \sqrt{\omega_0^2 - 2\gamma^2}$ に近づくと振幅が急激に極大化する **共鳴（Resonance）** が発生します。

---

## 3. 中心力場と極座標の運動方程式

### 2次元極座標系での加速度
2次元平面の運動を極座標 $(r, \theta)$ で記述すると、加速度は動径成分と方位角成分に直交分解されます：

$$\vec{a} = (\ddot{r} - r\dot{\theta}^2)\vec{e}_r + \frac{1}{r}\frac{d}{dt}(r^2 \dot{\theta})\vec{e}_\theta$$

中心力場 $\vec{F} = F(r)\vec{e}_r$ では、方位角方向の力 $F_\theta = 0$ であるため：

$$\frac{d}{dt}(mr^2\dot{\theta}) = 0 \implies L \equiv mr^2\dot{\theta} = \text{一定} \quad (\text{角運動量保存則})$$

### 有効ポテンシャル
動径方向の運動方程式に $L$ を代入すると、1次元の等価問題に帰着します：

$$m\ddot{r} = F(r) + \frac{L^2}{mr^3} = -\frac{d}{dr}U_{\text{eff}}(r)$$

$$U_{\text{eff}}(r) = U(r) + \frac{L^2}{2mr^2} \quad (\text{遠心力ポテンシャルを含む有効ポテンシャル})$$

これにより、天体の軌道運動（円・楕円・放物線・双曲線）の安定性がポテンシャルの谷として一目瞭然に解析できます。

---

## 4. 剛体の力学（慣性モーメントテンソルと回転運動）

### 剛体の回転運動方程式
固定軸周りに回転する剛体の角運動量 $L$ とトルク（力のモーメント）$N$ の関係：

$$L = I \omega, \quad I \frac{d\omega}{dt} = N$$

### 慣性モーメントの重積分計算
剛体の質量密度 $\rho(\vec{r})$、回転軸からの垂直距離 $r_\perp$ とするとき：

$$I = \iiint_V r_\perp^2 \rho(\vec{r}) dV$$

* **一様中実円柱（中心軸周り）**: $I = \frac{1}{2}MR^2$
* **一様中実球（中心直径軸周り）**: $I = \frac{2}{5}MR^2$
* **一様細い棒（重心垂直軸周り）**: $I = \frac{1}{12}ML^2$
* **一様細い棒（一端垂直軸周り）**: $I = \frac{1}{3}ML^2$

### 平行軸の定理（Steiner's theorem）
重心 $G$ を通る軸周りの慣性モーメント $I_G$ と、それから距離 $d$ だけ平行移動した軸周りの慣性モーメント $I$ の関係：

$$I = I_G + M d^2$$

---

## 5. 解析力学（Analytical Mechanics）入門

ニュートンの運動方程式はデカルト座標では簡潔ですが、束縛条件（斜面、振り子のひも、滑車）が存在する場合、未知の束縛力（垂直抗力、張力）を消去する計算が複雑になります。
これを <strong>一般化座標 $q = (q_1, \dots, q_n)$</strong> を用いて完全に自動化するのが解析力学です。

### ① ラグランジュ形式
系の運動エネルギー $T(q, \dot{q})$ とポテンシャル $U(q)$ から **ラグランジアン（Lagrangian）** を定義します：

$$L(q, \dot{q}, t) \equiv T - U$$

ハミルトンの原理（作用積分 $S = \int_{t_1}^{t_2} L dt$ の変分 $\delta S = 0$）から、あらゆる力学系を統括する **オイラー＝ラグランジュ方程式** が導かれます：

$$\frac{d}{dt}\left( \frac{\partial L}{\partial \dot{q}_i} \right) - \frac{\partial L}{\partial q_i} = 0 \quad (i = 1, 2, \dots, n)$$

束縛力は一切出現せず、自由度の数だけの独立な運動方程式が機械的に導出されます。

### ② ハミルトン形式と正準方程式
一般化運動量 $p_i \equiv \frac{\partial L}{\partial \dot{q}_i}$ を導入し、ルジャンドル変換によって **ハミルトニアン（Hamiltonian）** を定義します：

$$H(q, p, t) \equiv \sum_{i=1}^n p_i \dot{q}_i - L = T + U \quad (\text{系の全エネルギー})$$

運動方程式は美しい対称性をもつ1階微分方程式系（正準方程式）になります：

$$\dot{q}_i = \frac{\partial H}{\partial p_i}, \quad \dot{p}_i = -\frac{\partial H}{\partial q_i}$$

この形式は、統計力学の位相空間や量子力学の演算子形式（シュレーディンガー描像・ハイゼンベルク描像）へと直結しています。

---

## 📝 大学力学 演習問題で実力を鍛える

微積分・微分方程式・重積分・ラグランジアンを用いた本格的な大学演習問題に挑戦しましょう：

<div class="problem-jump-card">
  <h3>🏎️ 大学力学・解析力学 厳選演習問題集</h3>
  <p>粘性減衰振動子の完全解、ビネの公式によるケプラー楕円軌道導出、一様球の慣性モーメント重積分、台車付き単振り子のオイラー＝ラグランジュ方程式など、詳細解説つきで演習できます。</p>
  <a class="jump-btn" href="/university/problems/mechanics">👉 大学力学 演習問題を解く →</a>
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
