---
title: 大学量子力学 演習問題集（シュレーディンガー方程式・不確定性原理・院試対策）
description: 大学物理の量子力学演習問題。1次元無限井戸型ポテンシャルのエネルギー固有値と波動関数の規格化・ゆらぎ計算、正準交換関係と不確定性原理のコーシー＝シュワルツ証明。
---

# ⚛️ 大学量子力学 厳選演習問題

理工系学部および大学院入試（院試）を想定した、大学量子力学の厳選演習問題集です。
シュレーディンガー方程式の境界値問題、ボルンの確率解釈に基づく規格化積分、エルミート演算子の期待値計算、交換関係と不確定性関係の厳密証明をマスターします。

<ClientOnly>
  <UniversityProblemViewer defaultUnit="quantum" />
</ClientOnly>

---

## 🧭 学習の指針・必須数学ツール

1. **時間を含まないシュレーディンガー方程式**:
   - $-\frac{\hbar^2}{2m}\frac{d^2\phi}{dx^2} + V(x)\phi = E\phi$
   - 境界条件（波動関数の連続性と1階微分の連続性、無限遠でのゼロ収束）。
2. **波動関数の規格化と期待値**:
   - 規格化積分 $\int_{-\infty}^\infty |\phi(x)|^2 dx = 1$
   - 位置の期待値 $\langle x \rangle = \int \phi^* x \phi dx$、運動量の期待値 $\langle p \rangle = \int \phi^* \left(-i\hbar\frac{d}{dx}\right) \phi dx$
   - 不確定さ（標準偏差） $\Delta x = \sqrt{\langle x^2 \rangle - \langle x \rangle^2}$
3. **演算子代数と不確定性原理**:
   - 正準交換関係 $[\hat{x}, \hat{p}] = i\hbar \hat{I}$
   - コーシー＝シュワルツの不等式を用いたケネジ＝ロバートソン不確定性関係 $\Delta A \Delta B \ge \frac{1}{2}|\langle [\hat{A}, \hat{B}] \rangle|$ の証明。
