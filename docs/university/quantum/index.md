---
title: 大学量子力学（Quantum Mechanics）
description: 状態ベクトル、波動関数の確率解釈、エルミート演算子、シュレーディンガー方程式、正準交換関係と不確定性原理、井戸型ポテンシャル・調和振動子・トンネル効果まで完全網羅。
---

# ⚛️ 大学量子力学（Quantum Mechanics）

<div class="lead">
高校物理の「原子物理」分野では、光量子説やボーアの量子条件（$mvr = n\frac{h}{2\pi}$）が半ば経験則として紹介されていました。<br>
大学の量子力学では、ニュートン力学の「位置と運動量による軌道の決定」という古典的決定論を捨て去り、<strong>ヒルベルト空間上の状態ベクトル $| \psi \rangle$、エルミート演算子、そしてシュレーディンガー方程式</strong>に基づく革新的な物理体系を構築します。
</div>

---

## 1. 量子力学の基本仮説（公理系）

量子力学は、以下の数理的公理系（基本原理）の上に美しく構築されています。

### ① 状態の記述（第1原理）
物理系の純粋状態は、複素ヒルベルト空間の単位ベクトル（または空間座標表現である <strong>波動関数 $\psi(\vec{r}, t)$</strong>）によって完全に表されます。

#### ボルンの確率解釈（Born's Statistical Interpretation）
時刻 $t$ において位置 $\vec{r}$ の微小体積要素 $dV$ に粒子が見出される確率 $dP$ は、波動関数の絶対値の2乗に比例します：

$$dP = |\psi(\vec{r}, t)|^2 dV$$

全空間での全確率は $1$ でなければならないため、**規格化条件（Normalization）** が課されます：

$$\iiint_{-\infty}^\infty |\psi(\vec{r}, t)|^2 dV = 1$$

### ② 物理量とエルミート演算子（第2原理）
観測可能なすべての物理量（オブザーバブル）は、ヒルベルト空間上の <strong>エルミート演算子（自己共役演算子 $\hat{A} = \hat{A}^\dagger$）</strong> に対応します。

* **位置演算子**: $\hat{\vec{r}} = \vec{r}$（単なる掛け算）
* **運動量演算子**: $\hat{\vec{p}} = -i\hbar \nabla = -i\hbar \left( \frac{\partial}{\partial x}\vec{e}_x + \frac{\partial}{\partial y}\vec{e}_y + \frac{\partial}{\partial z}\vec{e}_z \right)$
* **ハミルトニアン（エネルギー演算子）**: 
  $$\hat{H} = \frac{\hat{\vec{p}}^2}{2m} + V(\hat{\vec{r}}) = -\frac{\hbar^2}{2m}\nabla^2 + V(\vec{r})$$

### ③ 測定と固有値（第3原理）
物理量 $\hat{A}$ を測定したとき、得られる測定値は必ず $\hat{A}$ の固有方程式の <strong>固有値 $a_n$</strong> のいずれかです：

$$\hat{A} \phi_n(\vec{r}) = a_n \phi_n(\vec{r})$$

エルミート演算子の固有値は必ず **実数** であり、異なる固有値に属する固有関数は互いに **直交** します。
状態 $|\psi\rangle$ を測定したときの期待値 $\langle A \rangle$ は以下で計算されます：

$$\langle A \rangle = \int \psi^*(\vec{r}, t) \hat{A} \psi(\vec{r}, t) dV$$

---

## 2. シュレーディンガー方程式（Schrödinger Equation）

### 時間に依存するシュレーディンガー方程式
状態の時間発展は、量子力学の運動方程式である以下の偏微分方程式によって一意に決定されます：

$$i\hbar \frac{\partial}{\partial t}\psi(\vec{r}, t) = \hat{H}\psi(\vec{r}, t) = \left[ -\frac{\hbar^2}{2m}\nabla^2 + V(\vec{r}, t) \right] \psi(\vec{r}, t)$$

### 時間に依存しないシュレーディンガー方程式と定常状態
ポテンシャルが時間に陽に依存しない場合（$V(\vec{r})$）、変数分離 $\psi(\vec{r}, t) = \phi(\vec{r}) e^{-iEt/\hbar}$ を行うと、エネルギー固有値問題に分離されます：

$$\hat{H}\phi(\vec{r}) = E\phi(\vec{r}) \iff \left[ -\frac{\hbar^2}{2m}\nabla^2 + V(\vec{r}) \right]\phi(\vec{r}) = E\phi(\vec{r})$$

この解 $\phi(\vec{r})$ を **定常状態（Stationary State）** と呼び、存在確率密度 $|\psi(\vec{r}, t)|^2 = |\phi(\vec{r})|^2$ は時間変化しません。

---

## 3. 正準交換関係と不確定性原理

### 位置と運動量の交換子
位置演算子 $\hat{x}$ と運動量演算子 $\hat{p} = -i\hbar \frac{d}{dx}$ は可換ではありません。任意のテスト関数 $f(x)$ に作用させると：

$$[\hat{x}, \hat{p}] f(x) = (\hat{x}\hat{p} - \hat{p}\hat{x}) f(x) = x\left(-i\hbar \frac{df}{dx}\right) - \left(-i\hbar \frac{d}{dx}(xf)\right) = i\hbar f(x)$$

したがって、量子力学の根幹をなす **正準交換関係** が得られます：

$$[\hat{x}, \hat{p}] = \hat{x}\hat{p} - \hat{p}\hat{x} = i\hbar \hat{I}$$

### ケネジ＝ロバートソン不確定性関係
コーシー＝シュワルツの不等式より、非可換なエルミート演算子 $\hat{A}, \hat{B}$ の測定値の不確定さ（分散 $\Delta A = \sqrt{\langle A^2 \rangle - \langle A \rangle^2}$）には、以下の不等式が常に成り立ちます：

$$\Delta A \, \Delta B \ge \frac{1}{2}\left| \langle [\hat{A}, \hat{B}] \rangle \right|$$

$\hat{A} = \hat{x}, \hat{B} = \hat{p}$ を代入すると、有名な **ハイゼンベルクの不確定性関係** が厳密に導出されます：

$$\Delta x \, \Delta p \ge \frac{\hbar}{2}$$

位置と運動量を同時に無限の精度で決定することは、自然界の基本原理として不可能です。

---

## 4. 厳密解の代表例

### ① 1次元無限に深い井戸型ポテンシャル
幅 $a$ の区間 $0 < x < a$ のみ $V=0$、外部が $V=\infty$：

$$-\frac{\hbar^2}{2m}\frac{d^2\phi}{dx^2} = E\phi, \quad \phi(0) = \phi(a) = 0$$

解くと、エネルギー固有値と規格化固有関数が離散的に得られます：

$$E_n = \frac{n^2 \pi^2 \hbar^2}{2ma^2} \quad (n = 1, 2, 3, \dots)$$

$$\phi_n(x) = \sqrt{\frac{2}{a}}\sin\left( \frac{n\pi x}{a} \right)$$

基底状態（$n=1$）でもエネルギーはゼロにならず、$E_1 > 0$（**零点エネルギー**）を保持します。

### ② 1次元調和振動子（生成・消滅演算子法）
ポテンシャル $V(x) = \frac{1}{2}m\omega^2 x^2$ に対し、無次元の消滅演算子 $\hat{a}$ と生成演算子 $\hat{a}^\dagger$ を定義します：

$$\hat{a} = \sqrt{\frac{m\omega}{2\hbar}}\left( \hat{x} + \frac{i}{m\omega}\hat{p} \right), \quad \hat{a}^\dagger = \sqrt{\frac{m\omega}{2\hbar}}\left( \hat{x} - \frac{i}{m\omega}\hat{p} \right)$$

交換関係 $[\hat{a}, \hat{a}^\dagger] = 1$ より、ハミルトニアンは数演算子 $\hat{N} = \hat{a}^\dagger \hat{a}$ で書けます：

$$\hat{H} = \hbar\omega \left( \hat{a}^\dagger \hat{a} + \frac{1}{2} \right)$$

エネルギー固有値は等間隔に量子化されます：

$$E_n = \hbar\omega \left( n + \frac{1}{2} \right) \quad (n = 0, 1, 2, \dots)$$

基底状態の零点振動エネルギーは $E_0 = \frac{1}{2}\hbar\omega$ です。

### ③ ポテンシャル障壁と量子トンネル効果
粒子のエネルギー $E$ より高い障壁 $V_0 > E$（幅 $a$）が存在するとき、古典力学では粒子は100%反射されます。
しかし量子力学では、障壁内部で波動関数が指数関数的に減衰しながら浸透（$\phi(x) \sim e^{-\kappa x}, \kappa = \frac{\sqrt{2m(V_0-E)}}{\hbar}$）し、反対側へ有限の確率で染み出します：

$$T \approx \exp\left( -2\frac{\sqrt{2m(V_0 - E)}}{\hbar} a \right) \quad (\text{透過係数})$$

このトンネル効果は、走査型トンネル顕微鏡（STM）、半導体フラッシュメモリ、恒星内での原子核融合反応の基礎となっています。

---

## 📝 大学量子力学 演習問題で実力を鍛える

井戸型ポテンシャルの規格化積分、正準交換関係と不確定性関係の不等式証明など、大学専門レベルの厳選演習問題に挑戦しましょう：

<div class="problem-jump-card">
  <h3>⚛️ 大学量子力学 厳選演習問題集</h3>
  <p>1次元無限井戸の固有値問題とゆらぎ計算、演算子の交換子展開と不確定性原理の厳密証明など、数式展開の全ステップを丁寧に記述した解説つきで学習できます。</p>
  <a class="jump-btn" href="/university/problems/quantum">👉 大学量子力学 演習問題を解く →</a>
</div>

<style scoped>
.problem-jump-card {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(56, 189, 248, 0.12));
  border: 1px solid rgba(168, 85, 247, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 2rem 0;
}
.problem-jump-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #a855f7;
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
  background: #a855f7;
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
