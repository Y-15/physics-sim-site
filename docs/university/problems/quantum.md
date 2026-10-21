# 量子力学 演習問題（全6問）

<div class="level-badge" style="display:inline-block; background:#eff6ff; color:#1d4ed8; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem; margin-bottom:16px;">
  対象：大学2〜3年次・大学院入試対策 ／ 範囲：正準交換関係・不確定性原理・1次元井戸型＆障壁ポテンシャル・調和振動子（昇降演算子）・角運動量＆スピン・水素原子と摂動論
</div>

シュレーディンガー方程式の境界値問題、正準交換関係 $[\hat{r}_\alpha, \hat{p}_\beta] = i\hbar\delta_{\alpha\beta}$ と最小不確定ガウス波束、調和振動子の生成・消滅演算子 $\hat{a}^\dagger, \hat{a}$ による代数計算、確率流密度ベクトル $\boldsymbol{j}$ とトンネル効果、角運動量演算子 $\hat{\boldsymbol{L}}$ とパウリ行列 $\hat{\boldsymbol{\sigma}}$、および水素原子と定常摂動論を徹底演習する全6問です。

## 解答のポイントと必須公式チェック

- **正準交換関係とロバートソンの不確定性関係**：
  $$[\hat{r}_\alpha, \hat{p}_\beta] = i\hbar\delta_{\alpha\beta}, \qquad \Delta A \cdot \Delta B \ge \frac{1}{2}\left|\langle[\hat{A}, \hat{B}]\rangle\right|, \qquad \Delta x \cdot \Delta p_x \ge \frac{\hbar}{2}$$
- **1次元調和振動子の生成・消滅演算子**：
  $$\hat{a} = \sqrt{\frac{m\omega}{2\hbar}}\left(\hat{x} + \frac{i}{m\omega}\hat{p}\right), \quad [\hat{a}, \hat{a}^\dagger] = 1, \quad \hat{H} = \hbar\omega\left(\hat{a}^\dagger\hat{a} + \frac{1}{2}\right), \quad \hat{a}|n\rangle = \sqrt{n}|n-1\rangle, \quad \hat{a}^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle$$
- **軌道角運動量代数と定常摂動論**：
  $$[\hat{L}_\alpha, \hat{L}_\beta] = i\hbar\sum_\gamma \epsilon_{\alpha\beta\gamma}\hat{L}_\gamma, \qquad E_n = E_n^{(0)} + \langle n^{(0)}|\hat{V}|n^{(0)}\rangle + \sum_{m\neq n}\frac{|\langle m^{(0)}|\hat{V}|n^{(0)}\rangle|^2}{E_n^{(0)} - E_m^{(0)}} + \cdots$$

---

<UniversityProblemViewer category="quantum" />

<div style="margin-top:24px; display:flex; gap:12px; flex-wrap:wrap;">
  <a href="/university/quantum/index" style="display:inline-block; background:#f8fafc; color:#334155; border:1px solid #cbd5e1; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">
    ← 量子力学の講義ページに戻る
  </a>
  <a href="/university/problems/index" style="display:inline-block; background:#1d4ed8; color:white; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:700;">
    大学物理 総合演習トップ（全24問）へ →
  </a>
</div>
