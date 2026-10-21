# 熱力学・統計力学 演習問題（全6問）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学1〜3年次・大学院入試対策 ／ 範囲：熱力学ポテンシャル・マクスウェルの関係式・実在気体・相転移・カノニカル分配関数・量子統計
</div>

熱力学の基本関係式 $dU = T\,dS - P\,dV + \mu\,dN$ とルジャンドル変換、マクスウェルの関係式を用いた $C_P - C_V$ やファン・デル・ワールス気体の解析、クラペイロン・クラウジウスの式、そしてカノニカル分配関数 $Z = \sum_i e^{-\beta E_i}$・位相空間積分・フェルミ統計までを体系的に演習する全6問です。

## 解答のポイントと必須公式チェック

- **熱力学ポテンシャルの全微分とマクスウェルの関係式**：
  $$dU = T\,dS - P\,dV \implies \left(\frac{\partial T}{\partial V}\right)_S = -\left(\frac{\partial P}{\partial S}\right)_V, \qquad dF = -S\,dT - P\,dV \implies \left(\frac{\partial S}{\partial V}\right)_T = \left(\frac{\partial P}{\partial T}\right)_V$$
- **エネルギー方程式と熱容量差**：
  $$\left(\frac{\partial U}{\partial V}\right)_T = T\left(\frac{\partial P}{\partial T}\right)_V - P, \qquad C_P - C_V = T\left(\frac{\partial P}{\partial T}\right)_V\left(\frac{\partial V}{\partial T}\right)_P = \frac{TV\alpha^2}{\kappa_T}$$
- **カノニカル分配関数 $Z$ と熱力学量**：
  $$Z = \sum_i e^{-\beta E_i}, \qquad F = -k_B T \ln Z, \qquad U = -\frac{\partial \ln Z}{\partial \beta}, \qquad S = k_B \ln Z + \frac{U}{T}, \qquad C_V = k_B \beta^2 \frac{\partial^2 \ln Z}{\partial \beta^2}$$

---

<UniversityProblemViewer category="thermodynamics" />

<div style="margin-top:24px; display:flex; gap:12px; flex-wrap:wrap;">
  <a href="/university/thermodynamics/index" style="display:inline-block; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">
    ← 熱・統計力学の講義ページに戻る
  </a>
  <a href="/university/problems/quantum" style="display:inline-block; background:#1d4ed8; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">
    次の演習：量子力学（全6問）へ →
  </a>
</div>
