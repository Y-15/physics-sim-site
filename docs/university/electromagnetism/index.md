---
title: 大学電磁気学（Electromagnetism & Maxwell Equations）
description: ベクトル解析（grad, div, rot）の数学的基礎から、マクスウェル方程式の微分形・積分形、ポアソン方程式、電磁波の波動方程式導出、ポインティング・ベクトルまで完全網羅。
---

# ⚡ 大学電磁気学（Electromagnetism & Maxwell Equations）

<div class="lead">
高校物理の電磁気は「クーロン力」「電場」「オームの法則」「フレミング左手・右手の法則」「電磁誘導」など、多くの個別公式が乱立していました。<br>
大学の電磁気学では、<strong>ベクトル解析</strong>という強力な数学的言語を用いることで、すべての電磁気現象が<strong>たった4つの偏微分方程式（マクスウェル方程式）</strong>から美しく演繹されることを学びます。<br>
そしてこの方程式から、光の正体が電磁波であることが必然的に予言されます。
</div>

---

## 1. ベクトル解析（Vector Calculus）の基礎

電磁場を記述するための3大微分演算子と2大積分定理を定義します。ナブラ演算子は $\nabla = \left( \frac{\partial}{\partial x}, \frac{\partial}{\partial y}, \frac{\partial}{\partial z} \right)$ です。

### ① 勾配（Gradient: $\text{grad}$）
スカラー場 $\phi(x, y, z)$（例：電位）から、その空間変化率が最大となる方向と大きさをもつベクトル場を生成します：

$$\nabla \phi = \text{grad}\,\phi = \frac{\partial \phi}{\partial x}\vec{e}_x + \frac{\partial \phi}{\partial y}\vec{e}_y + \frac{\partial \phi}{\partial z}\vec{e}_z$$

静電場と電位の関係は $\vec{E} = -\nabla \phi$ です。

### ② 発散（Divergence: $\text{div}$）
ベクトル場 $\vec{A}(x, y, z)$（例：電場）から、空間の各点から湧き出す流束（ソース・シンク）の強さを表すスカラー場を生成します：

$$\nabla \cdot \vec{A} = \text{div}\,\vec{A} = \frac{\partial A_x}{\partial x} + \frac{\partial A_y}{\partial y} + \frac{\partial A_z}{\partial z}$$

### ③ 回転（Curl / Rotation: $\text{rot}$）
ベクトル場 $\vec{A}$ の微小な循環（渦の強さと回転軸の向き）を表すベクトル場を生成します：

$$\nabla \times \vec{A} = \text{rot}\,\vec{A} = \begin{vmatrix} \vec{e}_x & \vec{e}_y & \vec{e}_z \\ \frac{\partial}{\partial x} & \frac{\partial}{\partial y} & \frac{\partial}{\partial z} \\ A_x & A_y & A_z \end{vmatrix} = \left( \frac{\partial A_z}{\partial y} - \frac{\partial A_y}{\partial z} \right)\vec{e}_x + \left( \frac{\partial A_x}{\partial z} - \frac{\partial A_z}{\partial x} \right)\vec{e}_y + \left( \frac{\partial A_y}{\partial x} - \frac{\partial A_x}{\partial y} \right)\vec{e}_z$$

### ④ 2大積分定理

#### ガウスの発散定理（Gauss's Divergence Theorem）
閉曲面 $S$ を通過する全流束は、内部領域 $V$ での発散の体積積分に等しい：

$$\iint_S \vec{A} \cdot d\vec{S} = \iiint_V (\nabla \cdot \vec{A}) dV$$

#### ストークスの定理（Stokes' Theorem）
閉曲線 $C$ に沿った線積分（循環）は、その閉曲線を縁とする曲面 $S$ 上の回転の面積分に等しい：

$$\oint_C \vec{A} \cdot d\vec{r} = \iint_S (\nabla \times \vec{A}) \cdot d\vec{S}$$

---

## 2. マクスウェル方程式系（The Maxwell Equations）

電磁気学の全現象を統べる4大基礎方程式です。微分形と積分形を対比して理解します。

| 法則名 | 微分形（局所法則） | 積分形（巨視法則） | 物理的意味 |
| :--- | :--- | :--- | :--- |
| **① ガウスの法則（電場）** | $\displaystyle \nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}$ | $\displaystyle \iint_S \vec{E} \cdot d\vec{S} = \frac{Q_{\text{enclosed}}}{\varepsilon_0}$ | 電場の湧き出し源は電荷密度 $\rho$ である。正電荷から電気力線が出て負電荷に入る。 |
| **② ガウスの法則（磁場）** | $\displaystyle \nabla \cdot \vec{B} = 0$ | $\displaystyle \iint_S \vec{B} \cdot d\vec{S} = 0$ | 磁場の湧き出し・吸い込みは存在しない。孤立した磁気単極子（モノポール）は存在せず、磁力線は必ずループを描く。 |
| **③ ファラデーの電磁誘導則** | $\displaystyle \nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}$ | $\displaystyle \oint_C \vec{E} \cdot d\vec{r} = -\frac{d\Phi_B}{dt}$ | 時間変化する磁場は、その周囲に渦を巻く電場（誘導起電力）を生成する。 |
| **④ アンペール・マクスウェル則** | $\displaystyle \nabla \times \vec{B} = \mu_0 \vec{j} + \mu_0 \varepsilon_0 \frac{\partial \vec{E}}{\partial t}$ | $\displaystyle \oint_C \vec{B} \cdot d\vec{r} = \mu_0 I + \mu_0 \varepsilon_0 \frac{d\Phi_E}{dt}$ | 電流 $\vec{j}$ だけでなく、時間変化する電場（変位電流 $\varepsilon_0 \frac{\partial \vec{E}}{\partial t}$）も渦状の磁場を生成する。 |

---

## 3. ポテンシャル論と静電場・静磁場

### 静電ポテンシャルとポアソン方程式
静電場では $\frac{\partial \vec{B}}{\partial t} = 0$ より $\nabla \times \vec{E} = 0$ となり、電位（スカラーポテンシャル）$\phi$ が定義されます：

$$\vec{E} = -\nabla \phi$$

これをガウスの法則 $\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}$ に代入すると：

$$\nabla \cdot (-\nabla \phi) = -\nabla^2 \phi = \frac{\rho}{\varepsilon_0} \implies \nabla^2 \phi = -\frac{\rho}{\varepsilon_0} \quad (\text{ポアソン方程式})$$

電荷のない真空領域（$\rho = 0$）では <strong>ラプラス方程式 $\nabla^2 \phi = 0$</strong> に簡約され、ディリクレ境界条件やノイマン境界条件のもとで解が一意に決定されます。

### ベクトルポテンシャル $\vec{A}$
磁場は常に $\nabla \cdot \vec{B} = 0$ を満たすため、任意のベクトル場の回転の発散がゼロになる公式（$\nabla \cdot (\nabla \times \vec{A}) = 0$）より、<strong>ベクトルポテンシャル $\vec{A}$</strong> が存在します：

$$\vec{B} = \nabla \times \vec{A}$$

クーロンゲージ $\nabla \cdot \vec{A} = 0$ をとると、定常磁場ではポアソン方程式型の偏微分方程式を満たします：

$$\nabla^2 \vec{A} = -\mu_0 \vec{j}$$

---

## 4. 電磁波の波動方程式と光速度

電荷も電流もない真空（$\rho = 0, \vec{j} = \vec{0}$）において、ファラデー則の回転をとると：

$$\nabla \times (\nabla \times \vec{E}) = -\frac{\partial}{\partial t}(\nabla \times \vec{B}) = -\mu_0 \varepsilon_0 \frac{\partial^2 \vec{E}}{\partial t^2}$$

左辺の恒等式 $\nabla \times (\nabla \times \vec{E}) = \nabla(\nabla \cdot \vec{E}) - \nabla^2 \vec{E} = -\nabla^2 \vec{E}$ より：

$$\nabla^2 \vec{E} - \mu_0 \varepsilon_0 \frac{\partial^2 \vec{E}}{\partial t^2} = \vec{0}$$

磁場 $\vec{B}$ についても全く同一の3次元波動方程式を満たします：

$$\nabla^2 \vec{B} - \frac{1}{c^2}\frac{\partial^2 \vec{B}}{\partial t^2} = \vec{0}, \quad c \equiv \frac{1}{\sqrt{\varepsilon_0 \mu_0}} \approx 2.998 \times 10^8 \,\text{m/s}$$

電場と磁場は互いに直交し、進行方向とも直交する横波として、真空中を光速 $c$ で伝播します。

### ポインティング・ベクトルとエネルギー流
単位時間・単位面積を通過する電磁エネルギーの流れは **ポインティング・ベクトル（Poynting vector）** で与えられます：

$$\vec{S} \equiv \frac{1}{\mu_0}(\vec{E} \times \vec{B}) = \vec{E} \times \vec{H} \quad [\text{W/m}^2]$$

電磁場のエネルギー密度 $u = \frac{1}{2}\varepsilon_0 E^2 + \frac{1}{2\mu_0}B^2$ に対し、局所的なエネルギー保存則が厳密に成立します：

$$\frac{\partial u}{\partial t} + \nabla \cdot \vec{S} = -\vec{j} \cdot \vec{E}$$

右辺 $-\vec{j} \cdot \vec{E}$ はジュール熱などの仕事として電磁場が荷電粒子系へ受け渡すエネルギー率を表します。

---

## 📝 大学電磁気学 演習問題で実力を鍛える

ガウスの法則の微分形、マクスウェル方程式からの電磁波導出など、大学定期試験・院試レベルの厳選問題に挑戦しましょう：

<div class="problem-jump-card">
  <h3>⚡ 大学電磁気学 厳選演習問題集</h3>
  <p>球対称電荷分布のガウス微分形とポアソン解析、真空中のマクスウェル方程式から3次元波動方程式・光速度の完全導出など、途中式を省略しない詳細解答つきで演習できます。</p>
  <a class="jump-btn" href="/university/problems/electromagnetism">👉 大学電磁気学 演習問題を解く →</a>
</div>

<style scoped>
.problem-jump-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(56, 189, 248, 0.12));
  border: 1px solid rgba(99, 102, 241, 0.35);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 2rem 0;
}
.problem-jump-card h3 {
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  color: #6366f1;
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
  background: #6366f1;
  color: #fff !important;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 6px;
  text-decoration: none;
}
.jump-btn:hover {
  opacity: 0.9;
}
.standard-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.88rem;
}
.standard-table th, .standard-table td {
  border: 1px solid var(--vp-c-border);
  padding: 12px 14px;
  text-align: left;
}
.standard-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 700;
}
</style>
