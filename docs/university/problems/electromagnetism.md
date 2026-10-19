---
title: 大学電磁気学 演習問題集（マクスウェル方程式・詳細解答・院試対策）
description: 大学物理の電磁気学演習問題。ガウスの法則微分形と球対称電場・ポテンシャル解析、マクスウェル方程式からの電磁波波動方程式導出、ポインティングベクトルとエネルギー流。
---

# ⚡ 大学電磁気学 厳選演習問題

理工系学部および大学院入試（院試）を想定した、大学電磁気学の厳選演習問題集です。
ベクトル解析（grad, div, rot）、ガウスの発散定理、ストークスの定理、マクスウェル方程式の微分形から波動方程式を導出する計算力を養成します。

<ClientOnly>
  <UniversityProblemViewer defaultUnit="electromagnetism" />
</ClientOnly>

---

## 🧭 学習の指針・必須数学ツール

1. **ベクトル解析公式**:
   - $\nabla \times (\nabla \phi) = \vec{0}$（勾配の回転は常にゼロ）
   - $\nabla \cdot (\nabla \times \vec{A}) = 0$（回転の発散は常にゼロ）
   - $\nabla \times (\nabla \times \vec{A}) = \nabla(\nabla \cdot \vec{A}) - \nabla^2 \vec{A}$（電磁波波動方程式の導出キー）
2. **ガウスの法則とポアソン方程式**:
   - $\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}$
   - $\vec{E} = -\nabla \phi \implies \nabla^2 \phi = -\frac{\rho}{\varepsilon_0}$（ポアソン方程式）
   - 境界条件における電場・ポテンシャルの連続性。
3. **電磁波と光速度**:
   - 真空マクスウェル方程式から3次元波動方程式 $\nabla^2 \vec{E} - \frac{1}{c^2}\frac{\partial^2 \vec{E}}{\partial t^2} = \vec{0}$ の導出。
   - 光速度 $c = \frac{1}{\sqrt{\varepsilon_0 \mu_0}}$。
   - ポインティングベクトル $\vec{S} = \frac{1}{\mu_0}(\vec{E} \times \vec{B})$ と電磁場のエネルギー保存則。
