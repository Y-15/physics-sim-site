# 電磁気学 演習問題（全6問）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学1〜2年次・大学院入試対策 ／ 範囲：ベクトル解析・ポアソン方程式・鏡像法・電気双極子・ベクトルポテンシャル・電磁波とポインティングベクトル
</div>

マクスウェル方程式の微分形・積分形を使いこなし、球対称・円柱対称な場の計算、接地導体に対する鏡像法、電気双極子モーメント $\boldsymbol{p}$ が作る電場、ベクトルポテンシャル $\boldsymbol{A}$ とビオ・サバールの法則、そして電磁波の波動方程式とポインティングベクトル $\boldsymbol{S} = \frac{1}{\mu_0}\boldsymbol{E}\times\boldsymbol{B}$ を導出する全6問です。

## 解答のポイントと必須公式チェック

- **真空中のマクスウェル方程式**：
  $$\boldsymbol{\nabla}\cdot\boldsymbol{E} = \frac{\rho}{\varepsilon_0}, \qquad \boldsymbol{\nabla}\cdot\boldsymbol{B} = 0, \qquad \boldsymbol{\nabla}\times\boldsymbol{E} = -\frac{\partial\boldsymbol{B}}{\partial t}, \qquad \boldsymbol{\nabla}\times\boldsymbol{B} = \mu_0\boldsymbol{j} + \mu_0\varepsilon_0\frac{\partial\boldsymbol{E}}{\partial t}$$
- **電磁ポテンシャルと場**：
  $$\boldsymbol{E} = -\boldsymbol{\nabla}\phi - \frac{\partial\boldsymbol{A}}{\partial t}, \qquad \boldsymbol{B} = \boldsymbol{\nabla}\times\boldsymbol{A}, \qquad \nabla^2\phi = -\frac{\rho}{\varepsilon_0}\ (\text{静電場}), \qquad \nabla^2\boldsymbol{A} = -\mu_0\boldsymbol{j}\ (\text{クーロンゲージ静磁場})$$
- **電磁場のエネルギー密度 $u$ とポインティングベクトル $\boldsymbol{S}$**：
  $$u = \frac{1}{2}\varepsilon_0\boldsymbol{E}^2 + \frac{1}{2\mu_0}\boldsymbol{B}^2, \qquad \boldsymbol{S} = \frac{1}{\mu_0}\boldsymbol{E}\times\boldsymbol{B}, \qquad \frac{\partial u}{\partial t} + \boldsymbol{\nabla}\cdot\boldsymbol{S} = -\boldsymbol{j}\cdot\boldsymbol{E}$$

---

<UniversityProblemViewer category="electromagnetism" />

<div style="margin-top:24px; display:flex; gap:12px; flex-wrap:wrap;">
  <a href="/university/electromagnetism/index" style="display:inline-block; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">
    ← 電磁気学の講義ページに戻る
  </a>
  <a href="/university/problems/thermodynamics" style="display:inline-block; background:#1d4ed8; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">
    次の演習：熱・統計力学（全6問）へ →
  </a>
</div>
