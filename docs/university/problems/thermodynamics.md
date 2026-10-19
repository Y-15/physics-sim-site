---
title: 大学熱力学・統計力学 演習問題集（ルジャンドル変換・分配関数・院試対策）
description: 大学物理の熱力学・統計力学演習問題。ルジャンドル変換と4大マクスウェル関係式、古典理想気体のカノニカル分配関数重積分、状態方程式と内部エネルギーの完全導出。
---

# 🔥 大学熱力学・統計力学 厳選演習問題

理工系学部および大学院入試（院試）を想定した、大学熱力学・統計力学の厳選演習問題集です。
熱力学ポテンシャル（$U, H, F, G$）の全微分形式、ルジャンドル変換、マクスウェル関係式を用いた物性値の導出、カノニカル分配関数の多次元位相空間積分を演習します。

<ClientOnly>
  <UniversityProblemViewer defaultUnit="thermodynamics" />
</ClientOnly>

---

## 🧭 学習の指針・必須数学ツール

1. **多変数関数の全微分とルジャンドル変換**:
   - $dU = TdS - PdV \implies dH = TdS + VdP, \; dF = -SdT - PdV, \; dG = -SdT + VdP$
   - シュワルツの定理によるマクスウェル関係式の導出：
     $$\left(\frac{\partial S}{\partial V}\right)_T = \left(\frac{\partial P}{\partial T}\right)_V, \quad \left(\frac{\partial S}{\partial P}\right)_T = -\left(\frac{\partial V}{\partial T}\right)_P$$
2. **統計力学の分配関数**:
   - カノニカル分配関数 $Z = \sum_i e^{-\beta E_i} \iff \frac{1}{N! h^{3N}}\int d^{3N}q d^{3N}p e^{-\beta \mathcal{H}}$
   - ガウス積分公式 $\int_{-\infty}^\infty e^{-\alpha x^2} dx = \sqrt{\frac{\pi}{\alpha}}$
   - スターリングの公式 $\ln N! \approx N\ln N - N$
   - 自由エネルギー $F = -k_B T \ln Z$ と圧力 $P = -\left(\frac{\partial F}{\partial V}\right)_T$、内部エネルギー $U = -\frac{\partial}{\partial \beta}\ln Z$ の微分操作。
